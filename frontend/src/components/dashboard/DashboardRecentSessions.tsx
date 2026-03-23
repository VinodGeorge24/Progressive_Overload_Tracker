import { ArrowRight, CalendarDays, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

import type { SessionOut } from "@/api/sessions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardRecentSessionsProps {
  sessions: SessionOut[];
  loading: boolean;
  formatDate: (value: string) => string;
  formatRelativeDate: (value: string) => string;
}

const summarizeExercises = (session: SessionOut): string => {
  const names = session.exercises.map((exercise) => exercise.exercise_name);
  if (names.length === 0) {
    return "No exercises logged";
  }
  if (names.length <= 3) {
    return names.join(", ");
  }
  return `${names.slice(0, 3).join(", ")} +${names.length - 3} more`;
};

const getTotalSets = (session: SessionOut): number =>
  session.exercises.reduce(
    (count, exercise) => count + exercise.sets.length,
    0,
  );

export function DashboardRecentSessions({
  sessions,
  loading,
  formatDate,
  formatRelativeDate,
}: DashboardRecentSessionsProps) {
  return (
    <Card className="border-white/10 bg-slate-900/65 shadow-[0_32px_90px_rgba(2,6,23,0.38)]">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle className="text-xl text-slate-50">
            Recent sessions
          </CardTitle>
          <CardDescription className="mt-1 text-slate-400">
            Your latest training sessions, cleaned up into a more useful
            activity view.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-fit text-sky-200 hover:bg-sky-400/10 hover:text-sky-100"
          asChild
        >
          <Link to="/history">View full history</Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5"
            >
              <div className="h-4 w-24 rounded bg-white/10" />
              <div className="mt-4 h-5 w-3/4 rounded bg-white/[0.08]" />
              <div className="mt-3 h-4 w-1/2 rounded bg-white/[0.06]" />
            </div>
          ))
        ) : sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-8 text-center">
            <p className="text-lg font-medium text-slate-100">
              No workouts logged yet
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Start with today&apos;s workout and your recent activity will show
              up here.
            </p>
            <Button
              className="mt-5 bg-sky-500 text-white hover:bg-sky-400"
              asChild
            >
              <Link to="/log">Log your first session</Link>
            </Button>
          </div>
        ) : (
          sessions.map((session, index) => {
            const totalSets = getTotalSets(session);

            return (
              <Link
                key={session.id}
                to={`/history/${session.id}`}
                className="group block rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 transition-all hover:border-sky-400/[0.18] hover:bg-sky-400/[0.08] hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="subtle"
                        className="border-white/10 bg-slate-950/70 text-slate-200"
                      >
                        <CalendarDays className="mr-1 size-3.5" />
                        {formatDate(session.date)}
                      </Badge>
                      <Badge
                        variant="subtle"
                        className="border-white/10 bg-slate-950/70 text-slate-400"
                      >
                        {formatRelativeDate(session.date)}
                      </Badge>
                      {index === 0 && (
                        <Badge
                          variant="subtle"
                          className="border-sky-300/15 bg-sky-400/10 text-sky-200"
                        >
                          Latest
                        </Badge>
                      )}
                    </div>

                    <p className="mt-4 text-lg font-medium text-slate-50">
                      {summarizeExercises(session)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge
                        variant="subtle"
                        className="border-white/10 bg-white/5 text-slate-200"
                      >
                        <Dumbbell className="mr-1 size-3.5" />
                        {session.exercises.length} exercise
                        {session.exercises.length === 1 ? "" : "s"}
                      </Badge>
                      <Badge
                        variant="subtle"
                        className="border-white/10 bg-white/5 text-slate-200"
                      >
                        {totalSets} set{totalSets === 1 ? "" : "s"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-400 transition-colors group-hover:text-sky-100">
                    Open session
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
