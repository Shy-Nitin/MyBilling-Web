import time
from datetime import datetime, timedelta
from threading import Lock
from fastapi import APIRouter, Depends, HTTPException, Response, Header, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from backend.app.core.database import get_db
from backend.app.models.invoice import Invoice
from backend.app.models.settings import SystemSettings
from backend.app.models.user import User
from backend.app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse
from backend.app.services.billing_service import create_sale_invoice, update_sale_invoice, delete_sale_invoice
from backend.app.services.pdf_service import generate_invoice_pdf, generate_profit_report_pdf
from backend.app.api.deps import get_current_user

router = APIRouter()

# Thread-safe in-memory idempotency cache: key -> (timestamp, invoice_id)
_idempotency_cache: Dict[str, tuple[float, int]] = {}
_cache_lock = Lock()
IDEMPOTENCY_TTL_SECONDS = 60.0

def _cleanup_idempotency_cache():
    now = time.time()
    expired = [k for k, (ts, _) in _idempotency_cache.items() if now - ts > IDEMPOTENCY_TTL_SECONDS]
    for k in expired:
        _idempotency_cache.pop(k, None)

@router.post("/invoices", response_model=InvoiceResponse)
def create_invoice(
    invoice_in: InvoiceCreate,
    x_idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    key = x_idempotency_key or invoice_in.idempotency_key
    if key:
        with _cache_lock:
            _cleanup_idempotency_cache()
            if key in _idempotency_cache:
                _, existing_inv_id = _idempotency_cache[key]
                existing_invoice = db.query(Invoice).filter(
                    Invoice.id == existing_inv_id,
                    Invoice.user_id == current_user.id
                ).first()
                if existing_invoice:
                    return existing_invoice

    invoice = create_sale_invoice(db, invoice_in, user_id=current_user.id)

    if key:
        with _cache_lock:
            _idempotency_cache[key] = (time.time(), invoice.id)

    return invoice

@router.put("/invoices/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_invoice = update_sale_invoice(db, invoice_id, invoice_update, user_id=current_user.id)
    return updated_invoice

@router.delete("/invoices/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = delete_sale_invoice(db, invoice_id, user_id=current_user.id)
    return result

@router.get("/invoices", response_model=List[InvoiceResponse])
def get_invoices(
    limit: int = 100,
    skip: int = 0,
    shop_id: Optional[int] = None,
    status: Optional[str] = Query("ALL", description="Filter by status: ALL, ACTIVE, DELIVERED, PAID, CREDIT, PARTIAL"),
    date_preset: Optional[str] = Query("all", description="today, yesterday, 7d, 30d, this_month, custom, all"),
    start_date: Optional[str] = Query(None, description="YYYY-MM-DD for custom range"),
    end_date: Optional[str] = Query(None, description="YYYY-MM-DD for custom range"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Invoice).filter(Invoice.user_id == current_user.id)
    if shop_id:
        query = query.filter(Invoice.shop_id == shop_id)

    # Status filter
    if status and status.upper() != "ALL":
        st = status.upper()
        if st == "ACTIVE":
            query = query.filter(Invoice.balance_amount > 0)
        elif st == "DELIVERED":
            query = query.filter(Invoice.balance_amount == 0)
        elif st in ["PAID", "CREDIT", "PARTIAL", "UNPAID"]:
            if st == "CREDIT":
                query = query.filter(Invoice.payment_mode == "UDHAR_CREDIT")
            else:
                query = query.filter(Invoice.payment_status == st)

    # Date filter
    now = datetime.utcnow()
    dp = (date_preset or "all").lower()
    if dp == "today":
        start_of_day = datetime(now.year, now.month, now.day)
        query = query.filter(Invoice.created_at >= start_of_day)
    elif dp == "yesterday":
        yest = now - timedelta(days=1)
        start_of_yest = datetime(yest.year, yest.month, yest.day)
        end_of_yest = datetime(yest.year, yest.month, yest.day, 23, 59, 59)
        query = query.filter(Invoice.created_at >= start_of_yest, Invoice.created_at <= end_of_yest)
    elif dp == "7d":
        start_7d = now - timedelta(days=7)
        query = query.filter(Invoice.created_at >= start_7d)
    elif dp == "30d":
        start_30d = now - timedelta(days=30)
        query = query.filter(Invoice.created_at >= start_30d)
    elif dp == "this_month":
        start_month = datetime(now.year, now.month, 1)
        query = query.filter(Invoice.created_at >= start_month)
    elif dp == "custom" or start_date or end_date:
        if start_date:
            try:
                sd = datetime.strptime(start_date, "%Y-%m-%d")
                query = query.filter(Invoice.created_at >= sd)
            except ValueError:
                pass
        if end_date:
            try:
                ed = datetime.strptime(end_date, "%Y-%m-%d")
                ed_end = datetime(ed.year, ed.month, ed.day, 23, 59, 59)
                query = query.filter(Invoice.created_at <= ed_end)
            except ValueError:
                pass

    return query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
def get_invoice_by_id(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    return invoice

@router.get("/invoices/{invoice_id}/pdf")
def download_invoice_pdf(
    invoice_id: int,
    format: str = Query("a4", pattern="^(a4|80mm|50mm)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    
    settings = db.query(SystemSettings).filter(SystemSettings.user_id == current_user.id).first()
    if not settings:
        settings = SystemSettings(user_id=current_user.id)

    pdf_bytes = generate_invoice_pdf(invoice, settings, format_name=format)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename={invoice.invoice_number}-{format}.pdf"
        }
    )

@router.get("/invoices/{invoice_id}/profit-pdf")
def download_invoice_profit_pdf(
    invoice_id: int,
    format: str = Query("a4", pattern="^(a4|80mm|50mm)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    
    settings = db.query(SystemSettings).filter(SystemSettings.user_id == current_user.id).first()
    if not settings:
        settings = SystemSettings(user_id=current_user.id)

    pdf_bytes = generate_profit_report_pdf(invoice, settings, format_name=format)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename=PROFIT-{invoice.invoice_number}-{format}.pdf"
        }
    )
