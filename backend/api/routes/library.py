from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.auth.dependencies import get_current_user
from backend.database.connection import get_db
from backend.models.orm import SavedPrompt, User
from backend.models.schemas import LibraryItemCreate, LibraryItemResponse, LibraryItemUpdate

router = APIRouter(prefix="/library", tags=["library"])


@router.get("", response_model=list[LibraryItemResponse])
async def list_library_items(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> list[SavedPrompt]:
    result = await db.execute(
        select(SavedPrompt)
        .where(SavedPrompt.user_id == user.id)
        .order_by(SavedPrompt.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("", response_model=LibraryItemResponse, status_code=status.HTTP_201_CREATED)
async def create_library_item(
    payload: LibraryItemCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SavedPrompt:
    item = SavedPrompt(user_id=user.id, **payload.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=LibraryItemResponse)
async def update_library_item(
    item_id: UUID,
    payload: LibraryItemUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SavedPrompt:
    result = await db.execute(
        select(SavedPrompt).where(SavedPrompt.id == item_id, SavedPrompt.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Library item not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_library_item(
    item_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(SavedPrompt).where(SavedPrompt.id == item_id, SavedPrompt.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Library item not found")

    await db.delete(item)
    await db.commit()
