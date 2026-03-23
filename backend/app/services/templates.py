"""
templates.py

Business logic for WorkoutTemplate CRUD and template prefill payloads.
"""

from decimal import Decimal

from sqlalchemy.orm import Session, joinedload

from app.models.exercise import Exercise
from app.models.template_exercise import TemplateExercise
from app.models.user import User
from app.models.workout_template import WorkoutTemplate
from app.schemas.templates import (
    TemplateApplyExerciseOut,
    TemplateApplyOut,
    TemplateApplySetOut,
    TemplateCreate,
    TemplateExerciseOut,
    TemplateUpdate,
    WorkoutTemplateOut,
)


TEMPLATE_NOT_FOUND_DETAIL = "Template not found"
EXERCISE_NOT_FOUND_DETAIL = "Exercise not found"
DUPLICATE_EXERCISE_IDS_DETAIL = "Duplicate exercise IDs are not allowed in a template"


def _template_query_for_user(a_db: Session, a_user_id: int):
    """Base query for one user's templates, eager-loading exercises."""
    return (
        a_db.query(WorkoutTemplate)
        .options(
            joinedload(WorkoutTemplate.template_exercises).joinedload(TemplateExercise.exercise)
        )
        .filter(WorkoutTemplate.user_id == a_user_id)
    )


def _validate_exercise_ids_owned(a_db: Session, a_user_id: int, a_exercise_ids: list[int]) -> bool:
    """Return True if every exercise_id belongs to the user."""
    if not a_exercise_ids:
        return True
    count = (
        a_db.query(Exercise)
        .filter(Exercise.id.in_(a_exercise_ids), Exercise.user_id == a_user_id)
        .count()
    )
    return count == len(a_exercise_ids)


def _has_duplicate_exercise_ids(a_exercise_ids: list[int]) -> bool:
    """Return True when a template payload repeats the same exercise_id."""
    return len(a_exercise_ids) != len(set(a_exercise_ids))


def _template_to_out(a_template: WorkoutTemplate) -> WorkoutTemplateOut:
    """Build WorkoutTemplateOut from ORM objects."""
    exercises_out = [
        TemplateExerciseOut(
            exercise_id=template_exercise.exercise_id,
            exercise_name=template_exercise.exercise.name if template_exercise.exercise else "",
            target_sets=template_exercise.target_sets,
            target_reps=template_exercise.target_reps,
        )
        for template_exercise in sorted(
            a_template.template_exercises,
            key=lambda a_item: a_item.order,
        )
    ]
    return WorkoutTemplateOut(
        id=a_template.id,
        name=a_template.name,
        created_at=a_template.created_at,
        updated_at=a_template.updated_at,
        exercises=exercises_out,
    )


def _template_to_apply_out(a_template: WorkoutTemplate) -> TemplateApplyOut:
    """Build a session-shaped prefill payload from a saved template."""
    exercises = []
    for template_exercise in sorted(a_template.template_exercises, key=lambda a_item: a_item.order):
        sets = [
            TemplateApplySetOut(
                set_number=a_index + 1,
                reps=template_exercise.target_reps,
                weight=Decimal("0"),
            )
            for a_index in range(template_exercise.target_sets)
        ]
        exercises.append(
            TemplateApplyExerciseOut(
                exercise_id=template_exercise.exercise_id,
                exercise_name=template_exercise.exercise.name if template_exercise.exercise else "",
                sets=sets,
                notes=None,
            )
        )
    return TemplateApplyOut(
        template_id=a_template.id,
        template_name=a_template.name,
        exercises=exercises,
    )


def list_templates_for_user(a_db: Session, a_user: User) -> list[WorkoutTemplateOut]:
    """List all templates for a user."""
    templates = _template_query_for_user(a_db, a_user.id).order_by(WorkoutTemplate.name.asc()).all()
    return [_template_to_out(template) for template in templates]


def get_template_for_user(
    a_db: Session,
    a_user: User,
    a_template_id: int,
) -> WorkoutTemplateOut | None:
    """Get one template if it belongs to the user."""
    template = _template_query_for_user(a_db, a_user.id).filter(WorkoutTemplate.id == a_template_id).first()
    if template is None:
        return None
    return _template_to_out(template)


def create_template_for_user(
    a_db: Session,
    a_user: User,
    a_data: TemplateCreate,
) -> tuple[WorkoutTemplateOut | None, str | None]:
    """Create a new template for the user."""
    exercise_ids = [exercise.exercise_id for exercise in a_data.exercises]
    if _has_duplicate_exercise_ids(exercise_ids):
        return None, DUPLICATE_EXERCISE_IDS_DETAIL
    if not _validate_exercise_ids_owned(a_db, a_user.id, exercise_ids):
        return None, EXERCISE_NOT_FOUND_DETAIL

    template = WorkoutTemplate(user_id=a_user.id, name=a_data.name)
    a_db.add(template)
    a_db.flush()

    for a_order, exercise in enumerate(a_data.exercises):
        a_db.add(
            TemplateExercise(
                template_id=template.id,
                exercise_id=exercise.exercise_id,
                target_sets=exercise.target_sets,
                target_reps=exercise.target_reps,
                order=a_order,
            )
        )

    a_db.commit()
    template = _template_query_for_user(a_db, a_user.id).filter(WorkoutTemplate.id == template.id).first()
    assert template is not None
    return _template_to_out(template), None


def update_template_for_user(
    a_db: Session,
    a_user: User,
    a_template_id: int,
    a_data: TemplateUpdate,
) -> tuple[WorkoutTemplateOut | None, str | None]:
    """Update a saved template for the user."""
    template = (
        a_db.query(WorkoutTemplate)
        .options(joinedload(WorkoutTemplate.template_exercises))
        .filter(WorkoutTemplate.id == a_template_id, WorkoutTemplate.user_id == a_user.id)
        .first()
    )
    if template is None:
        return None, TEMPLATE_NOT_FOUND_DETAIL

    if a_data.exercises is not None:
        exercise_ids = [exercise.exercise_id for exercise in a_data.exercises]
        if _has_duplicate_exercise_ids(exercise_ids):
            return None, DUPLICATE_EXERCISE_IDS_DETAIL
        if not _validate_exercise_ids_owned(a_db, a_user.id, exercise_ids):
            return None, EXERCISE_NOT_FOUND_DETAIL
        for template_exercise in list(template.template_exercises):
            a_db.delete(template_exercise)
        a_db.flush()
        a_db.expire(template, ["template_exercises"])
        for a_order, exercise in enumerate(a_data.exercises):
            a_db.add(
                TemplateExercise(
                    template_id=template.id,
                    exercise_id=exercise.exercise_id,
                    target_sets=exercise.target_sets,
                    target_reps=exercise.target_reps,
                    order=a_order,
                )
            )

    if a_data.name is not None:
        template.name = a_data.name

    a_db.commit()
    template = _template_query_for_user(a_db, a_user.id).filter(WorkoutTemplate.id == a_template_id).first()
    assert template is not None
    return _template_to_out(template), None


def delete_template_for_user(a_db: Session, a_user: User, a_template_id: int) -> bool:
    """Delete a template if it belongs to the user."""
    template = (
        a_db.query(WorkoutTemplate)
        .filter(WorkoutTemplate.id == a_template_id, WorkoutTemplate.user_id == a_user.id)
        .first()
    )
    if template is None:
        return False
    a_db.delete(template)
    a_db.commit()
    return True


def apply_template_for_user(
    a_db: Session,
    a_user: User,
    a_template_id: int,
) -> TemplateApplyOut | None:
    """Return a session-shaped prefill payload for one template."""
    template = _template_query_for_user(a_db, a_user.id).filter(WorkoutTemplate.id == a_template_id).first()
    if template is None:
        return None
    return _template_to_apply_out(template)
