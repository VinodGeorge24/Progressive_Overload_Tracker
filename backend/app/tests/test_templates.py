"""
test_templates.py

Slice 5: workout templates CRUD, apply, and ownership rules.
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


def test_templates_crud_and_apply(client: TestClient):
    """Create, list, get, apply, update, and delete a template."""
    token = _register_and_login(client, "templates@example.com", "templates-user")
    headers = {"Authorization": f"Bearer {token}"}

    bench = client.post(
        "/api/v1/exercises/",
        headers=headers,
        json={"name": "Bench Press", "muscle_group": "chest"},
    ).json()
    row = client.post(
        "/api/v1/exercises/",
        headers=headers,
        json={"name": "Chest Supported Row", "muscle_group": "back"},
    ).json()
    squat = client.post(
        "/api/v1/exercises/",
        headers=headers,
        json={"name": "Back Squat", "muscle_group": "legs"},
    ).json()

    create_resp = client.post(
        "/api/v1/templates/",
        headers=headers,
        json={
            "name": "Upper A",
            "exercises": [
                {"exercise_id": bench["id"], "target_sets": 4, "target_reps": 8},
                {"exercise_id": row["id"], "target_sets": 3, "target_reps": 10},
            ],
        },
    )
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["name"] == "Upper A"
    assert created["exercises"] == [
        {
            "exercise_id": bench["id"],
            "exercise_name": "Bench Press",
            "target_sets": 4,
            "target_reps": 8,
        },
        {
            "exercise_id": row["id"],
            "exercise_name": "Chest Supported Row",
            "target_sets": 3,
            "target_reps": 10,
        },
    ]
    template_id = created["id"]

    list_resp = client.get("/api/v1/templates/", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1
    assert list_resp.json()[0]["id"] == template_id

    get_resp = client.get(f"/api/v1/templates/{template_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["exercises"][1]["exercise_name"] == "Chest Supported Row"

    apply_resp = client.get(f"/api/v1/templates/{template_id}/apply", headers=headers)
    assert apply_resp.status_code == 200
    assert apply_resp.json() == {
        "template_id": template_id,
        "template_name": "Upper A",
        "exercises": [
            {
                "exercise_id": bench["id"],
                "exercise_name": "Bench Press",
                "notes": None,
                "sets": [
                    {"set_number": 1, "reps": 8, "weight": "0"},
                    {"set_number": 2, "reps": 8, "weight": "0"},
                    {"set_number": 3, "reps": 8, "weight": "0"},
                    {"set_number": 4, "reps": 8, "weight": "0"},
                ],
            },
            {
                "exercise_id": row["id"],
                "exercise_name": "Chest Supported Row",
                "notes": None,
                "sets": [
                    {"set_number": 1, "reps": 10, "weight": "0"},
                    {"set_number": 2, "reps": 10, "weight": "0"},
                    {"set_number": 3, "reps": 10, "weight": "0"},
                ],
            },
        ],
    }

    update_resp = client.put(
        f"/api/v1/templates/{template_id}",
        headers=headers,
        json={
            "name": "Lower A",
            "exercises": [
                {"exercise_id": squat["id"], "target_sets": 5, "target_reps": 5},
            ],
        },
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Lower A"
    assert update_resp.json()["exercises"] == [
        {
            "exercise_id": squat["id"],
            "exercise_name": "Back Squat",
            "target_sets": 5,
            "target_reps": 5,
        }
    ]

    delete_resp = client.delete(f"/api/v1/templates/{template_id}", headers=headers)
    assert delete_resp.status_code == 204
    assert client.get(f"/api/v1/templates/{template_id}", headers=headers).status_code == 404


def test_templates_other_user_and_foreign_exercise_404(client: TestClient):
    """Templates respect ownership on both template ids and exercise ids."""
    token1 = _register_and_login(client, "template-owner@example.com", "template-owner")
    token2 = _register_and_login(client, "template-other@example.com", "template-other")
    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}

    owner_exercise = client.post(
        "/api/v1/exercises/",
        headers=headers1,
        json={"name": "Weighted Dip", "muscle_group": "chest"},
    ).json()
    intruder_create = client.post(
        "/api/v1/templates/",
        headers=headers2,
        json={
            "name": "Should Fail",
            "exercises": [
                {"exercise_id": owner_exercise["id"], "target_sets": 3, "target_reps": 8},
            ],
        },
    )
    assert intruder_create.status_code == 404
    assert intruder_create.json()["detail"] == "Exercise not found"

    owner_create = client.post(
        "/api/v1/templates/",
        headers=headers1,
        json={
            "name": "Push Day",
            "exercises": [
                {"exercise_id": owner_exercise["id"], "target_sets": 3, "target_reps": 8},
            ],
        },
    )
    assert owner_create.status_code == 201
    template_id = owner_create.json()["id"]

    assert client.get(f"/api/v1/templates/{template_id}", headers=headers2).status_code == 404
    assert client.get(f"/api/v1/templates/{template_id}/apply", headers=headers2).status_code == 404
    assert (
        client.put(
            f"/api/v1/templates/{template_id}",
            headers=headers2,
            json={"name": "Nope"},
        ).status_code
        == 404
    )
    assert client.delete(f"/api/v1/templates/{template_id}", headers=headers2).status_code == 404


def test_templates_duplicate_exercise_ids_return_400(client: TestClient):
    """Duplicate exercise ids in one template payload should return a clear 400."""
    token = _register_and_login(client, "template-dup@example.com", "template-dup")
    headers = {"Authorization": f"Bearer {token}"}

    exercise = client.post(
        "/api/v1/exercises/",
        headers=headers,
        json={"name": "Flat Bench Press", "muscle_group": "chest"},
    ).json()

    create_resp = client.post(
        "/api/v1/templates/",
        headers=headers,
        json={
            "name": "Duplicate Exercise Template",
            "exercises": [
                {"exercise_id": exercise["id"], "target_sets": 3, "target_reps": 8},
                {"exercise_id": exercise["id"], "target_sets": 2, "target_reps": 10},
            ],
        },
    )
    assert create_resp.status_code == 400
    assert create_resp.json()["detail"] == "Duplicate exercise IDs are not allowed in a template"
