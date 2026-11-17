import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "MyBilling ERP"
    API_V1_STR: str = "/api/v1"
    
    # Primary database URL: defaults to SQLite for immediate out-of-the-box local execution,
    # and can be overridden by DATABASE_URL environment variable for PostgreSQL.
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./mybilling.db"
    )
    
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
