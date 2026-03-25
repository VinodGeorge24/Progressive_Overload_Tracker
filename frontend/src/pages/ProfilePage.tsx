/**
 * Settings/profile page for viewing and updating account details.
 * Slice 6: profile and polish.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const formatTimestamp = (value?: string): string => {
  if (!value) {
    return "Unavailable";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export default function ProfilePage() {
  const { user, refreshUser, updateProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        setError(null);
        await refreshUser();
      } catch {
        if (isActive) {
          setError("Failed to load your profile.");
        }
      } finally {
        if (isActive) {
          setLoadingProfile(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [refreshUser]);

  useEffect(() => {
    setUsername(user?.username ?? "");
  }, [user]);

  const joinedOn = useMemo(() => formatTimestamp(user?.created_at), [user?.created_at]);
  const lastUpdatedOn = useMemo(() => formatTimestamp(user?.updated_at), [user?.updated_at]);

  const hasChanges =
    username.trim() !== (user?.username ?? "") ||
    currentPassword.length > 0 ||
    newPassword.length > 0 ||
    confirmPassword.length > 0;

  const resetPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedUsername = username.trim();

    setError(null);
    setSuccess(null);

    if (!trimmedUsername) {
      setError("Username is required.");
      return;
    }

    if (currentPassword && !newPassword) {
      setError("Enter a new password to change your password.");
      return;
    }

    if (newPassword && !currentPassword) {
      setError("Current password is required to set a new password.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("New password and confirmation must match.");
      return;
    }

    const payload: {
      username?: string;
      current_password?: string;
      new_password?: string;
    } = {};

    if (trimmedUsername !== (user?.username ?? "")) {
      payload.username = trimmedUsername;
    }

    if (newPassword || currentPassword) {
      payload.current_password = currentPassword;
      payload.new_password = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      setError("Make a change before saving.");
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await updateProfile(payload);
      setUsername(updatedUser.username);
      resetPasswordFields();
      setSuccess("Profile updated.");
    } catch (err: unknown) {
      const res =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string }; status?: number } }).response
          : undefined;
      const status = res?.status;
      const detail = res?.data?.detail;
      setError(
        status && status >= 500
          ? "Something went wrong on the server. Please try again."
          : typeof detail === "string"
            ? detail
            : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_32%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-slate-50">
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-sky-300/80">Settings</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Profile</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-400" asChild>
              <Link to="/dashboard">Home</Link>
            </Button>
            <Button variant="outline" size="sm" className="border-slate-700" asChild>
              <Link to="/history">History</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[0.95fr,1.35fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300/75">Account</p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">
            {user?.username ?? "Loading profile"}
          </h2>
          <dl className="mt-6 space-y-4 text-sm text-slate-300">
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-slate-500">Email</dt>
              <dd className="mt-1 break-all text-base text-slate-100">{user?.email ?? "..."}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-slate-500">Joined</dt>
              <dd className="mt-1">{joinedOn}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Last updated
              </dt>
              <dd className="mt-1">{lastUpdatedOn}</dd>
            </div>
          </dl>
          <p className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
            Profile changes update immediately in the app. Password changes require your current
            password.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Edit profile</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Account settings</h2>
            </div>
            {loadingProfile ? (
              <span className="text-sm text-slate-400" role="status" aria-live="polite">
                Refreshing...
              </span>
            ) : null}
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
              {error}
            </div>
          ) : null}

          {success ? (
            <div
              className="mt-5 rounded-2xl border border-emerald-500/60 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
              role="status"
              aria-live="polite"
            >
              {success}
            </div>
          ) : null}

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm sm:col-span-2">
                <span className="text-slate-400">Email</span>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  aria-readonly="true"
                  className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-400"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm sm:col-span-2">
                <span className="text-slate-400">Username</span>
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  minLength={1}
                  maxLength={255}
                  required
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="mb-4">
                <h3 className="text-base font-medium text-slate-100">Change password</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Leave these fields blank if you only want to update your username.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm sm:col-span-2">
                  <span className="text-slate-400">Current password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-slate-400">New password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    minLength={8}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-slate-400">Confirm new password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={8}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Save username changes and optional password updates in one request.
              </p>
              <Button type="submit" disabled={saving || !hasChanges}>
                {saving ? "Saving changes..." : "Save changes"}
              </Button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
