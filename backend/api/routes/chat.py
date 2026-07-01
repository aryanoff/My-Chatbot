import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.auth.dependencies import get_current_user
from backend.database.connection import AsyncSessionLocal, get_db
from backend.models.orm import Chat, Message, MessageRole, User
from backend.models.schemas import (
    ChatCreate,
    ChatResponse,
    MessageCreate,
    MessageFeedback,
    MessageResponse,
    MessageUpdate,
)
from backend.services.ai_router import get_best_response, stream_to_user

router = APIRouter(prefix="/chats", tags=["chats"])


# ── Guest (no-auth) endpoints ──────────────────────────────────────
class GuestMessage(BaseModel):
    content: str = Field(min_length=1, max_length=32000)
    model: str = "meta-ai"


@router.post("/guest", tags=["guest"])
async def guest_chat(payload: GuestMessage) -> dict:
    """Send a message without authentication — demo / guest mode."""
    history = [
        {"role": "user", "content": payload.content},
    ]
    content, final_model, tokens = await get_best_response(payload.content, history)
    return {"role": "assistant", "content": content, "tokens_used": tokens}


@router.websocket("/guest/stream")
async def guest_stream(websocket: WebSocket) -> None:
    """Stream a guest chat response via WebSocket — no auth needed."""
    await websocket.accept()
    try:
        init = await websocket.receive_json()
        content = init.get("content", "")
        model = init.get("model", "meta-ai")

        if not content:
            await websocket.send_json({"type": "error", "error": "Missing content"})
            await websocket.close()
            return

        history = [
            {"role": "user", "content": content},
        ]

        content_resp, final_model, tokens = await get_best_response(content, history)
        
        full_response = ""
        async for chunk in stream_to_user(content_resp):
            full_response += chunk
            await websocket.send_json({"type": "chunk", "content": chunk})

        await websocket.send_json({
            "type": "done",
            "message": {"id": "guest", "content": full_response, "role": "assistant"},
        })
    except WebSocketDisconnect:
        return
    except Exception as exc:
        err_msg = str(exc)
        if "111" in err_msg or "Connection refused" in err_msg:
            err_msg = "Database offline (Connection refused). Please ensure the backend is connected to the database, or NEXT_PUBLIC_API_URL is correctly set on the frontend."
        await websocket.send_json({"type": "error", "error": err_msg})
    finally:
        await websocket.close()


@router.get("", response_model=list[ChatResponse])
async def list_chats(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[Chat]:
    result = await db.execute(
        select(Chat).where(Chat.user_id == user.id).order_by(Chat.updated_at.desc()).limit(100)
    )
    return list(result.scalars().all())


@router.post("", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def create_chat(
    payload: ChatCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Chat:
    chat = Chat(user_id=user.id, **payload.model_dump())
    db.add(chat)
    await db.commit()
    await db.refresh(chat)
    return chat


@router.get("/{chat_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    chat_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Message]:
    chat = await _get_user_chat(db, chat_id, user.id)
    result = await db.execute(
        select(Message).where(Message.chat_id == chat.id).order_by(Message.created_at.asc())
    )
    return list(result.scalars().all())


@router.post("/{chat_id}/messages", response_model=MessageResponse)
async def send_message(
    chat_id: UUID,
    payload: MessageCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Message:
    chat = await _get_user_chat(db, chat_id, user.id)
    model = payload.model or chat.model

    user_msg = Message(chat_id=chat.id, role=MessageRole.user, content=payload.content, model=model)
    db.add(user_msg)
    await db.flush()

    history = await _build_history(db, chat.id)
    content, final_model, tokens = await get_best_response(payload.content, history)

    assistant_msg = Message(
        chat_id=chat.id,
        role=MessageRole.assistant,
        content=content,
        model=final_model,
        tokens_used=tokens,
    )
    db.add(assistant_msg)
    chat.token_count += tokens
    if chat.title == "New Chat":
        chat.title = payload.content[:80]
    await db.commit()
    await db.refresh(assistant_msg)
    return assistant_msg


@router.patch("/{chat_id}/messages/{message_id}", response_model=MessageResponse)
async def edit_message(
    chat_id: UUID,
    message_id: UUID,
    payload: MessageUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Message:
    await _get_user_chat(db, chat_id, user.id)
    result = await db.execute(select(Message).where(Message.id == message_id, Message.chat_id == chat_id))
    message = result.scalar_one_or_none()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    message.content = payload.content
    await db.commit()
    await db.refresh(message)
    return message


@router.post("/{chat_id}/messages/{message_id}/regenerate", response_model=MessageResponse)
async def regenerate_message(
    chat_id: UUID,
    message_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Message:
    chat = await _get_user_chat(db, chat_id, user.id)
    result = await db.execute(select(Message).where(Message.id == message_id, Message.chat_id == chat_id))
    message = result.scalar_one_or_none()
    if not message or message.role != MessageRole.assistant:
        raise HTTPException(status_code=404, detail="Assistant message not found")

    history = await _build_history(db, chat.id, exclude_after=message.id)
    user_message = history[-1]["content"] if history else "Regenerate this"
    content, final_model, tokens = await get_best_response(user_message, history)
    message.content = content
    message.tokens_used = tokens
    await db.commit()
    await db.refresh(message)
    return message


@router.post("/{chat_id}/messages/{message_id}/feedback")
async def message_feedback(
    chat_id: UUID,
    message_id: UUID,
    payload: MessageFeedback,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    await _get_user_chat(db, chat_id, user.id)
    result = await db.execute(select(Message).where(Message.id == message_id, Message.chat_id == chat_id))
    message = result.scalar_one_or_none()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    message.is_liked = payload.is_liked
    await db.commit()
    return {"status": "ok"}


@router.websocket("/{chat_id}/stream")
async def stream_chat(websocket: WebSocket, chat_id: UUID) -> None:
    await websocket.accept()
    try:
        init = await websocket.receive_json()
        token = init.get("token")
        content = init.get("content", "")
        audio_url = init.get("audio_url", None)
        model = init.get("model", "meta-ai")

        if not token or (not content and not audio_url):
            await websocket.send_json({"error": "Missing token or content"})
            await websocket.close()
            return

        async with AsyncSessionLocal() as db:
            from backend.auth.security import validate_access_token

            user_id = validate_access_token(token)
            chat = await _get_user_chat(db, chat_id, user_id)

            user_msg = Message(chat_id=chat.id, role=MessageRole.user, content=content, model=model)
            db.add(user_msg)
            await db.flush()

            history = await _build_history(db, chat.id)
            content_resp, final_model, tokens = await get_best_response(content, history, audio_url)
            
            full_response = ""
            async for chunk in stream_to_user(content_resp):
                full_response += chunk
                await websocket.send_json({"type": "chunk", "content": chunk})

            assistant_msg = Message(
                chat_id=chat.id,
                role=MessageRole.assistant,
                content=full_response,
                model=final_model,
                tokens_used=tokens,
            )
            db.add(assistant_msg)
            if chat.title == "New Chat":
                chat.title = content[:80]
            await db.commit()
            await db.refresh(assistant_msg)

            await websocket.send_json(
                {
                    "type": "done",
                    "message": {
                        "id": str(assistant_msg.id),
                        "content": full_response,
                        "role": "assistant",
                    },
                }
            )
    except WebSocketDisconnect:
        return
    except Exception as exc:
        await websocket.send_json({"type": "error", "error": str(exc)})
    finally:
        await websocket.close()


async def _get_user_chat(db: AsyncSession, chat_id: UUID, user_id: UUID) -> Chat:
    result = await db.execute(
        select(Chat).options(selectinload(Chat.messages)).where(Chat.id == chat_id, Chat.user_id == user_id)
    )
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


async def _build_history(
    db: AsyncSession, chat_id: UUID, exclude_after: UUID | None = None
) -> list[dict[str, str]]:
    result = await db.execute(select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at.asc()))
    messages = list(result.scalars().all())
    
    # Filter out excluded and get last 10
    filtered = []
    for msg in messages:
        if exclude_after and msg.id == exclude_after:
            break
        filtered.append({"role": msg.role.value, "content": msg.content})
        
    return filtered[-10:]
