"""
Pytest fixtures for backend tests.

Provides test client with overridden get_db using in-memory SQLite.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import _configure_sqlite_foreign_keys
from app.db.base import Base
from app.main import app


# In-memory SQLite for tests; StaticPool so all connections share the same DB
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_configure_sqlite_foreign_keys(engine)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Yield a test DB session. Tables created in pytest_configure or first use."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client():
    """Test client with test database. Each test gets a fresh DB (create_all at start)."""
    Base.metadata.create_all(bind=engine)
    try:
        from app.db.session import get_db
        app.dependency_overrides[get_db] = override_get_db
        with TestClient(app) as c:
            yield c
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
