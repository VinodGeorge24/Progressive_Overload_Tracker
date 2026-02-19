# Product Requirements Document (PRD)

## Product Overview

The Progressive Overload Tracker is a web application that helps users track their strength training workouts and implement progressive overload principles systematically.

## Product scope / level

- **Single web app**: Log sessions (date, exercises, sets with reps and weight per set), view history, see per-exercise progress (volume/trends).
- **Workout tracker with visualization per exercise**; no plateau detection or recommendations in current scope. No RPE or advanced periodization.
- **1RM estimation** is optional (not required for MVP).

For project-wide terminology (what **weight** and **reps** mean per set), see [DATA_MODEL.md](DATA_MODEL.md).

## Problem Statement

Fitness enthusiasts need a reliable way to:
1. Track workout history (exercises, sets, reps, weights)
2. Visualize progress over time (per-exercise charts)
3. Maintain workout consistency

## User Stories

### Authentication & Profile
- As a user, I want to create an account so I can save my workout data
- As a user, I want to log in securely so my data is protected
- As a user, I want to view and edit my profile information

### Workout Logging
- As a user, I want to log a workout session with exercises, sets, reps, and weights
- As a user, I want to save workout templates for quick logging
- As a user, I want to view my workout history chronologically

### Progress Tracking
- As a user, I want to see charts showing my progress over time (per exercise, filterable by set number)
- As a user, I want to see volume and weight trends for each exercise

### Analytics
- As a user, I want to see volume trends (total weight lifted) per exercise
- As a user, I want to see frequency of exercise performance
- (Optional) As a user, I may want to see one-rep max estimates in the future

## Core Features

### Must Have (MVP)
1. User authentication (signup, login, logout)
2. Exercise CRUD operations
3. Workout session logging (one session per user per day)
4. Per-set tracking: set_number, weight (lbs per set), reps (repetitions per set)—see [DATA_MODEL.md](DATA_MODEL.md) for terminology
5. Per-exercise progress visualization: Python-generated line charts (Option A—one chart per metric, filter by set_number); backend serves chart image to frontend
6. Historical workout viewing (view and edit past sessions)

### Primary screens
- Login / signup
- Dashboard (or Home)
- Log workout (today's workout; one per day)
- History (past sessions; view/edit)
- Exercise progress (per-exercise visualization, filterable by set_number)
- Templates (if templates are in scope)

### Should Have
1. Workout templates (create workout or choose from presets)
2. Exercise search and filtering
3. Export workout data

### Nice to Have
1. Mobile-responsive design
2. Social features (sharing workouts)
3. Exercise library with instructions
4. Rest timer
5. Workout reminders

## Definition of Done

### Backend
- [ ] All API endpoints implemented and tested
- [ ] Database migrations working
- [ ] Authentication and authorization functional
- [ ] Analytics calculations verified for correctness
- [ ] Unit tests with >80% coverage
- [ ] API documentation (OpenAPI/Swagger)

### Frontend
- [ ] All user stories implemented
- [ ] Responsive design (mobile and desktop)
- [ ] Error handling and user feedback
- [ ] Loading states and optimistic updates
- [ ] Accessible UI components

### Integration
- [ ] Frontend successfully communicates with backend
- [ ] End-to-end user flows tested
- [ ] Performance acceptable (<2s page loads)
- [ ] Security best practices followed

### Documentation
- [ ] README files updated
- [ ] API contract documented
- [ ] Data model documented
- [ ] Deployment instructions provided
- [ ] Coding standard followed and double checked

## Success Metrics

- Users can successfully log a complete workout session
- Progress charts accurately reflect historical data (per exercise, filterable by set_number)
- Application loads and responds within acceptable timeframes

## Technical Constraints

- Must use Python for backend (senior project requirement)
- Must use a relational database
- Must implement proper authentication
- Must include analytics/calculations (research component)
- Must be deployable and demonstrable

## Tech Stack (Source of Truth for AI Agent)

This section is authoritative. Do not propose or generate code using a different stack unless explicitly instructed.

### Required (must use)
- Backend language: Python 3.x
- Backend framework: FastAPI
- API style: REST (JSON)
- Database: PostgreSQL
- ORM: SQLAlchemy
- Migrations: Alembic
- Authentication: JWT (access token; refresh token optional)
- Environment config: .env (use python-dotenv or equivalent)
- Version control: Git + GitHub

### Frontend (must use)
- Frontend: Vite + React + React Router (no Next.js)
- Use `src/pages/` + React Router for routing (not Next.js `app/` or `pages/` conventions)
- Styling: Tailwind CSS. Use shadcn/ui for some components (buttons, inputs, cards, etc.); custom components may use Tailwind directly.
- Charts/visualization: **Charts are generated in the backend using Python** (e.g. matplotlib, Plotly). Backend produces chart images (PNG/SVG) or URLs; frontend displays them. Per-exercise line charts: x = date; Option A—one chart per metric (weight, then reps), filter by set_number.

### Architecture rules (must follow)
- Backend owns business logic (progress metrics, chart generation).
- Frontend is a client only (no direct DB access).
- All user workout data is private and must be protected behind auth.
- No hardcoded secrets. Use environment variables.

### Analytics / Research logic (must implement)
- Per-exercise progress: compute and expose per-exercise progress metrics (by date and set_number: weight, reps, volume). No plateau or recommendation logic for now.

### Not in MVP (do not build unless explicitly requested)
- Plateau detection
- Progressive overload recommendations
- Mobile app
- Microservices
- ML model training
- Social features (sharing, follows)
- Payment/subscriptions
- Admin dashboards

