"""
sessions.py

Business logic for WorkoutSession CRUD. One session per user per day (409 on duplicate date).
Validates exercise ownership; returns 404 for wrong user or missing exercise.
"""

from datetime import date, datetime

from sqlalchemy.orm import Session, joinedload

from app.models.exercise import Exercise
from app.models.set import Set
from app.models.user import User
from app.models.workout_exercise import WorkoutExercise
from app.models.workout_session import WorkoutSession
from app.schemas.sessions import (
    LastSetPoint,
    LastSetsOut,
    SessionCreate,
    SessionListResponse,
    SessionOut,
    SessionUpdate,
    SetOut,
    WorkoutExerciseOut,
    WorkoutExerciseIn,
)


SESSION_NOT_FOUND_DETAIL = "Session not found"
SESSION_DATE_EXISTS_DETAIL = "A workout already exists for this date; edit it instead."
SESSION_DATE_EXISTS_PUT_DETAIL = "A workout already exists for that date."
EXERCISE_NOT_FOUND_DETAIL = "Exercise not found"


def _session_to_out(a_session: WorkoutSession) -> SessionOut:
    """Build SessionOut from ORM with exercises (by order) and sets (by set_number).
    Dedupe sets by id so joinedload row multiplication never produces duplicate set entries.
    """
    exercises_out: list[WorkoutExerciseOut] = []
    for we in sorted(a_session.workout_exercises, key=lambda x: x.order):
        # Dedupe by id (joinedload can duplicate rows; keep one per set)
        unique_sets = {s.id: s for s in we.sets}.values()
        sets_out = [SetOut.model_validate(s) for s in sorted(unique_sets, key=lambda x: x.set_number)]
        exercises_out.append(
            WorkoutExerciseOut(
                exercise_id=we.exercise_id,
                exercise_name=we.exercise.name if we.exercise else "",
                sets=sets_out,
                notes=we.notes,
            )
        )
    return SessionOut(
        id=a_session.id,
        date=a_session.date,
        notes=a_session.notes,
        created_at=a_session.created_at,
        updated_at=a_session.updated_at,
        exercises=exercises_out,
    )


def _validate_exercise_ids_owned(a_db: Session, a_user_id: int, a_exercise_ids: list[int]) -> bool:
    """Return True if every exercise_id is owned by the user."""
    if not a_exercise_ids:
        return True
    count = (
        a_db.query(Exercise)
        .filter(Exercise.id.in_(a_exercise_ids), Exercise.user_id == a_user_id)
        .count()
    )
    return count == len(a_exercise_ids)


def create_session_for_user(
    a_db: Session,
    a_user: User,
    a_data: SessionCreate,
) -> tuple[SessionOut | None, str | None]:
    """
    Create a workout session. Returns (SessionOut, None) on success.
    Returns (None, detail_message) for 409 (date exists) or 404 (exercise not owned).
    """
    existing = (
        a_db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == a_user.id, WorkoutSession.date == a_data.date)
        .first()
    )
    if existing:
        return None, SESSION_DATE_EXISTS_DETAIL

    exercise_ids = [ex.exercise_id for ex in a_data.exercises]
    if not _validate_exercise_ids_owned(a_db, a_user.id, exercise_ids):
        return None, EXERCISE_NOT_FOUND_DETAIL

    session = WorkoutSession(
        user_id=a_user.id,
        date=a_data.date,
        notes=a_data.notes,
    )
    a_db.add(session)
    a_db.flush()

    for order, ex_in in enumerate(a_data.exercises):
        we = WorkoutExercise(
            session_id=session.id,
            exercise_id=ex_in.exercise_id,
            order=order,
            notes=ex_in.notes,
        )
        a_db.add(we)
        a_db.flush()
        for set_in in ex_in.sets:
            s = Set(
                workout_exercise_id=we.id,
                set_number=set_in.set_number,
                reps=set_in.reps,
                weight=set_in.weight,
                rest_seconds=set_in.rest_seconds,
                notes=set_in.notes,
            )
            a_db.add(s)

    a_db.commit()
    a_db.refresh(session)
    # Reload with relationships for output
    a_db.refresh(session)
    session = (
        a_db.query(WorkoutSession)
        .options(
            joinedload(WorkoutSession.workout_exercises).options(
                joinedload(WorkoutExercise.exercise),
                joinedload(WorkoutExercise.sets),
            )
        )
        .filter(WorkoutSession.id == session.id)
        .first()
    )
    return _session_to_out(session), None


def get_session_for_user(
    a_db: Session,
    a_user: User,
    a_session_id: int,
) -> SessionOut | None:
    """Get a session by id if owned by user; else None."""
    session = (
        a_db.query(WorkoutSession)
        .options(
            joinedload(WorkoutSession.workout_exercises).options(
                joinedload(WorkoutExercise.exercise),
                joinedload(WorkoutExercise.sets),
            )
        )
        .filter(
            WorkoutSession.id == a_session_id,
            WorkoutSession.user_id == a_user.id,
        )
        .first()
    )
    if session is None:
        return None
    return _session_to_out(session)


def list_sessions_for_user(
    a_db: Session,
    a_user: User,
    a_limit: int = 50,
    a_offset: int = 0,
    a_start_date: date | None = None,
    a_end_date: date | None = None,
) -> SessionListResponse:
    """List sessions for user with total count and optional date range."""
    q = (
        a_db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == a_user.id)
    )
    if a_start_date is not None:
        q = q.filter(WorkoutSession.date >= a_start_date)
    if a_end_date is not None:
        q = q.filter(WorkoutSession.date <= a_end_date)

    total = q.count()
    sessions = (
        q.options(
            joinedload(WorkoutSession.workout_exercises).options(
                joinedload(WorkoutExercise.exercise),
                joinedload(WorkoutExercise.sets),
            )
        )
        .order_by(WorkoutSession.date.desc())
        .limit(a_limit)
        .offset(a_offset)
        .all()
    )
    return SessionListResponse(
        sessions=[_session_to_out(s) for s in sessions],
        total=total,
    )


def update_session_for_user(
    a_db: Session,
    a_user: User,
    a_session_id: int,
    a_data: SessionUpdate,
) -> tuple[SessionOut | None, str | None]:
    """
    Update a session. Returns (SessionOut, None) on success.
    Returns (None, detail) for 404 (not found) or 409 (new date already has session).
    """
    session = (
        a_db.query(WorkoutSession)
        .filter(
            WorkoutSession.id == a_session_id,
            WorkoutSession.user_id == a_user.id,
        )
        .first()
    )
    if session is None:
        return None, SESSION_NOT_FOUND_DETAIL

    if a_data.date is not None and a_data.date != session.date:
        existing = (
            a_db.query(WorkoutSession)
            .filter(
                WorkoutSession.user_id == a_user.id,
                WorkoutSession.date == a_data.date,
            )
            .first()
        )
        if existing:
            return None, SESSION_DATE_EXISTS_PUT_DETAIL

    if a_data.exercises is not None:
        exercise_ids = [ex.exercise_id for ex in a_data.exercises]
        if not _validate_exercise_ids_owned(a_db, a_user.id, exercise_ids):
            return None, EXERCISE_NOT_FOUND_DETAIL
        # Replace workout_exercises and sets: delete existing, add new
        for we in list(session.workout_exercises):
            a_db.delete(we)
        a_db.flush()
        a_db.expire(session, ["workout_exercises"])  # clear deleted refs from session
        for order, ex_in in enumerate(a_data.exercises):
            we = WorkoutExercise(
                session_id=session.id,
                exercise_id=ex_in.exercise_id,
                order=order,
                notes=ex_in.notes,
            )
            a_db.add(we)
            a_db.flush()
            for set_in in ex_in.sets:
                s = Set(
                    workout_exercise_id=we.id,
                    set_number=set_in.set_number,
                    reps=set_in.reps,
                    weight=set_in.weight,
                    rest_seconds=set_in.rest_seconds,
                    notes=set_in.notes,
                )
                a_db.add(s)

    if a_data.date is not None:
        session.date = a_data.date
    if a_data.notes is not None:
        session.notes = a_data.notes

    a_db.commit()
    a_db.refresh(session)
    session = (
        a_db.query(WorkoutSession)
        .options(
            joinedload(WorkoutSession.workout_exercises).options(
                joinedload(WorkoutExercise.exercise),
                joinedload(WorkoutExercise.sets),
            )
        )
        .filter(WorkoutSession.id == session.id)
        .first()
    )
    return _session_to_out(session), None


def get_last_sets_for_exercise(
    a_db: Session,
    a_user: User,
    a_exercise_id: int,
) -> LastSetsOut | None:
    """
    Return the most recent session's sets for this exercise (for pre-fill).
    Returns None if exercise not owned by user or never logged.
    """
    # Verify exercise is owned
    ex = (
        a_db.query(Exercise)
        .filter(Exercise.id == a_exercise_id, Exercise.user_id == a_user.id)
        .first()
    )
    if ex is None:
        return None
    # Most recent workout_exercise for this exercise in a session by this user (past sessions)
    we = (
        a_db.query(WorkoutExercise)
        .options(joinedload(WorkoutExercise.sets))
        .join(WorkoutSession, WorkoutExercise.session_id == WorkoutSession.id)
        .filter(
            WorkoutSession.user_id == a_user.id,
            WorkoutExercise.exercise_id == a_exercise_id,
        )
        .order_by(WorkoutSession.date.desc())
        .first()
    )
    if we is None:
        return None
    session = (
        a_db.query(WorkoutSession)
        .filter(WorkoutSession.id == we.session_id)
        .first()
    )
    if session is None:
        return None
    sets_sorted = sorted(we.sets, key=lambda s: s.set_number)
    return LastSetsOut(
        date=session.date,
        sets=[
            LastSetPoint(set_number=s.set_number, weight=s.weight, reps=s.reps)
            for s in sets_sorted
        ],
    )


def delete_session_for_user(
    a_db: Session,
    a_user: User,
    a_session_id: int,
) -> bool:
    """Delete a session for user. Returns True if deleted, False if not found."""
    session = (
        a_db.query(WorkoutSession)
        .filter(
            WorkoutSession.id == a_session_id,
            WorkoutSession.user_id == a_user.id,
        )
        .first()
    )
    if session is None:
        return False
    a_db.delete(session)
    a_db.commit()
    return True
