import { ArrowRight, CalendarDays, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardHeroProps {
  displayName: string;
  lastWorkoutLabel: string | null;
  sessionsThisWeek: number;
  templateCount: number;
}

export function DashboardHero({
  displayName,
  lastWorkoutLabel,
  sessionsThisWeek,
  templateCount,
}: DashboardHeroProps) {
  return (
    <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(8,47,73,0.92),rgba(15,23,42,0.96)_42%,rgba(2,6,23,1))] shadow-[0_32px_90px_rgba(2,6,23,0.45)]">
      <CardContent className="relative p-6 sm:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_58%)] lg:block" />
        <div className="relative flex flex-col gap-8">
          <div className="min-w-0 max-w-3xl">
            <Badge
              variant="subtle"
              className="border-sky-300/15 bg-sky-400/10 text-sky-200"
            >
              <Sparkles className="mr-1 size-3.5" />
              Dashboard
            </Badge>
            <p className="mt-5 text-sm uppercase tracking-[0.35em] text-sky-300/75">
              Today&apos;s focus
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Ready for today&apos;s training,
              <span className="mt-1 block [overflow-wrap:anywhere]">
                {displayName}?
              </span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Keep the momentum moving with a clean log flow, quick access to
              templates, and a sharper view of your recent training history.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge
                variant="subtle"
                className="border-white/10 bg-white/5 text-slate-200"
              >
                <CalendarDays className="mr-1 size-3.5" />
                {lastWorkoutLabel
                  ? `Last workout ${lastWorkoutLabel}`
                  : "No sessions logged yet"}
              </Badge>
              <Badge
                variant="subtle"
                className="border-white/10 bg-white/5 text-slate-200"
              >
                <TrendingUp className="mr-1 size-3.5" />
                {sessionsThisWeek} session{sessionsThisWeek === 1 ? "" : "s"}{" "}
                this week
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(16rem,20rem)]">
            <Button
              asChild
              size="lg"
              className="h-auto min-h-12 justify-center gap-2 whitespace-normal rounded-2xl bg-sky-500 px-5 py-3 text-center text-base font-semibold text-white shadow-[0_22px_50px_rgba(14,165,233,0.3)] hover:bg-sky-400"
            >
              <Link to="/log">
                Log today&apos;s workout
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="h-auto min-h-12 whitespace-normal rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-center text-slate-100 hover:bg-white/10"
            >
              <Link to="/history">Review history</Link>
            </Button>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2 xl:col-span-1">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Templates ready
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between xl:flex-col xl:items-start">
                <div>
                  <p className="text-2xl font-semibold text-white">
                    {templateCount}
                  </p>
                  <p className="text-sm text-slate-400">
                    Saved routine{templateCount === 1 ? "" : "s"} available for
                    a fast start.
                  </p>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="self-start text-sky-200 hover:bg-sky-400/[0.12] hover:text-sky-100"
                >
                  <Link to="/templates">Open templates</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
