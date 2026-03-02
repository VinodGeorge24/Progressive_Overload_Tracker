"""
exercises.py

Endpoints for Exercise CRUD.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.exercises import ExerciseCreate, ExerciseOut, ExerciseUpdate
from app.services import exercises as exercises_service


EXERCISE_NOT_FOUND_DETAIL = "Exercise not found"

router = APIRouter()


@router.get("/", response_model=list[ExerciseOut])
def list_exercises(
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """
    List all exercises for the authenticated user.
    """
    return exercises_service.list_exercises_for_user(a_db, a_current_user)


@router.post(
    "/",
    response_model=ExerciseOut,
    status_code=status.HTTP_201_CREATED,
)
def create_exercise(
    a_body: ExerciseCreate,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Create a new exercise for the authenticated user.
    """
    return exercises_service.create_exercise_for_user(a_db, a_current_user, a_body)


@router.get(
    "/{a_exercise_id}",
    response_model=ExerciseOut,
)
def get_exercise(
    a_exercise_id: int,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Get a single exercise for the authenticated user.
    """
    exercise = exercises_service.get_exercise_for_user(
        a_db,
        a_current_user,
        a_exercise_id,
    )
    if exercise is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=EXERCISE_NOT_FOUND_DETAIL,
        )
    return exercise


@router.put(
    "/{a_exercise_id}",
    response_model=ExerciseOut,
)
def update_exercise(
    a_exercise_id: int,
    a_body: ExerciseUpdate,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Update an exercise for the authenticated user.
    """
    exercise = exercises_service.update_exercise_for_user(
        a_db,
        a_current_user,
        a_exercise_id,
        a_body,
    )
    if exercise is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=EXERCISE_NOT_FOUND_DETAIL,
        )
    return exercise


@router.delete(
    "/{a_exercise_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_exercise(
    a_exercise_id: int,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Delete an exercise for the authenticated user.
    """
    deleted = exercises_service.delete_exercise_for_user(a_db, a_current_user, a_exercise_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=EXERCISE_NOT_FOUND_DETAIL,
        )
    return None


