/**
 * Workout history: list sessions with link to view/edit.
 * Design inspiration: frontend_references/workout_history_-_lift_tracker/
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import * as sessionsApi from "@/api/sessions";

export default function HistoryPage() {
  const [data, setData] = useState<sessionsApi.SessionListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await sessionsApi.listSessions({ limit: 50, offset: 0 });
        setData(resp);
      } catch (err) {
        console.error(err);
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (session: sessionsApi.SessionOut) => {
    if (!window.confirm(`Delete the workout from ${session.date}? This cannot be undone.`)) return;
    try {
      setDeletingId(session.id);
      setError(null);
      await sessionsApi.deleteSession(session.id);
      setData((prev) =>
        prev
          ? {
              sessions: prev.sessions.filter((s) => s.id !== session.id),
              total: prev.total - 1,
            }
          : null
      );
    } catch (err) {
      console.error(err);
      setError("Failed to delete workout.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">History</h1>
          <p className="text-xs sm:text-sm text-slate-400">Past workout sessions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-slate-400" asChild>
            <Link to="/dashboard">Home</Link>
          </Button>
          <Button asChild>
            <Link to="/log">Log workout</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-6 max-w-4xl mx-auto w-full">
        {error && (
          <div className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : !data || data.sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center text-slate-400">
            <p className="text-sm">No workouts yet.</p>
            <Button asChild>
              <Link to="/log">Log your first workout</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-2">Total: {data.total} session(s)</p>
            <ul className="divide-y divide-slate-800">
              {data.sessions.map((session) => (
                <li key={session.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-100">{session.date}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {session.exercises.map((e) => e.exercise_name).join(", ") || "No exercises"}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="border-slate-700" asChild>
                      <Link to={`/history/${session.id}`}>View / Edit</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-800/80 text-red-300 hover:bg-red-950/50 hover:text-red-200"
                      onClick={() => handleDelete(session)}
                      disabled={deletingId === session.id}
                      aria-label={`Delete workout from ${session.date}`}
                    >
                      {deletingId === session.id ? "…" : "Delete"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
