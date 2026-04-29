/**
 * Workout history: list sessions with link to view/edit.
 * Design inspiration: frontend_references/workout_history_-_lift_tracker/
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as exportApi from "@/api/export";
import * as sessionsApi from "@/api/sessions";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const [data, setData] = useState<sessionsApi.SessionListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await sessionsApi.listSessions({ limit: 100, offset: 0 });
        setData(response);
      } catch (err) {
        console.error(err);
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredSessions = useMemo(() => {
    const sessions = data?.sessions ?? [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesSearch =
        !normalizedSearch ||
        session.exercises.some((exercise) =>
          exercise.exercise_name.toLowerCase().includes(normalizedSearch)
        ) ||
        session.notes?.toLowerCase().includes(normalizedSearch);
      const matchesStartDate = !startDate || session.date >= startDate;
      const matchesEndDate = !endDate || session.date <= endDate;

      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [data, endDate, searchTerm, startDate]);

  const handleDelete = async (session: sessionsApi.SessionOut) => {
    if (!window.confirm(`Delete the workout from ${session.date}? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(session.id);
      setError(null);
      setNotice(null);
      await sessionsApi.deleteSession(session.id);
      setData((prev) =>
        prev
          ? {
              sessions: prev.sessions.filter((a_session) => a_session.id !== session.id),
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

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);
      const filename = await exportApi.downloadExportFile("json");
      setNotice(`Downloaded ${filename}.`);
    } catch (err) {
      console.error(err);
      setError("Failed to export your data.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 px-4 py-4 sm:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">History</h1>
            <p className="text-xs sm:text-sm text-slate-400">Past workout sessions</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-400" asChild>
              <Link to="/dashboard">Home</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700"
              onClick={handleExport}
              disabled={exporting || !data?.sessions.length}
            >
              {exporting ? "Exporting..." : "Export data"}
            </Button>
            <Button asChild>
              <Link to="/log">Log workout</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 sm:px-8">
        {error && (
          <div className="mb-4 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {notice}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : !data || data.sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-slate-400">
            <p className="text-sm">No workouts yet.</p>
            <Button asChild>
              <Link to="/log">Log your first workout</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <section className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-xs text-slate-400">
                Search exercise
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Bench, squat, row..."
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs text-slate-400">
                From date
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs text-slate-400">
                To date
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                />
              </label>
            </section>

            <p className="text-xs text-slate-500">
              Showing {filteredSessions.length} of {data.total} session(s)
            </p>

            {filteredSessions.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-8 text-center text-sm text-slate-400">
                No workouts match the current filters.
              </div>
            ) : (
              <ul className="divide-y divide-slate-800">
                {filteredSessions.map((session) => (
                  <li
                    key={session.id}
                    className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-100">{session.date}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {session.exercises.map((exercise) => exercise.exercise_name).join(", ") ||
                          "No exercises"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:shrink-0">
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
                        {deletingId === session.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
