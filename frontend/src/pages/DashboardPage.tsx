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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="px-4 sm:px-8 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Hello, {user?.username ?? user?.email}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-200"
            asChild
          >
            <Link to="/exercises">Exercises</Link>
          </Button>
          <Button variant="secondary" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-slate-400 text-center max-w-md">
          Core workout logging and analytics will live here. For now, you can
          start by curating your personal{" "}
          <Link
            to="/exercises"
            className="underline decoration-sky-500/70 text-sky-300 hover:text-sky-200"
          >
            exercise library
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
