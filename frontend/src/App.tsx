/**
 * Root app component with routing (plan/coding_plan.md Slice 1).
 * Auth: /login, /signup; protected /dashboard; / shows welcome or redirect.
 */
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { AuthShell, AuthLoadingScreen } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardPage from "@/pages/DashboardPage";
import ExercisesPage from "@/pages/ExercisesPage";
import HistoryPage from "@/pages/HistoryPage";
import LogPage from "@/pages/LogPage";
import LoginPage from "@/pages/LoginPage";
import ProgressPage from "@/pages/ProgressPage";
import ProfilePage from "@/pages/ProfilePage";
import SessionEditPage from "@/pages/SessionEditPage";
import SignupPage from "@/pages/SignupPage";
import TemplatesPage from "@/pages/TemplatesPage";

/** Placeholder home: welcome + links. If authenticated, redirect to dashboard. */
function WelcomePage() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <AuthLoadingScreen />;
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return (
    <AuthShell
      panelBadge="Start here"
      title="A smoother first screen for the same training app."
      description="Log in to jump back into today's session, or create an account and start building your workout history."
      footer={
        <p className="text-center">
          Same tracker, same visual system, same path into your workouts.
        </p>
      }
    >
      <div className="space-y-4">
        <Button
          asChild
          className="h-12 w-full rounded-2xl bg-sky-500 text-base font-semibold text-white shadow-[0_22px_50px_rgba(14,165,233,0.28)] hover:bg-sky-400"
        >
          <Link to="/login">
            Log in
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button
          variant="secondary"
          asChild
          className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] text-base font-semibold text-slate-100 hover:bg-white/10"
        >
          <Link to="/signup">Create account</Link>
        </Button>
        <p className="text-center text-sm leading-6 text-slate-400">
          Pick up your recent sessions, templates, and progress insights from a
          cleaner entry point.
        </p>
      </div>
    </AuthShell>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises"
        element={
          <ProtectedRoute>
            <ExercisesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/log"
        element={
          <ProtectedRoute>
            <LogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history/:id"
        element={
          <ProtectedRoute>
            <SessionEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress/:exerciseId"
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <TemplatesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
