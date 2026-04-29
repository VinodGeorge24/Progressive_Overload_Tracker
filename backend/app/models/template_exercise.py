"""
template_exercise.py

Defines the TemplateExercise SQLAlchemy model (template-exercise junction).

Per DATA_MODEL.md: id, template_id (FK), exercise_id (FK), target_sets,
target_reps, order.
"""

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.exercise import Exercise
    from app.models.workout_template import WorkoutTemplate


class TemplateExercise(Base):
    """
    Junction: exercise included in a workout template.

    Table: template_exercises. order = display order within template.
    """

    __tablename__ = "template_exercises"
    __table_args__ = {"sqlite_autoincrement": True}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    template_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("workout_templates.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    exercise_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("exercises.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    target_sets: Mapped[int] = mapped_column(Integer, nullable=False)
    target_reps: Mapped[int] = mapped_column(Integer, nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    template: Mapped["WorkoutTemplate"] = relationship(
        "WorkoutTemplate",
        back_populates="template_exercises",
        passive_deletes=True,
    )
    exercise: Mapped["Exercise"] = relationship(
        "Exercise",
        back_populates="template_exercises",
        passive_deletes=True,
    )
