"""
Cleanup orphaned workout data in SQLite/Postgres.

Deletes:
- sets whose workout_exercise_id no longer exists
- workout_exercises whose exercise_id no longer exists
- workout_sessions with no workout_exercises left
"""

from __future__ import annotations

import argparse

from sqlalchemy import create_engine
from sqlalchemy import delete, func, select

from app.core.config import settings
from app.db.session import SessionLocal, _configure_sqlite_foreign_keys
from app.models.exercise import Exercise
from app.models.set import Set
from app.models.workout_exercise import WorkoutExercise
from app.models.workout_session import WorkoutSession

SQLITE_AUTOINCREMENT_TABLES = (
    "exercises",
    "workout_sessions",
    "workout_exercises",
    "sets",
)


def _sqlite_autoincrement_missing() -> list[str]:
    """Return SQLite tables that still need AUTOINCREMENT."""
    if not settings.DATABASE_URL.startswith("sqlite"):
        return []

    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
    _configure_sqlite_foreign_keys(engine)
    try:
        with engine.connect() as connection:
            rows = connection.exec_driver_sql(
                """
                SELECT name, sql
                FROM sqlite_master
                WHERE type = 'table'
                  AND name IN ('exercises', 'workout_sessions', 'workout_exercises', 'sets')
                """
            ).fetchall()
    finally:
        engine.dispose()

    create_sql_by_name = {row[0]: (row[1] or "").upper() for row in rows}
    return [
        table_name
        for table_name in SQLITE_AUTOINCREMENT_TABLES
        if "AUTOINCREMENT" not in create_sql_by_name.get(table_name, "")
    ]


def _rebuild_sqlite_tables_with_autoincrement() -> None:
    """Rebuild SQLite workout tables so ids are not reused after deletes."""
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
    try:
        with engine.begin() as connection:
            raw_connection = connection.connection.driver_connection
            raw_connection.executescript(
                """
                PRAGMA foreign_keys=OFF;

                CREATE TABLE exercises_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name VARCHAR(255) NOT NULL,
                    muscle_group VARCHAR(255),
                    created_at DATETIME NOT NULL,
                    updated_at DATETIME NOT NULL
                );
                INSERT INTO exercises_new (id, user_id, name, muscle_group, created_at, updated_at)
                SELECT id, user_id, name, muscle_group, created_at, updated_at FROM exercises;
                DROP TABLE exercises;
                ALTER TABLE exercises_new RENAME TO exercises;
                CREATE INDEX ix_exercises_user_id ON exercises (user_id);

                CREATE TABLE workout_sessions_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    date DATE NOT NULL,
                    notes TEXT,
                    created_at DATETIME NOT NULL,
                    updated_at DATETIME NOT NULL,
                    CONSTRAINT uq_workout_sessions_user_date UNIQUE (user_id, date)
                );
                INSERT INTO workout_sessions_new (id, user_id, date, notes, created_at, updated_at)
                SELECT id, user_id, date, notes, created_at, updated_at FROM workout_sessions;
                DROP TABLE workout_sessions;
                ALTER TABLE workout_sessions_new RENAME TO workout_sessions;
                CREATE INDEX ix_workout_sessions_user_id ON workout_sessions (user_id);

                CREATE TABLE workout_exercises_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id INTEGER NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
                    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
                    "order" INTEGER NOT NULL,
                    notes TEXT
                );
                INSERT INTO workout_exercises_new (id, session_id, exercise_id, "order", notes)
                SELECT id, session_id, exercise_id, "order", notes FROM workout_exercises;
                DROP TABLE workout_exercises;
                ALTER TABLE workout_exercises_new RENAME TO workout_exercises;
                CREATE INDEX ix_workout_exercises_session_id ON workout_exercises (session_id);
                CREATE INDEX ix_workout_exercises_exercise_id ON workout_exercises (exercise_id);

                CREATE TABLE sets_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    workout_exercise_id INTEGER NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
                    set_number INTEGER NOT NULL,
                    reps INTEGER NOT NULL,
                    weight NUMERIC(10, 2) NOT NULL,
                    rest_seconds INTEGER,
                    notes TEXT
                );
                INSERT INTO sets_new (id, workout_exercise_id, set_number, reps, weight, rest_seconds, notes)
                SELECT id, workout_exercise_id, set_number, reps, weight, rest_seconds, notes FROM sets;
                DROP TABLE sets;
                ALTER TABLE sets_new RENAME TO sets;
                CREATE INDEX ix_sets_workout_exercise_id ON sets (workout_exercise_id);

                PRAGMA foreign_keys=ON;
                """
            )
    finally:
        engine.dispose()


def cleanup_orphan_workout_data(a_dry_run: bool = False) -> dict[str, int]:
    """Remove orphan workout rows and return counts for each cleanup step."""
    autoincrement_rebuild_tables = _sqlite_autoincrement_missing()
    with SessionLocal() as db:
        orphan_set_count = db.execute(
            select(func.count(Set.id)).where(
                ~Set.workout_exercise_id.in_(select(WorkoutExercise.id))
            )
        ).scalar_one()
        orphan_workout_exercise_count = db.execute(
            select(func.count(WorkoutExercise.id)).where(
                ~WorkoutExercise.exercise_id.in_(select(Exercise.id))
            )
        ).scalar_one()

        results = {
            "deleted_sets": orphan_set_count,
            "deleted_workout_exercises": orphan_workout_exercise_count,
            "deleted_empty_sessions": 0,
            "rebuild_autoincrement_tables": len(autoincrement_rebuild_tables),
        }

        if orphan_set_count:
            db.execute(
                delete(Set).where(~Set.workout_exercise_id.in_(select(WorkoutExercise.id)))
            )
        if orphan_workout_exercise_count:
            db.execute(
                delete(WorkoutExercise).where(
                    ~WorkoutExercise.exercise_id.in_(select(Exercise.id))
                )
            )

        empty_session_ids = [
            row[0]
            for row in db.execute(
                select(WorkoutSession.id)
                .outerjoin(WorkoutExercise, WorkoutExercise.session_id == WorkoutSession.id)
                .group_by(WorkoutSession.id)
                .having(func.count(WorkoutExercise.id) == 0)
            ).all()
        ]
        results["deleted_empty_sessions"] = len(empty_session_ids)
        if empty_session_ids:
            db.execute(delete(WorkoutSession).where(WorkoutSession.id.in_(empty_session_ids)))

        if a_dry_run:
            db.rollback()
            return results

        db.commit()
        if autoincrement_rebuild_tables:
            _rebuild_sqlite_tables_with_autoincrement()
        return results


def main() -> None:
    parser = argparse.ArgumentParser(description="Delete orphaned workout rows from the database.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report rows that would be removed without modifying the database.",
    )
    args = parser.parse_args()

    results = cleanup_orphan_workout_data(a_dry_run=args.dry_run)
    mode = "Dry run" if args.dry_run else "Cleanup complete"
    print(mode)
    for key, value in results.items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    main()
