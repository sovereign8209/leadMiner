# ⛏ LeadMiner

A full-stack SaaS lead generation tool that scrapes Google Maps for targeted business leads based on category and location — with a live terminal UI, Excel export, and real-time streaming progress.

**🔗 Live Demo → [projectleadminer.netlify.app](https://projectleadminer.netlify.app)**

---

## 📸 What It Does

1. Enter a business category (e.g. `dentist`, `gym`, `restaurant`)
2. Enter a city (e.g. `Mumbai`, `Pune`, `Delhi`)
3. Set a review filter range to target leads by popularity
4. LeadMiner scrapes Google Maps, streams live progress to a terminal UI, and returns a filtered lead list
5. Export results to Excel in one click

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React, TypeScript, Vite |
| **Backend** | Python, FastAPI |
| **Scraping** | Playwright (headless Chromium, stealth mode) |
| **Auth** | Supabase *(coming soon)* |
| **Streaming** | Server-Sent Events (SSE) |
| **Export** | Pandas, OpenPyXL |
| **Deploy** | Netlify (frontend) + Render (backend) |

---

## ✅ Features

- 🗺️ **Google Maps scraper** — category + location based search
- 🎯 **Review filter** — target leads by min/max review count
- 📡 **Live terminal UI** — real-time SSE streaming shows scraping progress
- 📊 **Excel export** — download leads as `.xlsx` in one click
- 🛡️ **Stealth browser** — anti-detection headers, hidden webdriver flag
- 🚧 **Coming soon** — auth, user dashboard, admin panel, history, billing

---

## 📁 Project Structure

```
leadMiner/
├── backend/
│   ├── main.py           # FastAPI app — /scrape, /scrape/json, /scrape/stream
│   └── requirements.txt
├── src/
│   ├── pages/
│   │   ├── landing.tsx   # Landing page
│   │   ├── tool.tsx      # Main scraper tool with live terminal
│   │   └── comingsoon.tsx
│   ├── components/
│   │   └── ProtectedRoute.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── lib/
│   │   └── supabase.ts
│   └── App.tsx
├── public/
│   └── _redirects        # Netlify SPA routing
├── .env.example
└── README.md
```

---

## ⚙️ Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/sovereign8209/leadMiner.git
cd leadMiner
```

### 2. Frontend setup

```bash
npm install
cp .env.example .env
# Set VITE_BACKEND_URL=http://localhost:8000 in .env
npm run dev
```

### 3. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # macOS/Linux
venv\Scripts\activate          # Windows

pip install -r requirements.txt
python -m playwright install chromium

uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Open the tool

```
http://localhost:5173/tool
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/scrape/stream` | SSE stream — real-time progress + leads |
| `POST` | `/scrape/json` | Returns leads as JSON |
| `POST` | `/scrape` | Returns leads as `.xlsx` download |

### Request body (`POST` endpoints):

```json
{
  "category": "dentist",
  "location": "Mumbai",
  "min_reviews": 50,
  "max_reviews": 300,
  "max_results": 50
}
```

---

## 🌍 Environment Variables

Create a `.env` file in the project root:

```
VITE_BACKEND_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See `.env.example` for reference.

---

## 🚀 Deployment

| Service | Purpose |
|---|---|
| **Netlify** | Frontend — auto-deploys on `git push` |
| **Render** | Backend — free tier with keep-alive via cron-job.org |

> ⚠️ Free Render instances may take ~30s to wake up after inactivity. First request may be slow.

---

## 🔜 Roadmap

- [ ] User authentication (Supabase)
- [ ] User dashboard — lead history, saved searches
- [ ] Admin panel — usage monitoring, user control
- [ ] Rate limiting & request queue
- [ ] CSV export option
- [ ] Billing & subscription system

---

## ⚠️ Disclaimer

This tool interacts with publicly available data on Google Maps. Use responsibly and ensure compliance with applicable laws and Google's Terms of Service. Intended for educational and business intelligence purposes only.

---

## 👨‍💻 Built By

**Ashish Patil** — Full Stack Developer
[GitHub](https://github.com/sovereign8209)