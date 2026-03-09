"""
exercises.py

Business logic for Exercise CRUD scoped to the current user.
"""

from sqlalchemy import func

from app.models.exercise import Exercise
from app.models.user import User
from app.models.workout_exercise import WorkoutExercise
from app.models.workout_session import WorkoutSession
from app.schemas.exercises import ExerciseCreate, ExerciseOut, ExerciseUpdate


def list_exercises_for_user(a_db, a_user: User) -> list[ExerciseOut]:
    """
    List all exercises for the given user.
    """
    exercises = (
        a_db.query(Exercise)
        .filter(Exercise.user_id == a_user.id)
        .order_by(Exercise.name.asc())
        .all()
    )
    return [ExerciseOut.model_validate(ex) for ex in exercises]


def create_exercise_for_user(a_db, a_user: User, a_data: ExerciseCreate) -> ExerciseOut:
    """
    Create a new exercise owned by the given user.
    """
    exercise = Exercise(
        user_id=a_user.id,
        name=a_data.name,
        muscle_group=a_data.muscle_group,
    )
    a_db.add(exercise)
    a_db.commit()
    a_db.refresh(exercise)
    return ExerciseOut.model_validate(exercise)


def _get_exercise_for_user_or_none(a_db, a_user: User, a_exercise_id: int) -> Exercise | None:
    """
    Internal helper: return Exercise if it belongs to the user, else None.
    """
    return (
        a_db.query(Exercise)
        .filter(Exercise.id == a_exercise_id, Exercise.user_id == a_user.id)
        .first()
    )


def get_exercise_for_user(a_db, a_user: User, a_exercise_id: int) -> ExerciseOut | None:
    """
    Get a single exercise for a user; returns None if not found or not owned.
    """
    exercise = _get_exercise_for_user_or_none(a_db, a_user, a_exercise_id)
    if exercise is None:
        return None
    return ExerciseOut.model_validate(exercise)


def update_exercise_for_user(
    a_db,
    a_user: User,
    a_exercise_id: int,
    a_data: ExerciseUpdate,
) -> ExerciseOut | None:
    """
    Update an exercise for a user. Returns None if not found or not owned.
    """
    exercise = _get_exercise_for_user_or_none(a_db, a_user, a_exercise_id)
    if exercise is None:
        return None

    if a_data.name is not None:
        exercise.name = a_data.name
    if a_data.muscle_group is not None:
        exercise.muscle_group = a_data.muscle_group

    a_db.add(exercise)
    a_db.commit()
    a_db.refresh(exercise)
    return ExerciseOut.model_validate(exercise)


def delete_exercise_for_user(a_db, a_user: User, a_exercise_id: int) -> bool:
    """
    Delete an exercise for a user. Returns True if deleted, False if not found or not owned.
    """
    exercise = _get_exercise_for_user_or_none(a_db, a_user, a_exercise_id)
    if exercise is None:
        return False

    affected_session_ids = {
        row[0]
        for row in (
            a_db.query(WorkoutExercise.session_id)
            .filter(WorkoutExercise.exercise_id == exercise.id)
            .all()
        )
    }
    a_db.delete(exercise)
    a_db.flush()

    if affected_session_ids:
        empty_sessions = (
            a_db.query(WorkoutSession)
            .outerjoin(WorkoutExercise, WorkoutExercise.session_id == WorkoutSession.id)
            .filter(
                WorkoutSession.user_id == a_user.id,
                WorkoutSession.id.in_(affected_session_ids),
            )
            .group_by(WorkoutSession.id)
            .having(func.count(WorkoutExercise.id) == 0)
            .all()
        )
        for session in empty_sessions:
            a_db.delete(session)

    a_db.commit()
    return True


