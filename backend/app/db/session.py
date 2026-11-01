import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger("fitcheck.database")

def normalize_database_url(url: str) -> str:
    """
    Normalizes database URLs to ensure compatibility with SQLAlchemy 2.0 AsyncIO.
    Handles legacy postgres:// and postgresql:// schemes provided by cloud hosts
    (Supabase, Neon, Render, Railway, AWS RDS) by converting them to postgresql+asyncpg://.
    """
    if not url:
        return "sqlite+aiosqlite:///./fitcheck.db"
    
    clean = url.strip()
    if clean.startswith("postgres://"):
        clean = "postgresql+asyncpg://" + clean[len("postgres://"):]
    elif clean.startswith("postgresql://") and not clean.startswith("postgresql+"):
        clean = "postgresql+asyncpg://" + clean[len("postgresql://"):]
    
    return clean

DATABASE_URL = normalize_database_url(settings.DATABASE_URL)

connect_args = {}
engine_kwargs = {
    "echo": settings.DEBUG,
    "future": True,
}

if "sqlite" in DATABASE_URL:
    connect_args["check_same_thread"] = False
else:
    # Production PostgreSQL connection tuning
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20
    engine_kwargs["pool_pre_ping"] = True  # Automatically test connections to recover from dropped cloud connections

engine = create_async_engine(
    DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    import app.models  # noqa: F401 - ensure models are registered on Base.metadata
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
