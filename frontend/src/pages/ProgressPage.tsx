import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import * as analyticsApi from "@/api/analytics";
import * as exercisesApi from "@/api/exercises";

type Exercise = exercisesApi.Exercise;
type MetricOption = analyticsApi.ProgressMetric;

const metricOptions: MetricOption[] = ["weight", "reps", "volume"];

export default function ProgressPage() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [metric, setMetric] = useState<MetricOption>("weight");
  const [setNumber, setSetNumber] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [progress, setProgress] = useState<analyticsApi.ExerciseProgressOut | null>(null);
  const [chartUrl, setChartUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await exercisesApi.listExercises();
        setExercises(items);
        if (items.length === 0) {
          setSelectedExerciseId(null);
          return;
        }

        const requestedId = exerciseId ? Number(exerciseId) : NaN;
        const defaultExercise = Number.isFinite(requestedId)
          ? items.find((item) => item.id === requestedId) ?? items[0]
          : items[0];
        setSelectedExerciseId(defaultExercise.id);
        if (!exerciseId || Number(exerciseId) !== defaultExercise.id) {
          navigate(`/progress/${defaultExercise.id}`, { replace: true });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load exercises for analytics.");
      } finally {
        setLoading(false);
      }
    };
    loadExercises();
  }, [exerciseId, navigate]);

  useEffect(() => {
    if (!selectedExerciseId) {
      setProgress(null);
      setChartUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
        return null;
      });
      return;
    }

    let cancelled = false;
    let nextChartUrl: string | null = null;
    const params = {
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
      ...(setNumber ? { set_number: setNumber } : {}),
    };

    const loadProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        const [progressData, chartObjectUrl] = await Promise.all([
          analyticsApi.getProgress(selectedExerciseId, params),
          analyticsApi.getProgressChartObjectUrl(selectedExerciseId, { ...params, metric }),
        ]);
        nextChartUrl = chartObjectUrl;
        if (cancelled) {
          URL.revokeObjectURL(chartObjectUrl);
          return;
        }
        setProgress(progressData);
        setChartUrl((currentUrl) => {
          if (currentUrl) {
            URL.revokeObjectURL(currentUrl);
          }
          return chartObjectUrl;
        });
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load progress analytics.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProgress();

    return () => {
      cancelled = true;
      if (nextChartUrl) {
        URL.revokeObjectURL(nextChartUrl);
      }
    };
  }, [endDate, metric, selectedExerciseId, setNumber, startDate]);

  const availableSetNumbers = useMemo(() => {
    if (!progress) {
      return [];
    }
    return progress.series.map((series) => series.set_number);
  }, [progress]);

  const rows = useMemo(() => {
    if (!progress) {
      return [];
    }
    return progress.series.flatMap((series) =>
      series.points.map((point) => ({
        set_number: series.set_number,
        ...point,
      }))
    );
  }, [progress]);

  const handleExerciseChange = (nextExerciseId: number) => {
    setSelectedExerciseId(nextExerciseId);
    setSetNumber(undefined);
    navigate(`/progress/${nextExerciseId}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#020617_45%,_#0f172a_100%)] text-slate-50">
      <header className="border-b border-slate-800/90 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-sky-300/80">Progress</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Exercise analytics</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-slate-400" asChild>
              <Link to="/dashboard">Home</Link>
            </Button>
            <Button variant="outline" size="sm" className="border-slate-700" asChild>
              <Link to="/history">History</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8">
        {error && (
          <div className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading && exercises.length === 0 ? (
          <p className="text-sm text-slate-400">Loading analytics...</p>
        ) : exercises.length === 0 ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 text-center shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <h2 className="text-lg font-semibold">No exercises to analyze yet</h2>
            <p className="mt-2 text-sm text-slate-400">
              Add exercises and log a few sessions before opening the progress view.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/exercises">Open exercise library</Link>
            </Button>
          </section>
        ) : (
          <>
            <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] sm:grid-cols-2 xl:grid-cols-5">
              <label className="flex flex-col gap-2 text-sm xl:col-span-2">
                <span className="text-slate-400">Exercise</span>
                <select
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
                  value={selectedExerciseId ?? ""}
                  onChange={(event) => handleExerciseChange(Number(event.target.value))}
                >
                  {exercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                      {exercise.muscle_group ? ` (${exercise.muscle_group})` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-slate-400">Metric</span>
                <select
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 capitalize text-slate-50"
                  value={metric}
                  onChange={(event) => setMetric(event.target.value as MetricOption)}
                >
                  {metricOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-slate-400">Set number</span>
                <select
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
                  value={setNumber ?? ""}
                  onChange={(event) =>
                    setSetNumber(event.target.value ? Number(event.target.value) : undefined)
                  }
                >
                  <option value="">All sets</option>
                  {availableSetNumbers.map((value) => (
                    <option key={value} value={value}>
                      Set {value}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2 xl:col-span-5">
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-slate-400">Start date</span>
                  <input
                    type="date"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-slate-400">End date</span>
                  <input
                    type="date"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
              <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-sky-300/75">
                      Chart
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      {progress?.exercise_name ?? "Selected exercise"}
                    </h2>
                  </div>
                  <p className="text-sm capitalize text-slate-400">{metric} trend</p>
                </div>

                {loading ? (
                  <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/70 text-sm text-slate-400">
                    Rendering chart...
                  </div>
                ) : chartUrl ? (
                  <img
                    src={chartUrl}
                    alt={`Progress chart for ${progress?.exercise_name ?? "exercise"}`}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/70"
                  />
                ) : (
                  <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/70 text-sm text-slate-400">
                    No chart available.
                  </div>
                )}
              </article>

              <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-orange-300/75">Data</p>
                  <h2 className="mt-1 text-lg font-semibold">Recorded points</h2>
                </div>

                {rows.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-5 text-sm text-slate-400">
                    No workout data matches the current filters.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rows.map((row) => (
                      <div
                        key={`${row.set_number}-${row.date}-${row.weight}-${row.reps}`}
                        className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-slate-100">{row.date}</p>
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                              Set {row.set_number}
                            </p>
                          </div>
                          <div className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
                            {metric}
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                          <div className="rounded-xl bg-slate-900 px-2 py-3">
                            <p className="text-slate-500">Weight</p>
                            <p className="mt-1 font-semibold text-slate-50">{row.weight}</p>
                          </div>
                          <div className="rounded-xl bg-slate-900 px-2 py-3">
                            <p className="text-slate-500">Reps</p>
                            <p className="mt-1 font-semibold text-slate-50">{row.reps}</p>
                          </div>
                          <div className="rounded-xl bg-slate-900 px-2 py-3">
                            <p className="text-slate-500">Volume</p>
                            <p className="mt-1 font-semibold text-slate-50">{row.volume}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
