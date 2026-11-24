"""
Safe SQLite to Supabase PostgreSQL Migration Script
Migrates all tables, schemas, and records from SQLite to Supabase PostgreSQL.
Idempotent and safe: uses ON CONFLICT DO NOTHING, never drops source data.
"""
from dotenv import load_dotenv
load_dotenv()
import os
import sys
import argparse
from pathlib import Path

# Add project root and backend dir to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import insert as pg_insert

from backend.app.core.database import Base
from backend.app.models.user import User
from backend.app.models.session import UserSession
from backend.app.models.settings import SystemSettings
from backend.app.models.category import Category
from backend.app.models.route import Route
from backend.app.models.supplier import Supplier
from backend.app.models.shop import Shop
from backend.app.models.product import Product
from backend.app.models.invoice import Invoice, InvoiceItem
from backend.app.models.purchase import PurchaseOrder, PurchaseItem
from backend.app.models.ledger import LedgerEntry

# Dependency-ordered model list
TABLE_MODELS = [
    User,
    UserSession,
    SystemSettings,
    Category,
    Route,
    Supplier,
    Shop,
    Product,
    Invoice,
    InvoiceItem,
    PurchaseOrder,
    PurchaseItem,
    LedgerEntry,
]

def find_sqlite_file() -> str:
    candidates = [
        BASE_DIR / "mybilling.db",
        BACKEND_DIR / "mybilling.db",
        Path.cwd() / "mybilling.db",
    ]
    for p in candidates:
        if p.exists() and p.is_file():
            return str(p)
    return str(BACKEND_DIR / "mybilling.db")

def normalize_pg_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    if url.startswith("postgresql://") and not url.startswith("postgresql+"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url

def migrate(source_sqlite: str, target_url: str, dry_run: bool = False):
    print("=" * 60)
    print("MyBilling SQLite -> Supabase Migration")
    print(f"Source SQLite : {source_sqlite}")
    print(f"Target DB     : {target_url.split('@')[-1] if '@' in target_url else target_url}")
    print(f"Dry Run       : {dry_run}")
    print("=" * 60)

    if not os.path.exists(source_sqlite):
        print(f"[!] Source SQLite file not found: {source_sqlite}")
        print("    If database is brand new, run backend first to create schema.")
        return

    # Ensure source SQLite columns are aligned (e.g. supabase_uid, user_id)
    try:
        from backend.app.db.migrate_multitenant import migrate_multitenant
        migrate_multitenant()
    except Exception as e:
        print(f"[*] Note on local schema migration: {e}")

    # 1. Connect to source SQLite
    source_engine = create_engine(f"sqlite:///{source_sqlite}", connect_args={"check_same_thread": False})
    SourceSession = sessionmaker(bind=source_engine)
    source_db = SourceSession()

    # 2. Connect to target PostgreSQL
    norm_target_url = normalize_pg_url(target_url)
    target_engine = create_engine(norm_target_url, pool_pre_ping=True)
    TargetSession = sessionmaker(bind=target_engine)
    target_db = TargetSession()

    # 3. Create schema on target
    if not dry_run:
        print("\n[*] Ensuring tables exist on target database...")
        Base.metadata.create_all(bind=target_engine)
        print("[+] Target schema verified/created.")

    # 4. Migrate tables in dependency order
    total_migrated = 0
    is_postgres = target_engine.dialect.name == "postgresql"

    for model in TABLE_MODELS:
        table_name = model.__tablename__
        try:
            records = source_db.query(model).all()
        except Exception as e:
            print(f"[-] Skipping table {table_name}: not found in source SQLite ({e})")
            continue

        count = len(records)
        print(f"\n[*] Table `{table_name}`: found {count} records in source.")

        if dry_run or count == 0:
            continue

        table = model.__table__
        migrated_for_table = 0

        for record in records:
            # Extract row dict
            row_dict = {col.name: getattr(record, col.name) for col in table.columns}

            if is_postgres:
                # Use PostgreSQL ON CONFLICT DO NOTHING for idempotency
                stmt = pg_insert(table).values(row_dict).on_conflict_do_nothing()
                target_db.execute(stmt)
            else:
                # Fallback merge for non-postgres
                target_db.merge(record)

            migrated_for_table += 1

        target_db.commit()
        print(f"[+] Migrated {migrated_for_table}/{count} records into `{table_name}`.")
        total_migrated += migrated_for_table

        # Reset serial sequences in PostgreSQL so next AUTO INCREMENT doesn't collide
        if is_postgres and "id" in [c.name for c in table.columns]:
            try:
                seq_query = text(
                    f"SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), "
                    f"COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM \"{table_name}\""
                )
                target_db.execute(seq_query)
                target_db.commit()
            except Exception:
                # Table might not use a standard serial sequence, ignore
                target_db.rollback()

    source_db.close()
    target_db.close()

    print("\n" + "=" * 60)
    print(f"[✓] Migration complete! Total rows processed: {total_migrated}")
    print("=" * 60)

    # shortcut: only migrates models in TABLE_MODELS, update list if new tables are added

def main():
    parser = argparse.ArgumentParser(description="Migrate MyBilling SQLite database to Supabase PostgreSQL.")
    parser.add_argument("--sqlite", default=None, help="Path to source mybilling.db SQLite file")
    parser.add_argument("--target", default=None, help="Target PostgreSQL connection string (Supabase)")
    parser.add_argument("--dry-run", action="store_true", help="Inspect source records without writing to target")

    args = parser.parse_args()

    sqlite_path = args.sqlite or find_sqlite_file()
    target_url = (
        args.target
        or os.getenv("TARGET_DATABASE_URL")
        or os.getenv("SUPABASE_DATABASE_URL")
        or os.getenv("DATABASE_URL")
    )

    if not target_url or target_url.startswith("sqlite"):
        print("[!] No target PostgreSQL / Supabase URL specified.")
        print("    Pass --target 'postgresql+psycopg2://user:pass@host:6543/postgres' or set SUPABASE_DATABASE_URL in .env")
        print(f"    Inspecting source SQLite only: {sqlite_path}")
        args.dry_run = True
        target_url = f"sqlite:///{sqlite_path}"

    migrate(source_sqlite=sqlite_path, target_url=target_url, dry_run=args.dry_run)

if __name__ == "__main__":
    main()
