/**
 * Sign up page. On success redirects to /dashboard.
 * Design inspiration: frontend_references/signup_page_-_lift_tracker/
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthShell, authInputClassName } from "@/components/auth/AuthShell";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(email, username, password);
      navigate("/dashboard", { replace: true });
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
            : "Sign up failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      panelBadge="Create account"
      title="Set up your training space."
      description="Create an account to start logging workouts, saving templates, and tracking progress in one place."
      footer={
        <p className="text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-sky-200 underline-offset-4 transition-colors hover:text-sky-100 hover:underline"
          >
            Log in
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
            htmlFor="signup-email"
            className="text-sm font-medium text-slate-200"
          >
            Email
          </label>
          <input
            id="signup-email"
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
            htmlFor="signup-username"
            className="text-sm font-medium text-slate-200"
          >
            Username
          </label>
          <input
            id="signup-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={1}
            placeholder="Pick a display name"
            className={authInputClassName}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="signup-password"
            className="text-sm font-medium text-slate-200"
          >
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Create a password"
            className={authInputClassName}
          />
          <p className="text-xs text-slate-500">At least 8 characters</p>
        </div>
        <Button
          type="submit"
          className="h-12 w-full rounded-2xl bg-sky-500 text-base font-semibold text-white shadow-[0_22px_50px_rgba(14,165,233,0.28)] hover:bg-sky-400"
          disabled={submitting}
        >
          {submitting ? "Creating account..." : "Sign up"}
        </Button>
      </form>
    </AuthShell>
  );
}
