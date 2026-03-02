"""
test_exercises.py

Slice 2: Exercises CRUD and ownership.
"""

from fastapi.testclient import TestClient


def _register_and_login(a_client: TestClient, a_email: str, a_username: str) -> str:
    """Helper: register a user and return access token."""
    register_resp = a_client.post(
        "/api/v1/auth/register",
        json={"email": a_email, "username": a_username, "password": "password123"},
    )
    assert register_resp.status_code == 201

    login_resp = a_client.post(
        "/api/v1/auth/login",
        json={"email": a_email, "password": "password123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    return token


def test_exercises_crud_for_user(client: TestClient):
    """Create, list, get, update, and delete exercises for a user."""
    token = _register_and_login(client, "user1@example.com", "user1")
    headers = {"Authorization": f"Bearer {token}"}

    # Create exercise
    create_resp = client.post(
        "/api/v1/exercises/",
        headers=headers,
        json={"name": "Bench Press", "muscle_group": "chest"},
    )
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["name"] == "Bench Press"
    assert created["muscle_group"] == "chest"
    exercise_id = created["id"]

    # List exercises
    list_resp = client.get("/api/v1/exercises/", headers=headers)
    assert list_resp.status_code == 200
    exercises = list_resp.json()
    assert isinstance(exercises, list)
    assert any(ex["id"] == exercise_id for ex in exercises)

    # Get exercise
    get_resp = client.get(f"/api/v1/exercises/{exercise_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == exercise_id

    # Update exercise
    update_resp = client.put(
        f"/api/v1/exercises/{exercise_id}",
        headers=headers,
        json={"name": "Incline Bench Press"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Incline Bench Press"

    # Delete exercise
    delete_resp = client.delete(f"/api/v1/exercises/{exercise_id}", headers=headers)
    assert delete_resp.status_code == 204

    # Get after delete → 404
    get_after_delete = client.get(f"/api/v1/exercises/{exercise_id}", headers=headers)
    assert get_after_delete.status_code == 404


def test_exercises_are_scoped_to_current_user(client: TestClient):
    """Exercises created by one user are not visible or editable by another user."""
    token_user1 = _register_and_login(client, "user1@example.com", "user1")
    headers_user1 = {"Authorization": f"Bearer {token_user1}"}

    create_resp = client.post(
        "/api/v1/exercises/",
        headers=headers_user1,
        json={"name": "Squat", "muscle_group": "legs"},
    )
    assert create_resp.status_code == 201
    exercise_id = create_resp.json()["id"]

    token_user2 = _register_and_login(client, "user2@example.com", "user2")
    headers_user2 = {"Authorization": f"Bearer {token_user2}"}

    # User 2 list should not include user 1's exercise
    list_resp_user2 = client.get("/api/v1/exercises/", headers=headers_user2)
    assert list_resp_user2.status_code == 200
    assert all(ex["id"] != exercise_id for ex in list_resp_user2.json())

    # User 2 get/update/delete should see 404
    get_resp = client.get(f"/api/v1/exercises/{exercise_id}", headers=headers_user2)
    assert get_resp.status_code == 404

    update_resp = client.put(
        f"/api/v1/exercises/{exercise_id}",
        headers=headers_user2,
        json={"name": "Front Squat"},
    )
    assert update_resp.status_code == 404

    delete_resp = client.delete(
        f"/api/v1/exercises/{exercise_id}",
        headers=headers_user2,
    )
    assert delete_resp.status_code == 404

