import type { LucideIcon } from "lucide-react";
import { CalendarDays, Dumbbell, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface DashboardStatsProps {
  sessionsThisWeek: number;
  exerciseCount: number;
  templateCount: number;
}

interface StatItem {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}

export function DashboardStats({
  sessionsThisWeek,
  exerciseCount,
  templateCount,
}: DashboardStatsProps) {
  const items: StatItem[] = [
    {
      label: "This week",
      value: `${sessionsThisWeek}`,
      detail: `Workout session${sessionsThisWeek === 1 ? "" : "s"} logged`,
      icon: CalendarDays,
    },
    {
      label: "Exercise library",
      value: `${exerciseCount}`,
      detail: `Movement${exerciseCount === 1 ? "" : "s"} ready to use`,
      icon: Dumbbell,
    },
    {
      label: "Templates",
      value: `${templateCount}`,
      detail: `Saved routine${templateCount === 1 ? "" : "s"} available`,
      icon: Sparkles,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.label}
            className="border-white/10 bg-slate-900/55 shadow-[0_20px_60px_rgba(2,6,23,0.3)] transition-all hover:border-white/15 hover:bg-slate-900/72"
          >
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
                  {item.value}
                </p>
                <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl border border-sky-400/15 bg-sky-400/10 text-sky-300">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
