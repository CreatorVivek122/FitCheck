# FitCheck — Your Fit. Your Style. Your Score.

> **Production AI Fashion Evaluation & Styling Web Application**  
> Inspired by editorial publications and modern high-end fashion design systems.

---

## 1. Overview
FitCheck is an AI fashion companion that solves the everyday question: *"Does this outfit work?"*  
Before heading to college, work, a date, or a party, users upload an outfit photo, select their occasion and aesthetic preference, and receive grounded, constructive styling feedback.

### Key Capabilities
- **Four Pillar Analysis:**
  1. **Color Coordination:** Palette harmony, contrast ratio, and extracted hex swatches.
  2. **Styling & Cohesion:** Layering dynamics, footwear match, and aesthetic unity.
  3. **Fit & Proportion:** Visible hemline breaks and silhouette drape (with honest caveats for camera crop).
  4. **Occasion Match:** Contextual suitability for everyday casual, office, date night, party, or traditional events.
- **Editorial UI/UX:** Luxury serif typography (`Newsreader`), warm bone palette (`#FBF9F5`), deep oxblood accents (`#6D1F2F`), dark/light mode toggle, and micro-interactions.
- **Wardrobe Vault ("My Fits"):** Private gallery of evaluated outfits with search, occasion filters, score sorting, and inline notes.
- **Compare Fits Studio:** Side-by-side head-to-head comparison with score deltas and AI occasion verdict.
- **Social & Share Card Generator:** Instant canvas rendering of magazine-cover style cards formatted for Instagram Stories / social platforms.
- **Ethical AI & Privacy:** Purely clothing-focused feedback with zero body-shaming, automatic EXIF/GPS stripping, and full GDPR-ready data export and wipe controls.

---

## 2. Project Architecture

```
FitCheck/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI application & lifespan
│   │   ├── core/                      # Config, security, logging, errors
│   │   ├── db/                        # SQLAlchemy async session & init
│   │   ├── models/                    # User, ImageUpload, AnalysisJob, FitReport
│   │   ├── schemas/                   # Pydantic v2 validation contracts
│   │   ├── services/                  # Upload, storage, scoring, safety, reports
│   │   ├── ai/                        # Provider interface, Gemini VLM & local CV
│   │   └── api/v1/routes/             # Health, uploads, analyses, reports, users
│   ├── tests/                         # Full Pytest test suite (100% pass)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    # Main app shell & view router
│   │   ├── index.css                  # Editorial luxury design system
│   │   ├── components/                # Navbar, Hero, Studio, Report, Vault, Compare, ShareCard
│   │   ├── services/api.ts            # Typed REST API client
│   │   └── types/index.ts             # Complete TypeScript data contracts
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.ts
├── docker-compose.yml
├── plan.md
└── DECISIONS.md
```

---

## 3. Quick Start

### Backend (FastAPI)
```bash
cd backend
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run test suite
python -m pytest tests -v

# 3. Start development server
uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

### Frontend (React + TypeScript + Vite)
```bash
cd frontend
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
```
- Frontend Web App: `http://localhost:5173`

### Docker Compose (Full Stack)
```bash
docker-compose up --build
```
- Web Application: `http://localhost:3000`
- API Backend: `http://localhost:8000`

---

## 4. Environment Variables
Copy `backend/.env.example` to `backend/.env` (optional):
```ini
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=sqlite+aiosqlite:///./fitcheck.db
STORAGE_DIR=storage_data

# Optional: Add your Gemini API Key for Gemini 2.5 Flash Vision
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
PREFER_LOCAL_CV=false
```
*Note: If `GEMINI_API_KEY` is not provided, FitCheck operates seamlessly on its built-in Computer Vision & Fashion Heuristics engine.*

