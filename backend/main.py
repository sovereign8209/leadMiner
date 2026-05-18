from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor
from playwright.sync_api import sync_playwright
import pandas as pd
import asyncio
import io

app = FastAPI(title="leadMiner API")

# ── CORS — allows React frontend to talk to this API ──────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-netlify-app.netlify.app"],  # update with your Netlify URL after deploy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Thread pool for running sync Playwright in async FastAPI ──────────────────
executor = ThreadPoolExecutor(max_workers=2)


# ── REQUEST SCHEMA ─────────────────────────────────────────────────────────────
class ScrapeRequest(BaseModel):
    category: str       # e.g. "dentist"
    location: str       # e.g. "Mumbai"
    min_reviews: int = 50
    max_reviews: int = 300
    max_results: int = 50


# ── SCRAPER LOGIC (sync — runs in thread) ─────────────────────────────────────

def collect_urls(query: str, max_results: int) -> list[tuple[str, str]]:
    """Stage 1 — collect (name, url) pairs from Google Maps sidebar."""
    results = []
    seen = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)  # headless=True for server
        page = browser.new_page()

        page.goto(f"https://www.google.com/maps/search/{query.replace(' ', '+')}")
        page.wait_for_timeout(5000)

        scrollable = page.locator('div[role="feed"]')

        while len(results) < max_results:
            listings = page.locator("div.Nv2PK")
            count = listings.count()

            for i in range(count):
                item = listings.nth(i)
                try:
                    name = item.locator("a.hfpxzc").get_attribute("aria-label")
                    url = item.locator("a.hfpxzc").get_attribute("href")

                    if url and url not in seen:
                        seen.add(url)
                        results.append((name, url))

                        if len(results) >= max_results:
                            break
                except Exception:
                    continue

            scrollable.evaluate("el => el.scrollBy(0, 1500)")
            page.wait_for_timeout(1500)

        browser.close()

    return results


def enrich_urls(
    url_data: list[tuple[str, str]],
    category: str,
    location: str,
    min_reviews: int,
    max_reviews: int,
) -> list[dict]:
    """Stage 2 — visit each listing and extract full details."""
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for name, url in url_data:
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

                # Filter by review range
                if not reviews or not (min_reviews <= reviews <= max_reviews):
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

            except Exception:
                continue

        browser.close()

    return results


def run_scraper(category: str, location: str, min_reviews: int, max_reviews: int, max_results: int) -> list[dict]:
    """Full pipeline: collect → enrich → return leads."""
    query = f"{category} in {location}"
    urls = collect_urls(query, max_results)
    leads = enrich_urls(urls, category, location, min_reviews, max_reviews)
    return leads


# ── ROUTES ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "leadMiner API is running 🚀"}


@app.post("/scrape")
async def scrape(request: ScrapeRequest):
    """
    Scrape Google Maps and return leads as a downloadable Excel file.

    Body:
        category    — business type (e.g. "dentist")
        location    — city or region (e.g. "Mumbai")
        min_reviews — minimum review count filter (default: 50)
        max_reviews — maximum review count filter (default: 300)
        max_results — max listings to collect (default: 50)

    Returns:
        Excel file (.xlsx) as a streaming download
    """
    try:
        # Run sync scraper in thread so FastAPI stays non-blocking
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
                detail="No leads found for the given category and location."
            )

        # Convert to Excel in memory
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
        raise HTTPException(status_code=500, detail=f"Scraper error: {str(e)}")


@app.post("/scrape/json")
async def scrape_json(request: ScrapeRequest):
    """
    Same as /scrape but returns JSON instead of Excel.
    Used by the dashboard to display leads in the UI table.
    """
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
                detail="No leads found for the given category and location."
            )

        return {"count": len(leads), "leads": leads}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraper error: {str(e)}")