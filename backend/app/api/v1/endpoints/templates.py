"""
templates.py

Endpoints for workout template CRUD and template apply/prefill.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.templates import TemplateApplyOut, TemplateCreate, TemplateUpdate, WorkoutTemplateOut
from app.services import templates as templates_service


router = APIRouter()


@router.get("/", response_model=list[WorkoutTemplateOut])
def list_templates(
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """List all templates for the authenticated user."""
    return templates_service.list_templates_for_user(a_db, a_current_user)


@router.post("/", response_model=WorkoutTemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(
    a_body: TemplateCreate,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a new workout template for the authenticated user."""
    result, detail = templates_service.create_template_for_user(a_db, a_current_user, a_body)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
    return result


@router.get("/{a_template_id}", response_model=WorkoutTemplateOut)
def get_template(
    a_template_id: int,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """Get one workout template for the authenticated user."""
    template = templates_service.get_template_for_user(a_db, a_current_user, a_template_id)
    if template is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=templates_service.TEMPLATE_NOT_FOUND_DETAIL,
        )
    return template


@router.get("/{a_template_id}/apply", response_model=TemplateApplyOut)
def apply_template(
    a_template_id: int,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """Return a session-shaped prefill payload for one saved template."""
    template = templates_service.apply_template_for_user(a_db, a_current_user, a_template_id)
    if template is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=templates_service.TEMPLATE_NOT_FOUND_DETAIL,
        )
    return template


@router.put("/{a_template_id}", response_model=WorkoutTemplateOut)
def update_template(
    a_template_id: int,
    a_body: TemplateUpdate,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """Update one workout template for the authenticated user."""
    result, detail = templates_service.update_template_for_user(
        a_db,
        a_current_user,
        a_template_id,
        a_body,
    )
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
    return result


@router.delete("/{a_template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    a_template_id: int,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """Delete one workout template for the authenticated user."""
    deleted = templates_service.delete_template_for_user(a_db, a_current_user, a_template_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=templates_service.TEMPLATE_NOT_FOUND_DETAIL,
        )
    return None
