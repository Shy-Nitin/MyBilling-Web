from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.settings import SystemSettings
from backend.app.models.user import User
from backend.app.schemas.settings import SystemSettingsResponse, SystemSettingsUpdate
from backend.app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=SystemSettingsResponse)
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(SystemSettings).filter(SystemSettings.user_id == current_user.id).first()
    if not settings:
        settings = SystemSettings(
            user_id=current_user.id,
            store_name=current_user.business_name or "My Store",
            email=current_user.email
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("", response_model=SystemSettingsResponse)
def update_settings(
    settings_in: SystemSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(SystemSettings).filter(SystemSettings.user_id == current_user.id).first()
    if not settings:
        settings = SystemSettings(user_id=current_user.id)
        db.add(settings)

    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings
