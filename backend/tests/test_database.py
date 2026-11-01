import pytest
from app.db.session import normalize_database_url
from sqlalchemy.ext.asyncio import create_async_engine

def test_normalize_database_url():
    # 1. Heroku / Render / Supabase legacy postgres://
    raw_postgres = "postgres://postgres:password123@db.supabase.co:5432/postgres"
    expected = "postgresql+asyncpg://postgres:password123@db.supabase.co:5432/postgres"
    assert normalize_database_url(raw_postgres) == expected

    # 2. Standard postgresql:// without async driver
    raw_postgresql = "postgresql://user:secret@ep-cool-db.neon.tech:5432/main"
    expected_neon = "postgresql+asyncpg://user:secret@ep-cool-db.neon.tech:5432/main"
    assert normalize_database_url(raw_postgresql) == expected_neon

    # 3. Already normalized postgresql+asyncpg://
    already_clean = "postgresql+asyncpg://admin:pass@host:5432/fitcheck"
    assert normalize_database_url(already_clean) == already_clean

    # 4. SQLite preserved
    sqlite_url = "sqlite+aiosqlite:///./test.db"
    assert normalize_database_url(sqlite_url) == sqlite_url

    # 5. Empty string fallback
    assert normalize_database_url("") == "sqlite+aiosqlite:///./fitcheck.db"


def test_asyncpg_engine_creation():
    # Verifies that asyncpg driver is recognized by SQLAlchemy without missing module errors
    mock_pg_url = "postgresql+asyncpg://test_user:test_pass@localhost:5432/test_db"
    engine = create_async_engine(mock_pg_url)
    assert engine.dialect.name == "postgresql"
    assert engine.dialect.driver == "asyncpg"


@pytest.mark.anyio
async def test_init_db_registers_all_tables():
    from app.db.session import Base
    import app.models  # ensure models are imported
    table_names = set(Base.metadata.tables.keys())
    expected_tables = {"users", "image_uploads", "analysis_jobs", "fit_reports"}
    assert expected_tables.issubset(table_names)
