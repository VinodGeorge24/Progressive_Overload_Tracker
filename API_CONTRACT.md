# API Contract

This document defines the contract between the frontend and backend. All endpoints, request/response formats, and authentication requirements are specified here.

## Source of Truth

API_CONTRACT.md is the human-readable contract; FastAPI's auto-generated OpenAPI schema (`/docs`, `/openapi.json`) is the machine contract. They must match. When changing endpoints, update both this document and ensure the implementation aligns with it. Run the API and verify `/docs` reflects the contract.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: (TBD)

## Authentication

Most endpoints require authentication via JWT tokens.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Terminology (sets)

In request/response bodies, **weight** and **reps** refer to each set. See [DATA_MODEL.md](DATA_MODEL.md) for full definitions.

- **weight**: Weight lifted per that set (per set_number), in lbs.
- **reps**: Repetitions performed in that set (per set_number).

## Endpoints

### Authentication

#### POST /api/v1/auth/register
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "username"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### POST /api/v1/auth/login
Authenticate and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### POST /api/v1/auth/logout
Invalidate current token (if token blacklisting implemented).

**Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

### Exercises

#### GET /api/v1/exercises
Get all exercises for the authenticated user.

**Response (200):**
```json
{
  "exercises": [
    {
      "id": 1,
      "name": "Bench Press",
      "muscle_group": "chest",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/v1/exercises
Create a new exercise.

**Request:**
```json
{
  "name": "Bench Press",
  "muscle_group": "chest"
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Bench Press",
  "muscle_group": "chest",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### GET /api/v1/exercises/{exercise_id}
Get a specific exercise.

**Response (200):**
```json
{
  "id": 1,
  "name": "Bench Press",
  "muscle_group": "chest",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### PUT /api/v1/exercises/{exercise_id}
Update an exercise.

**Request:**
```json
{
  "name": "Incline Bench Press",
  "muscle_group": "chest"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Incline Bench Press",
  "muscle_group": "chest",
  "updated_at": "2024-01-02T00:00:00Z"
}
```

#### DELETE /api/v1/exercises/{exercise_id}
Delete an exercise.

**Response (204):** No content

### Workout Sessions

At most one workout session per user per calendar day. All session list/get endpoints scope to the current user.

#### GET /api/v1/sessions
Get all workout sessions for the authenticated user. Returns at most one session per date per user.

**Query Parameters:**
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)
- `start_date`: Filter sessions after this date (ISO format)
- `end_date`: Filter sessions before this date (ISO format)

**Response (200):**
```json
{
  "sessions": [
    {
      "id": 1,
      "date": "2024-01-01",
      "notes": "Great workout",
      "created_at": "2024-01-01T10:00:00Z",
      "exercises": [
        {
          "exercise_id": 1,
          "exercise_name": "Bench Press",
          "sets": [
            {
              "id": 1,
              "reps": 10,
              "weight": 135,
              "set_number": 1
            }
          ]
        }
      ]
    }
  ],
  "total": 1
}
```

#### POST /api/v1/sessions
Create a new workout session.

**Response (409 Conflict):** When the user already has a session for the given date. Body should include a clear message (e.g. "A workout already exists for this date; edit it instead.").

**Request:**
```json
{
  "date": "2024-01-01",
  "notes": "Great workout",
  "exercises": [
    {
      "exercise_id": 1,
      "sets": [
        {
          "reps": 10,
          "weight": 135,
          "set_number": 1
        }
      ]
    }
  ]
}
```

**Response (201):**
```json
{
  "id": 1,
  "date": "2024-01-01",
  "notes": "Great workout",
  "created_at": "2024-01-01T10:00:00Z"
}
```

#### GET /api/v1/sessions/{session_id}
Get a specific workout session.

**Response (200):**
```json
{
  "id": 1,
  "date": "2024-01-01",
  "notes": "Great workout",
  "exercises": [...]
}
```

#### PUT /api/v1/sessions/{session_id}
Update a workout session.

**Request:**
```json
{
  "date": "2024-01-01",
  "notes": "Updated notes",
  "exercises": [...]
}
```

**Response (200):**
```json
{
  "id": 1,
  "date": "2024-01-01",
  "notes": "Updated notes",
  "updated_at": "2024-01-01T11:00:00Z"
}
```

#### DELETE /api/v1/sessions/{session_id}
Delete a workout session.

**Response (204):** No content

### Analytics

Charts are generated in the backend with Python (e.g. matplotlib, Plotly). The backend may expose progress data and/or serve chart images (PNG/SVG) or URLs.

#### GET /api/v1/analytics/progress/{exercise_id}
Get progress data for a specific exercise (for chart generation or display). Scoped to the authenticated user.

**Query Parameters:**
- `start_date`: Start date for analysis (ISO format)
- `end_date`: End date for analysis (ISO format)
- `set_number`: (Optional) Filter to a specific set number (e.g. 1, 2). If omitted, return all set numbers.

**Response (200):**
```json
{
  "exercise_id": 1,
  "exercise_name": "Bench Press",
  "series": [
    {
      "set_number": 1,
      "points": [
        {
          "date": "2024-01-01",
          "weight": 135,
          "reps": 10,
          "volume": 1350
        }
      ]
    }
  ]
}
```

*(Optional)* **Chart image endpoint:** If the backend serves pre-rendered chart images, document the endpoint(s) here (e.g. GET returns image PNG/SVG or URL). Query params may include `exercise_id`, `start_date`, `end_date`, `set_number`, `metric` (weight | reps | volume).

#### GET /api/v1/analytics/plateaus
*Future.* Not in MVP. Remove or mark as deprecated until plateau detection is in scope.

#### GET /api/v1/analytics/recommendations
*Future.* Not in MVP. Remove or mark as deprecated until recommendations are in scope.

### Workout Templates

#### GET /api/v1/templates
Get all workout templates for the authenticated user.

**Response (200):**
```json
{
  "templates": [
    {
      "id": 1,
      "name": "Push Day",
      "exercises": [
        {
          "exercise_id": 1,
          "exercise_name": "Bench Press",
          "target_sets": 4,
          "target_reps": 10
        }
      ]
    }
  ]
}
```

#### POST /api/v1/templates
Create a new workout template.

**Request:**
```json
{
  "name": "Push Day",
  "exercises": [
    {
      "exercise_id": 1,
      "target_sets": 4,
      "target_reps": 10
    }
  ]
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Push Day",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## Error Responses

All errors follow this format:

**Response (4xx/5xx):**
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Status Codes
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Missing or invalid token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `422`: Unprocessable Entity - Validation error
- `500`: Internal Server Error - Server-side error

### Resource ownership and edge cases

- **404 Not Found**: Return when the resource does not exist **or** does not belong to the authenticated user (e.g. `exercise_id`, `session_id` for another user). Do not leak existence of other users' resources.
- **409 Conflict**: When creating a session (POST /api/v1/sessions) for a date that already has a session for this user (one session per day).
- **400 Bad Request**: Invalid date (e.g. future date if disallowed), invalid `set_number` or weight/reps (e.g. negative, zero where not allowed).
- **422 Unprocessable Entity**: Validation errors (e.g. required fields missing, wrong types).
- All session, exercise, and template list/get endpoints must scope to the current user only.

## Rate Limiting

(To be determined - may implement rate limiting for production)

## Versioning

All endpoints use the `/api/v1/` prefix. Future versions would use `/api/v2/`, etc.

