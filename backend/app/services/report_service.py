from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional
from backend.app.models.invoice import Invoice, InvoiceItem
from backend.app.models.product import Product
from backend.app.models.shop import Shop
from backend.app.schemas.report import (
    DashboardMetrics,
    DailySalesPulse,
    ProfitAnalyticsPoint,
    CategoryMargin,
    InvoiceProfitSummary,
    InvoiceProfitItemSummary,
)

def _get_item_cost(item: InvoiceItem) -> float:
    return getattr(item, "landed_cost", None) or getattr(item, "unit_cost", 0.0) or 0.0

def _get_item_disc(item: InvoiceItem) -> float:
    return getattr(item, "discount_amount", 0.0) or 0.0

def get_dashboard_metrics(db: Session, date_range: str = "today", user_id: int = 1) -> DashboardMetrics:
    now = datetime.utcnow()
    rng = (date_range or "today").lower()

    if rng == "7d":
        period_start = now - timedelta(days=7)
        prev_start = now - timedelta(days=14)
        prev_end = period_start
    elif rng == "30d":
        period_start = now - timedelta(days=30)
        prev_start = now - timedelta(days=60)
        prev_end = period_start
    else: # today
        period_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        prev_start = period_start - timedelta(days=1)
        prev_end = period_start

    # Invoices in current period
    current_invoices = db.query(Invoice).filter(
        Invoice.created_at >= period_start,
        Invoice.user_id == user_id
    ).all()
    gross_revenue = sum(inv.total_amount for inv in current_invoices)
    
    curr_invoice_ids = [inv.id for inv in current_invoices]
    curr_items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id.in_(curr_invoice_ids)).all() if curr_invoice_ids else []
    
    net_profit = sum((item.unit_rate - _get_item_cost(item)) * item.quantity - _get_item_disc(item) for item in curr_items)
    net_profit = max(0.0, net_profit)

    # Invoices in previous period
    prev_invoices = db.query(Invoice).filter(
        Invoice.created_at >= prev_start,
        Invoice.created_at < prev_end,
        Invoice.user_id == user_id
    ).all()
    prev_revenue = sum(inv.total_amount for inv in prev_invoices)
    prev_ids = [inv.id for inv in prev_invoices]
    prev_items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id.in_(prev_ids)).all() if prev_ids else []
    prev_profit = max(0.0, sum((item.unit_rate - _get_item_cost(item)) * item.quantity - _get_item_disc(item) for item in prev_items))

    def _calc_change(curr: float, prev: float) -> float:
        if prev > 0:
            return round(((curr - prev) / prev) * 100.0, 1)
        return 0.0

    rev_change = _calc_change(gross_revenue, prev_revenue)
    profit_change = _calc_change(net_profit, prev_profit)
    velocity_change = _calc_change(float(len(current_invoices)), float(len(prev_invoices)))

    # Outstanding Udhar for user
    unsettled_udhar = db.query(func.sum(Shop.current_balance)).filter(Shop.user_id == user_id).scalar() or 0.0
    unsettled_udhar_count = db.query(Shop).filter(Shop.current_balance > 0, Shop.user_id == user_id).count()

    # Sales pulse
    pulse_slots = []
    if rng == "today":
        time_slots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
        for t in time_slots:
            hour = int(t.split(":")[0])
            slot_start = period_start + timedelta(hours=hour)
            slot_end = slot_start + timedelta(hours=2)
            slot_invoices = [inv for inv in current_invoices if slot_start <= inv.created_at < slot_end]
            sales = sum(inv.total_amount for inv in slot_invoices)
            cash_in = sum(inv.paid_amount for inv in slot_invoices)
            pulse_slots.append(
                DailySalesPulse(
                    time=t,
                    sales=round(sales, 2),
                    cash_in=round(cash_in, 2),
                    is_forecast=False
                )
            )
    elif rng == "7d":
        for i in range(6, -1, -1):
            day_dt = (now - timedelta(days=i)).date()
            d_start = datetime.combine(day_dt, datetime.min.time())
            d_end = datetime.combine(day_dt, datetime.max.time())
            slot_invoices = [inv for inv in current_invoices if d_start <= inv.created_at <= d_end]
            sales = sum(inv.total_amount for inv in slot_invoices)
            cash_in = sum(inv.paid_amount for inv in slot_invoices)
            pulse_slots.append(
                DailySalesPulse(
                    time=day_dt.strftime("%a %d"),
                    sales=round(sales, 2),
                    cash_in=round(cash_in, 2),
                    is_forecast=False
                )
            )
    else: # 30d
        for i in range(5, -1, -1):
            slot_start = now - timedelta(days=(i + 1) * 5)
            slot_end = now - timedelta(days=i * 5)
            slot_invoices = [inv for inv in current_invoices if slot_start <= inv.created_at <= slot_end]
            sales = sum(inv.total_amount for inv in slot_invoices)
            cash_in = sum(inv.paid_amount for inv in slot_invoices)
            pulse_slots.append(
                DailySalesPulse(
                    time=slot_end.strftime("%d %b"),
                    sales=round(sales, 2),
                    cash_in=round(cash_in, 2),
                    is_forecast=False
                )
            )

    recent_invoices = []
    recent_db_invoices = db.query(Invoice).filter(Invoice.user_id == user_id).order_by(Invoice.created_at.desc()).limit(10).all()
    for inv in recent_db_invoices:
        recent_invoices.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "shop_customer": inv.customer_name if not inv.shop else f"{inv.shop.name} ({inv.customer_name})",
            "time": inv.created_at.strftime("%I:%M %p"),
            "date": inv.created_at.strftime("%d-%b-%Y"),
            "amount": inv.total_amount,
            "status": inv.payment_status,
            "payment_mode": inv.payment_mode
        })

    return DashboardMetrics(
        gross_revenue_today=round(gross_revenue, 2),
        gross_revenue_change=rev_change,
        net_profit_today=round(net_profit, 2),
        net_profit_change=profit_change,
        unsettled_udhar=round(unsettled_udhar, 2),
        unsettled_udhar_count=unsettled_udhar_count,
        daily_velocity_invoices=len(current_invoices),
        daily_velocity_change=velocity_change,
        sales_pulse=pulse_slots,
        recent_invoices=recent_invoices
    )

def get_profit_analytics_series(db: Session, user_id: int = 1) -> list[ProfitAnalyticsPoint]:
    today = datetime.utcnow().date()
    points = []
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        day_start = datetime.combine(target_date, datetime.min.time())
        day_end = datetime.combine(target_date, datetime.max.time())
        
        day_invoices = db.query(Invoice).filter(
            Invoice.created_at >= day_start,
            Invoice.created_at <= day_end,
            Invoice.user_id == user_id
        ).all()
        gross_revenue = sum(inv.total_amount for inv in day_invoices)
        
        day_inv_ids = [inv.id for inv in day_invoices]
        day_items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id.in_(day_inv_ids)).all() if day_inv_ids else []
        
        net_profit = sum((item.unit_rate - _get_item_cost(item)) * item.quantity - _get_item_disc(item) for item in day_items)
        net_profit = max(0.0, net_profit)
        
        margin_percent = round((net_profit / gross_revenue * 100), 1) if gross_revenue > 0 else 0.0
        
        points.append(
            ProfitAnalyticsPoint(
                label=target_date.strftime("%a"),
                gross_revenue=round(gross_revenue, 2),
                net_profit=round(net_profit, 2),
                prior_revenue=0.0,
                margin_percent=margin_percent
            )
        )
    return points

def get_category_margins(db: Session, user_id: int = 1) -> list[CategoryMargin]:
    categories = [
        "Staples & Grains",
        "Edible Oils",
        "Beverages & Dairy",
        "Personal Care",
        "Snacks & Confectionery"
    ]
    
    results = []
    for cat in categories:
        items = db.query(InvoiceItem).join(
            Invoice, InvoiceItem.invoice_id == Invoice.id
        ).join(
            Product, InvoiceItem.product_id == Product.id
        ).filter(
            Product.category == cat,
            Invoice.user_id == user_id
        ).all()

        items_sold = sum(i.quantity for i in items)
        revenue = sum(i.total_amount for i in items)
        cogs = sum(_get_item_cost(i) * i.quantity for i in items)
        gross_profit = sum((i.unit_rate - _get_item_cost(i)) * i.quantity - _get_item_disc(i) for i in items)
        gross_profit = max(0.0, gross_profit)
        margin = round((gross_profit / revenue * 100), 1) if revenue > 0 else 0.0
        
        results.append(
            CategoryMargin(
                category=cat,
                items_sold=round(items_sold, 1),
                revenue=round(revenue, 2),
                cogs=round(cogs, 2),
                gross_profit=round(gross_profit, 2),
                margin_percent=margin
            )
        )
    return results

def get_invoice_profit_summaries(
    db: Session,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    shop_id: Optional[int] = None,
    product_id: Optional[int] = None,
    user_id: int = 1
) -> List[InvoiceProfitSummary]:
    query = db.query(Invoice).filter(Invoice.user_id == user_id)
    if start_date:
        query = query.filter(Invoice.created_at >= start_date)
    if end_date:
        query = query.filter(Invoice.created_at <= end_date)
    if shop_id:
        query = query.filter(Invoice.shop_id == shop_id)
        
    invoices = query.order_by(Invoice.created_at.desc()).all()
    summaries = []
    
    for inv in invoices:
        items = inv.items
        if product_id:
            items = [item for item in items if item.product_id == product_id]
            if not items:
                continue

        item_summaries = []
        inv_cost = 0.0
        inv_profit = 0.0

        for it in items:
            c = _get_item_cost(it)
            d = _get_item_disc(it)
            unit_profit = it.unit_rate - c
            item_profit = (unit_profit * it.quantity) - d
            item_cost = c * it.quantity
            
            inv_cost += item_cost
            inv_profit += item_profit

            item_summaries.append(
                InvoiceProfitItemSummary(
                    product_id=it.product_id,
                    sku=it.sku,
                    product_name=it.product_name,
                    pack_size=it.pack_size or "1 unit",
                    quantity=it.quantity,
                    unit=it.unit,
                    unit_cost=round(c, 2),
                    unit_rate=round(it.unit_rate, 2),
                    unit_profit=round(unit_profit, 2),
                    discount_amount=round(d, 2),
                    total_profit=round(item_profit, 2)
                )
            )

        margin_percent = round((inv_profit / inv.total_amount * 100), 1) if inv.total_amount > 0 else 0.0

        summaries.append(
            InvoiceProfitSummary(
                id=inv.id,
                invoice_number=inv.invoice_number,
                customer_name=inv.customer_name,
                shop_name=inv.shop.name if inv.shop else None,
                date=inv.created_at.strftime("%d-%b-%Y %I:%M %p"),
                total_amount=round(inv.total_amount, 2),
                total_cost=round(inv_cost, 2),
                total_profit=round(inv_profit, 2),
                profit_margin_percent=margin_percent,
                items=item_summaries
            )
        )

    return summaries
