"""
test_auth.py

Slice 1: Register then login returns 200 and access_token.
"""

import pytest
from fastapi.testclient import TestClient

from app.core import security


@pytest.fixture(autouse=True)
def _mock_password_in_tests(monkeypatch):
    """Avoid bcrypt in tests to prevent passlib/bcrypt version issues; still test auth flow."""
    monkeypatch.setattr(security, "get_password_hash", lambda p: f"hashed_{p}")
    monkeypatch.setattr(security, "verify_password", lambda p, h: h == f"hashed_{p}")


def test_register_then_login_returns_token(client: TestClient):
    """Register a user, then login; expect 200 and access_token in response."""
    # Register
    register_resp = client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "username": "testuser", "password": "password123"},
    )
    assert register_resp.status_code == 201
    data = register_resp.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"
    assert "id" in data
    assert "password" not in data

    # Login
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    assert login_data.get("token_type") == "bearer"
    assert "user" in login_data
    assert login_data["user"]["email"] == "test@example.com"


def test_me_requires_auth(client: TestClient):
    """GET /auth/me without token returns 401."""
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_me_with_token_returns_user(client: TestClient):
    """GET /auth/me with valid token returns current user."""
    client.post(
        "/api/v1/auth/register",
        json={"email": "me@example.com", "username": "meuser", "password": "password123"},
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "me@example.com", "password": "password123"},
    )
    token = login_resp.json()["access_token"]
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "me@example.com"
