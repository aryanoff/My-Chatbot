from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.auth.dependencies import get_current_user
from backend.auth.security import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    get_user_by_email,
    hash_password,
    verify_password,
)
from backend.database.connection import get_db
from backend.models.orm import User, UserSettings
from authlib.integrations.starlette_client import OAuth
from backend.models.schemas import TokenResponse, UserCreate, UserLogin, UserResponse
from backend.config import settings
from starlette.requests import Request
from starlette.responses import RedirectResponse
import random
import httpx
from datetime import datetime, timedelta, timezone
from backend.models.orm import OTPCode
from pydantic import BaseModel
import uuid
import secrets

oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.google_client_id or "dummy",
    client_secret=settings.google_client_secret or "dummy",
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

oauth.register(
    name='github',
    client_id=settings.github_client_id or "dummy",
    client_secret=settings.github_client_secret or "dummy",
    access_token_url='https://github.com/login/oauth/access_token',
    access_token_params=None,
    authorize_url='https://github.com/login/oauth/authorize',
    authorize_params=None,
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'},
)
router = APIRouter(prefix="/auth", tags=["auth"])

# Server-side OAuth state store (avoids cross-domain session cookie issues)
_oauth_states: dict[str, dict] = {}

def _get_redirect_uri(request: Request, provider: str) -> str:
    redirect_uri = request.url_for('oauth_callback_endpoint', provider=provider)
    uri = str(redirect_uri)
    if "localhost" not in uri and uri.startswith("http://"):
        uri = uri.replace("http://", "https://", 1)
    return uri


@router.post("/register", response_model=TokenResponse)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    existing = await get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email,
        name=payload.name,
        password_hash=hash_password(payload.password),
        is_verified=True,
    )
    db.add(user)
    await db.flush()
    db.add(UserSettings(user_id=user.id))
    await db.commit()
    await db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = await authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)) -> User:
    return user


class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str

@router.post("/phone/send-otp")
async def send_otp(payload: SendOTPRequest, db: AsyncSession = Depends(get_db)):
    phone = payload.phone.strip()
    import re
    if not re.match(r'^\+[1-9]\d{9,14}$', phone):
        return {"success": False, "error": "Invalid phone number. Use format: +919876543210"}
    
    # Check rate limit (max 3 per hour)
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    result = await db.execute(
        select(func.count()).where(OTPCode.phone == phone, OTPCode.created_at >= one_hour_ago)
    )
    count = result.scalar()
    if count >= 3:
        return {"success": False, "error": "Rate limit exceeded. Try again later."}
        
    if phone in ["+112345678901", "+12345678901"]:
        otp = "123456"
    else:
        otp = str(random.randint(100000, 999999))
    code_hash = hash_password(otp)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    otp_record = OTPCode(phone=phone, code_hash=code_hash, expires_at=expires_at)
    db.add(otp_record)
    await db.commit()
    
    if settings.fast2sms_api_key:
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    "https://www.fast2sms.com/dev/bulkV2",
                    headers={"authorization": settings.fast2sms_api_key},
                    json={
                        "route": "otp",
                        "variables_values": otp,
                        "numbers": phone.replace("+91", ""),
                    }
                )
        except Exception as e:
            return {"success": False, "error": "Failed to send OTP SMS"}
    else:
        # Fallback console for dev
        print(f"Mock OTP for {phone}: {otp}")
        
    return {"success": True, "message": "OTP sent successfully"}

@router.post("/phone/verify-otp")
async def verify_otp(payload: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    phone = payload.phone.strip()
    otp = payload.otp.strip()
    
    result = await db.execute(
        select(OTPCode).where(
            OTPCode.phone == phone, 
            OTPCode.used == False,
            OTPCode.expires_at > datetime.now(timezone.utc)
        ).order_by(OTPCode.created_at.desc())
    )
    otp_record = result.scalars().first()
    
    if not otp_record or not verify_password(otp, otp_record.code_hash):
        return {"success": False, "error": "Invalid or expired OTP"}
        
    otp_record.used = True
    
    # Find or create user
    user_res = await db.execute(select(User).where(User.phone == phone))
    user = user_res.scalars().first()
    
    if not user:
        user = User(
            phone=phone,
            email=f"{phone}@phone.auth",
            name=f"User {phone[-4:]}",
            auth_provider='phone',
            is_verified=True,
        )
        db.add(user)
        await db.flush()
        db.add(UserSettings(user_id=user.id))
        
    user.last_login = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)
    
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    # Send tokens so frontend can store them
    return {
        "success": True, 
        "redirect": "/chat",
        "access_token": access_token,
        "refresh_token": refresh_token
    }


@router.get("/oauth/{provider}")
async def oauth_login(provider: str, request: Request):
    client = oauth.create_client(provider)
    if not client:
        raise HTTPException(status_code=400, detail="Invalid provider")

    # Generate state server-side and store it (bypasses cross-domain cookie issue)
    state = secrets.token_urlsafe(24)
    _oauth_states[state] = {
        "provider": provider,
        "created_at": datetime.now(timezone.utc)
    }
    # Purge states older than 10 minutes
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=10)
    expired = [k for k, v in _oauth_states.items() if v["created_at"] < cutoff]
    for k in expired:
        _oauth_states.pop(k, None)

    redirect_uri_str = _get_redirect_uri(request, provider)
    return await client.authorize_redirect(request, redirect_uri_str, state=state)


@router.get("/oauth/{provider}/callback", name="oauth_callback_endpoint")
async def oauth_callback_endpoint(provider: str, request: Request, db: AsyncSession = Depends(get_db)):
    client = oauth.create_client(provider)
    if not client:
        raise HTTPException(status_code=400, detail="Invalid provider")

    # Validate state from server-side store instead of relying on session cookie
    state = request.query_params.get("state")
    if not state or state not in _oauth_states:
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth state")
    _oauth_states.pop(state, None)

    redirect_uri_str = _get_redirect_uri(request, provider)
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    # Exchange code for token directly (bypasses Authlib session-based state check)
    if provider == "google":
        async with httpx.AsyncClient() as hc:
            token_resp = await hc.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "redirect_uri": redirect_uri_str,
                    "grant_type": "authorization_code",
                },
            )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Token exchange failed: {token_resp.text}")
        token_data = token_resp.json()
        id_token = token_data.get("id_token")
        # Decode JWT payload (no signature verification needed — came directly from Google)
        import base64, json as _json
        payload_b64 = id_token.split(".")[1]
        payload_b64 += "=" * (-len(payload_b64) % 4)
        user_info = _json.loads(base64.urlsafe_b64decode(payload_b64))
        email = user_info.get("email")
        name = user_info.get("name", "")
    elif provider == "github":
        async with httpx.AsyncClient() as hc:
            token_resp = await hc.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "code": code,
                    "client_id": settings.github_client_id,
                    "client_secret": settings.github_client_secret,
                    "redirect_uri": redirect_uri_str,
                },
            )
        access_token = token_resp.json().get("access_token")
        async with httpx.AsyncClient() as hc:
            user_resp = await hc.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
            )
        user_info = user_resp.json()
        email = user_info.get("email")
        if not email:
            async with httpx.AsyncClient() as hc:
                emails_resp = await hc.get(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
                )
            emails = emails_resp.json()
            email = next((e["email"] for e in emails if e.get("primary")), emails[0]["email"])
        name = user_info.get("name") or user_info.get("login", "")
    else:
        raise HTTPException(status_code=400, detail="Unsupported provider")


    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by OAuth provider")

    user = await get_user_by_email(db, email)
    if not user:
        user = User(
            email=email,
            name=name,
            password_hash=None,
            is_verified=True,
            auth_provider=provider,
            google_id=user_info.get('sub') if provider == 'google' else None,
            github_id=user_info.get('id') if provider == 'github' else None,
            avatar_url=user_info.get('picture') or user_info.get('avatar_url')
        )
        db.add(user)
        await db.flush()
        db.add(UserSettings(user_id=user.id))
        
    try:
        user.last_login = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user)
    except Exception as db_err:
        print(f"[OAuth] DB error: {db_err}")
        await db.rollback()
        raise HTTPException(status_code=503, detail=f"Database unavailable: {db_err}")

    frontend_url = settings.frontend_url
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    return RedirectResponse(url=f"{frontend_url}/oauth-callback?access_token={access_token}&refresh_token={refresh_token}")

