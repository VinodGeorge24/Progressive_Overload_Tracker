"""
Database session management.

Creates and manages SQLAlchemy database sessions.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


def _configure_sqlite_foreign_keys(a_engine) -> None:
    """Enable SQLite foreign key enforcement so ON DELETE CASCADE actually runs."""
    if not str(a_engine.url).startswith("sqlite"):
        return

    @event.listens_for(a_engine, "connect")
    def _set_sqlite_pragma(a_dbapi_connection, _connection_record) -> None:
        cursor = a_dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=settings.DEBUG,  # Log SQL queries in debug mode
)
_configure_sqlite_foreign_keys(engine)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    Dependency function for FastAPI to get database session.

    Yields a database session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

