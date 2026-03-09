"""
analytics.py

Endpoints for exercise progress analytics and chart rendering.
"""

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.analytics import ExerciseProgressOut, ProgressMetric
from app.services import analytics as analytics_service

router = APIRouter()


@router.get("/progress/{a_exercise_id}", response_model=ExerciseProgressOut)
def get_progress(
    a_exercise_id: int,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    set_number: int | None = Query(None, gt=0),
):
    """Return progress series for one exercise and optional filter set."""
    result, detail = analytics_service.get_progress_for_exercise(
        a_db,
        a_current_user,
        a_exercise_id,
        a_start_date=start_date,
        a_end_date=end_date,
        a_set_number=set_number,
    )
    if detail == analytics_service.EXERCISE_NOT_FOUND_DETAIL:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
    assert result is not None
    return result


@router.get("/progress/{a_exercise_id}/chart")
def get_progress_chart(
    a_exercise_id: int,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
    metric: ProgressMetric = Query("weight"),
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    set_number: int | None = Query(None, gt=0),
):
    """Return a PNG chart for one exercise and metric."""
    result, detail = analytics_service.get_progress_for_exercise(
        a_db,
        a_current_user,
        a_exercise_id,
        a_start_date=start_date,
        a_end_date=end_date,
        a_set_number=set_number,
    )
    if detail == analytics_service.EXERCISE_NOT_FOUND_DETAIL:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
    assert result is not None
    chart_bytes = analytics_service.build_progress_chart_png(result, metric)
    return Response(
        content=chart_bytes,
        media_type="image/png",
        headers={"Cache-Control": "no-store"},
    )
