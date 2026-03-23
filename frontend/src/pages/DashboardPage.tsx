import { useEffect, useState } from "react";

import type { SessionOut } from "@/api/sessions";
import * as exercisesApi from "@/api/exercises";
import * as sessionsApi from "@/api/sessions";
import * as templatesApi from "@/api/templates";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { DashboardRecentSessions } from "@/components/dashboard/DashboardRecentSessions";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardState {
  sessions: SessionOut[];
  totalSessions: number;
  exerciseCount: number;
  templateCount: number;
}

const emptyDashboardState: DashboardState = {
  sessions: [],
  totalSessions: 0,
  exerciseCount: 0,
  templateCount: 0,
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  weekday: "short",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
});

const dayInMs = 1000 * 60 * 60 * 24;

const parseSessionDate = (value: string): Date => new Date(`${value}T12:00:00`);

const getStartOfWeek = (value: Date): Date => {
  const nextValue = new Date(value);
  nextValue.setHours(0, 0, 0, 0);
  nextValue.setDate(nextValue.getDate() - nextValue.getDay());
  return nextValue;
};

const formatDashboardDate = (value: string): string =>
  dateFormatter.format(parseSessionDate(value));

const formatRelativeDashboardDate = (value: string): string => {
  const targetDate = parseSessionDate(value);
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const dayDifference = Math.round(
    (today.getTime() - targetDate.getTime()) / dayInMs,
  );
  if (dayDifference === 0) {
    return "Today";
  }
  if (dayDifference === 1) {
    return "Yesterday";
  }
  if (dayDifference > 1 && dayDifference < 7) {
    return weekdayFormatter.format(targetDate);
  }
  return shortDateFormatter.format(targetDate);
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [dashboardState, setDashboardState] =
    useState<DashboardState>(emptyDashboardState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      const [sessionsResult, exercisesResult, templatesResult] =
        await Promise.allSettled([
          sessionsApi.listSessions({ limit: 50, offset: 0 }),
          exercisesApi.listExercises(),
          templatesApi.listTemplates(),
        ]);

      if (!isActive) {
        return;
      }

      const nextState: DashboardState = { ...emptyDashboardState };
      let hasFailure = false;

      if (sessionsResult.status === "fulfilled") {
        nextState.sessions = sessionsResult.value.sessions;
        nextState.totalSessions = sessionsResult.value.total;
      } else {
        hasFailure = true;
      }

      if (exercisesResult.status === "fulfilled") {
        nextState.exerciseCount = exercisesResult.value.length;
      } else {
        hasFailure = true;
      }

      if (templatesResult.status === "fulfilled") {
        nextState.templateCount = templatesResult.value.length;
      } else {
        hasFailure = true;
      }

      setDashboardState(nextState);
      setError(
        hasFailure
          ? "Some dashboard insights could not be loaded right now. Logging and navigation still work."
          : null,
      );
      setLoading(false);
    };

    void load();

    return () => {
      isActive = false;
    };
  }, []);

  const recentSessions = dashboardState.sessions.slice(0, 5);
  const sessionsThisWeek = dashboardState.sessions.filter((session) => {
    return parseSessionDate(session.date) >= getStartOfWeek(new Date());
  }).length;
  const displayName = user?.username ?? user?.email ?? "athlete";
  const navLabel = user?.username ?? user?.email ?? "Signed in";
  const lastWorkoutLabel = recentSessions[0]
    ? shortDateFormatter.format(parseSessionDate(recentSessions[0].date))
    : null;

  return (
    <div className="dark min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_100%_0%,_rgba(56,189,248,0.14),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#020617_48%,_#0f172a_100%)] text-slate-50">
      <DashboardNav userLabel={navLabel} onLogout={() => void logout()} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
          <DashboardHero
            displayName={displayName}
            lastWorkoutLabel={lastWorkoutLabel}
            sessionsThisWeek={sessionsThisWeek}
            templateCount={dashboardState.templateCount}
          />
          <DashboardQuickActions
            templateCount={dashboardState.templateCount}
            exerciseCount={dashboardState.exerciseCount}
            totalSessions={dashboardState.totalSessions}
          />
        </section>

        <DashboardStats
          sessionsThisWeek={sessionsThisWeek}
          exerciseCount={dashboardState.exerciseCount}
          templateCount={dashboardState.templateCount}
        />

        <DashboardRecentSessions
          sessions={recentSessions}
          loading={loading}
          formatDate={formatDashboardDate}
          formatRelativeDate={formatRelativeDashboardDate}
        />
      </main>
    </div>
  );
}
