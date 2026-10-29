from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.session import get_db

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/live")
async def health_live():
    """Liveness probe: verifies process is alive."""
    return {"status": "ok", "service": "FitCheck API"}

@router.get("/ready")
async def health_ready(db: AsyncSession = Depends(get_db)):
    """Readiness probe: verifies database connection is ready to serve traffic."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        return {"status": "degraded", "database": str(e)}, 503

