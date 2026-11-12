from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.app.core.database import get_db
from backend.app.schemas.report import ProfitAnalyticsPoint, CategoryMargin, TaxSummary, InvoiceProfitSummary
from backend.app.services.report_service import get_profit_analytics_series, get_category_margins, get_invoice_profit_summaries
from backend.app.models.invoice import Invoice

router = APIRouter()

@router.get("/profit-trends", response_model=List[ProfitAnalyticsPoint])
def profit_trends(db: Session = Depends(get_db)):
    return get_profit_analytics_series(db)

@router.get("/category-margins", response_model=List[CategoryMargin])
def category_margins(db: Session = Depends(get_db)):
    return get_category_margins(db)

@router.get("/profit-breakdown", response_model=List[InvoiceProfitSummary])
def profit_breakdown(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    shop_id: Optional[int] = None,
    product_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    s_date = datetime.fromisoformat(start_date) if start_date else None
    e_date = datetime.fromisoformat(end_date) if end_date else None
    return get_invoice_profit_summaries(db, start_date=s_date, end_date=e_date, shop_id=shop_id, product_id=product_id)

@router.get("/tax-summary", response_model=TaxSummary)
def tax_summary(db: Session = Depends(get_db)):
    invoices = db.query(Invoice).all()
    total_tax = sum(inv.tax_amount for inv in invoices)
    total_taxable = sum(inv.subtotal - inv.discount_amount for inv in invoices)
    
    half_tax = round(total_tax / 2.0, 2)
    return TaxSummary(
        taxable_amount=round(total_taxable, 2),
        cgst_amount=half_tax,
        sgst_amount=half_tax,
        igst_amount=0.0,
        total_tax=round(total_tax, 2)
    )
