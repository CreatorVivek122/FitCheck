import os
from typing import List, Optional
from pydantic import BaseModel, Field

def _load_env_file():
    """Loads key-value pairs from .env file into os.environ if present."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    candidate_paths = [
        os.path.join(base_dir, ".env"),
        os.path.join(os.getcwd(), ".env"),
        os.path.join(os.getcwd(), "backend", ".env")
    ]
    for env_path in candidate_paths:
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k not in os.environ or not os.environ[k]:
                        os.environ[k] = v
            break

_load_env_file()

class Settings(BaseModel):
    PROJECT_NAME: str = "FitCheck"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    DEBUG: bool = Field(default_factory=lambda: os.getenv("DEBUG", "true").lower() in ("true", "1", "t"))
    
    # Storage settings
    STORAGE_TYPE: str = Field(default_factory=lambda: os.getenv("STORAGE_TYPE", "local"))
    STORAGE_DIR: str = Field(default_factory=lambda: os.getenv("STORAGE_DIR", "storage_data"))
    MAX_UPLOAD_BYTES: int = 10 * 1024 * 1024  # 10 MB
    MAX_IMAGE_DIMENSION: int = 4096
    MIN_IMAGE_DIMENSION: int = 150
    ALLOWED_MIME_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]
    
    # Database
    DATABASE_URL: str = Field(
        default_factory=lambda: os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./fitcheck.db")
    )
    
    # AI Provider configuration
    GEMINI_API_KEY: Optional[str] = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY"))
    GEMINI_MODEL: str = Field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))
    PREFER_LOCAL_CV: bool = Field(default_factory=lambda: os.getenv("PREFER_LOCAL_CV", "false").lower() in ("true", "1", "t"))
    
    # Security & Rate Limiting
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    SECRET_KEY: str = Field(default_factory=lambda: os.getenv("SECRET_KEY", "fitcheck-dev-secret-key-change-in-production-2026"))
    DEFAULT_USER_ID: str = "user-default-001"

settings = Settings()

