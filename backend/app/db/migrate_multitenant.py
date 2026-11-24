import sys
from pathlib import Path

# Add project root and backend dir to sys.path
_BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
_BACKEND_DIR = _BASE_DIR / "backend"
if str(_BASE_DIR) not in sys.path:
    sys.path.insert(0, str(_BASE_DIR))
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

import sqlite3
from sqlalchemy import text
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.core.security import get_password_hash
from backend.app.models.user import User
from backend.app.models.session import UserSession
from backend.app.models.settings import SystemSettings

def migrate_multitenant():
    """Ensure multi-tenant tables and user_id columns exist across all business entities."""
    # 1. Create tables for all models if not existing
    Base.metadata.create_all(bind=engine)
    
    # 2. Check and add user_id column to existing tables for SQLite
    db_url = str(engine.url)
    if "sqlite" in db_url:
        tables_to_check = [
            "products",
            "shops",
            "suppliers",
            "invoices",
            "purchase_orders",
            "ledger_entries",
            "routes",
            "categories",
            "system_settings",
        ]
        
        with engine.connect() as conn:
            for table in tables_to_check:
                # Check if table exists
                tbl_check = conn.execute(text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")).fetchone()
                if not tbl_check:
                    continue
                
                # Check columns
                cols = conn.execute(text(f"PRAGMA table_info('{table}')")).fetchall()
                col_names = [c[1] for c in cols]
                if "user_id" not in col_names:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN user_id INTEGER DEFAULT 1"))
                    conn.commit()
            
            # Ensure users table has supabase_uid column
            user_cols = conn.execute(text("PRAGMA table_info('users')")).fetchall()
            user_col_names = [c[1] for c in user_cols]
            if "supabase_uid" not in user_col_names:
                conn.execute(text("ALTER TABLE users ADD COLUMN supabase_uid VARCHAR(64)"))
                conn.commit()
    
    # 3. Seed default Master Admin and standard user if table is empty
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            # Default Master Admin
            admin_user = User(
                id=1,
                email="admin@mybilling.com",
                password_hash=get_password_hash("AdminPassword@123"),
                full_name="Nitin Parashar",
                business_name="MyBilling Enterprise",
                role="master_admin",
                is_active=True,
            )
            db.add(admin_user)
            db.commit()

            # Seed demo/standard user
            demo_user = User(
                id=2,
                email="demo@mybilling.com",
                password_hash=get_password_hash("DemoPassword@123"),
                full_name="Demo Merchant",
                business_name="Demo Retail Store",
                role="user",
                is_active=True,
            )
            db.add(demo_user)
            db.commit()

            # Ensure system settings for user 1 and user 2
            s1 = db.query(SystemSettings).filter(SystemSettings.user_id == 1).first()
            if not s1:
                settings1 = SystemSettings(
                    user_id=1,
                    store_name="MyBilling Enterprise Store",
                    tagline="Executive Precision ERP",
                    email="admin@mybilling.com"
                )
                db.add(settings1)

            s2 = db.query(SystemSettings).filter(SystemSettings.user_id == 2).first()
            if not s2:
                settings2 = SystemSettings(
                    user_id=2,
                    store_name="Demo Retail Store",
                    tagline="Fast POS & Invoicing",
                    email="demo@mybilling.com"
                )
                db.add(settings2)
            db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_multitenant()
    print("Multi-tenant migration complete.")
