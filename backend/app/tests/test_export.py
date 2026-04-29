"""
test_export.py

Slice 8: export endpoint coverage.
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
    return login_resp.json()["access_token"]


def test_export_returns_only_authenticated_users_data(client: TestClient):
    """Export returns a JSON attachment containing only the current user's data."""
    token1 = _register_and_login(client, "export-owner@example.com", "export-owner")
    token2 = _register_and_login(client, "export-other@example.com", "export-other")
    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}

    owner_exercise = client.post(
        "/api/v1/exercises/",
        headers=headers1,
        json={"name": "Bench Press", "muscle_group": "chest"},
    ).json()
    other_exercise = client.post(
        "/api/v1/exercises/",
        headers=headers2,
        json={"name": "Deadlift", "muscle_group": "back"},
    ).json()

    session_resp = client.post(
        "/api/v1/sessions/",
        headers=headers1,
        json={
            "date": "2024-08-10",
            "notes": "Heavy day",
            "exercises": [
                {
                    "exercise_id": owner_exercise["id"],
                    "notes": "Paused reps",
                    "sets": [
                        {"set_number": 1, "reps": 8, "weight": 185},
                        {"set_number": 2, "reps": 6, "weight": 195},
                    ],
                }
            ],
        },
    )
    assert session_resp.status_code == 201

    template_resp = client.post(
        "/api/v1/templates/",
        headers=headers1,
        json={
            "name": "Push Day",
            "exercises": [
                {"exercise_id": owner_exercise["id"], "target_sets": 4, "target_reps": 8},
            ],
        },
    )
    assert template_resp.status_code == 201

    export_resp = client.get("/api/v1/export/", headers=headers1, params={"format": "json"})
    assert export_resp.status_code == 200
    assert export_resp.headers["content-type"].startswith("application/json")
    assert (
        export_resp.headers["content-disposition"]
        .startswith('attachment; filename="progressive-overload-export-')
    )

    payload = export_resp.json()
    assert payload["user"]["email"] == "export-owner@example.com"
    assert payload["user"]["username"] == "export-owner"
    assert payload["exercises"] == [
        {
            "id": owner_exercise["id"],
            "name": "Bench Press",
            "muscle_group": "chest",
            "created_at": owner_exercise["created_at"],
            "updated_at": owner_exercise["updated_at"],
        }
    ]
    assert len(payload["sessions"]) == 1
    assert payload["sessions"][0]["date"] == "2024-08-10"
    assert payload["sessions"][0]["notes"] == "Heavy day"
    assert payload["sessions"][0]["exercises"] == [
        {
            "exercise_id": owner_exercise["id"],
            "exercise_name": "Bench Press",
            "notes": "Paused reps",
            "sets": [
                {
                    "id": payload["sessions"][0]["exercises"][0]["sets"][0]["id"],
                    "set_number": 1,
                    "reps": 8,
                    "weight": "185.00",
                    "rest_seconds": None,
                    "notes": None,
                },
                {
                    "id": payload["sessions"][0]["exercises"][0]["sets"][1]["id"],
                    "set_number": 2,
                    "reps": 6,
                    "weight": "195.00",
                    "rest_seconds": None,
                    "notes": None,
                },
            ],
        }
    ]
    assert payload["templates"] == [
        {
            "id": template_resp.json()["id"],
            "name": "Push Day",
            "created_at": template_resp.json()["created_at"],
            "updated_at": template_resp.json()["updated_at"],
            "exercises": [
                {
                    "exercise_id": owner_exercise["id"],
                    "exercise_name": "Bench Press",
                    "target_sets": 4,
                    "target_reps": 8,
                }
            ],
        }
    ]
    assert "exported_at" in payload

    serialized_payload = export_resp.text
    assert "export-owner@example.com" in serialized_payload
    assert "Bench Press" in serialized_payload
    assert "export-other@example.com" not in serialized_payload
    assert other_exercise["name"] not in serialized_payload


def test_export_requires_authentication(client: TestClient):
    """Unauthenticated export requests return 401."""
    response = client.get("/api/v1/export/", params={"format": "json"})
    assert response.status_code == 401
