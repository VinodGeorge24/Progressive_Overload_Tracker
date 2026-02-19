# Backend

The core of the senior project - a Python FastAPI application that handles all business logic, data persistence, and API endpoints.

## Tech Stack

- **Framework**: FastAPI
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Pydantic
- **Database**: PostgreSQL (or SQLite for development)

## Setup

### Prerequisites

- Python 3.9 or higher
- PostgreSQL (or SQLite for development)
- pip or poetry for dependency management

### Installation

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -e .
   ```
   Or if using the pyproject.toml directly:
   ```bash
   pip install fastapi uvicorn sqlalchemy alembic pydantic python-jose[cryptography] passlib[bcrypt] python-multipart
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env` in the project root and configure:
   - `DATABASE_URL`: Your database connection string
   - `SECRET_KEY`: A secret key for JWT token signing
   - Other configuration as needed

4. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

5. **Start the development server:**
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── api/                 # API router grouping and versioning
│   │   ├── deps.py          # Shared dependencies (get_current_user when auth exists)
│   │   └── v1/
│   │       ├── router.py    # Aggregates v1 subrouters
│   │       └── endpoints/   # THE router home: auth, exercises, sessions, etc.
│   ├── core/                # Core utilities (config, security, logging)
│   ├── db/                  # Database session and base models
│   ├── models/              # SQLAlchemy database models
│   ├── schemas/             # Pydantic schemas for validation
│   ├── services/            # Business logic layer
│   └── tests/               # Unit and integration tests
├── alembic/                 # Database migration files
├── alembic.ini              # Alembic configuration
└── pyproject.toml           # Python dependencies and project config
```

## Development Workflow

1. **Create a new feature:**
   - Add database models in `app/models/`
   - Create Pydantic schemas in `app/schemas/`
   - Implement business logic in `app/services/`
   - Add route handlers in `app/api/v1/endpoints/` (the one true router home)
   - Include routers in `app/api/v1/router.py` and register in `app/main.py`

2. **Database changes:**
   - Modify models in `app/models/`
   - Generate migration: `alembic revision --autogenerate -m "description"`
   - Review the generated migration file
   - Apply migration: `alembic upgrade head`

3. **Testing:**
   ```bash
   pytest
   ```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Key Files

- `app/main.py`: Application initialization and route registration
- `app/core/config.py`: Configuration management
- `app/core/security.py`: Authentication and password hashing
- `app/db/session.py`: Database session management
- `app/models/`: Database table definitions
- `app/services/`: Business logic (especially analytics)

## Dependencies

See `pyproject.toml` for the complete list of dependencies.

## Environment Variables

See `.env.example` in the project root for required environment variables.

