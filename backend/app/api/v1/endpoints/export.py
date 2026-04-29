"""
export.py

Endpoint for exporting the authenticated user's workout data.
"""

from datetime import datetime, timezone
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services import export as export_service

router = APIRouter()


@router.get("/")
def export_user_data(
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
    a_format: Annotated[Literal["json"], Query(alias="format")] = "json",
) -> Response:
    """Download a JSON export of all user-owned workout data."""
    payload = export_service.build_export_for_user(a_db, a_current_user)
    filename_date = datetime.now(timezone.utc).date().isoformat()
    filename = f'attachment; filename="progressive-overload-export-{filename_date}.{a_format}"'
    return Response(
        content=payload.model_dump_json(indent=2),
        media_type="application/json",
        headers={"Content-Disposition": filename},
    )
