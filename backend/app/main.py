import sys
import os
import types

# Ensure 'backend' package exists in sys.modules so internal absolute imports work
# regardless of whether Python was started from the repo root or inside backend/ (e.g. Vercel)
if "backend" not in sys.modules:
    try:
        import backend
    except ImportError:
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        backend_pkg = types.ModuleType("backend")
        backend_pkg.__path__ = [backend_dir]
        backend_pkg.__file__ = os.path.join(backend_dir, "__init__.py")
        sys.modules["backend"] = backend_pkg

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.app.core.config import settings
from backend.app.api.router import api_router
from backend.app.db.init_db import init_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed realistic sample data
    init_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS setup for Vite frontend (local dev + Vercel preview & production domains)
cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    cors_origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https?://.*\.vercel\.app$",
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME, "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
