import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional

# Automatically load environment variables from root or backend .env
_current_file = Path(__file__).resolve()
_root_dir = _current_file.parent.parent.parent.parent
load_dotenv(_root_dir / ".env")
load_dotenv(_current_file.parent.parent.parent / ".env")
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "MyBilling ERP"
    API_V1_STR: str = "/api/v1"
    
    # Primary database URL: defaults to SQLite for immediate out-of-the-box local execution,
    # and can be overridden by DATABASE_URL environment variable for PostgreSQL / Supabase.
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./mybilling.db"
    )
    
    # Supabase configuration (optional / production)
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL", "").strip() or None
    SUPABASE_ANON_KEY: Optional[str] = os.getenv("SUPABASE_ANON_KEY", "").strip() or None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip() or None
    SUPABASE_JWT_SECRET: Optional[str] = os.getenv("SUPABASE_JWT_SECRET", "").strip() or None
    
    # Server configs
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Authentication & Security
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", 
        "mybilling-super-secure-production-grade-signing-key-2026-auth-token"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    MAX_SESSION_LIFETIME_DAYS: int = 90
    
    # Cookie Configuration
    COOKIE_SECURE: bool = os.getenv("ENVIRONMENT", "development").lower() == "production"
    COOKIE_SAMESITE: str = "lax"
    
    class Config:
        case_sensitive = True

settings = Settings()
