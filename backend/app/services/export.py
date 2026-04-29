"""
export.py

Business logic for user-owned data export.
"""

from datetime import datetime, timezone

from sqlalchemy.orm import Session, joinedload

from app.models.exercise import Exercise
from app.models.template_exercise import TemplateExercise
from app.models.user import User
from app.models.workout_exercise import WorkoutExercise
from app.models.workout_session import WorkoutSession
from app.models.workout_template import WorkoutTemplate
from app.schemas.export import ExportOut
from app.schemas.exercises import ExerciseOut
from app.services import auth as auth_service
from app.services import sessions as sessions_service
from app.services import templates as templates_service


def build_export_for_user(a_db: Session, a_user: User) -> ExportOut:
    """Return the complete export payload for one authenticated user."""
    exercises = (
        a_db.query(Exercise)
        .filter(Exercise.user_id == a_user.id)
        .order_by(Exercise.name.asc())
        .all()
    )
    sessions = (
        a_db.query(WorkoutSession)
        .options(
            joinedload(WorkoutSession.workout_exercises).options(
                joinedload(WorkoutExercise.exercise),
                joinedload(WorkoutExercise.sets),
            )
        )
        .filter(WorkoutSession.user_id == a_user.id)
        .order_by(WorkoutSession.date.desc())
        .all()
    )
    templates = (
        a_db.query(WorkoutTemplate)
        .options(
            joinedload(WorkoutTemplate.template_exercises).joinedload(TemplateExercise.exercise)
        )
        .filter(WorkoutTemplate.user_id == a_user.id)
        .order_by(WorkoutTemplate.name.asc())
        .all()
    )

    return ExportOut(
        exported_at=datetime.now(timezone.utc),
        user=auth_service.user_to_out(a_user),
        exercises=[ExerciseOut.model_validate(exercise) for exercise in exercises],
        sessions=[sessions_service._session_to_out(session) for session in sessions],
        templates=[templates_service._template_to_out(template) for template in templates],
    )
