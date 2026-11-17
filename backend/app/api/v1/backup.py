import os
import shutil
import sqlite3
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from backend.app.core.database import engine
from backend.app.models.user import User
from backend.app.api.deps import get_current_admin

router = APIRouter()

BACKUP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../backups"))
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../mybilling.db"))

def _ensure_backup_dir():
    os.makedirs(BACKUP_DIR, exist_ok=True)

class BackupInfo(BaseModel):
    filename: str
    size_bytes: int
    size_formatted: str
    created_at: str
    timestamp: float

def _format_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.2f} MB"

def _verify_sqlite_db(path: str) -> bool:
    try:
        conn = sqlite3.connect(path)
        cur = conn.cursor()
        cur.execute("PRAGMA integrity_check;")
        res = cur.fetchone()
        conn.close()
        return res is not None and res[0] == "ok"
    except Exception:
        return False

@router.get("/list", response_model=List[BackupInfo])
def list_backups(admin: User = Depends(get_current_admin)):
    """Master Admin: List available system database snapshot files."""
    _ensure_backup_dir()
    backups = []
    for f in os.listdir(BACKUP_DIR):
        if f.endswith(".db"):
            fp = os.path.join(BACKUP_DIR, f)
            stat = os.stat(fp)
            backups.append(BackupInfo(
                filename=f,
                size_bytes=stat.st_size,
                size_formatted=_format_size(stat.st_size),
                created_at=datetime.fromtimestamp(stat.st_mtime).strftime("%d-%b-%Y %I:%M %p"),
                timestamp=stat.st_mtime
            ))
    backups.sort(key=lambda b: b.timestamp, reverse=True)
    return backups

@router.post("/create", response_model=BackupInfo)
def create_backup(admin: User = Depends(get_current_admin)):
    """Master Admin: Trigger an atomic SQLite snapshot."""
    _ensure_backup_dir()
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=404, detail="Primary database file not found on disk.")

    timestamp_str = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    backup_filename = f"mybilling-backup-{timestamp_str}.db"
    backup_path = os.path.join(BACKUP_DIR, backup_filename)

    try:
        src = sqlite3.connect(DB_PATH)
        dst = sqlite3.connect(backup_path)
        with dst:
            src.backup(dst, pages=100)
        dst.close()
        src.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup process failed: {str(e)}")

    if not _verify_sqlite_db(backup_path):
        if os.path.exists(backup_path):
            os.remove(backup_path)
        raise HTTPException(status_code=500, detail="Backup file corrupted or failed SQLite integrity check.")

    stat = os.stat(backup_path)
    return BackupInfo(
        filename=backup_filename,
        size_bytes=stat.st_size,
        size_formatted=_format_size(stat.st_size),
        created_at=datetime.fromtimestamp(stat.st_mtime).strftime("%d-%b-%Y %I:%M %p"),
        timestamp=stat.st_mtime
    )

@router.post("/restore")
def restore_backup(filename: str, admin: User = Depends(get_current_admin)):
    """Master Admin: Safely restore a historical database snapshot."""
    _ensure_backup_dir()
    backup_path = os.path.join(BACKUP_DIR, filename)
    if not os.path.exists(backup_path):
        raise HTTPException(status_code=404, detail=f"Backup snapshot '{filename}' not found.")

    if not _verify_sqlite_db(backup_path):
        raise HTTPException(status_code=400, detail="Selected backup failed SQLite integrity check. Cannot restore.")

    pre_restore_ts = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    safety_copy = os.path.join(BACKUP_DIR, f"pre-restore-safety-{pre_restore_ts}.db")
    if os.path.exists(DB_PATH):
        shutil.copy2(DB_PATH, safety_copy)

    try:
        shutil.copy2(backup_path, DB_PATH)
    except Exception as e:
        if os.path.exists(safety_copy):
            shutil.copy2(safety_copy, DB_PATH)
        raise HTTPException(status_code=500, detail=f"Restore operation failed: {str(e)}")

    return {
        "success": True,
        "message": f"Successfully restored system from snapshot '{filename}'. Previous active state saved as safety backup.",
        "safety_backup": os.path.basename(safety_copy)
    }

@router.get("/download/{filename}")
def download_backup(filename: str, admin: User = Depends(get_current_admin)):
    """Master Admin: Download a snapshot database file."""
    _ensure_backup_dir()
    backup_path = os.path.join(BACKUP_DIR, filename)
    if not os.path.exists(backup_path):
        raise HTTPException(status_code=404, detail=f"Backup file '{filename}' not found.")
    return FileResponse(
        path=backup_path,
        filename=filename,
        media_type="application/x-sqlite3"
    )

@router.delete("/{filename}")
def delete_backup(filename: str, admin: User = Depends(get_current_admin)):
    """Master Admin: Remove an old backup snapshot file."""
    _ensure_backup_dir()
    backup_path = os.path.join(BACKUP_DIR, filename)
    if not os.path.exists(backup_path):
        raise HTTPException(status_code=404, detail="Backup file not found.")
    os.remove(backup_path)
    return {"success": True, "message": f"Snapshot '{filename}' deleted."}
