/**
 * Wraps children and redirects to /login if not authenticated.
 */
import { Navigate, useLocation } from "react-router-dom";

import { AuthLoadingScreen } from "@/components/auth/AuthShell";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
