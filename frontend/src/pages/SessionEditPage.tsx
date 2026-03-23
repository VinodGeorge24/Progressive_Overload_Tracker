/**
 * Edit a session by id (from History). Same form as LogPage but for an existing session.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import * as exercisesApi from "@/api/exercises";
import * as sessionsApi from "@/api/sessions";

type Exercise = exercisesApi.Exercise;
type SetIn = sessionsApi.SetIn;

interface LocalSet extends SetIn {
  localId: string;
}

interface LocalExercise {
  exercise_id: number;
  exercise_name: string;
  muscle_group?: string;
  sets: LocalSet[];
  notes: string;
}

const newSet = (setNumber: number): LocalSet => ({
  localId: crypto.randomUUID(),
  set_number: setNumber,
  reps: 0,
  weight: 0,
  notes: undefined,
});

export default function SessionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sessionId = id ? parseInt(id, 10) : NaN;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [session, setSession] = useState<sessionsApi.SessionOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [localExercises, setLocalExercises] = useState<LocalExercise[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id || isNaN(sessionId)) {
      setLoading(false);
      setError("Invalid session.");
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [exList, sess] = await Promise.all([
          exercisesApi.listExercises(),
          sessionsApi.getSession(sessionId),
        ]);
        setExercises(exList);
        setSession(sess);
        setDate(sess.date);
        setLocalExercises(
          sess.exercises.map((e) => {
            const ex = exList.find((x) => x.id === e.exercise_id);
            // Dedupe sets by id so we never show duplicate rows (backend/ORM can occasionally duplicate)
            const seenSetIds = new Set<number>();
            const uniqueSets = e.sets.filter((s) => {
              if (seenSetIds.has(s.id)) return false;
              seenSetIds.add(s.id);
              return true;
            });
            return {
              exercise_id: e.exercise_id,
              exercise_name: e.exercise_name,
              muscle_group: ex?.muscle_group,
              sets: uniqueSets
                .sort((a, b) => a.set_number - b.set_number)
                .map((s) => ({
                  localId: crypto.randomUUID(),
                  set_number: s.set_number,
                  reps: s.reps,
                  weight: s.weight,
                  rest_seconds: s.rest_seconds ?? undefined,
                  notes: s.notes ?? undefined,
                })),
              notes: e.notes ?? "",
            };
          })
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load session.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, sessionId]);

  const addExercise = async () => {
    if (exercises.length === 0) return;
    const first = exercises[0];
    let initialSets: LocalSet[] = [newSet(1)];
    try {
      const last = await sessionsApi.getLastSetsForExercise(first.id);
      if (last?.sets?.length) {
        initialSets = last.sets.map((s) => ({
          localId: crypto.randomUUID(),
          set_number: s.set_number,
          weight: s.weight,
          reps: s.reps,
          notes: undefined,
        }));
      }
    } catch {
      // keep default one empty set
    }
    setLocalExercises((prev) => [
      ...prev,
      {
        exercise_id: first.id,
        exercise_name: first.name,
        muscle_group: first.muscle_group,
        sets: initialSets,
        notes: "",
      },
    ]);
  };

  const removeExercise = (index: number) => {
    setLocalExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const changeExercise = async (index: number, exerciseId: number) => {
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    let sets: LocalSet[] = [{ ...newSet(1) }];
    try {
      const last = await sessionsApi.getLastSetsForExercise(ex.id);
      if (last?.sets?.length) {
        sets = last.sets.map((s) => ({
          localId: crypto.randomUUID(),
          set_number: s.set_number,
          weight: s.weight,
          reps: s.reps,
          notes: undefined,
        }));
      }
    } catch {
      // keep single empty set
    }
    setLocalExercises((prev) =>
      prev.map((e, i) =>
        i === index
          ? {
              ...e,
              exercise_id: ex.id,
              exercise_name: ex.name,
              muscle_group: ex.muscle_group,
              sets,
            }
          : e
      )
    );
  };

  const updateExerciseNotes = (exIndex: number, value: string) => {
    setLocalExercises((prev) =>
      prev.map((e, i) => (i === exIndex ? { ...e, notes: value } : e))
    );
  };

  const addSet = (exIndex: number) => {
    setLocalExercises((prev) =>
      prev.map((e, i) => {
        if (i !== exIndex) return e;
        return { ...e, sets: [...e.sets, newSet(e.sets.length + 1)] };
      })
    );
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    setLocalExercises((prev) =>
      prev.map((e, i) => {
        if (i !== exIndex) return e;
        const newSets = e.sets
          .filter((_, si) => si !== setIndex)
          .map((s, si) => ({ ...s, set_number: si + 1 }));
        return { ...e, sets: newSets };
      })
    );
  };

  const updateSet = (
    exIndex: number,
    setIndex: number,
    field: keyof SetIn,
    value: number | string | undefined
  ) => {
    setLocalExercises((prev) =>
      prev.map((e, i) => {
        if (i !== exIndex) return e;
        return {
          ...e,
          sets: e.sets.map((s, si) =>
            si === setIndex ? { ...s, [field]: value } : s
          ),
        };
      })
    );
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this workout? This cannot be undone.")) return;
    try {
      setDeleting(true);
      setError(null);
      await sessionsApi.deleteSession(sessionId);
      navigate("/history");
    } catch (err) {
      console.error(err);
      setError("Failed to delete workout.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    const payload = {
      date,
      exercises: localExercises.map((e) => ({
        exercise_id: e.exercise_id,
        sets: e.sets
          .filter((s) => s.reps > 0 && s.weight >= 0)
          .map(({ localId: _, ...s }) => s),
        notes: e.notes.trim() || null,
      })),
    };
    const hasValidSets = payload.exercises.some((e) => e.sets.length > 0);
    if (!hasValidSets) {
      setError("Add at least one exercise with at least one set (reps > 0, weight ≥ 0).");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await sessionsApi.updateSession(sessionId, payload);
      navigate("/history");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (status === 409) {
        setError(detail ?? "A workout already exists for that date.");
      } else {
        setError("Failed to save workout.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-slate-400">{loading ? "Loading..." : "Session not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Edit session</h1>
          <p className="text-xs sm:text-sm text-slate-400">{date}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" className="text-slate-400" asChild>
            <Link to="/dashboard">Home</Link>
          </Button>
          <Button variant="outline" className="border-slate-700" asChild>
            <Link to="/history">Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-800/80 text-red-300 hover:bg-red-950/50 hover:text-red-200"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete workout"}
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-6 max-w-4xl mx-auto w-full space-y-6">
        {error && (
          <div className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
          <input
            type="date"
            className="rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Add Exercise
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-slate-700 w-fit"
              onClick={addExercise}
              disabled={exercises.length === 0}
            >
              Add exercise
            </Button>
          </div>
          <div className="space-y-6">
          {localExercises.map((le, exIndex) => (
            <article
              key={`${le.exercise_id}-${exIndex}`}
              className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    <span className="text-sky-400 text-xl" aria-hidden>⌃</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <select
                      className="dark-surface-select w-full cursor-pointer border-none bg-transparent text-lg font-bold text-slate-100 focus:outline-none focus:ring-0"
                      value={le.exercise_id}
                      onChange={(e) => changeExercise(exIndex, Number(e.target.value))}
                    >
                      {exercises.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} {ex.muscle_group ? `(${ex.muscle_group})` : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
                      {le.muscle_group || "—"}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-red-400 shrink-0"
                  onClick={() => removeExercise(exIndex)}
                  aria-label="Remove exercise"
                >
                  ×
                </Button>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                      <th className="px-6 py-3 w-20">Set #</th>
                      <th className="px-6 py-3">Weight (lbs)</th>
                      <th className="px-6 py-3">Reps</th>
                      <th className="px-6 py-3">Notes</th>
                      <th className="px-6 py-3 w-10 text-right" aria-label="Remove set" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {le.sets.map((set, setIndex) => (
                      <tr key={set.localId} className="hover:bg-slate-800/50">
                        <td className="px-6 py-4 font-bold text-slate-400">{set.set_number}</td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-base font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="0"
                            value={set.weight || ""}
                            onChange={(e) =>
                              updateSet(exIndex, setIndex, "weight", e.target.value ? Number(e.target.value) : 0)
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min={0}
                            className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-base font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="0"
                            value={set.reps || ""}
                            onChange={(e) =>
                              updateSet(exIndex, setIndex, "reps", e.target.value ? Number(e.target.value) : 0)
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            className="min-w-[100px] max-w-[180px] rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="Set notes"
                            value={set.notes ?? ""}
                            onChange={(e) => updateSet(exIndex, setIndex, "notes", e.target.value || undefined)}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => removeSet(exIndex, setIndex)}
                            aria-label="Remove set"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-slate-800/10 flex flex-col gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-slate-700 text-slate-700 hover:border-sky-500 hover:text-slate-900"
                  onClick={() => addSet(exIndex)}
                >
                  Add Set
                </Button>
                <div>
                  <textarea
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 min-h-[60px]"
                    placeholder="Add exercise notes (e.g., 'Elbows tucked', 'Fast eccentric')"
                    value={le.notes}
                    onChange={(e) => updateExerciseNotes(exIndex, e.target.value)}
                  />
                </div>
              </div>
            </article>
          ))}
          </div>
        </div>
      </main>
      <footer className="sticky bottom-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur px-4 sm:px-8 py-4 flex items-center justify-end gap-3">
        <p className="text-xs text-slate-500 mr-auto">Click Save when you&apos;re done editing.</p>
        <Button variant="outline" className="border-slate-700" asChild>
          <Link to="/history">Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </footer>
    </div>
  );
}
