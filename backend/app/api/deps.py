from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.core.security import decode_access_token
from backend.app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)

def get_authenticated_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Validate identity from Authorization Bearer token or HttpOnly cookie (App or Supabase Auth)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Check Authorization header first, then fallback to cookie
    auth_token = token
    if not auth_token:
        auth_token = request.cookies.get("mybilling_access_token")

    if not auth_token:
        raise credentials_exception

    payload = decode_access_token(auth_token)
    if not payload:
        raise credentials_exception

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise credentials_exception

    user = None
    # 1. If token is issued via Supabase Auth (sub is a UUID)
    if payload.get("supabase"):
        user = db.query(User).filter(
            (User.supabase_uid == user_id_str) | (User.email == payload.get("email"))
        ).first()
        if user and not user.supabase_uid:
            user.supabase_uid = user_id_str
            db.commit()
    else:
        # 2. Standard application token (sub is user.id integer or email)
        try:
            user_id = int(user_id_str)
            user = db.query(User).filter(User.id == user_id).first()
        except ValueError:
            user = db.query(User).filter(
                (User.supabase_uid == user_id_str) | (User.email == payload.get("email"))
            ).first()

    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account."
        )

    return user

def get_current_user(
    request: Request,
    auth_user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
) -> User:
    """
    Returns effective tenant user context for business data scoping.
    - Default (Normal Users & Master Admin): Returns caller's own User record.
    - Switched Context: Master Admin can supply 'X-Active-User-Id' header to inspect
      and manage a specific user's individual workspace.
    - Normal Users are strictly forbidden from passing another user's ID (403 Forbidden).
    """
    active_user_header = request.headers.get("X-Active-User-Id")
    if not active_user_header:
        active_user_header = request.query_params.get("active_user_id")

    if active_user_header:
        try:
            target_id = int(active_user_header)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid X-Active-User-Id header format. Must be an integer."
            )

        # IDOR Protection: Normal user cannot switch workspace context
        if auth_user.role != "master_admin":
            if target_id != auth_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Normal users cannot switch workspaces or access another user's data."
                )
            return auth_user

        # Master Admin switching context
        if target_id == auth_user.id:
            return auth_user

        target_user = db.query(User).filter(User.id == target_id).first()
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target workspace for user ID {target_id} not found."
            )
        if not target_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target user account is disabled."
            )
        return target_user

    # Default: Return authenticated user's own workspace
    return auth_user

def get_current_admin(
    auth_user: User = Depends(get_authenticated_user)
) -> User:
    """Enforce Master Admin role on administrative operations."""
    if auth_user.role != "master_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The operation requires Master Admin privileges."
        )
    return auth_user
