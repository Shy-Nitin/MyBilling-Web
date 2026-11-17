from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.app.core.database import get_db
from backend.app.models.ledger import LedgerEntry
from backend.app.models.shop import Shop
from backend.app.models.supplier import Supplier
from backend.app.models.user import User
from backend.app.schemas.ledger import LedgerEntryCreate, LedgerEntryResponse
from backend.app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[LedgerEntryResponse])
def list_ledger_entries(
    account_type: Optional[str] = None,
    reference_type: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(LedgerEntry).filter(LedgerEntry.user_id == current_user.id)
    if account_type and account_type != "All":
        query = query.filter(LedgerEntry.account_type == account_type)
    if reference_type and reference_type != "All":
        query = query.filter(LedgerEntry.reference_type == reference_type)
    return query.order_by(LedgerEntry.transaction_date.desc()).limit(limit).all()

@router.get("/summary")
def get_ledger_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entries = db.query(LedgerEntry).filter(LedgerEntry.user_id == current_user.id).all()
    
    # Calculate cash on hand & bank balances
    cash_debits = sum(e.debit_amount for e in entries if e.account_type == "CASH")
    cash_credits = sum(e.credit_amount for e in entries if e.account_type == "CASH")
    cash_in_drawer = cash_debits - cash_credits

    bank_debits = sum(e.debit_amount for e in entries if e.account_type == "BANK")
    bank_credits = sum(e.credit_amount for e in entries if e.account_type == "BANK")
    bank_balance = bank_debits - bank_credits

    # Receivables & Payables
    total_receivable = sum(s.current_balance for s in db.query(Shop).filter(Shop.user_id == current_user.id).all())
    total_payable = sum(sup.outstanding_balance for sup in db.query(Supplier).filter(Supplier.user_id == current_user.id).all())

    return {
        "cash_in_drawer": round(max(0.0, cash_in_drawer), 2),
        "bank_balance": round(max(0.0, bank_balance), 2),
        "total_receivables": round(total_receivable, 2),
        "total_payables": round(total_payable, 2),
    }

@router.post("", response_model=LedgerEntryResponse)
def create_manual_voucher(
    entry_in: LedgerEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry_count = db.query(LedgerEntry).filter(LedgerEntry.user_id == current_user.id).count() + 1
    entry_number = f"MAN-{datetime.utcnow().strftime('%Y%m')}-{entry_count:05d}"
    
    entry = LedgerEntry(
        user_id=current_user.id,
        entry_number=entry_number,
        transaction_date=entry_in.transaction_date or datetime.utcnow(),
        reference_type=entry_in.reference_type,
        reference_id=entry_in.reference_id,
        shop_id=entry_in.shop_id,
        supplier_id=entry_in.supplier_id,
        account_type=entry_in.account_type,
        description=entry_in.description,
        debit_amount=entry_in.debit_amount,
        credit_amount=entry_in.credit_amount,
        running_balance=0.0,
        payment_mode=entry_in.payment_mode
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
