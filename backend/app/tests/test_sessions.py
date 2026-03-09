"""
test_sessions.py

Slice 3: Workout sessions CRUD, 409 on duplicate date, 404 for other user.
"""

from fastapi.testclient import TestClient
from sqlalchemy import text

from app.tests.conftest import TestingSessionLocal


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
    return login_resp.json()["access_token"]


def test_sessions_crud_and_list(client: TestClient):
    """Create session with exercises and sets; list, get, update, delete."""
    token = _register_and_login(client, "user1@example.com", "user1")
    headers = {"Authorization": f"Bearer {token}"}

    # Create two exercises
    e1 = client.post(
        "/api/v1/exercises/",
        headers=headers,
        json={"name": "Bench Press", "muscle_group": "chest"},
    ).json()
    e2 = client.post(
        "/api/v1/exercises/",
        headers=headers,
        json={"name": "Squat", "muscle_group": "legs"},
    ).json()

    # Create session with 2 exercises and sets
    create_body = {
        "date": "2024-01-15",
        "notes": "Great workout",
        "exercises": [
            {
                "exercise_id": e1["id"],
                "sets": [
                    {"set_number": 1, "reps": 10, "weight": 135},
                    {"set_number": 2, "reps": 8, "weight": 145},
                ],
            },
            {
                "exercise_id": e2["id"],
                "sets": [{"set_number": 1, "reps": 5, "weight": 225}],
            },
        ],
    }
    create_resp = client.post("/api/v1/sessions/", headers=headers, json=create_body)
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["date"] == "2024-01-15"
    assert created["notes"] == "Great workout"
    assert len(created["exercises"]) == 2
    session_id = created["id"]

    # List sessions
    list_resp = client.get("/api/v1/sessions/", headers=headers)
    assert list_resp.status_code == 200
    data = list_resp.json()
    assert "sessions" in data
    assert "total" in data
    assert data["total"] == 1
    assert len(data["sessions"]) == 1
    assert data["sessions"][0]["id"] == session_id
    assert len(data["sessions"][0]["exercises"]) == 2

    # Get session
    get_resp = client.get(f"/api/v1/sessions/{session_id}", headers=headers)
    assert get_resp.status_code == 200
    get_data = get_resp.json()
    assert get_data["id"] == session_id
    assert len(get_data["exercises"]) == 2
    assert get_data["exercises"][0]["exercise_name"] == "Bench Press"
    assert len(get_data["exercises"][0]["sets"]) == 2

    # Update session
    update_resp = client.put(
        f"/api/v1/sessions/{session_id}",
        headers=headers,
        json={"notes": "Updated notes", "date": "2024-01-15", "exercises": create_body["exercises"]},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["notes"] == "Updated notes"

    # Delete session
    delete_resp = client.delete(f"/api/v1/sessions/{session_id}", headers=headers)
    assert delete_resp.status_code == 204

    # Get after delete → 404
    get_after = client.get(f"/api/v1/sessions/{session_id}", headers=headers)
    assert get_after.status_code == 404


def test_repeated_session_updates_do_not_accumulate_duplicate_sets(client: TestClient):
    """Repeated PUT should replace prior sets, not accumulate orphaned rows."""
    token = _register_and_login(client, "user-dup@example.com", "user-dup")
    headers = {"Authorization": f"Bearer {token}"}
    exercise = client.post(
        "/api/v1/exercises/",
        headers=headers,
        json={"name": "JM Press", "muscle_group": "triceps"},
    ).json()

    payload = {
        "date": "2024-06-01",
        "exercises": [
            {
                "exercise_id": exercise["id"],
                "sets": [
                    {"set_number": 1, "reps": 10, "weight": 65},
                    {"set_number": 2, "reps": 8, "weight": 70},
                ],
            }
        ],
    }
    create_resp = client.post("/api/v1/sessions/", headers=headers, json=payload)
    assert create_resp.status_code == 201
    session_id = create_resp.json()["id"]

    for _ in range(3):
        update_resp = client.put(f"/api/v1/sessions/{session_id}", headers=headers, json=payload)
        assert update_resp.status_code == 200

    get_resp = client.get(f"/api/v1/sessions/{session_id}", headers=headers)
    assert get_resp.status_code == 200
    sets = get_resp.json()["exercises"][0]["sets"]
    assert [(s["set_number"], s["weight"], s["reps"]) for s in sets] == [
        (1, "65.00", 10),
        (2, "70.00", 8),
    ]
    assert len({s["id"] for s in sets}) == 2

    last_sets_resp = client.get(
        "/api/v1/sessions/last-sets",
        headers=headers,
        params={"exercise_id": exercise["id"]},
    )
    assert last_sets_resp.status_code == 200
    assert last_sets_resp.json()["sets"] == [
        {"set_number": 1, "weight": "65.00", "reps": 10},
        {"set_number": 2, "weight": "70.00", "reps": 8},
    ]


def test_session_post_same_date_returns_409(client: TestClient):
    """POST session for a date that already has a session returns 409."""
    token = _register_and_login(client, "user1@example.com", "user1")
    headers = {"Authorization": f"Bearer {token}"}
    e = client.post(
        "/api/v1/exercises/",
        headers=headers,
        json={"name": "Bench", "muscle_group": "chest"},
    ).json()

    body = {
        "date": "2024-02-01",
        "exercises": [{"exercise_id": e["id"], "sets": [{"set_number": 1, "reps": 10, "weight": 135}]}],
    }
    first = client.post("/api/v1/sessions/", headers=headers, json=body)
    assert first.status_code == 201

    second = client.post("/api/v1/sessions/", headers=headers, json=body)
    assert second.status_code == 409
    assert "date" in second.json().get("detail", "").lower() or "workout" in second.json().get("detail", "").lower()


def test_session_put_to_existing_date_returns_409(client: TestClient):
    """PUT session to change date to a date that already has a session returns 409."""
    token = _register_and_login(client, "user1@example.com", "user1")
    headers = {"Authorization": f"Bearer {token}"}
    e = client.post(
        "/api/v1/exercises/",
        headers=headers,
        json={"name": "Bench", "muscle_group": "chest"},
    ).json()

    client.post(
        "/api/v1/sessions/",
        headers=headers,
        json={
            "date": "2024-03-01",
            "exercises": [{"exercise_id": e["id"], "sets": [{"set_number": 1, "reps": 10, "weight": 135}]}],
        },
    )
    assert client.post(
        "/api/v1/sessions/",
        headers=headers,
        json={
            "date": "2024-03-02",
            "exercises": [{"exercise_id": e["id"], "sets": [{"set_number": 1, "reps": 10, "weight": 135}]}],
        },
    ).status_code == 201

    list_resp = client.get("/api/v1/sessions/", headers=headers)
    sessions = list_resp.json()["sessions"]
    session_mar2 = next(s for s in sessions if s["date"] == "2024-03-02")

    # Try to change 2024-03-02 session to 2024-03-01 (already exists)
    put_resp = client.put(
        f"/api/v1/sessions/{session_mar2['id']}",
        headers=headers,
        json={"date": "2024-03-01", "notes": None, "exercises": []},
    )
    assert put_resp.status_code == 409


def test_sessions_other_user_404(client: TestClient):
    """GET, PUT, DELETE another user's session returns 404."""
    token1 = _register_and_login(client, "user1@example.com", "user1")
    token2 = _register_and_login(client, "user2@example.com", "user2")
    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}

    e = client.post(
        "/api/v1/exercises/",
        headers=headers1,
        json={"name": "Bench", "muscle_group": "chest"},
    ).json()
    create = client.post(
        "/api/v1/sessions/",
        headers=headers1,
        json={
            "date": "2024-04-01",
            "exercises": [{"exercise_id": e["id"], "sets": [{"set_number": 1, "reps": 10, "weight": 135}]}],
        },
    ).json()
    session_id = create["id"]

    get_resp = client.get(f"/api/v1/sessions/{session_id}", headers=headers2)
    assert get_resp.status_code == 404

    put_resp = client.put(
        f"/api/v1/sessions/{session_id}",
        headers=headers2,
        json={"date": "2024-04-01", "notes": "nope"},
    )
    assert put_resp.status_code == 404

    delete_resp = client.delete(f"/api/v1/sessions/{session_id}", headers=headers2)
    assert delete_resp.status_code == 404


def test_session_exercise_not_owned_404(client: TestClient):
    """Creating a session with an exercise_id owned by another user returns 404."""
    token1 = _register_and_login(client, "user1@example.com", "user1")
    token2 = _register_and_login(client, "user2@example.com", "user2")
    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}

    e_user1 = client.post(
        "/api/v1/exercises/",
        headers=headers1,
        json={"name": "Bench", "muscle_group": "chest"},
    ).json()

    # User2 tries to create a session with user1's exercise_id
    create_resp = client.post(
        "/api/v1/sessions/",
        headers=headers2,
        json={
            "date": "2024-05-01",
            "exercises": [
                {"exercise_id": e_user1["id"], "sets": [{"set_number": 1, "reps": 10, "weight": 135}]}
            ],
        },
    )
    assert create_resp.status_code == 404
    assert "exercise" in create_resp.json().get("detail", "").lower() or "not found" in create_resp.json().get("detail", "").lower()


def test_delete_exercise_cascades_logged_data_and_recreated_name_starts_clean(client: TestClient):
    """Deleting an exercise removes its workout data; recreating the name starts clean."""
    token = _register_and_login(client, "exercise-cleanup@example.com", "exercise-cleanup")
    headers = {"Authorization": f"Bearer {token}"}

    original = client.post(
        "/api/v1/exercises/",
        headers=headers,
        json={"name": "Squat", "muscle_group": "legs"},
    ).json()
    create_session = client.post(
        "/api/v1/sessions/",
        headers=headers,
        json={
            "date": "2024-07-01",
            "exercises": [
                {
                    "exercise_id": original["id"],
                    "sets": [
                        {"set_number": 1, "reps": 5, "weight": 225},
                        {"set_number": 2, "reps": 5, "weight": 235},
                    ],
                }
            ],
        },
    )
    assert create_session.status_code == 201

    delete_resp = client.delete(f"/api/v1/exercises/{original['id']}", headers=headers)
    assert delete_resp.status_code == 204

    last_deleted = client.get(
        "/api/v1/sessions/last-sets",
        headers=headers,
        params={"exercise_id": original["id"]},
    )
    assert last_deleted.status_code == 404

    sessions_after_delete = client.get("/api/v1/sessions/", headers=headers)
    assert sessions_after_delete.status_code == 200
    assert sessions_after_delete.json()["sessions"] == []

    with TestingSessionLocal() as db:
        workout_exercise_count = db.execute(
            text("select count(*) from workout_exercises where exercise_id = :exercise_id"),
            {"exercise_id": original["id"]},
        ).scalar_one()
        set_count = db.execute(
            text(
                """
                select count(*)
                from sets s
                join workout_exercises we on we.id = s.workout_exercise_id
                where we.exercise_id = :exercise_id
                """
            ),
            {"exercise_id": original["id"]},
        ).scalar_one()
    assert workout_exercise_count == 0
    assert set_count == 0

    recreated = client.post(
        "/api/v1/exercises/",
        headers=headers,
        json={"name": "Squat", "muscle_group": "legs"},
    ).json()
    assert recreated["id"] != original["id"]

    new_session = client.post(
        "/api/v1/sessions/",
        headers=headers,
        json={
            "date": "2024-07-02",
            "exercises": [
                {
                    "exercise_id": recreated["id"],
                    "sets": [{"set_number": 1, "reps": 3, "weight": 315}],
                }
            ],
        },
    )
    assert new_session.status_code == 201

    last_recreated = client.get(
        "/api/v1/sessions/last-sets",
        headers=headers,
        params={"exercise_id": recreated["id"]},
    )
    assert client.get(
        "/api/v1/sessions/last-sets",
        headers=headers,
        params={"exercise_id": original["id"]},
    ).status_code == 404
    assert last_recreated.status_code == 200
    assert last_recreated.json()["sets"] == [
        {"set_number": 1, "weight": "315.00", "reps": 3}
    ]

    sessions_after_recreate = client.get("/api/v1/sessions/", headers=headers)
    assert sessions_after_recreate.status_code == 200
    assert sessions_after_recreate.json()["total"] == 1
    assert sessions_after_recreate.json()["sessions"][0]["exercises"][0]["sets"] == [
        {
            "id": sessions_after_recreate.json()["sessions"][0]["exercises"][0]["sets"][0]["id"],
            "set_number": 1,
            "reps": 3,
            "weight": "315.00",
            "rest_seconds": None,
            "notes": None,
        }
    ]
