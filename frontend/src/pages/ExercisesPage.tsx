/**
 * Exercises list and manage page (Slice 2 frontend).
 *
 * Authenticated users can:
 * - See their exercises in a simple card list (name + muscle group)
 * - Create a new exercise
 * - Edit an existing exercise
 * - Delete an exercise
 *
 * Visual inspiration: exercises_library_-_lift_tracker/ (card-based layout).
 */

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as exercisesApi from "@/api/exercises";
import { Button } from "@/components/ui/button";

type Exercise = exercisesApi.Exercise;

type Mode = "idle" | "creating" | "editing";

interface FormState {
  id?: number;
  name: string;
  muscle_group: string;
}

const emptyForm: FormState = {
  name: "",
  muscle_group: "",
};

export default function ExercisesPage() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await exercisesApi.listExercises();
        setItems(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load exercises.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visibleItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return items.filter((exercise) => {
      const matchesSearch =
        !normalizedSearch ||
        exercise.name.toLowerCase().includes(normalizedSearch) ||
        exercise.muscle_group?.toLowerCase().includes(normalizedSearch);
      const normalizedGroup = exercise.muscle_group?.trim() || "Uncategorized";
      const matchesMuscleGroup =
        muscleGroupFilter === "all" || normalizedGroup === muscleGroupFilter;
      return matchesSearch && matchesMuscleGroup;
    });
  }, [items, muscleGroupFilter, searchTerm]);

  const groupedByMuscle = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    for (const exercise of visibleItems) {
      const key = exercise.muscle_group?.trim() || "Uncategorized";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(exercise);
    }
    return groups;
  }, [visibleItems]);

  const sortedGroupKeys = useMemo(
    () => Object.keys(groupedByMuscle).sort((a, b) => a.localeCompare(b)),
    [groupedByMuscle]
  );
  const muscleGroupOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((exercise) => exercise.muscle_group?.trim() || "Uncategorized"))
      ).sort((a, b) => a.localeCompare(b)),
    [items]
  );

  const startCreate = () => {
    setForm(emptyForm);
    setMode("creating");
    setError(null);
  };

  const startEdit = (exercise: Exercise) => {
    setForm({
      id: exercise.id,
      name: exercise.name,
      muscle_group: exercise.muscle_group ?? "",
    });
    setMode("editing");
    setError(null);
  };

  const cancelForm = () => {
    setMode("idle");
    setForm(emptyForm);
    setError(null);
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      if (mode === "creating") {
        const created = await exercisesApi.createExercise({
          name: form.name.trim(),
          muscle_group: form.muscle_group.trim() || null,
        });
        setItems((prev) => [...prev, created]);
      } else if (mode === "editing" && form.id != null) {
        const updated = await exercisesApi.updateExercise(form.id, {
          name: form.name.trim(),
          muscle_group: form.muscle_group.trim() || null,
        });
        setItems((prev) =>
          prev.map((exercise) => (exercise.id === updated.id ? updated : exercise))
        );
      }
      cancelForm();
    } catch (err) {
      console.error(err);
      setError("Failed to save exercise.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (exercise: Exercise) => {
    if (!window.confirm(`Delete "${exercise.name}"? This cannot be undone.`)) return;
    try {
      await exercisesApi.deleteExercise(exercise.id);
      setItems((prev) => prev.filter((a_exercise) => a_exercise.id !== exercise.id));
      if (mode === "editing" && form.id === exercise.id) {
        cancelForm();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete exercise.");
    }
  };

  const hasExercises = items.length > 0;
  const hasVisibleExercises = visibleItems.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 px-4 py-4 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Exercises</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Your personal library of movements used for logging workouts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-400" asChild>
              <Link to="/dashboard">Home</Link>
            </Button>
            <Button size="sm" onClick={startCreate}>
              Add exercise
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-8 flex flex-col gap-6">
        {error && (
          <div className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {hasExercises && (
          <section className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:grid-cols-[minmax(0,1fr)_220px]">
            <label className="flex flex-col gap-1.5 text-xs text-slate-400">
              Search exercises
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Bench, squat, hamstrings..."
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-slate-400">
              Muscle group
              <select
                value={muscleGroupFilter}
                onChange={(event) => setMuscleGroupFilter(event.target.value)}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
              >
                <option value="all">All muscle groups</option>
                {muscleGroupOptions.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </label>
          </section>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Loading exercises...
          </div>
        ) : !hasExercises ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center text-slate-400">
            <p className="text-sm sm:text-base">You haven&apos;t added any exercises yet.</p>
            <Button size="sm" onClick={startCreate}>
              Create your first exercise
            </Button>
          </div>
        ) : !hasVisibleExercises ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/30 px-6 py-10 text-center text-slate-400">
            <p className="text-sm sm:text-base">No exercises match the current filters.</p>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700"
              onClick={() => {
                setSearchTerm("");
                setMuscleGroupFilter("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <section className="flex-1 space-y-4">
            <p className="text-xs text-slate-500">
              Showing {visibleItems.length} of {items.length} exercise(s)
            </p>
            {sortedGroupKeys.map((group) => (
              <div key={group} className="space-y-2">
                <h2 className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {group}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedByMuscle[group].map((exercise) => (
                    <article
                      key={exercise.id}
                      className="group rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 flex items-center justify-between shadow-sm hover:border-sky-500/70 hover:bg-slate-900/80 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <h3 className="font-medium text-sm sm:text-base">{exercise.name}</h3>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          {exercise.muscle_group || "Uncategorized"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-slate-700 text-slate-100 hover:border-sky-500/70 hover:bg-sky-500/10 hover:text-sky-100"
                          onClick={() => startEdit(exercise)}
                          aria-label={`Edit ${exercise.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-red-800 text-red-300 hover:bg-red-900/40"
                          onClick={() => handleDelete(exercise)}
                          aria-label={`Delete ${exercise.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {(mode === "creating" || mode === "editing") && (
          <section className="mt-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4 max-w-xl">
            <h2 className="text-sm sm:text-base font-semibold mb-3">
              {mode === "creating" ? "Add exercise" : "Edit exercise"}
            </h2>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300" htmlFor="exercise-name">
                  Name
                </label>
                <input
                  id="exercise-name"
                  type="text"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                  placeholder="e.g., Barbell Bench Press"
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300" htmlFor="exercise-muscle">
                  Muscle group (optional)
                </label>
                <input
                  id="exercise-muscle"
                  type="text"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                  placeholder="e.g., Chest, Back, Legs"
                  value={form.muscle_group}
                  onChange={(event) => handleChange("muscle_group", event.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-700"
                  onClick={cancelForm}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : mode === "creating" ? "Create" : "Save changes"}
                </Button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
