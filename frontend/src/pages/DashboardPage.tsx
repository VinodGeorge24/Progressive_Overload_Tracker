/**
 * Dashboard: greeting, Log Today's Workout CTA, recent sessions.
 * Design inspiration: frontend_references/main_dashboard_-_lift_tracker/
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import * as sessionsApi from "@/api/sessions";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [recent, setRecent] = useState<sessionsApi.SessionOut[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await sessionsApi.listSessions({ limit: 5, offset: 0 });
        setRecent(resp.sessions);
      } catch {
        setRecent([]);
      } finally {
        setLoadingRecent(false);
      }
    };
    load();
  }, []);

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
          <Button
            variant="outline"
            className="border-slate-700 text-slate-200"
            asChild
          >
            <Link to="/history">History</Link>
          </Button>
          <Button variant="secondary" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:px-8 max-w-2xl mx-auto w-full space-y-6">
        <section className="flex flex-col items-center gap-4 py-6">
          <Button asChild className="bg-sky-600 hover:bg-sky-700">
            <Link to="/log">Log Today&apos;s Workout</Link>
          </Button>
          <p className="text-sm text-slate-400 text-center">
            Add exercises from your{" "}
            <Link
              to="/exercises"
              className="underline decoration-sky-500/70 text-sky-300 hover:text-sky-200"
            >
              exercise library
            </Link>
            , then log sets and weight.
          </p>
        </section>

        {loadingRecent ? (
          <p className="text-sm text-slate-500">Loading recent sessions...</p>
        ) : recent.length > 0 ? (
          <section>
            <h2 className="text-sm font-medium text-slate-400 mb-2">Recent sessions</h2>
            <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800 overflow-hidden">
              {recent.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/history/${s.id}`}
                    className="block px-4 py-3 hover:bg-slate-800/50 text-slate-200"
                  >
                    <span className="font-medium">{s.date}</span>
                    <span className="text-slate-500 text-sm ml-2">
                      {s.exercises.map((e) => e.exercise_name).join(", ") || "No exercises"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="mt-2 text-sky-400" asChild>
              <Link to="/history">View all history</Link>
            </Button>
          </section>
        ) : null}
      </main>
    </div>
  );
}
