from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.report import DashboardMetrics
from backend.app.services.report_service import get_dashboard_metrics
from backend.app.models.user import User
from backend.app.api.deps import get_current_user

router = APIRouter()

@router.get("/metrics", response_model=DashboardMetrics)
def read_dashboard_metrics(
    range: str = Query("today", description="Time range: today, 7d, 30d"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_dashboard_metrics(db, date_range=range, user_id=current_user.id)
