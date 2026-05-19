from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor
from playwright.sync_api import sync_playwright
import pandas as pd
import asyncio
import logging
import subprocess
import io

# ── LOGGING ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

# ── INSTALL PLAYWRIGHT BROWSER AT RUNTIME ────────────────────────────────────
try:
    subprocess.run(
        ["python", "-m", "playwright", "install", "chromium"],
        check=True,
        capture_output=True
    )
    logger.info("✅ Playwright chromium ready")
except Exception as e:
    logger.warning(f"⚠️ Playwright install warning: {e}")

app = FastAPI(title="leadMiner API")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Thread pool ───────────────────────────────────────────────────────────────
executor = ThreadPoolExecutor(max_workers=2)


# ── REQUEST SCHEMA ────────────────────────────────────────────────────────────
class ScrapeRequest(BaseModel):
    category: str
    location: str
    min_reviews: int = 50
    max_reviews: int = 300
    max_results: int = 50


# ── STEALTH BROWSER HELPER ────────────────────────────────────────────────────
def make_stealth_page(browser):
    """Create a browser context that looks like a real user."""
    context = browser.new_context(
        user_agent=(
            "Mozilla/5.0 (X11; Linux x86_64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        viewport={"width": 1280, "height": 800},
        locale="en-US",
        timezone_id="Asia/Kolkata",
    )
    page = context.new_page()
    # Hide webdriver flag — key anti-detection step
    page.add_init_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    )
    return page


# ── STAGE 1 — COLLECT URLS ────────────────────────────────────────────────────
def collect_urls(query: str, max_results: int) -> list[tuple[str, str]]:
    results = []
    seen = set()

    logger.info(f"🗺️  Stage 1 — Searching: '{query}' | Max: {max_results}")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ]
        )
        page = make_stealth_page(browser)

        maps_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
        logger.info(f"🌐 Opening: {maps_url}")
        page.goto(maps_url)
        page.wait_for_timeout(6000)

        # Check if Maps loaded correctly
        feed = page.locator('div[role="feed"]')
        if not feed.count():
            logger.warning("⚠️  Feed not found — Google may have blocked the request")
            browser.close()
            return []

        logger.info("✅ Feed found — starting collection...")
        no_new_count = 0

        while len(results) < max_results:
            listings = page.locator("div.Nv2PK")
            count = listings.count()
            before = len(results)

            logger.info(f"   Visible: {count} | Collected: {len(results)}")

            for i in range(count):
                item = listings.nth(i)
                try:
                    name = item.locator("a.hfpxzc").get_attribute("aria-label")
                    url = item.locator("a.hfpxzc").get_attribute("href")

                    if url and url not in seen:
                        seen.add(url)
                        results.append((name, url))
                        logger.info(f"   [{len(results)}] {name}")

                        if len(results) >= max_results:
                            break
                except Exception:
                    continue

            # Stop if scroll isn't loading new results
            if len(results) == before:
                no_new_count += 1
                if no_new_count >= 3:
                    logger.info("🛑 No new results after 3 scrolls — stopping")
                    break
            else:
                no_new_count = 0

            feed.evaluate("el => el.scrollBy(0, 1500)")
            page.wait_for_timeout(2000)

        browser.close()

    logger.info(f"✅ Stage 1 done — {len(results)} URLs collected")
    return results


# ── STAGE 2 — ENRICH ─────────────────────────────────────────────────────────
def enrich_urls(
    url_data: list[tuple[str, str]],
    category: str,
    location: str,
    min_reviews: int,
    max_reviews: int,
) -> list[dict]:
    results = []

    logger.info(f"🔍 Stage 2 — Enriching {len(url_data)} listings...")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ]
        )
        page = make_stealth_page(browser)

        for idx, (name, url) in enumerate(url_data, start=1):
            logger.info(f"   [{idx}/{len(url_data)}] {name}")
            try:
                page.goto(url)
                page.wait_for_timeout(4000)

                # ⭐ Rating
                rating = None
                try:
                    el = page.locator("span.ceNzKf")
                    if el.count():
                        rating = float(el.first.get_attribute("aria-label").split()[0])
                except Exception:
                    pass

                # 📝 Reviews
                reviews = None
                try:
                    el = page.locator('span[aria-label*="reviews"]')
                    if el.count():
                        label = el.first.get_attribute("aria-label")
                        reviews = int(label.split()[0].replace(",", ""))
                except Exception:
                    pass

                logger.info(f"      ⭐ {rating} | 📝 {reviews} reviews")

                # Filter by review range
                if not reviews or not (min_reviews <= reviews <= max_reviews):
                    logger.info("      ❌ Skipped (out of review range)")
                    continue

                # 📞 Phone
                phone = None
                try:
                    el = page.locator('button[data-item-id^="phone:"]')
                    if el.count():
                        phone = el.first.get_attribute("aria-label").replace("Phone: ", "").strip()
                except Exception:
                    pass

                # 🌐 Website
                website = None
                try:
                    el = page.locator('a[data-item-id="authority"]')
                    if el.count():
                        website = el.first.get_attribute("href")
                except Exception:
                    pass

                # 📍 Address
                address = None
                try:
                    el = page.locator('button[data-item-id="address"]')
                    if el.count():
                        address = el.first.get_attribute("aria-label").replace("Address: ", "").strip()
                except Exception:
                    pass

                results.append({
                    "name": name,
                    "rating": rating,
                    "reviews": reviews,
                    "phone": phone,
                    "website": website,
                    "address": address,
                    "category": category,
                    "location": location,
                    "url": url,
                })
                logger.info(f"      ✅ Saved → {name}")

            except Exception as e:
                logger.warning(f"      ⚠️  Error on {name}: {e}")
                continue

        browser.close()

    logger.info(f"✅ Stage 2 done — {len(results)} leads passed filter")
    return results


# ── PIPELINE ──────────────────────────────────────────────────────────────────
def run_scraper(
    category: str,
    location: str,
    min_reviews: int,
    max_reviews: int,
    max_results: int,
) -> list[dict]:
    logger.info(f"\n🚀 PIPELINE START — {category} in {location}")
    query = f"{category} in {location}"
    urls = collect_urls(query, max_results)

    if not urls:
        logger.warning("❌ No URLs collected — aborting")
        return []

    leads = enrich_urls(urls, category, location, min_reviews, max_reviews)
    logger.info(f"🎯 PIPELINE DONE — {len(leads)} leads\n")
    return leads


# ── ROUTES ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "leadMiner API is running 🚀"}


@app.post("/scrape/json")
async def scrape_json(request: ScrapeRequest):
    """Returns leads as JSON — used by dashboard table."""
    try:
        loop = asyncio.get_event_loop()
        leads = await loop.run_in_executor(
            executor,
            run_scraper,
            request.category,
            request.location,
            request.min_reviews,
            request.max_reviews,
            request.max_results,
        )

        if not leads:
            raise HTTPException(
                status_code=404,
                detail="No leads found. Try adjusting filters or a different location."
            )

        return {"count": len(leads), "leads": leads}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        raise HTTPException(status_code=500, detail=f"Scraper error: {str(e)}")


@app.post("/scrape")
async def scrape_excel(request: ScrapeRequest):
    """Returns leads as downloadable Excel file."""
    try:
        loop = asyncio.get_event_loop()
        leads = await loop.run_in_executor(
            executor,
            run_scraper,
            request.category,
            request.location,
            request.min_reviews,
            request.max_reviews,
            request.max_results,
        )

        if not leads:
            raise HTTPException(
                status_code=404,
                detail="No leads found. Try adjusting filters or a different location."
            )

        df = pd.DataFrame(leads)
        buffer = io.BytesIO()
        df.to_excel(buffer, index=False)
        buffer.seek(0)

        filename = f"{request.category}_{request.location}_leads.xlsx".replace(" ", "_")

        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        raise HTTPException(status_code=500, detail=f"Scraper error: {str(e)}")