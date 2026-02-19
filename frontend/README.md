# Frontend

User interface for the Progressive Overload Tracker. This is a modern web application that displays data and collects user input.

## Tech Stack

**Vite + React + React Router** (chosen stack; no Next.js).

**Tailwind CSS** for styling. **shadcn/ui** for some UI components (buttons, inputs, cards, dialogs, etc.); add components via `npx shadcn@latest add <component>`. Custom components may use Tailwind directly.

Use `src/pages/` + React Router for routing. Do not use Next.js `app/` or `pages/` conventions.

## Design references (Stitch from Google + frontend_references)

UI design direction is inspired by **Stitch (Google)**. For consistency and ideas when building pages and components:

- **Reference folder:** `frontend_references/` at the **project root** (one level above `frontend/`). Static HTML mockups that reflect the intended look and feel:
  - `code_log_in.html` — Login: card layout, primary color, dark mode, Inter font.
  - `code_create_account.html` — Signup: same design language.
  - `code_todays_log.html` — Today’s workout log: nav, logging UI.
  - `code_analytics.html` — Analytics: sidebar, chart area, exercise selector.
- When implementing a page, open the corresponding reference file for layout, spacing, colors (e.g. primary `#137fec`, dark background `#101922`), and typography. Implement in React with Tailwind and shadcn/ui; do not copy HTML literally—use it as a visual and structural reference.
- The coding plan (`plan/coding_plan.md`) also points to these references for each frontend slice.

## Setup

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- Backend API running (see `backend/README.md`)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Configure environment:**
   Create a `.env` file (or `.env.local`) with:
   ```
   VITE_API_URL=http://localhost:8000
   # or REACT_APP_API_URL=... depending on framework
   ```

3. **Start development server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

The frontend will be available at `http://localhost:3000` (or the configured port)

## Project Structure

```
frontend/
├── src/
│   ├── pages/                # Application pages/screens
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── WorkoutLogPage.tsx
│   │   ├── HistoryPage.tsx
│   │   └── AnalyticsPage.tsx
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # shadcn/ui components (Button, Card, Input, etc.)
│   │   ├── WorkoutCard.tsx
│   │   ├── ExerciseForm.tsx
│   │   └── ProgressChart.tsx
│   ├── lib/                  # Utilities (e.g. utils.ts for cn())
│   ├── api/                  # Frontend API helpers
│   │   ├── auth.ts
│   │   ├── exercises.ts
│   │   ├── sessions.ts
│   │   └── analytics.ts
│   ├── hooks/                # Custom React hooks (if using React)
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript type definitions
│   └── App.tsx or main.tsx   # Application entry point
├── public/                   # Static assets
└── package.json              # Dependencies and scripts
```

## Development Workflow

1. **Create a new page:**
   - Add component in `src/pages/`
   - Add route in routing configuration
   - Create API helper functions in `src/api/` if needed

2. **Create a reusable component:**
   - Add component in `src/components/`
   - Export from components index if using barrel exports

3. **API integration:**
   - All API calls should go through `src/api/` helpers
   - Use consistent error handling
   - Store authentication tokens securely

## Key Principles

1. **Separation of Concerns**: UI components should not contain business logic
2. **API Abstraction**: All backend calls go through `api/` helpers
3. **Type Safety**: Use TypeScript for type checking (if using TypeScript)
4. **Error Handling**: Provide user-friendly error messages
5. **Loading States**: Show loading indicators during API calls
6. **Responsive Design**: Ensure mobile and desktop compatibility

## API Integration

The frontend communicates with the backend API defined in `API_CONTRACT.md`. 

Example API helper:
```typescript
// src/api/exercises.ts
import { API_URL } from '../config';

export async function getExercises(token: string) {
  const response = await fetch(`${API_URL}/api/v1/exercises`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch exercises');
  }
  
  return response.json();
}
```

## Authentication

Store JWT tokens securely (e.g., in memory, httpOnly cookies, or secure storage). Include the token in API request headers as specified in `API_CONTRACT.md`.

## Environment Variables

- `VITE_API_URL` or `REACT_APP_API_URL`: Backend API base URL
- Other framework-specific variables as needed

## Building for Production

```bash
npm run build
```

The built files will be in `dist/` or `build/` depending on the framework.

