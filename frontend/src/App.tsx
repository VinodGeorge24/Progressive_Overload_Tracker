/**
 * Root app component with routing (plan/coding_plan.md Slice 1).
 * Auth: /login, /signup; protected /dashboard; / shows welcome or redirect.
 */
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardPage from "@/pages/DashboardPage";
import ExercisesPage from "@/pages/ExercisesPage";
import HistoryPage from "@/pages/HistoryPage";
import LogPage from "@/pages/LogPage";
import LoginPage from "@/pages/LoginPage";
import ProgressPage from "@/pages/ProgressPage";
import SessionEditPage from "@/pages/SessionEditPage";
import SignupPage from "@/pages/SignupPage";
import TemplatesPage from "@/pages/TemplatesPage";

/** Placeholder home: welcome + links. If authenticated, redirect to dashboard. */
function WelcomePage() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Progressive Overload Tracker</h1>
      <p className="text-muted-foreground">Welcome</p>
      <div className="flex gap-3">
        <Button asChild>
          <Link to="/login">Log in</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/signup">Sign up</Link>
        </Button>
      </div>
    </div>
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
