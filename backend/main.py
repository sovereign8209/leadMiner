from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from playwright.sync_api import sync_playwright
import pandas as pd
import asyncio
import logging
import subprocess
import threading
import json
import io

# ── LOGGING ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

# ── INSTALL PLAYWRIGHT BROWSER AT RUNTIME ─────────────────────────────────────
try:
    subprocess.run(
        ["python", "-m", "playwright", "install", "chromium"],
        check=True,
        capture_output=True,
        timeout=60   # ← add this so it doesn't hang forever
    )
    logger.info("✅ Playwright chromium ready")
except Exception as e:
    logger.warning(f"⚠️ Playwright install warning: {e}")

app = FastAPI(title="leadMiner API")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://projectleadminer.netlify.app", "http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    page.set_default_timeout(60000)
    page.route("**/*.{png,jpg,jpeg,gif,svg,css,woff,woff2}", lambda route: route.abort())
    page.add_init_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    )
    return page


def launch_browser(p):
    return p.chromium.launch(
        headless=True,
        args=[
            "--no-sandbox",
            "--disable-blink-features=AutomationControlled",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--single-process",
            "--no-zygote",
        ]
    )


# ── STAGE 1 — COLLECT URLS ────────────────────────────────────────────────────
def collect_urls(query: str, max_results: int, progress=None) -> list[tuple[str, str]]:
    results = []
    seen = set()

    def emit(msg):
        if progress:
            progress.put(msg)

    emit(f"🗺️ Searching: '{query}'")

    with sync_playwright() as p:
        browser = launch_browser(p)
        page = make_stealth_page(browser)

        maps_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
        emit(f"🌐 Opening Google Maps...")
        page.goto(maps_url)
        page.wait_for_timeout(6000)

        feed = page.locator('div[role="feed"]')
        if not feed.count():
            emit("⚠️ Feed not found — Google may have blocked the request")
            browser.close()
            return []

        emit("✅ Maps loaded — collecting listings...")
        no_new_count = 0

        while len(results) < max_results:
            listings = page.locator("div.Nv2PK")
            count = listings.count()
            before = len(results)

            for i in range(count):
                item = listings.nth(i)
                try:
                    name = item.locator("a.hfpxzc").get_attribute("aria-label")
                    url = item.locator("a.hfpxzc").get_attribute("href")

                    if url and url not in seen:
                        seen.add(url)
                        results.append((name, url))
                        emit(f"📍 [{len(results)}] {name}")

                        if len(results) >= max_results:
                            break
                except Exception:
                    continue

            if len(results) == before:
                no_new_count += 1
                if no_new_count >= 3:
                    emit("🛑 No new results — moving to next stage")
                    break
            else:
                no_new_count = 0

            feed.evaluate("el => el.scrollBy(0, 1500)")
            page.wait_for_timeout(2000)

        browser.close()

    emit(f"✅ Stage 1 done — {len(results)} listings found")
    return results


# ── STAGE 2 — ENRICH ─────────────────────────────────────────────────────────
def enrich_urls(
    url_data: list[tuple[str, str]],
    category: str,
    location: str,
    min_reviews: int,
    max_reviews: int,
    progress=None,
) -> list[dict]:
    results = []

    def emit(msg):
        if progress:
            progress.put(msg)

    emit(f"🔍 Stage 2 — Enriching {len(url_data)} listings...")

    with sync_playwright() as p:
        browser = launch_browser(p)
        page = make_stealth_page(browser)

        for idx, (name, url) in enumerate(url_data, start=1):
            emit(f"[{idx}/{len(url_data)}] Checking: {name}")
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
                page.wait_for_timeout(2000)

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

                emit(f"   ⭐ {rating} | 📝 {reviews} reviews")

                if not reviews or not (min_reviews <= reviews <= max_reviews):
                    emit(f"   ❌ Skipped — out of review range")
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
                emit(f"   ✅ Saved → {name}")

            except Exception as e:
                emit(f"   ⚠️ Skipped {name}: timeout or error")
                continue

        browser.close()

    emit(f"✅ Stage 2 done — {len(results)} leads passed filter")
    return results


# ── PIPELINE ──────────────────────────────────────────────────────────────────
def run_scraper(
    category: str,
    location: str,
    min_reviews: int,
    max_reviews: int,
    max_results: int,
    progress=None,
) -> list[dict]:
    def emit(msg):
        if progress:
            progress.put(msg)

    emit(f"🚀 Pipeline starting — {category} in {location}")
    query = f"{category} in {location}"
    urls = collect_urls(query, max_results, progress=progress)

    if not urls:
        emit("❌ No listings found — try a different category or location")
        return []

    leads = enrich_urls(urls, category, location, min_reviews, max_reviews, progress=progress)
    emit(f"🎯 Pipeline complete — {len(leads)} leads ready")
    return leads


# ── ROUTES ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "leadMiner API is running 🚀"}


@app.post("/scrape/stream")
async def scrape_stream(request: ScrapeRequest):
    """
    SSE endpoint — streams real-time progress to the frontend.
    Returns log messages as they happen, then final leads as JSON.
    """
    import queue as queue_module

    progress = queue_module.Queue()
    result_holder = {"leads": [], "error": None}

    def run():
        try:
            leads = run_scraper(
                request.category,
                request.location,
                request.min_reviews,
                request.max_reviews,
                request.max_results,
                progress=progress,
            )
            result_holder["leads"] = leads
        except Exception as e:
            result_holder["error"] = str(e)
        finally:
            progress.put(None)  # sentinel — signals stream is done

    thread = threading.Thread(target=run)
    thread.start()

    async def event_generator():
        loop = asyncio.get_event_loop()

        while True:
            # Read from queue without blocking the event loop
            msg = await loop.run_in_executor(None, progress.get)

            if msg is None:
                # Sentinel received — scraper finished
                if result_holder["error"]:
                    yield f"data: {json.dumps({'type': 'error', 'message': result_holder['error']})}\n\n"
                else:
                    yield f"data: {json.dumps({'type': 'done', 'leads': result_holder['leads'], 'count': len(result_holder['leads'])})}\n\n"
                break

            # Stream log message to frontend
            yield f"data: {json.dumps({'type': 'log', 'message': msg})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/scrape/json")
async def scrape_json(request: ScrapeRequest):
    """Returns leads as JSON — fallback endpoint."""
    try:
        loop = asyncio.get_event_loop()
        leads = await loop.run_in_executor(
            None,
            run_scraper,
            request.category,
            request.location,
            request.min_reviews,
            request.max_reviews,
            request.max_results,
            None,
        )

        if not leads:
            raise HTTPException(status_code=404, detail="No leads found. Try adjusting filters.")

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
            None,
            run_scraper,
            request.category,
            request.location,
            request.min_reviews,
            request.max_reviews,
            request.max_results,
            None,
        )

        if not leads:
            raise HTTPException(status_code=404, detail="No leads found. Try adjusting filters.")

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