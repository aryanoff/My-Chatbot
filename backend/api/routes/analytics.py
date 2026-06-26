from datetime import date, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.auth.dependencies import get_current_user
from backend.database.connection import get_db
from backend.models.orm import Agent, Chat, File, Message, UsageAnalytics, User
from backend.models.schemas import AnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])

BUILTIN_AGENTS = [
    {
        "name": "Developer Agent",
        "slug": "developer",
        "description": "Expert coding assistant for building and debugging software.",
        "system_prompt": "You are an expert software developer.",
        "icon": "code",
        "color": "#6366F1",
    },
    {
        "name": "Research Agent",
        "slug": "research",
        "description": "Deep research and analysis across any topic.",
        "system_prompt": "You are a thorough research analyst.",
        "icon": "search",
        "color": "#06B6D4",
    },
    {
        "name": "Writing Agent",
        "slug": "writing",
        "description": "Professional writing, editing, and content creation.",
        "system_prompt": "You are a professional writer and editor.",
        "icon": "pen",
        "color": "#8B5CF6",
    },
    {
        "name": "Marketing Agent",
        "slug": "marketing",
        "description": "Marketing strategy, copywriting, and campaigns.",
        "system_prompt": "You are a marketing strategist.",
        "icon": "megaphone",
        "color": "#EC4899",
    },
    {
        "name": "Business Agent",
        "slug": "business",
        "description": "Business planning, analysis, and strategy.",
        "system_prompt": "You are a business consultant.",
        "icon": "briefcase",
        "color": "#10B981",
    },
    {
        "name": "Design Agent",
        "slug": "design",
        "description": "UI/UX design, branding, and creative direction.",
        "system_prompt": "You are a creative design expert.",
        "icon": "palette",
        "color": "#F59E0B",
    },
    {
        "name": "Education Agent",
        "slug": "education",
        "description": "Teaching, tutoring, and educational content.",
        "system_prompt": "You are a patient educator.",
        "icon": "graduation-cap",
        "color": "#3B82F6",
    },
]


@router.get("/dashboard", response_model=AnalyticsResponse)
async def dashboard(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> AnalyticsResponse:
    chat_count = await db.scalar(select(func.count()).select_from(Chat).where(Chat.user_id == user.id)) or 0
    tokens = await db.scalar(select(func.coalesce(func.sum(Message.tokens_used), 0)).where(Message.chat_id.in_(
        select(Chat.id).where(Chat.user_id == user.id)
    ))) or 0
    files = await db.scalar(select(func.count()).select_from(File).where(File.user_id == user.id)) or 0

    start = date.today() - timedelta(days=30)
    usage_result = await db.execute(
        select(UsageAnalytics).where(UsageAnalytics.user_id == user.id, UsageAnalytics.date >= start)
    )
    monthly = [
        {"date": str(u.date), "tokens": u.tokens_used, "messages": u.messages_sent}
        for u in usage_result.scalars().all()
    ]

    recent_chats = await db.execute(
        select(Chat).where(Chat.user_id == user.id).order_by(Chat.updated_at.desc()).limit(5)
    )
    activity = [
        {"type": "chat", "title": c.title, "date": c.updated_at.isoformat()}
        for c in recent_chats.scalars().all()
    ]

    return AnalyticsResponse(
        total_chats=chat_count,
        tokens_used=tokens,
        files_analyzed=files,
        images_generated=0,
        monthly_usage=monthly,
        recent_activity=activity,
    )


agents_router = APIRouter(prefix="/agents", tags=["agents"])


@agents_router.get("")
async def list_agents(db: AsyncSession = Depends(get_db)) -> list[dict]:
    result = await db.execute(select(Agent).where(Agent.is_active == True).order_by(Agent.name))
    agents = result.scalars().all()
    if not agents:
        return BUILTIN_AGENTS
    return [
        {
            "id": str(a.id),
            "name": a.name,
            "slug": a.slug,
            "description": a.description,
            "icon": a.icon,
            "color": a.color,
            "is_builtin": a.is_builtin,
        }
        for a in agents
    ]
