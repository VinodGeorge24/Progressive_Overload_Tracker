"""
test_analytics.py

Slice 4: exercise progress analytics JSON and PNG chart coverage.
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


def _create_progress_history(a_client: TestClient, a_headers: dict[str, str]) -> int:
    """Create one exercise with two sessions so analytics has data to aggregate."""
    exercise = a_client.post(
        "/api/v1/exercises/",
        headers=a_headers,
        json={"name": "Bench Press", "muscle_group": "chest"},
    )
    assert exercise.status_code == 201
    exercise_id = exercise.json()["id"]

    first_session = a_client.post(
        "/api/v1/sessions/",
        headers=a_headers,
        json={
            "date": "2024-08-01",
            "exercises": [
                {
                    "exercise_id": exercise_id,
                    "sets": [
                        {"set_number": 1, "reps": 10, "weight": 135},
                        {"set_number": 2, "reps": 8, "weight": 145},
                    ],
                }
            ],
        },
    )
    assert first_session.status_code == 201

    second_session = a_client.post(
        "/api/v1/sessions/",
        headers=a_headers,
        json={
            "date": "2024-08-08",
            "exercises": [
                {
                    "exercise_id": exercise_id,
                    "sets": [
                        {"set_number": 1, "reps": 9, "weight": 140},
                        {"set_number": 2, "reps": 7, "weight": 150},
                    ],
                }
            ],
        },
    )
    assert second_session.status_code == 201
    return exercise_id


def test_progress_endpoint_returns_grouped_series(client: TestClient):
    """Progress JSON should group points by set number and compute volume."""
    token = _register_and_login(client, "analytics@example.com", "analytics-user")
    headers = {"Authorization": f"Bearer {token}"}
    exercise_id = _create_progress_history(client, headers)

    response = client.get(
        f"/api/v1/analytics/progress/{exercise_id}",
        headers=headers,
    )
    assert response.status_code == 200

    payload = response.json()
    assert payload["exercise_id"] == exercise_id
    assert payload["exercise_name"] == "Bench Press"
    assert [series["set_number"] for series in payload["series"]] == [1, 2]
    assert payload["series"][0]["points"] == [
        {"date": "2024-08-01", "weight": 135.0, "reps": 10, "volume": 1350.0},
        {"date": "2024-08-08", "weight": 140.0, "reps": 9, "volume": 1260.0},
    ]

    filtered = client.get(
        f"/api/v1/analytics/progress/{exercise_id}",
        headers=headers,
        params={"set_number": 2, "start_date": "2024-08-05"},
    )
    assert filtered.status_code == 200
    assert filtered.json()["series"] == [
        {
            "set_number": 2,
            "points": [{"date": "2024-08-08", "weight": 150.0, "reps": 7, "volume": 1050.0}],
        }
    ]


def test_progress_chart_returns_png(client: TestClient):
    """Chart endpoint should return a PNG with auth-protected exercise data."""
    token = _register_and_login(client, "chart@example.com", "chart-user")
    headers = {"Authorization": f"Bearer {token}"}
    exercise_id = _create_progress_history(client, headers)

    response = client.get(
        f"/api/v1/analytics/progress/{exercise_id}/chart",
        headers=headers,
        params={"metric": "volume", "set_number": 1},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.headers["cache-control"] == "no-store"
    assert response.content.startswith(b"\x89PNG\r\n\x1a\n")


def test_progress_404_for_other_users_exercise(client: TestClient):
    """Progress endpoints should not leak another user's exercise."""
    owner_token = _register_and_login(client, "owner@example.com", "owner-user")
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    exercise_id = _create_progress_history(client, owner_headers)

    other_token = _register_and_login(client, "other@example.com", "other-user")
    other_headers = {"Authorization": f"Bearer {other_token}"}

    json_resp = client.get(f"/api/v1/analytics/progress/{exercise_id}", headers=other_headers)
    chart_resp = client.get(f"/api/v1/analytics/progress/{exercise_id}/chart", headers=other_headers)

    assert json_resp.status_code == 404
    assert chart_resp.status_code == 404
