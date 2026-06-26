from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1, max_length=255)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    avatar_url: str | None = None
    role: str
    subscription: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatCreate(BaseModel):
    title: str = "New Chat"
    model: str = "meta-ai"
    project_id: UUID | None = None
    agent_id: UUID | None = None


class ChatResponse(BaseModel):
    id: UUID
    title: str
    model: str
    is_pinned: bool
    token_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=32000)
    model: str | None = None
    web_search: bool = False
    reasoning: bool = False
    deep_research: bool = False
    agent_id: UUID | None = None


class MessageUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=32000)


class MessageResponse(BaseModel):
    id: UUID
    chat_id: UUID
    role: str
    content: str
    model: str | None
    tokens_used: int
    metadata: dict[str, Any] = Field(default_factory=dict, alias="metadata_")
    is_liked: bool | None
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}


class MessageFeedback(BaseModel):
    is_liked: bool | None = None


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    color: str = "#6366F1"
    tags: list[str] = Field(default_factory=list)


class ProjectResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    color: str
    is_favorite: bool
    tags: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class AgentResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: str | None
    icon: str | None
    color: str
    is_builtin: bool

    model_config = {"from_attributes": True}


class SettingsUpdate(BaseModel):
    theme: str | None = None
    language: str | None = None
    notifications_enabled: bool | None = None
    web_search_enabled: bool | None = None
    reasoning_enabled: bool | None = None
    deep_research_enabled: bool | None = None
    default_model: str | None = None


class SettingsResponse(BaseModel):
    id: UUID
    user_id: UUID
    theme: str
    language: str
    notifications_enabled: bool
    web_search_enabled: bool
    reasoning_enabled: bool
    deep_research_enabled: bool
    default_model: str

    model_config = {"from_attributes": True}


class AnalyticsResponse(BaseModel):
    total_chats: int
    tokens_used: int
    files_analyzed: int
    images_generated: int
    monthly_usage: list[dict[str, Any]]
    recent_activity: list[dict[str, Any]]


class FileUploadResponse(BaseModel):
    id: UUID
    name: str
    file_type: str
    mime_type: str | None
    size_bytes: int
    thumbnail_url: str | None

    model_config = {"from_attributes": True}
