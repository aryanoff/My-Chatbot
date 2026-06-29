import os
import uuid
from pathlib import Path

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.auth.dependencies import get_current_user
from backend.config import settings
from backend.database.connection import get_db
from backend.models.orm import File as FileModel
from backend.models.orm import FileType, User
from backend.models.schemas import FileUploadResponse

router = APIRouter(prefix="/files", tags=["files"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

MIME_TO_TYPE = {
    "application/pdf": FileType.pdf,
    "image/jpeg": FileType.image,
    "image/png": FileType.image,
    "image/webp": FileType.image,
    "video/mp4": FileType.video,
    "audio/mpeg": FileType.audio,
    "audio/wav": FileType.audio,
}


@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FileModel:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required")

    content = await file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail="File too large")

    ext = Path(file.filename).suffix
    storage_name = f"{uuid.uuid4()}{ext}"
    storage_path = UPLOAD_DIR / str(user.id) / storage_name
    storage_path.parent.mkdir(parents=True, exist_ok=True)

    async with aiofiles.open(storage_path, "wb") as f:
        await f.write(content)

    import io
    try:
        from PyPDF2 import PdfReader
    except ImportError:
        PdfReader = None

    file_type = MIME_TO_TYPE.get(file.content_type or "", FileType.other)
    if ext in [".txt", ".md", ".csv", ".json", ".py", ".js", ".tsx", ".ts", ".html", ".css"]:
        file_type = FileType.document

    extracted_text = ""
    if file_type == FileType.pdf and PdfReader:
        try:
            reader = PdfReader(io.BytesIO(content))
            extracted_text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        except Exception:
            pass
    elif file_type == FileType.document:
        try:
            extracted_text = content.decode("utf-8")
        except Exception:
            pass

    record = FileModel(
        user_id=user.id,
        name=file.filename,
        file_type=file_type,
        mime_type=file.content_type,
        size_bytes=len(content),
        storage_path=str(storage_path),
        metadata_={"extracted_text": extracted_text[:100000]} if extracted_text else {}
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.get("", response_model=list[FileUploadResponse])
async def list_files(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[FileModel]:
    result = await db.execute(
        select(FileModel).where(FileModel.user_id == user.id).order_by(FileModel.created_at.desc())
    )
    return list(result.scalars().all())
