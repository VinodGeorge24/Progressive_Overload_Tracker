# Data Model

This document describes the database structure, entities, relationships, and what each field represents.

## Overview

The database uses a relational model to track users, exercises, workout sessions, sets, and templates. All timestamps are stored in UTC.

## Project-wide terminology

Referenced by PRD, API_CONTRACT, and other docs:

- **weight**: Weight lifted **for that set** (per set_number), in pounds (lbs). E.g. for set_number 1, weight might be 85 (lbs).
- **reps**: Repetitions performed **in that set** (per set_number). E.g. for set_number 1, reps might be 6.

So every set row/object is read as: "For this set_number, the user did `reps` repetitions at `weight` lbs."

**Units:** Weight is stored and displayed in pounds (lbs) only. Future: optional kg conversion (see Future Considerations).

## Entities

### Users

Stores user account information and authentication data.

**Table:** `users`

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Unique user identifier |
| `email` | String (Unique) | User's email address (used for login) |
| `username` | String (Unique) | Display name for the user |
| `hashed_password` | String | Bcrypt-hashed password |
| `created_at` | DateTime | Account creation timestamp |
| `updated_at` | DateTime | Last profile update timestamp |
| `is_active` | Boolean | Whether the account is active (default: true) |

**Relationships:**
- One-to-many with `exercises` (users create exercises)
- One-to-many with `workout_sessions` (users log sessions)
- One-to-many with `workout_templates` (users create templates)

### Exercises

Represents a specific exercise that can be performed (e.g., "Bench Press", "Squat").

**Table:** `exercises`

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Unique exercise identifier |
| `user_id` | Integer (FK) | Owner of this exercise |
| `name` | String | Exercise name (e.g., "Bench Press") |
| `muscle_group` | String | Primary muscle group (e.g., "chest", "legs", "back") |
| `created_at` | DateTime | Exercise creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

**Relationships:**
- Many-to-one with `users` (each exercise belongs to a user)
- One-to-many with `workout_exercises` (exercises appear in sessions)
- One-to-many with `template_exercises` (exercises can be in templates)

**Notes:**
- Exercise names are user-specific (users can have their own "Bench Press")
- Muscle groups help with categorization and analytics

### Workout Sessions

Represents a single workout session on a specific date.

**Table:** `workout_sessions`

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Unique session identifier |
| `user_id` | Integer (FK) | Owner of this session |
| `date` | Date | Date of the workout (not datetime, just date) |
| `notes` | Text (Optional) | User's notes about the session |
| `created_at` | DateTime | Session creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

**Relationships:**
- Many-to-one with `users` (each session belongs to a user)
- One-to-many with `workout_exercises` (sessions contain exercises)

**Notes:**
- **Only one session per user per date.** A user can view and edit that day's workout, not create a second. Enforce via unique constraint on `(user_id, date)` or in application logic.
- Sessions are the container for all exercises performed in one workout.

### Workout Exercises

Junction table linking workout sessions to exercises. Represents "Exercise X was performed in Session Y".

**Table:** `workout_exercises`

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Unique identifier |
| `session_id` | Integer (FK) | The workout session |
| `exercise_id` | Integer (FK) | The exercise performed |
| `order` | Integer | Display order within the session |
| `notes` | Text (Optional) | Exercise-specific notes for this session |

**Relationships:**
- Many-to-one with `workout_sessions` (belongs to a session)
- Many-to-one with `exercises` (references an exercise)
- One-to-many with `sets` (contains multiple sets)

**Notes:**
- The `order` field allows users to record exercises in the sequence they performed them

### Sets

Represents a single set of an exercise within a workout session.

**Table:** `sets`

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Unique set identifier |
| `workout_exercise_id` | Integer (FK) | The workout exercise this set belongs to |
| `set_number` | Integer | Set number within the exercise (1, 2, 3, ...) |
| `reps` | Integer | Repetitions performed **in that set** (per set_number). See [Project-wide terminology](#project-wide-terminology) above. |
| `weight` | Decimal | Weight lifted **for that set** (per set_number), in lbs. See [Project-wide terminology](#project-wide-terminology) above. |
| `rest_seconds` | Integer (Optional) | Rest time after this set (if tracked) |
| `notes` | Text (Optional) | Set-specific notes |

**Relationships:**
- Many-to-one with `workout_exercises` (belongs to a workout exercise)

**Notes:**
- **weight** = weight per set (lbs). Stored as decimal for fractional weights (e.g., 135.5 lbs).
- **reps** = repetitions per set. `set_number` identifies which set (e.g., "Set 3 of Bench Press").
- This is the core data point for progress and volume calculations.

### Workout Templates

Pre-defined workout structures that users can quickly apply to create new sessions.

**Table:** `workout_templates`

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Unique template identifier |
| `user_id` | Integer (FK) | Owner of this template |
| `name` | String | Template name (e.g., "Push Day", "Leg Day") |
| `created_at` | DateTime | Template creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

**Relationships:**
- Many-to-one with `users` (each template belongs to a user)
- One-to-many with `template_exercises` (templates contain exercises)

### Template Exercises

Junction table linking templates to exercises with target sets/reps.

**Table:** `template_exercises`

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Unique identifier |
| `template_id` | Integer (FK) | The workout template |
| `exercise_id` | Integer (FK) | The exercise in the template |
| `target_sets` | Integer | Target number of sets |
| `target_reps` | Integer | Target number of reps per set |
| `order` | Integer | Display order within the template |

**Relationships:**
- Many-to-one with `workout_templates` (belongs to a template)
- Many-to-one with `exercises` (references an exercise)

**Notes:**
- Templates store "target" values, but actual sets are created when a session is logged
- Templates speed up workout logging by pre-populating exercises

## Entity Relationship Diagram (Conceptual)

```
Users
  ├── Exercises (1:N)
  ├── Workout Sessions (1:N)
  └── Workout Templates (1:N)

Workout Sessions
  └── Workout Exercises (1:N)
        └── Sets (1:N)

Workout Templates
  └── Template Exercises (1:N)
        └── Exercises (N:1)
```

## Key Relationships

1. **User → Exercises**: Users create and own exercises
2. **User → Sessions**: Users log workout sessions
3. **Session → Workout Exercises → Sets**: Sessions contain exercises, exercises contain sets
4. **User → Templates**: Users create reusable workout templates
5. **Template → Exercises**: Templates reference exercises with target values

## Calculated Fields (Not Stored)

These are computed from the data model but not stored as columns:

- **Volume**: Sum of (reps × weight) for all sets in a session/exercise
- **Total Volume**: Sum of volume across all exercises in a session

*Future: 1RM estimation (e.g. Epley formula) is optional and not required for MVP.*

## Indexes

Recommended indexes for performance:

- `users.email` (unique index for login lookups)
- `workout_sessions.user_id, date` (for filtering user sessions by date); use unique index on `(user_id, date)` to enforce one session per user per day
- `sets.workout_exercise_id` (for loading sets efficiently)
- `exercises.user_id` (for listing user's exercises)
- `workout_exercises.session_id` (for loading session exercises)

## Data Integrity Rules

1. **Cascade Deletes:**
   - Deleting a user should cascade delete their exercises, sessions, and templates
   - Deleting a session should cascade delete workout exercises and sets
   - Deleting a workout exercise should cascade delete its sets
   - Deleting a template should cascade delete template exercises

2. **Constraints:**
   - `reps` must be > 0
   - `weight` must be >= 0
   - `set_number` must be > 0
   - `date` cannot be in the future (or allow with warning)

3. **Uniqueness:**
   - User emails must be unique
   - User usernames must be unique
   - One workout session per user per calendar day: `(user_id, date)` must be unique on `workout_sessions`
   - Exercise names per user can be duplicates (user choice)

## Future Considerations

- **Units**: Optional kg conversion for weight (currently lbs only).
- **Plates/Equipment**: Track available equipment (barbell, dumbbells, etc.)
- **Body Metrics**: Track bodyweight, body fat percentage over time
- **Workout Types**: Categorize sessions (strength, cardio, mobility)
- **Exercise Variations**: Link related exercises (e.g., "Bench Press" and "Incline Bench Press")
- **Programs**: Multi-week training programs with progression schemes

