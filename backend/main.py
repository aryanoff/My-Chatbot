from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from backend.api.routes.analytics import agents_router, router as analytics_router
from backend.api.routes.auth import router as auth_router
from backend.api.routes.chat import router as chat_router
from backend.api.routes.files import router as files_router
from backend.api.routes.library import router as library_router
from backend.api.routes.projects import router as projects_router
from backend.api.routes.projects import settings_router
from backend.config import settings
from backend.database.connection import Base, engine

limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.rate_limit_per_minute}/minute"])


import asyncio
from backend.services.health_check import run_health_checks, health_check_loop

@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        # DB is offline, skipping initialization to prevent Railway healthcheck timeouts
        # async def init_db():
        #     async with engine.begin() as conn:
        #         await conn.run_sync(Base.metadata.create_all)
        # await asyncio.wait_for(init_db(), timeout=5.0)
        pass
    except Exception as e:
        print(f"[startup] DB init warning (non-fatal): {e}")
    asyncio.create_task(run_health_checks())
    asyncio.create_task(health_check_loop())
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProxyHeadersMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] in ("http", "websocket"):
            headers = dict(scope.get("headers", []))
            if b"x-forwarded-proto" in headers and headers[b"x-forwarded-proto"] == b"https":
                print(f"[ProxyHeaders] Rewriting scheme to https (was {scope.get('scheme')})")
                scope["scheme"] = "https"
        await self.app(scope, receive, send)

app.add_middleware(ProxyHeadersMiddleware)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(files_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(settings_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(agents_router, prefix="/api/v1")
app.include_router(library_router, prefix="/api/v1")


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "service": settings.app_name,
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "health": "/health",
        "api": "/api/v1",
    }


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "healthy", "service": settings.app_name}
