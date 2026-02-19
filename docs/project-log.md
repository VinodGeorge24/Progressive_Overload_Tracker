# Project Log

Chronological log of project decisions and documentation updates. For weekly progress reports, see [weekly-reports/](weekly-reports/).

---

## 2026-02-18

NOTE: this was not all done in one day, but will start the codebases' logging from 2/18/26.

### Human summary

Scoped the project to a focused workout tracker: single web app with per-set logging (date, set_number, weight in lbs, reps) and per-exercise line charts. One workout per user per day; users can view and edit that day's workout. Removed plateau detection and recommendations from current scope. Weight is lbs only (kg conversion possible later). Documented primary screens (login, dashboard, log workout, history, exercise progress, templates), edge cases (404 for wrong owner, 409 for duplicate session date, 400/422 for validation), and visualization approach: charts generated in the backend with Python (Option A—one chart per metric, filter by set_number); frontend displays chart images. Project-wide terminology for **weight** (weight per set, lbs) and **reps** (repetitions per set) added to DATA_MODEL and referenced across PRD and API_CONTRACT.

### Agent summary

- **Scope**: Single web app. Workout tracker with per-exercise visualization. No plateau detection or recommendations in MVP.
- **Sessions**: One per user per calendar day. User can view/edit that day's workout; cannot create a second session for the same date.
- **Set fields**: date, set_number, **weight** (lbs per set), **reps** (repetitions per set). See DATA_MODEL.md "Project-wide terminology."
- **Units**: Weight stored and displayed in lbs only. Future: optional kg conversion.
- **Visualization**: Charts generated in backend with Python (e.g. matplotlib, Plotly). Option A: one chart per metric (weight, reps), filter by set_number; x = date. Frontend displays backend-served chart images (PNG/SVG or URL).
- **Primary screens**: Login/signup, Dashboard, Log workout, History, Exercise progress (filter by set_number), Templates.
- **Edge cases**: 404 when resource does not exist or does not belong to authenticated user. 409 when POST session for a date that already has a session for this user. 400 for invalid date/set_number/weight/reps. 422 for validation errors. All list/get endpoints scope to current user.
- **API analytics**: Progress endpoint returns series by set_number with points (date, weight, reps, volume). Plateaus and recommendations endpoints marked Future / not in MVP.
- **Docs updated**: PRD, DATA_MODEL, API_CONTRACT, research-notes, README, .cursorrules, ARCHITECTURE, PROJECT_GUIDE, docs/libraries-and-tools.
