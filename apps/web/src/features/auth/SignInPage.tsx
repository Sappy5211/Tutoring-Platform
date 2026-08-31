import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@vidya/ui";

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) { setError("Enter your email and password to continue."); return; }
    setError(null);
    // Mock only - no auth is wired. P0.5 owns the real session.
    navigate("/app/home");
  };

  return (
    <div className="auth">
      <section className="auth__panel">
        <div className="auth__form-wrap">
          <Link to="/" className="auth__brand">
            <span className="brand__mark">V</span>
            <span>VIDYA</span>
          </Link>

          <h1>Welcome back</h1>
          <p className="auth__lede">Pick up where you left off — your plan, progress and streak are saved.</p>

          <form onSubmit={submit} noValidate>
            <label className="auth__field">
              <span>Email address</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(error) || undefined}
              />
            </label>

            <label className="auth__field">
              <span>Password</span>
              <div className="auth__password">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(error) || undefined}
                />
                <button
                  type="button"
                  className="auth__reveal"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="auth__row">
              <label className="auth__check">
                <input type="checkbox" defaultChecked />
                <span>Keep me signed in</span>
              </label>
              <Link to="/reset-password" className="auth__link">Reset password</Link>
            </div>

            {error && <p className="auth__error" role="alert">{error}</p>}

            <Button type="submit" className="auth__submit">Sign in</Button>
          </form>

          <div className="auth__divider"><span>Or continue with</span></div>

          <button type="button" className="auth__oauth">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
              <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.6c-.1 1.1-.9 2.8-2.5 3.9l3.8 3c2.3-2.1 3.6-5.2 3.6-8.8z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.8-3c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5l-4 3.1C3.2 21.3 7.3 24 12 24z" />
              <path fill="#FBBC05" d="M5.2 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3l-4-3.1C.4 8.2 0 10 0 12s.4 3.8 1.2 5.4l4-3.1z" />
              <path fill="#EA4335" d="M12 4.8c2.3 0 3.8.9 4.7 1.8l3.4-3.3C18 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.6l4 3.1C6.1 6.8 8.8 4.8 12 4.8z" />
            </svg>
            Continue with Google
          </button>

          <p className="auth__foot">
            New to VIDYA? <Link to="/onboarding" className="auth__link">Create an account</Link>
          </p>
          {/* DPDP Act 2023: a minor's account needs verifiable guardian consent,
              so the signup path must say so before it is entered, not after. */}
          <p className="auth__consent">
            <ShieldCheck size={14} aria-hidden />
            Students under 18 need a parent or guardian to confirm the account.
          </p>
        </div>
      </section>

      <aside className="auth__aside" aria-label="About VIDYA">
        <div className="auth__art" aria-hidden />
        <figure className="auth__quote">
          <img src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%23216d5a'/%3E%3Ctext x='32' y='42' font-family='Inter,sans-serif' font-size='26' font-weight='700' fill='white' text-anchor='middle'%3EPS%3C/text%3E%3C/svg%3E" alt="" width={48} height={48} />
          <figcaption>
            <strong>Priya Sharma</strong>
            <span>Parent · Class 7, Pune</span>
            <blockquote>
              “He stopped guessing. When he gets something wrong it shows him the
              steps, and if he is still stuck we book a teacher for half an hour.”
            </blockquote>
          </figcaption>
        </figure>
      </aside>
    </div>
  );
}
