# Frontend references (design inspiration)

This folder contains **screen-level design references** for the Progressive Overload Tracker. Each subfolder is named after a screen and contains:

- **code.html** — Static HTML + Tailwind mockup for that screen (layout, components, copy).
- *(Optional)* A screen image for quick visual reference.

**Intent:** These are **inspiration references**, not copy-paste targets. Use them for layout ideas, design language, and UX patterns. Implementation should be in React with Tailwind and shadcn/ui; interpret freely and improve where it makes sense.

---

## Folder map (screen → reference)

| Folder | Screen | Use when building |
|--------|--------|--------------------|
| `login_page_-_lift_tracker/` | Login | Slice 1 — Auth (login page) |
| `signup_page_-_lift_tracker/` | Sign up / Create account | Slice 1 — Auth (signup page) |
| `main_dashboard_-_lift_tracker/` | Dashboard / Home | After Slice 1 — Dashboard placeholder, then main home |
| `today's_log_-_lift_tracker/` | Today's workout log | Slice 3 — Log session (create/edit today) |
| `workout_history_-_lift_tracker/` | Workout history list | Slice 3 — History list, view/edit session |
| `progress_analytics_-_lift_tracker/` | Progress / Analytics | Slice 4 — Per-exercise progress, charts |
| `workout_templates_-_lift_tracker/` | Templates list & cards | Slice 5 — Templates list, create/edit, “use template” |
| `exercises_library_-_lift_tracker/` | Exercises library | Slice 2 — Exercises list, create/edit exercise |
| `app_settings_-_lift_tracker/` | App settings | Slice 6 — Settings (theme, units, profile, export, danger zone) |
| `help_&_faq_-_lift_tracker/` | Help & FAQ | Slice 6 or later — Help center, FAQ, support CTA |

---

## Design system (from references)

- **Primary:** `#137fec` (most refs). Progress Analytics uses `#7f13ec` (purple) — treat as alternate; app should standardize on one primary (recommend `#137fec`).
- **Background (dark):** `#101922` (`background-dark`). Light: `#f6f7f8` / `#f5f7f8`.
- **Font:** Inter (Google Fonts), `font-display` in Tailwind.
- **Icons:** Material Symbols Outlined.
- **Dark mode:** `class`-based (`html class="dark"`); support light and dark.
- **Layout:** Sidebar nav (fixed, ~w-64) for app screens; centered card for auth. Sticky headers and fixed footers where needed (e.g. Today’s Log save bar).

We may and probably will use shadcn and other libraries as well, so we are not limited to these references.
---

## Per-screen analysis (for the agent)

### 1. `login_page_-_lift_tracker/`

- **Purpose:** Login — email, password, “Forgot password?”, “Keep me logged in,” primary CTA “Log In to Dashboard.”
- **Layout:** Top bar (logo “LIFT TRACKER”, Features/Support, Sign up). Main: centered card with icon, “Welcome back,” form, optional “or continue with” (Google/Apple) and “Create an account” link.
- **Notes:** Card glow, input icons (mail, lock), password visibility toggle. Use as inspiration for layout and hierarchy; OAuth is optional/future.

### 2. `signup_page_-_lift_tracker/`

- **Purpose:** Create account — username, email, password, confirm password, terms checkbox.
- **Layout:** Compact header (logo, “Already have an account? Log in”). Main: heading “Create your account,” card with form, password checklist (8+ chars, number, special char), footer “Already have an account?” (mobile).
- **Notes:** Decorative blur orbs in background. Password strength/checklist is a good UX pattern to consider.

### 3. `main_dashboard_-_lift_tracker/`

- **Purpose:** Post-login home — greeting, quick stats, CTA to log workout, progress chart placeholder, recent sessions table.
- **Layout:** Sidebar (Dashboard, Exercises, History, Analytics, Settings, user block + logout). Main: “Hello, [Name]”, “Log Today’s Workout” button, 3-column stats (Total Workouts, Exercises Logged, Weekly Sessions), “Progress Overload Trend” chart area, “Recent Sessions” table (Date, Routine, Duration, Volume, Action).
- **Notes:** Stats can be derived from API; chart is backend-generated (Slice 4). Table links to view/edit session.

### 4. `today's_log_-_lift_tracker/`

- **Purpose:** Log today’s workout — add exercises, per-exercise sets (set #, weight, reps), notes, save/cancel.
- **Layout:** Same sidebar (Log active; Log, History, Templates, Statistics). Sticky header: “Today’s Log”, date, “Start from Template.” Main: “Add Exercise” (search/select), then exercise cards. Each card: exercise name + muscle group, table (Set #, Weight (lbs), Reps, Action), “Add Set,” exercise notes textarea. Bottom: “Workout Notes” textarea. Fixed footer: Cancel, “Save Workout.”
- **Notes:** One session per day (409 if duplicate); “Start from Template” from Slice 5. Match set_number, weight, reps to API/DATA_MODEL.

### 5. `workout_history_-_lift_tracker/`

- **Purpose:** List past sessions with search, date filter, export; view/edit/delete.
- **Layout:** Sidebar (History active). Header: title, “Export,” “Log Workout.” Filters: search (exercise/routine), date range (Last 30 Days, etc.), filter button. Table: Date & Name, Main Exercises (tags), Duration, Total Volume, Actions (view, edit, delete). Pagination. Footer stats: Total Monthly Volume, Workouts (month), Top Performance (e.g. PR).
- **Notes:** Duration can be computed or optional. “Export” → Slice 7. View/Edit → same session form as Today’s Log but for that session’s date.

### 6. `progress_analytics_-_lift_tracker/`

- **Purpose:** Per-exercise progress — pick exercise, metric (Weight/Reps/Volume/1RM Est.), set filter (All / Top set), chart + session history table.
- **Layout:** Sidebar (Analytics active). Header: “Progress Analytics,” date range, “Export PDF.” Controls: Exercise select, Metric Type toggles, Set Filter. Stats: Personal Best, Monthly Volume. Main chart (line/area), legend. “Session History” table (Date, Weight, Sets×Reps, Volume, RPE, Notes).
- **Notes:** Charts generated in backend (Slice 4); frontend displays image or URL. 1RM and RPE are optional (not in MVP). Use reference for layout and filter pattern; align metrics with API (weight, reps, volume, set_number).

### 7. `workout_templates_-_lift_tracker/`

- **Purpose:** List templates, create new, use template, edit.
- **Layout:** Sidebar (Templates active). Header: “Workout Templates,” “Create Template.” Search + Category/Sort. Grid of template cards: image, name, category badge, exercise count, “Last performance” line, “Use Template” + edit icon. Last card: “Create New Template” dashed card.
- **Notes:** “Use Template” pre-fills today’s log (Slice 5). Our data model has template name + template_exercises (target_sets, target_reps); no image required—card layout is the inspiration.

### 8. `exercises_library_-_lift_tracker/`

- **Purpose:** User’s exercise list — search, filter by muscle group, sort; create/edit exercise.
- **Layout:** Sidebar (Exercises active), “New Workout” CTA, user block. Header: “Exercises Library,” “Create Exercise.” Filters: search, “All Muscle Groups,” “Sort: Recent.” Table: Exercise Name (with icon), Muscle Group (colored tag), Created Date, Actions (edit). Pagination.
- **Notes:** Matches Slice 2 — exercises CRUD; muscle_group as in DATA_MODEL. Delete can be in row menu or separate flow.

### 9. `app_settings_-_lift_tracker/`

- **Purpose:** App and account settings — theme, units, date format, profile link, change password, export data, danger zone (delete account).
- **Layout:** Sidebar (Settings active), Profile in nav. Main: “Settings” heading. Sections: General (Dark Mode toggle, Weight Units, Date Format); Account & Security (Personal Information link, Security Credentials / Change Password, Data Management / Export Data); Danger Zone (Delete Account). Footer line.
- **Notes:** Profile can be same page or `/profile`; Change Password can be modal or separate page. Export and delete account are Slice 6/7.

### 10. `help_&_faq_-_lift_tracker/`

- **Purpose:** Help center — search, topic chips, FAQ sections (Logging, Templates, Charts, Account), expandable items, CTA (Submit ticket, Live chat).
- **Layout:** Sidebar (Help & FAQ active), “Need Assistance?” card + Contact Support. Main: “Help Center,” search, filter chips (All Topics, Logging, Templates, Charts, Account). Sections with accordion-style FAQ; bottom “Still have questions?” CTA.
- **Notes:** Content can be static or later driven by CMS. RPE/1RM mentioned in one FAQ—align with MVP (optional).

---

## How to use these references

1. **Before implementing a page:** Open the matching folder’s `code.html` (and image if present) to see layout, sections, and copy.
2. **Implement in React:** Use Tailwind and shadcn/ui; keep primary `#137fec`, background-dark `#101922`, Inter, and sidebar pattern consistent.
3. **Do not copy-paste HTML:** Translate structure and intent into components and routes. Omit or simplify features not in scope (e.g. OAuth, RPE, 1RM) until they’re in the plan.
4. **Improve where needed:** Empty states, loading, errors, and a11y should go beyond the static refs.
