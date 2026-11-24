from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool, QueuePool
from backend.app.core.config import settings

def normalize_database_url(url: str) -> str:
    cleaned = url.strip()
    if cleaned.startswith("postgres://"):
        return cleaned.replace("postgres://", "postgresql+psycopg2://", 1)
    if cleaned.startswith("postgresql://") and not cleaned.startswith("postgresql+"):
        return cleaned.replace("postgresql://", "postgresql+psycopg2://", 1)
    return cleaned

def create_db_engine(url: str, is_secure: bool = False):
    norm_url = normalize_database_url(url)
    connect_args = {}
    engine_kwargs = {"pool_pre_ping": True}

    if norm_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    else:
        # Supabase PostgreSQL / Vercel Serverless connection pooling configuration
        # For serverless functions or Supabase pooler (port 6543), avoid holding exhausted connection pools
        engine_kwargs["pool_recycle"] = 300
        if is_secure or ":6543" in norm_url:
            engine_kwargs["poolclass"] = NullPool
        else:
            engine_kwargs["pool_size"] = 5
            engine_kwargs["max_overflow"] = 2

    return create_engine(
        norm_url,
        connect_args=connect_args,
        **engine_kwargs
    )

engine = create_db_engine(settings.DATABASE_URL, is_secure=settings.COOKIE_SECURE)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
