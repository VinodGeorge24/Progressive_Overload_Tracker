"""
sessions.py

Endpoints for WorkoutSession CRUD. One session per user per day; 409 on duplicate date.
"""

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.sessions import (
    LastSetsOut,
    SessionCreate,
    SessionListResponse,
    SessionOut,
    SessionUpdate,
)
from app.services import sessions as sessions_service

SESSION_NOT_FOUND_DETAIL = "Session not found"

router = APIRouter()


@router.get("/", response_model=SessionListResponse)
def list_sessions(
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
):
    """
    List workout sessions for the authenticated user with optional date range.
    """
    return sessions_service.list_sessions_for_user(
        a_db,
        a_current_user,
        a_limit=limit,
        a_offset=offset,
        a_start_date=start_date,
        a_end_date=end_date,
    )


@router.post(
    "/",
    response_model=SessionOut,
    status_code=status.HTTP_201_CREATED,
)
def create_session(
    a_body: SessionCreate,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Create a workout session. Returns 409 if a session already exists for the date.
    """
    result, detail = sessions_service.create_session_for_user(
        a_db,
        a_current_user,
        a_body,
    )
    if detail == sessions_service.SESSION_DATE_EXISTS_DETAIL:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )
    if detail == sessions_service.EXERCISE_NOT_FOUND_DETAIL:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
        )
    assert result is not None
    return result


@router.get(
    "/last-sets",
    response_model=LastSetsOut,
)
def get_last_sets(
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
    exercise_id: int = Query(..., gt=0),
):
    """
    Get the most recent session's sets for an exercise (for pre-fill when logging).
    404 if exercise not found or not owned, or if never logged.
    """
    result = sessions_service.get_last_sets_for_exercise(
        a_db,
        a_current_user,
        exercise_id,
    )
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found or never logged.",
        )
    return result


@router.get(
    "/{a_session_id}",
    response_model=SessionOut,
)
def get_session(
    a_session_id: int,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Get a workout session by id. 404 if not found or not owned.
    """
    session = sessions_service.get_session_for_user(
        a_db,
        a_current_user,
        a_session_id,
    )
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=SESSION_NOT_FOUND_DETAIL,
        )
    return session


@router.put(
    "/{a_session_id}",
    response_model=SessionOut,
)
def update_session(
    a_session_id: int,
    a_body: SessionUpdate,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Update a workout session. 409 if the new date already has a session.
    """
    result, detail = sessions_service.update_session_for_user(
        a_db,
        a_current_user,
        a_session_id,
        a_body,
    )
    if detail == sessions_service.SESSION_NOT_FOUND_DETAIL:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
        )
    if detail == sessions_service.SESSION_DATE_EXISTS_PUT_DETAIL:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )
    if detail == sessions_service.EXERCISE_NOT_FOUND_DETAIL:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
        )
    assert result is not None
    return result


@router.delete(
    "/{a_session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_session(
    a_session_id: int,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Delete a workout session. 404 if not found or not owned.
    """
    deleted = sessions_service.delete_session_for_user(
        a_db,
        a_current_user,
        a_session_id,
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=SESSION_NOT_FOUND_DETAIL,
        )
    return None
