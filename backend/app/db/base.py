"""
Base model registry for SQLAlchemy and Alembic.

This module provides the declarative base that all models inherit from.
Do NOT import models here — that causes circular imports (user -> base -> user).
Alembic discovers models by importing them in alembic/env.py after importing Base.
"""

from sqlalchemy.orm import declarative_base

# Single declarative base for all models; Alembic env.py imports Base and models
Base = declarative_base()

