/**
 * Workout templates page: create, edit, delete, and use reusable workout templates.
 * Design inspiration: frontend_references/workout_templates_-_lift_tracker/
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import * as exercisesApi from "@/api/exercises";
import * as templatesApi from "@/api/templates";

type Exercise = exercisesApi.Exercise;
type WorkoutTemplate = templatesApi.WorkoutTemplate;

type Mode = "idle" | "creating" | "editing";

interface LocalTemplateExercise {
  localId: string;
  exercise_id: number;
  target_sets: number;
  target_reps: number;
}

interface FormState {
  id?: number;
  name: string;
  exercises: LocalTemplateExercise[];
}

const emptyForm: FormState = {
  name: "",
  exercises: [],
};

const createTemplateExerciseRow = (a_exercise_id: number): LocalTemplateExercise => ({
  localId: crypto.randomUUID(),
  exercise_id: a_exercise_id,
  target_sets: 3,
  target_reps: 10,
});

const sortTemplates = (a_items: WorkoutTemplate[]): WorkoutTemplate[] =>
  [...a_items].sort((a_left, a_right) => a_left.name.localeCompare(a_right.name));

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [templateList, exerciseList] = await Promise.all([
          templatesApi.listTemplates(),
          exercisesApi.listExercises(),
        ]);
        setTemplates(sortTemplates(templateList));
        setExercises(exerciseList);
      } catch (err) {
        console.error(err);
        setError("Failed to load templates.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const startCreate = () => {
    setForm({
      name: "",
      exercises: exercises.length > 0 ? [createTemplateExerciseRow(exercises[0].id)] : [],
    });
    setMode("creating");
    setError(null);
  };

  const startEdit = (template: WorkoutTemplate) => {
    setForm({
      id: template.id,
      name: template.name,
      exercises: template.exercises.map((exercise) => ({
        localId: crypto.randomUUID(),
        exercise_id: exercise.exercise_id,
        target_sets: exercise.target_sets,
        target_reps: exercise.target_reps,
      })),
    });
    setMode("editing");
    setError(null);
  };

  const cancelForm = () => {
    setMode("idle");
    setForm(emptyForm);
    setError(null);
  };

  const handleNameChange = (a_value: string) => {
    setForm((prev) => ({ ...prev, name: a_value }));
  };

  const addExerciseRow = () => {
    if (exercises.length === 0) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      exercises: [...prev.exercises, createTemplateExerciseRow(exercises[0].id)],
    }));
  };

  const removeExerciseRow = (a_local_id: string) => {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((exercise) => exercise.localId !== a_local_id),
    }));
  };

  const updateExerciseRow = (
    a_local_id: string,
    a_field: "exercise_id" | "target_sets" | "target_reps",
    a_value: number
  ) => {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.localId === a_local_id ? { ...exercise, [a_field]: a_value } : exercise
      ),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError("Template name is required.");
      return;
    }
    if (form.exercises.length === 0) {
      setError("Add at least one exercise to the template.");
      return;
    }

    const payload = {
      name,
      exercises: form.exercises.map(({ localId: _, ...exercise }) => exercise),
    };

    try {
      setSaving(true);
      setError(null);
      if (mode === "creating") {
        const created = await templatesApi.createTemplate(payload);
        setTemplates((prev) => sortTemplates([...prev, created]));
      } else if (mode === "editing" && form.id != null) {
        const updated = await templatesApi.updateTemplate(form.id, payload);
        setTemplates((prev) =>
          sortTemplates(prev.map((template) => (template.id === updated.id ? updated : template)))
        );
      }
      cancelForm();
    } catch (err: unknown) {
      console.error(err);
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (template: WorkoutTemplate) => {
    if (!window.confirm(`Delete "${template.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(template.id);
      setError(null);
      await templatesApi.deleteTemplate(template.id);
      setTemplates((prev) => prev.filter((item) => item.id !== template.id));
      if (mode === "editing" && form.id === template.id) {
        cancelForm();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete template.");
    } finally {
      setDeletingId(null);
    }
  };

  const exerciseNameForId = (a_exercise_id: number) =>
    exercises.find((exercise) => exercise.id === a_exercise_id)?.name ?? "Unknown exercise";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 px-4 py-4 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Templates</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Save repeatable workouts and apply them to Today&apos;s Log.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" className="text-slate-400" asChild>
            <Link to="/dashboard">Home</Link>
          </Button>
          <Button variant="outline" size="sm" className="border-slate-700" asChild>
            <Link to="/log">Log workout</Link>
          </Button>
          <Button size="sm" onClick={startCreate}>
            Create template
          </Button>
        </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-6 flex flex-col gap-6">
        {error && (
          <div className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
            Loading templates...
          </div>
        ) : templates.length === 0 ? (
          <section className="flex-1 flex flex-col items-center justify-center gap-3 text-center text-slate-400">
            <p className="text-sm sm:text-base">No workout templates yet.</p>
            <p className="text-xs sm:text-sm max-w-md">
              Create one to prefill Today&apos;s Log with your common exercises and target set/rep
              structure.
            </p>
            <Button size="sm" onClick={startCreate}>
              Create your first template
            </Button>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <article
                key={template.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-sky-300/80">
                      Workout Template
                    </p>
                    <h2 className="mt-2 text-lg font-semibold">{template.name}</h2>
                  </div>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-300">
                    {template.exercises.length} exercise{template.exercises.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {template.exercises.map((exercise) => (
                    <div
                      key={`${template.id}-${exercise.exercise_id}`}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2"
                    >
                      <p className="text-sm font-medium text-slate-100">{exercise.exercise_name}</p>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                        {exercise.target_sets} sets x {exercise.target_reps} reps
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <Link to={`/log?templateId=${template.id}`}>Use template</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700"
                    onClick={() => startEdit(template)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-800/80 text-red-300 hover:bg-red-950/50 hover:text-red-200"
                    onClick={() => handleDelete(template)}
                    disabled={deletingId === template.id}
                  >
                    {deletingId === template.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </article>
            ))}
          </section>
        )}

        {(mode === "creating" || mode === "editing") && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 max-w-3xl">
            <h2 className="text-base font-semibold">
              {mode === "creating" ? "Create template" : "Edit template"}
            </h2>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300" htmlFor="template-name">
                  Template name
                </label>
                <input
                  id="template-name"
                  type="text"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                  placeholder="e.g., Upper A"
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                      Exercises
                    </p>
                    <p className="text-xs text-slate-500">
                      Target sets and reps define the placeholder rows for Today&apos;s Log.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-slate-700"
                    onClick={addExerciseRow}
                    disabled={exercises.length === 0}
                  >
                    Add exercise
                  </Button>
                </div>

                {exercises.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Create exercises in your{" "}
                    <Link to="/exercises" className="underline text-sky-400">
                      exercise library
                    </Link>{" "}
                    before building templates.
                  </p>
                ) : form.exercises.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-4 py-5 text-sm text-slate-400">
                    Add at least one exercise to save this template.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {form.exercises.map((exercise) => (
                      <div
                        key={exercise.localId}
                        className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 md:grid-cols-[1.6fr_0.7fr_0.7fr_auto]"
                      >
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="text-slate-400">Exercise</span>
                          <select
                            className="dark-surface-select rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
                            value={exercise.exercise_id}
                            onChange={(event) =>
                              updateExerciseRow(
                                exercise.localId,
                                "exercise_id",
                                Number(event.target.value)
                              )
                            }
                          >
                            {exercises.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                                {option.muscle_group ? ` (${option.muscle_group})` : ""}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="flex flex-col gap-1 text-sm">
                          <span className="text-slate-400">Target sets</span>
                          <input
                            type="number"
                            min={1}
                            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
                            value={exercise.target_sets}
                            onChange={(event) =>
                              updateExerciseRow(
                                exercise.localId,
                                "target_sets",
                                Math.max(1, Number(event.target.value) || 1)
                              )
                            }
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-sm">
                          <span className="text-slate-400">Target reps</span>
                          <input
                            type="number"
                            min={1}
                            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
                            value={exercise.target_reps}
                            onChange={(event) =>
                              updateExerciseRow(
                                exercise.localId,
                                "target_reps",
                                Math.max(1, Number(event.target.value) || 1)
                              )
                            }
                          />
                        </label>

                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-red-800/80 text-red-300 hover:bg-red-950/50 hover:text-red-200"
                            onClick={() => removeExerciseRow(exercise.localId)}
                            aria-label={`Remove ${exerciseNameForId(exercise.exercise_id)} from template`}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  {saving
                    ? "Saving..."
                    : mode === "creating"
                      ? "Create template"
                      : "Save changes"}
                </Button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
