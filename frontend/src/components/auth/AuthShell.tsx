import type { ReactNode } from "react";
import { CalendarDays, Sparkles, TrendingUp } from "lucide-react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  panelBadge: string;
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}

const authHighlights = [
  {
    title: "Cleaner logging",
    description: "Move from warm-up to working sets without fighting the UI.",
    icon: CalendarDays,
  },
  {
    title: "Real progress checks",
    description: "Review recent sessions and analytics in the same flow.",
    icon: TrendingUp,
  },
  {
    title: "Templates ready",
    description: "Start familiar sessions faster with reusable routines.",
    icon: Sparkles,
  },
];

export const authInputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:border-sky-300/40";

export const authShellBackgroundClassName =
  "dark min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_100%_0%,_rgba(56,189,248,0.14),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#020617_48%,_#0f172a_100%)] text-slate-50";

export function AuthLoadingScreen({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        authShellBackgroundClassName,
        "flex items-center justify-center px-4 py-8",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/70 px-6 py-5 text-sm text-slate-300 shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl">
        <BrandLogo className="size-20 drop-shadow-[0_18px_24px_rgba(2,6,23,0.38)]" />
        <div>{label}</div>
      </div>
    </div>
  );
}

export function AuthShell({
  panelBadge,
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <div className={authShellBackgroundClassName}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] xl:gap-12">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_32px_90px_rgba(2,6,23,0.32)] sm:p-8 lg:p-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/45 to-transparent" />
            <div className="absolute -left-20 top-0 size-48 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="absolute right-0 top-24 size-44 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="relative">
              <Badge
                variant="subtle"
                className="border-sky-300/15 bg-sky-400/10 text-sky-200"
              >
                Progressive Overload
              </Badge>

              <div className="mt-5 flex items-center gap-4">
                <BrandLogo className="size-20 shrink-0 drop-shadow-[0_20px_28px_rgba(2,6,23,0.36)]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-sky-300/80">
                    Strength Logging System
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Same training system, cleaner entry point.
                  </p>
                </div>
              </div>

              <h1 className="mt-8 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Step back into a cleaner training rhythm.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Log faster, revisit recent sessions, and keep your progress
                moving with the same focused look and feel used across the
                tracker.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {authHighlights.map((highlight) => {
                  const Icon = highlight.icon;

                  return (
                    <div
                      key={highlight.title}
                      className="rounded-3xl border border-white/10 bg-slate-950/45 p-4"
                    >
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                        <Icon className="size-4" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-white">
                        {highlight.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {highlight.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,47,73,0.7),rgba(15,23,42,0.88)_52%,rgba(2,6,23,0.96))] p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="subtle"
                    className="border-white/10 bg-white/5 text-slate-200"
                  >
                    Ready for today
                  </Badge>
                  <Badge
                    variant="subtle"
                    className="border-white/10 bg-white/5 text-slate-200"
                  >
                    History on hand
                  </Badge>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-sky-300/70">
                      Fast start
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Get from sign-in to today&apos;s workout without losing
                      the calm, high-contrast flow used across the tracker.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-sky-300/70">
                      Context kept close
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Templates, recent workouts, and progress insights are all
                      waiting on the other side of a quick, clean sign-in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Card className="overflow-hidden border-white/10 bg-slate-950/72 shadow-[0_32px_90px_rgba(2,6,23,0.42)] backdrop-blur-xl">
            <CardContent className="p-6 sm:p-8">
              <Badge
                variant="subtle"
                className="border-sky-300/15 bg-sky-400/10 text-sky-200"
              >
                {panelBadge}
              </Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {description}
              </p>

              <div className="mt-8">{children}</div>

              <div className="mt-8 border-t border-white/10 pt-6 text-sm text-slate-400">
                {footer}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
