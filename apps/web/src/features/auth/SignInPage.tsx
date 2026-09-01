import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Field, Input, Toast } from "@vidya/ui";

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError(null);
    // Mock only - no auth is wired. P0.5 owns the real session.
    navigate("/app/home");
  };

  return (
    <div className="grid min-h-screen bg-[var(--bg)] lg:grid-cols-2">
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-2 text-[15px] font-bold text-[var(--ink)]">
            <span aria-hidden className="grid size-8 place-items-center rounded-[10px] bg-[var(--primary)] text-[13px] font-bold text-white">V</span>
            VIDYA
          </Link>

          <h1 className="mt-9 text-balance font-display text-[28px] font-bold text-[var(--ink)]">Welcome back</h1>
          <p className="mt-2 text-[14px] text-[var(--muted)]">
            Pick up where you left off — your plan, progress and streak are saved.
          </p>

          <form onSubmit={submit} noValidate className="mt-8 grid gap-5">
            <Field label="Email address">
              {(id) => (
                <Input
                  id={id}
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(error) || undefined}
                />
              )}
            </Field>

            <Field label="Password">
              {(id) => (
                <div className="relative">
                  <Input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={Boolean(error) || undefined}
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-[8px] text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
                  </button>
                </div>
              )}
            </Field>

            <div className="flex items-center justify-between gap-3 text-[13px]">
              <label className="flex items-center gap-2 text-[var(--ink-soft)]">
                <input
                  type="checkbox"
                  name="keep-signed-in"
                  defaultChecked
                  className="size-4 rounded border-[var(--line-strong)] accent-[var(--primary)]"
                />
                Keep me signed in
              </label>
              <Link to="/reset-password" className="font-semibold text-[var(--primary)] hover:underline">
                Reset password
              </Link>
            </div>

            {error && (
              <p role="alert" className="text-[13px] font-medium text-[var(--danger)]">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full">Sign in</Button>
          </form>

          <div className="relative my-7 text-center">
            <div aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-[var(--line)]" />
            <span className="relative bg-[var(--bg)] px-3 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--faint)]">
              Or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={() => setToast("Google sign-in is not wired up in this prototype.")}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] text-[14px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
              <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.6c-.1 1.1-.9 2.8-2.5 3.9l3.8 3c2.3-2.1 3.6-5.2 3.6-8.8z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.8-3c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5l-4 3.1C3.2 21.3 7.3 24 12 24z" />
              <path fill="#FBBC05" d="M5.2 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3l-4-3.1C.4 8.2 0 10 0 12s.4 3.8 1.2 5.4l4-3.1z" />
              <path fill="#EA4335" d="M12 4.8c2.3 0 3.8.9 4.7 1.8l3.4-3.3C18 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.6l4 3.1C6.1 6.8 8.8 4.8 12 4.8z" />
            </svg>
            Continue with Google
          </button>

          {/* DPDP Act 2023: a minor's account needs verifiable guardian consent, so this
              must be visible on the sign-in screen itself, before the signup link below. */}
          <p className="mt-7 flex items-start gap-2 rounded-[10px] bg-[var(--surface-soft)] p-3 text-[12.5px] leading-snug text-[var(--ink-soft)]">
            <ShieldCheck size={15} aria-hidden className="mt-0.5 shrink-0 text-[var(--muted)]" />
            Students under 18 need a parent or guardian to confirm the account.
          </p>

          <p className="mt-4 text-center text-[13px] text-[var(--muted)]">
            New to VIDYA?{" "}
            <Link to="/onboarding" className="font-semibold text-[var(--primary)] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-[var(--surface-soft)] lg:block" aria-label="What families say about VIDYA">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: [
              "radial-gradient(circle at 18% 22%, color-mix(in srgb, var(--primary) 48%, transparent), transparent 55%)",
              "radial-gradient(circle at 82% 12%, color-mix(in srgb, var(--secure) 40%, transparent), transparent 50%)",
              "radial-gradient(circle at 70% 82%, color-mix(in srgb, var(--developing) 32%, transparent), transparent 55%)",
              "radial-gradient(circle at 15% 85%, color-mix(in srgb, var(--needswork) 24%, transparent), transparent 50%)",
            ].join(", "),
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 animate-pulse motion-reduce:animate-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, var(--line-strong) 0, var(--line-strong) 1px, transparent 1px, transparent 64px), repeating-linear-gradient(90deg, var(--line-strong) 0, var(--line-strong) 1px, transparent 1px, transparent 64px)",
            animationDuration: "10s",
          }}
        />
        <div
          aria-hidden
          className="absolute -right-24 -top-24 size-[420px] rounded-full opacity-50 blur-3xl animate-pulse motion-reduce:animate-none"
          style={{ background: "color-mix(in srgb, var(--secure) 55%, transparent)", animationDuration: "6s" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-16 size-[380px] rounded-full opacity-40 blur-3xl animate-pulse motion-reduce:animate-none"
          style={{ background: "color-mix(in srgb, var(--developing) 50%, transparent)", animationDuration: "8s" }}
        />

        <div className="relative flex h-full flex-col justify-end p-10 xl:p-14">
          <figure className="max-w-md rounded-[16px] border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-[var(--shadow)] backdrop-blur">
            <span aria-hidden className="grid size-10 place-items-center rounded-full bg-[var(--primary)] text-[13px] font-bold text-white">
              PS
            </span>
            <blockquote className="mt-3 text-[15px] leading-snug text-[var(--ink)]">
              “He stopped guessing. When he gets something wrong it shows him the
              steps, and if he is still stuck we book a teacher for half an hour.”
            </blockquote>
            <figcaption className="mt-3 text-[12.5px] text-[var(--muted)]">
              <strong className="font-semibold text-[var(--ink)]">Priya Sharma</strong> · Parent, Class 7, Pune
            </figcaption>
          </figure>
        </div>
      </aside>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
