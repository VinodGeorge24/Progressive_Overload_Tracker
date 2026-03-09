"""
analytics.py

Business logic for exercise progress analytics and chart rendering.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import date
from io import BytesIO

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
from sqlalchemy.orm import Session

from app.models.exercise import Exercise
from app.models.user import User
from app.models.workout_exercise import WorkoutExercise
from app.models.workout_session import WorkoutSession
from app.schemas.analytics import ExerciseProgressOut, ProgressMetric, ProgressPoint, ProgressSeries


EXERCISE_NOT_FOUND_DETAIL = "Exercise not found"


def _get_owned_exercise(a_db: Session, a_user: User, a_exercise_id: int) -> Exercise | None:
    """Return the user's exercise if it exists, otherwise None."""
    return (
        a_db.query(Exercise)
        .filter(Exercise.id == a_exercise_id, Exercise.user_id == a_user.id)
        .first()
    )


def get_progress_for_exercise(
    a_db: Session,
    a_user: User,
    a_exercise_id: int,
    a_start_date: date | None = None,
    a_end_date: date | None = None,
    a_set_number: int | None = None,
) -> tuple[ExerciseProgressOut | None, str | None]:
    """Return grouped progress series for one exercise, scoped to the user."""
    exercise = _get_owned_exercise(a_db, a_user, a_exercise_id)
    if exercise is None:
        return None, EXERCISE_NOT_FOUND_DETAIL

    query = (
        a_db.query(WorkoutSession.date, WorkoutExercise.order, WorkoutExercise, Exercise)
        .join(WorkoutExercise, WorkoutExercise.session_id == WorkoutSession.id)
        .join(Exercise, Exercise.id == WorkoutExercise.exercise_id)
        .filter(
            WorkoutSession.user_id == a_user.id,
            WorkoutExercise.exercise_id == a_exercise_id,
        )
    )
    if a_start_date is not None:
        query = query.filter(WorkoutSession.date >= a_start_date)
    if a_end_date is not None:
        query = query.filter(WorkoutSession.date <= a_end_date)

    workout_rows = query.order_by(WorkoutSession.date.asc(), WorkoutExercise.order.asc()).all()

    points_by_set_number: dict[int, list[ProgressPoint]] = defaultdict(list)
    for session_date, _, workout_exercise, _ in workout_rows:
        for logged_set in sorted(workout_exercise.sets, key=lambda a_set: a_set.set_number):
            if a_set_number is not None and logged_set.set_number != a_set_number:
                continue
            weight = float(logged_set.weight)
            points_by_set_number[logged_set.set_number].append(
                ProgressPoint(
                    date=session_date,
                    weight=weight,
                    reps=logged_set.reps,
                    volume=weight * logged_set.reps,
                )
            )

    series = [
        ProgressSeries(set_number=set_number, points=points)
        for set_number, points in sorted(points_by_set_number.items())
    ]
    return (
        ExerciseProgressOut(
            exercise_id=exercise.id,
            exercise_name=exercise.name,
            series=series,
        ),
        None,
    )


def build_progress_chart_png(
    a_progress: ExerciseProgressOut,
    a_metric: ProgressMetric,
) -> bytes:
    """Render a PNG chart for the selected metric."""
    figure, axis = plt.subplots(figsize=(10, 5), dpi=160)
    figure.patch.set_facecolor("#020617")
    axis.set_facecolor("#0f172a")

    colors = ["#38bdf8", "#f97316", "#22c55e", "#facc15", "#e879f9", "#fb7185"]

    if a_progress.series:
        for index, series in enumerate(a_progress.series):
            x_values = [point.date.isoformat() for point in series.points]
            if a_metric == "reps":
                y_values = [point.reps for point in series.points]
            elif a_metric == "volume":
                y_values = [point.volume for point in series.points]
            else:
                y_values = [point.weight for point in series.points]
            axis.plot(
                x_values,
                y_values,
                marker="o",
                linewidth=2.2,
                markersize=5,
                color=colors[index % len(colors)],
                label=f"Set {series.set_number}",
            )
        axis.legend(facecolor="#0f172a", edgecolor="#334155", labelcolor="#e2e8f0")
    else:
        axis.text(
            0.5,
            0.5,
            "No data for the selected filters",
            color="#cbd5e1",
            ha="center",
            va="center",
            transform=axis.transAxes,
        )

    axis.set_title(f"{a_progress.exercise_name} {a_metric.title()} Progress", color="#f8fafc", pad=14)
    axis.set_xlabel("Date", color="#cbd5e1")
    axis.set_ylabel(a_metric.title(), color="#cbd5e1")
    axis.tick_params(axis="x", colors="#94a3b8", rotation=45)
    axis.tick_params(axis="y", colors="#94a3b8")
    for spine in axis.spines.values():
        spine.set_color("#334155")
    axis.grid(True, color="#1e293b", linewidth=0.8, alpha=0.8)
    figure.tight_layout()

    buffer = BytesIO()
    figure.savefig(buffer, format="png", facecolor=figure.get_facecolor(), bbox_inches="tight")
    plt.close(figure)
    return buffer.getvalue()
