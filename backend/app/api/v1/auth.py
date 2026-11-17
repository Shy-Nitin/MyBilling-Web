from datetime import datetime, timedelta
import re
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token_string,
    hash_token,
)
from backend.app.models.user import User
from backend.app.models.session import UserSession
from backend.app.models.settings import SystemSettings
from backend.app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse
from backend.app.api.deps import get_current_user

router = APIRouter()

def validate_password_strength(password: str):
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )
    if not re.search(r"[A-Z]", password) or not re.search(r"[0-9]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter and one number."
        )

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    # Set access token cookie (short-lived)
    response.set_cookie(
        key="mybilling_access_token",
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
        path="/"
    )
    # Set refresh token cookie (long-lived persistent session: 30 days)
    response.set_cookie(
        key="mybilling_refresh_token",
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
        path="/"
    )

def clear_auth_cookies(response: Response):
    response.delete_cookie(key="mybilling_access_token", path="/")
    response.delete_cookie(key="mybilling_refresh_token", path="/")

@router.post("/signup", response_model=TokenResponse)
def signup(payload: UserRegister, request: Request, response: Response, db: Session = Depends(get_db)):
    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )
    validate_password_strength(payload.password)

    email_clean = payload.email.strip().lower()
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Create new user
    new_user = User(
        email=email_clean,
        password_hash=get_password_hash(payload.password),
        full_name=payload.full_name.strip(),
        business_name=payload.business_name.strip(),
        role="user",
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Automatically provision default store settings for the new tenant
    user_settings = SystemSettings(
        user_id=new_user.id,
        store_name=new_user.business_name,
        email=new_user.email,
        tagline="Precision Billing & Invoicing",
        currency_symbol="₹"
    )
    db.add(user_settings)

    # Create session tokens
    access_token = create_access_token(subject=new_user.id, role=new_user.role, email=new_user.email)
    raw_refresh_token = create_refresh_token_string()
    refresh_hash = hash_token(raw_refresh_token)

    now = datetime.utcnow()
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")[:250]

    user_session = UserSession(
        user_id=new_user.id,
        refresh_token_hash=refresh_hash,
        ip_address=client_ip,
        user_agent=user_agent,
        expires_at=now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        created_at=now,
        last_used_at=now,
        is_revoked=False
    )
    db.add(user_session)
    db.commit()
    db.refresh(new_user)

    set_auth_cookies(response, access_token, raw_refresh_token)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, request: Request, response: Response, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled. Please contact support."
        )

    # Issue tokens
    access_token = create_access_token(subject=user.id, role=user.role, email=user.email)
    raw_refresh_token = create_refresh_token_string()
    refresh_hash = hash_token(raw_refresh_token)

    now = datetime.utcnow()
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")[:250]

    session_record = UserSession(
        user_id=user.id,
        refresh_token_hash=refresh_hash,
        ip_address=client_ip,
        user_agent=user_agent,
        expires_at=now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        created_at=now,
        last_used_at=now,
        is_revoked=False
    )
    db.add(session_record)
    db.commit()

    set_auth_cookies(response, access_token, raw_refresh_token)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_refresh_token = request.cookies.get("mybilling_refresh_token")
    if not raw_refresh_token:
        # Check authorization header or query as fallback
        raw_refresh_token = request.headers.get("x-refresh-token")

    if not raw_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh session found."
        )

    hashed = hash_token(raw_refresh_token)
    session_record = db.query(UserSession).filter(
        UserSession.refresh_token_hash == hashed,
        UserSession.is_revoked == False
    ).first()

    now = datetime.utcnow()
    if not session_record:
        # Session not found; do not clear cookies proactively to avoid destroying valid concurrent sessions
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or was revoked. Please log in again."
        )

    # Check inactivity expiration (30 days) and absolute expiration (90 days)
    if session_record.expires_at < now or (session_record.created_at + timedelta(days=settings.MAX_SESSION_LIFETIME_DAYS)) < now:
        session_record.is_revoked = True
        db.commit()
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please log in again."
        )

    user = db.query(User).filter(User.id == session_record.user_id).first()
    if not user or not user.is_active:
        session_record.is_revoked = True
        db.commit()
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is no longer active."
        )

    # Handle concurrent request race conditions:
    # If this session record was already rotated and is currently in its 60-second grace window,
    # issue a valid access token without re-rotating or modifying cookies.
    is_in_grace_period = session_record.expires_at < (now + timedelta(days=1))
    if is_in_grace_period:
        access_token = create_access_token(subject=user.id, role=user.role, email=user.email)
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    # Refresh token rotation:
    # 1. Generate new refresh token
    new_raw_refresh = create_refresh_token_string()
    new_hash = hash_token(new_raw_refresh)

    # 2. Create new session record for the rotated token
    client_ip = request.client.host if request.client else session_record.ip_address
    user_agent = request.headers.get("user-agent", session_record.user_agent or "")[:250]
    new_session = UserSession(
        user_id=user.id,
        refresh_token_hash=new_hash,
        ip_address=client_ip,
        user_agent=user_agent,
        expires_at=now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        created_at=now,
        last_used_at=now,
        is_revoked=False
    )
    db.add(new_session)

    # 3. Retire previous session with a 60-second grace window to allow simultaneous in-flight requests to succeed
    session_record.expires_at = now + timedelta(seconds=60)
    session_record.last_used_at = now

    # 4. Clean up any stale grace-period sessions that have already expired
    db.query(UserSession).filter(
        UserSession.user_id == user.id,
        UserSession.expires_at < now
    ).delete(synchronize_session=False)

    new_access_token = create_access_token(subject=user.id, role=user.role, email=user.email)
    db.commit()

    set_auth_cookies(response, new_access_token, new_raw_refresh)

    return TokenResponse(
        access_token=new_access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_refresh_token = request.cookies.get("mybilling_refresh_token")
    if raw_refresh_token:
        hashed = hash_token(raw_refresh_token)
        session_record = db.query(UserSession).filter(UserSession.refresh_token_hash == hashed).first()
        if session_record:
            session_record.is_revoked = True
            db.commit()

    clear_auth_cookies(response)
    return {"message": "Logged out successfully."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
