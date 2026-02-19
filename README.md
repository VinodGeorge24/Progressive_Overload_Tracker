# Progressive Overload Tracker

Before reading this, please reference "PRD.md" and read it thoroughly. That is our "reference" and truth. Then, reference this document.

## Overview

This is a workout tracking application designed to help users systematically increase their training volume and intensity over time. The app tracks exercises, sets, reps, and weights to enable progressive overload—the fundamental principle of strength training.

## Problem It Solves

Many fitness enthusiasts struggle to:
- Track their workout history consistently
- Visualize their progress over time (per exercise)
- Maintain consistency in their training routine

This application provides a workout tracker with per-set logging (weight and reps per set), one workout per day, and per-exercise progress visualization (Python-generated charts). See [PRD.md](PRD.md) for scope; plateau detection and recommendations are not in current scope.

## Features

- User authentication and profile management
- Exercise and workout session logging (one session per user per day)
- Per-set tracking: set_number, weight (lbs per set), reps (reps per set)—see [DATA_MODEL.md](DATA_MODEL.md)
- Historical workout data (view and edit past sessions)
- Per-exercise progress visualization (line charts, filterable by set number)
- Workout templates for quick logging (should-have)

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, Alembic
- **Frontend**: Vite + React + React Router, Tailwind CSS, shadcn/ui (for select components)
- **Database**: PostgreSQL (or SQLite for development)
- **Authentication**: JWT tokens

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js (for frontend)
- PostgreSQL (or SQLite for development)

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment variables
3. Set up the backend (see `backend/README.md`)
4. Set up the frontend (see `frontend/README.md`)

### Running Locally

**Backend:**
```bash
cd backend
pip install -e .
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

- `backend/` - Python FastAPI application
- `frontend/` - User interface application
- `plan/` - Coding plan (slice-by-slice implementation order) and plan docs
- `frontend_references/` - Design inspiration (screen mockups and code.html; not part of build)
- `docs/` - Documentation and research notes
- `logs/` - Project task logs and history
- `infra/` - Infrastructure and deployment configuration

## Documentation

- [Product Requirements Document](./PRD.md) - What the app must do
- [API Contract](./API_CONTRACT.md) - Backend endpoints and usage
- [Data Model](./DATA_MODEL.md) - Database structure and relationships
- [Coding Standards](./CODING_STANDARDS.md) - Code style and conventions
- [AI Usage Log](./AI_USAGE.md) - Record of AI assistance
- [Documentation (docs/)](./docs/README.md) - Research notes, project log, and doc index
- [Plan (plan/)](./plan/README.md) - Slice order and how to use the coding plan
- [Frontend design references](./frontend_references/README.md) - Screen-to-folder map and design tokens for implementers

## Contributing

This is a senior project. See the documentation in `docs/` for more details about the project scope and requirements.

## Additional Details:

1. If you have any structure questions or any specific questions, recheck this document and "PRD.md". If those do not answer your question specifically, PLEASE re-ask the user as a prompt before proceeding 
