from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.errors import (
    FitCheckException,
    fitcheck_exception_handler,
    generic_exception_handler
)
from app.db.session import init_db
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Initializing FitCheck Database...")
    await init_db()
    if settings.GEMINI_API_KEY and not settings.PREFER_LOCAL_CV:
        masked_key = f"...{settings.GEMINI_API_KEY[-4:]}" if len(settings.GEMINI_API_KEY) >= 4 else "***"
        logger.info(f"✨ AI Engine: Google Gemini ACTIVE (Model: {settings.GEMINI_MODEL}, Key: {masked_key})")
    else:
        logger.info("ℹ️ AI Engine: Local Computer Vision & Fashion Heuristics ACTIVE (Offline / No API key)")
    logger.info("FitCheck API startup complete. Ready for requests.")
    yield
    logger.info("FitCheck API shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Your Fit. Your Style. Your Score. Production AI Fashion Evaluation Engine.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handlers
app.add_exception_handler(FitCheckException, fitcheck_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include API v1 router
app.include_router(api_router)

@app.get("/")
async def root():
    return {
        "app": "FitCheck API",
        "tagline": "Your Fit. Your Style. Your Score.",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health/live"
    }

