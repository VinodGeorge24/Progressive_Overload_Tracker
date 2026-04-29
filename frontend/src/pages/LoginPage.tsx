/**
 * Login page. On success redirects to /dashboard (or from state).
 * Design inspiration: frontend_references/login_page_-_lift_tracker/
 */
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthShell, authInputClassName } from "@/components/auth/AuthShell";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const res =
        err && typeof err === "object" && "response" in err
          ? (
              err as {
                response?: { data?: { detail?: string }; status?: number };
              }
            ).response
          : undefined;
      const status = res?.status;
      const detail = res?.data?.detail;
      const message =
        status && status >= 500
          ? "Something went wrong on the server. Please try again."
          : typeof detail === "string"
            ? detail
            : "Login failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      panelBadge="Welcome back"
      title="Log in to pick up where you left off."
      description="Use the same account you use for training history, templates, and today's log."
      footer={
        <p className="text-center">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-sky-200 underline-offset-4 transition-colors hover:text-sky-100 hover:underline"
          >
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p
            className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100"
            role="alert"
          >
            {error}
          </p>
        )}
        <div className="space-y-2">
          <label
            htmlFor="login-email"
            className="text-sm font-medium text-slate-200"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className={authInputClassName}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-slate-200"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            className={authInputClassName}
          />
        </div>
        <Button
          type="submit"
          className="h-12 w-full rounded-2xl bg-sky-500 text-base font-semibold text-white shadow-[0_22px_50px_rgba(14,165,233,0.28)] hover:bg-sky-400"
          disabled={submitting}
        >
          {submitting ? "Signing in..." : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}
