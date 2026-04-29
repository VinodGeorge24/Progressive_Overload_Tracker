"""
workout_template.py

Defines the WorkoutTemplate SQLAlchemy model.

Per DATA_MODEL.md: id, user_id (FK), name, created_at, updated_at.
"""

from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.time import utc_now
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.template_exercise import TemplateExercise
    from app.models.user import User


class WorkoutTemplate(Base):
    """
    A reusable workout structure owned by one user.

    Table: workout_templates.
    """

    __tablename__ = "workout_templates"
    __table_args__ = {"sqlite_autoincrement": True}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="workout_templates",
        passive_deletes=True,
    )
    template_exercises: Mapped[List["TemplateExercise"]] = relationship(
        "TemplateExercise",
        back_populates="template",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
