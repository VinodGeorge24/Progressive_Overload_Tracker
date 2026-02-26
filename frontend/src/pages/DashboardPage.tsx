/**
 * Dashboard placeholder after login. Slice 1 checkpoint.
 * Design inspiration: frontend_references/main_dashboard_-_lift_tracker/
 */
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Hello, {user?.username ?? user?.email}!
      </p>
      <p className="text-sm text-muted-foreground">
        You’re logged in. Exercises and workout logging coming in later slices.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button variant="secondary" onClick={() => logout()}>
          Log out
        </Button>
      </div>
    </div>
  );
}
