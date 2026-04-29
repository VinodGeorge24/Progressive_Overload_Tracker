import {
  Dumbbell,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Progress", to: "/progress", icon: TrendingUp },
  { label: "Templates", to: "/templates", icon: Sparkles },
  { label: "Exercises", to: "/exercises", icon: Dumbbell },
  { label: "History", to: "/history", icon: History },
];

interface DashboardNavProps {
  userLabel: string;
  onLogout: () => void;
}

export function DashboardNav({ userLabel, onLogout }: DashboardNavProps) {
  const { pathname } = useLocation();

  return (
    <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <BrandLogo className="size-14 shrink-0 drop-shadow-[0_18px_28px_rgba(2,6,23,0.4)]" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.35em] text-sky-300/80">
                Progressive Overload
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-slate-50">
                Training Dashboard
              </h1>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
              {userLabel}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
              asChild
            >
              <Link to="/settings">
                <Settings className="size-4" />
                Settings
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:bg-white/[0.08] hover:text-slate-50"
              onClick={onLogout}
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2 pb-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.to || pathname.startsWith(`${item.to}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex min-w-0 flex-1 basis-[calc(50%-0.25rem)] items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all sm:min-w-fit sm:basis-auto sm:flex-none",
                  isActive
                    ? "border-sky-400/30 bg-sky-400/[0.14] text-sky-200 shadow-[0_12px_40px_rgba(14,165,233,0.18)]"
                    : "border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-slate-100",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
