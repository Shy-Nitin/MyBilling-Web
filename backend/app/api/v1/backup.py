import os
import shutil
import sqlite3
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from backend.app.core.database import engine

router = APIRouter()

BACKUP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../backups"))
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../mybilling.db"))

def _ensure_backup_dir():
    os.makedirs(BACKUP_DIR, exist_ok=True)

class BackupInfo(BaseModel):
    filename: str
    size_bytes: int
    size_kb: float
    created_at: str
    is_auto_snapshot: bool = False

def _verify_sqlite_db(path: str) -> bool:
    try:
        with open(path, "rb") as f:
            header = f.read(16)
            if not header.startswith(b"SQLite format 3\x00"):
                return False
        conn = sqlite3.connect(path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA quick_check")
        res = cursor.fetchone()
        conn.close()
        return res is not None and res[0] == "ok"
    except Exception:
        return False

@router.get("/list", response_model=List[BackupInfo])
def list_backups():
    _ensure_backup_dir()
    files = []
    for fname in os.listdir(BACKUP_DIR):
        if fname.endswith(".db"):
            fpath = os.path.join(BACKUP_DIR, fname)
            stat = os.stat(fpath)
            dt_str = datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S")
            files.append(
                BackupInfo(
                    filename=fname,
                    size_bytes=stat.st_size,
                    size_kb=round(stat.st_size / 1024.0, 1),
                    created_at=dt_str,
                    is_auto_snapshot="snapshot" in fname.lower()
                )
            )
    files.sort(key=lambda x: x.created_at, reverse=True)
    return files

@router.post("/create", response_model=BackupInfo)
def create_backup():
    _ensure_backup_dir()
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=404, detail="Active database file not found.")

    timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    backup_filename = f"maya-billing-backup-{timestamp}.db"
    backup_path = os.path.join(BACKUP_DIR, backup_filename)

    # Use SQLite online backup API to ensure 100% consistent live snapshot
    try:
        src = sqlite3.connect(DB_PATH)
        dst = sqlite3.connect(backup_path)
        with dst:
            src.backup(dst)
        dst.close()
        src.close()
    except Exception as e:
        shutil.copy2(DB_PATH, backup_path)

    stat = os.stat(backup_path)
    return BackupInfo(
        filename=backup_filename,
        size_bytes=stat.st_size,
        size_kb=round(stat.st_size / 1024.0, 1),
        created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        is_auto_snapshot=False
    )

@router.get("/download/{filename}")
def download_backup(filename: str):
    _ensure_backup_dir()
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(BACKUP_DIR, safe_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Backup file not found.")
    return FileResponse(
        path=file_path,
        filename=safe_filename,
        media_type="application/x-sqlite3"
    )

@router.delete("/{filename}")
def delete_backup(filename: str):
    _ensure_backup_dir()
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(BACKUP_DIR, safe_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Backup file not found.")
    try:
        os.remove(file_path)
        return {"success": True, "message": f"Backup {safe_filename} removed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete backup: {str(e)}")

@router.post("/restore")
async def restore_backup(
    filename: Optional[str] = Query(None, description="Filename from existing backups list"),
    file: Optional[UploadFile] = File(None)
):
    _ensure_backup_dir()
    temp_restore_path = None

    if file:
        temp_restore_path = os.path.join(BACKUP_DIR, f"temp-upload-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.db")
        try:
            content = await file.read()
            with open(temp_restore_path, "wb") as f:
                f.write(content)
            source_path = temp_restore_path
        except Exception as e:
            if temp_restore_path and os.path.exists(temp_restore_path):
                os.remove(temp_restore_path)
            raise HTTPException(status_code=400, detail=f"Failed to process uploaded file: {str(e)}")
    elif filename:
        safe_filename = os.path.basename(filename)
        source_path = os.path.join(BACKUP_DIR, safe_filename)
        if not os.path.exists(source_path):
            raise HTTPException(status_code=404, detail="Specified backup file not found.")
    else:
        raise HTTPException(status_code=400, detail="Provide either a backup filename or upload a .db file.")

    # 1. Validate SQLite database integrity before touching live database
    if not _verify_sqlite_db(source_path):
        if temp_restore_path and os.path.exists(temp_restore_path):
            os.remove(temp_restore_path)
        raise HTTPException(status_code=400, detail="Corrupt or invalid SQLite database file. Restore aborted.")

    # 2. Create pre-restore safety snapshot of current database
    snapshot_filename = f"pre-restore-snapshot-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}.db"
    snapshot_path = os.path.join(BACKUP_DIR, snapshot_filename)
    if os.path.exists(DB_PATH):
        try:
            shutil.copy2(DB_PATH, snapshot_path)
        except Exception as e:
            if temp_restore_path and os.path.exists(temp_restore_path):
                os.remove(temp_restore_path)
            raise HTTPException(status_code=500, detail=f"Safety snapshot failed: {str(e)}")

    # 3. Dispose active SQLAlchemy connections
    engine.dispose()

    # 4. Atomic copy / replace
    try:
        shutil.copy2(source_path, DB_PATH)
        # Reconnect test
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in cursor.fetchall()]
        conn.close()
    except Exception as e:
        # Rollback from safety snapshot!
        if os.path.exists(snapshot_path):
            shutil.copy2(snapshot_path, DB_PATH)
        if temp_restore_path and os.path.exists(temp_restore_path):
            os.remove(temp_restore_path)
        raise HTTPException(status_code=500, detail=f"Database restore failed. Rolled back to safety snapshot. Error: {str(e)}")

    # Cleanup temp upload file
    if temp_restore_path and os.path.exists(temp_restore_path):
        os.remove(temp_restore_path)

    return {
        "success": True,
        "message": "Database restored successfully. All tables and data reloaded.",
        "tables_restored": len(tables),
        "safety_snapshot": snapshot_filename
    }
