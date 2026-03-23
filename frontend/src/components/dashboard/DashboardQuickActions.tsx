import type { LucideIcon } from "lucide-react";
import { ArrowRight, BarChart3, Dumbbell, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface DashboardQuickActionsProps {
  templateCount: number;
  exerciseCount: number;
  totalSessions: number;
}

interface QuickAction {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
}

export function DashboardQuickActions({
  templateCount,
  exerciseCount,
  totalSessions,
}: DashboardQuickActionsProps) {
  const actions: QuickAction[] = [
    {
      title: "Review progress",
      description: "Open analytics and check your latest exercise trends.",
      to: "/progress",
      icon: BarChart3,
    },
    {
      title: "Use a template",
      description:
        templateCount > 0
          ? `${templateCount} saved routine${templateCount === 1 ? "" : "s"} ready to prefill your next session.`
          : "Build a repeatable routine before your next training day.",
      to: "/templates",
      icon: Sparkles,
    },
    {
      title: "Manage exercises",
      description:
        exerciseCount > 0
          ? `${exerciseCount} movement${exerciseCount === 1 ? "" : "s"} available in your library.`
          : "Add your core lifts so logging stays fast and consistent.",
      to: "/exercises",
      icon: Dumbbell,
    },
  ];

  return (
    <Card className="border-white/10 bg-slate-900/65 shadow-[0_28px_80px_rgba(2,6,23,0.38)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-slate-50">Quick actions</CardTitle>
        <CardDescription className="text-slate-400">
          Jump back into the parts of the app you use most.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.to}
              to={action.to}
              className="group flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 transition-all hover:border-sky-400/20 hover:bg-sky-400/[0.08] hover:-translate-y-0.5"
            >
              <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl border border-sky-400/15 bg-sky-400/10 text-sky-300">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-100">{action.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="mt-1 size-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-sky-200" />
            </Link>
          );
        })}

        <Separator className="bg-white/10" />

        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
            Training pulse
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-50">
            {totalSessions}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Total workout session{totalSessions === 1 ? "" : "s"} logged so far.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
