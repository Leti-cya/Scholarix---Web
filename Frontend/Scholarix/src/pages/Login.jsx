/**
 * Login.jsx  (refined)
 * ─────────────────────────────────────────────────────────
 * Location: src/pages/Login.jsx
 *
 * Refinements from v1:
 *   · Left panel content cut by ~50% — heading, sub-text,
 *     and one quote only. Feature bullet list removed.
 *   · Generic "Welcome back" copy replaced with
 *     scholarship-focused messaging per role.
 *   · Removed the duplicate "New to Scholarix?" link that
 *     appeared both in the sub-heading and at the bottom
 *     of the form. Only the sub-heading version remains.
 *   · Left panel now uses a lighter gradient and a subtle
 *     SVG illustration instead of a heavy dark block.
 *
 * Everything else — layout, form logic, validation, tabs —
 * is unchanged from the previously generated version.
 */

import React, { useState } from "react";
import "./Auth.css";
import { loginUser } from "../service/Api";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────

/**
 * LEFT_COPY
 * ─────────────────────────────────────────────────────────
 * Scholarship-focused copy for each role.
 *
 * Refinement: removed heading + four feature bullets + full
 * quote block — too much. Now: heading + one sentence + one
 * short quote. The illustration fills the visual space.
 */
const LEFT_COPY = {
  student: {
    eyebrow: "Student portal",
    heading: "Discover scholarships\nthat match your\nfuture.",
    sub: "Your matches, deadlines, and applications are ready for you.",
    quote: {
      text: "I logged in one morning and had two award notifications waiting. Scholarix genuinely changed everything.",
      author: "Aisha Kamara",
      role: "MSc Economics · LSE",
    },
  },
  provider: {
    eyebrow: "Provider portal",
    heading: "Support talented\nstudents through\nmeaningful opportunities.",
    sub: "Your applicant pipeline, analytics, and programme tools are one click away.",
    quote: {
      text: "The quality of matched applicants on Scholarix is genuinely outstanding. Our review time dropped by 60%.",
      author: "Dr. James Osei",
      role: "Head of Programmes · Aga Khan Foundation",
    },
  },
};

// ─────────────────────────────────────────────────────────
// PANEL ILLUSTRATION
// Inline SVG — scholarship cap + stat chips.
// Replaces the heavy feature-bullet list with a visual
// that adds warmth and brand character without density.
// ─────────────────────────────────────────────────────────

/**
 * PanelIllustration
 * A lightweight inline SVG: graduation cap silhouette with
 * three orbiting gold stat chips (scholarships, students, funds).
 * Accent colour shifts per role: gold (student), teal (provider).
 */
function PanelIllustration({ role }) {
  const accent = role === "provider" ? "#1ABCAD" : "#F5C842";

  return (
    <div className="auth-left__illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="auth-panel-svg"
      >
        {/* Background glow rings */}
        <circle cx="140" cy="100" r="80" fill="rgba(255,255,255,0.04)" />
        <circle cx="140" cy="100" r="58" fill="rgba(255,255,255,0.04)" />

        {/* Graduation cap — mortarboard top diamond */}
        <polygon
          points="140,42  196,68  140,94  84,68"
          fill="rgba(255,255,255,0.16)"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.5"
        />
        {/* Cap body */}
        <path
          d="M100 78 L100 108 Q140 124 180 108 L180 78 Q140 94 100 78Z"
          fill="rgba(255,255,255,0.09)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.5"
        />
        {/* Tassel */}
        <line x1="196" y1="68" x2="196" y2="104" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        <circle cx="196" cy="109" r="5" fill={accent} />
        <line x1="192" y1="109" x2="188" y2="123" stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <line x1="196" y1="111" x2="196" y2="125" stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <line x1="200" y1="109" x2="204" y2="123" stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

        {/* Stat chip: top-left */}
        <rect x="18" y="28" width="78" height="34" rx="8"
          fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
        <text x="32" y="42" fill={accent} fontSize="9" fontWeight="700"
          fontFamily="Space Grotesk, sans-serif">18,400+</text>
        <text x="32" y="55" fill="rgba(255,255,255,0.45)" fontSize="7.5"
          fontFamily="Inter, sans-serif">Scholarships</text>

        {/* Stat chip: bottom-left */}
        <rect x="12" y="138" width="74" height="34" rx="8"
          fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
        <text x="26" y="152" fill={accent} fontSize="9" fontWeight="700"
          fontFamily="Space Grotesk, sans-serif">120K+</text>
        <text x="26" y="165" fill="rgba(255,255,255,0.45)" fontSize="7.5"
          fontFamily="Inter, sans-serif">Students</text>

        {/* Stat chip: right */}
        <rect x="192" y="138" width="72" height="34" rx="8"
          fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
        <text x="205" y="152" fill={accent} fontSize="9" fontWeight="700"
          fontFamily="Space Grotesk, sans-serif">$4.2B</text>
        <text x="205" y="165" fill="rgba(255,255,255,0.45)" fontSize="7.5"
          fontFamily="Inter, sans-serif">Awarded</text>

        {/* Connector dots */}
        <circle cx="96"  cy="46"  r="2.5" fill={accent} opacity="0.45" />
        <circle cx="86"  cy="138" r="2.5" fill={accent} opacity="0.45" />
        <circle cx="192" cy="138" r="2.5" fill={accent} opacity="0.45" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────

/**
 * LeftPanel  (refined)
 * ─────────────────────────────────────────────────────────
 * Reduced from 5 blocks to 3:
 *   1. Logo
 *   2. Eyebrow + heading + one-line sub
 *   3. SVG illustration + short quote
 *
 * Feature bullet list removed — unnecessary at sign-in.
 * Uses .auth-left--light for a softer background gradient.
 */
function LeftPanel({ role }) {
  const copy = LEFT_COPY[role];

  return (
    <div className="auth-left auth-left--light">

      {/* Logo */}
      <a href="/" className="auth-logo" aria-label="Back to Scholarix home">
        <span className="auth-logo__mark" aria-hidden="true">SX</span>
        <span className="auth-logo__text">Scholarix</span>
      </a>

      <div className="auth-left__body">

        {/* Eyebrow */}
        <p className="auth-left__eyebrow">{copy.eyebrow}</p>

        {/*
         * Scholarship-focused headline.
         * Last line = gold italic for visual signature.
         * Heading split by \n keeps line breaks deliberate.
         */}
        <h1 className="auth-left__heading">
          {copy.heading.split("\n").map((line, i, arr) =>
            i === arr.length - 1
              ? <span key={i} className="auth-left__heading-accent">{line}</span>
              : <span key={i}>{line}<br /></span>
          )}
        </h1>

        {/* Single supporting sentence */}
        <p className="auth-left__sub">{copy.sub}</p>

        {/* Illustration — fills visual space, adds warmth */}
        <PanelIllustration role={role} />

        {/* Short social-proof quote */}
        <blockquote className="auth-left__quote">
          <p className="auth-left__quote-text">"{copy.quote.text}"</p>
          <footer className="auth-left__quote-footer">
            <span className="auth-left__quote-author">{copy.quote.author}</span>
            <span className="auth-left__quote-role">{copy.quote.role}</span>
          </footer>
        </blockquote>

      </div>

      <p className="auth-left__foot">© 2026 Scholarix Inc.</p>
    </div>
  );
}

/**
 * RoleTabs
 * Unchanged from v1.
 */
function RoleTabs({ active, onChange }) {
  const tabs = [
    { id: "student",  label: "Student" },
    { id: "provider", label: "Provider" },
  ];

  return (
    <div className="login-tabs" role="tablist" aria-label="Account type">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          className={`login-tab ${active === tab.id ? "login-tab--active" : ""}`}
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          id={`tab-${tab.id}`}
          aria-controls={`tabpanel-${tab.id}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/**
 * LoginForm
 * All validation, field logic, and loading state unchanged.
 */
function LoginForm({ role, onSuccess }) {
  const [email, setEmail]        = useState("");
  const [password, setPassword]  = useState("");
  const [remember, setRemember]  = useState(false);
  const [showPass, setShowPass]  = useState(false);
  const [loading, setLoading]    = useState(false);
  const [errors, setErrors]      = useState({});
  const [globalError, setGlobal] = useState("");

  function validate() {
    const errs = {};
    if (!email.trim())
      errs.email = "Please enter your email address.";
    else if (!/\S+@\S+\.\S+/.test(email))
      errs.email = "That doesn't look like a valid email.";
    if (!password)
      errs.password = "Please enter your password.";
    else if (password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setGlobal("");
    setLoading(true);

    try {
      const response = await loginUser({ email, password });
      setLoading(false);
      
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      onSuccess(user.role);
    } catch (err) {
      setLoading(false);
      setGlobal(
        err.response?.data?.message ||
        "Invalid email or password. Please try again."
      );
    }
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
    if (errors.email) setErrors((p) => ({ ...p, email: "" }));
    setGlobal("");
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    if (errors.password) setErrors((p) => ({ ...p, password: "" }));
    setGlobal("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={`Sign in as ${role}`}
      id={`tabpanel-${role}`}
      role="tabpanel"
      aria-labelledby={`tab-${role}`}
    >

      {/* Global credential error */}
      {globalError && (
        <div className="auth-alert auth-alert--error" role="alert">
          <span aria-hidden="true">⚠</span> {globalError}
        </div>
      )}

      {/* Social sign-in */}
      <div className="auth-social-row">
        <button type="button" className="auth-social-btn" aria-label="Continue with Google">
          <span className="auth-social-btn__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </span>
          Continue with Google
        </button>
        <button type="button" className="auth-social-btn" aria-label="Continue with Apple">
          <span className="auth-social-btn__icon" aria-hidden="true">🍎</span>
          Continue with Apple
        </button>
      </div>

      {/* OR divider */}
      <div className="auth-divider" aria-hidden="true">
        <span>or sign in with email</span>
      </div>

      {/* Email field */}
      <div className="auth-field">
        <div className="auth-field__wrap">
          <span className="auth-field__icon" aria-hidden="true">✉</span>
          <input
            id="login-email"
            type="email"
            className={`auth-field__input auth-field__input--icon ${errors.email ? "auth-field__input--error" : ""}`}
            placeholder="you@university.edu"
            value={email}
            onChange={handleEmailChange}
            autoComplete="email"
            autoFocus
            aria-describedby={errors.email ? "login-email-err" : undefined}
            aria-invalid={!!errors.email}
          />
        </div>
        {errors.email && (
          <p id="login-email-err" className="auth-field__error" role="alert">{errors.email}</p>
        )}
      </div>

      {/* Password field */}
      <div className="auth-field">
        {/* Label on left, forgot-password on right */}
        <div className="auth-field__wrap">
          <span className="auth-field__icon" aria-hidden="true">🔒</span>
          <input
            id="login-password"
            type={showPass ? "text" : "password"}
            className={`auth-field__input auth-field__input--icon ${errors.password ? "auth-field__input--error" : ""}`}
            placeholder="Your password"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="current-password"
            aria-describedby={errors.password ? "login-pass-err" : undefined}
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            className="auth-field__toggle"
            onClick={() => setShowPass((s) => !s)}
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>
        <div className="login-pass-header">
          <a href="/forgot-password" className="auth-forgot-link">Forgot password?</a>
        </div>
        {errors.password && (
          <p id="login-pass-err" className="auth-field__error" role="alert">{errors.password}</p>
        )}
      </div>

      {/* Remember me */}
      <label className="auth-checkbox" htmlFor="login-remember">
        <input
          id="login-remember"
          type="checkbox"
          className="auth-checkbox__input"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <span className="auth-checkbox__box" aria-hidden="true" />
        <span className="auth-checkbox__label">Keep me signed in for 30 days</span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        className="auth-btn auth-btn--primary auth-btn--full"
        disabled={loading}
        aria-busy={loading}
        style={{ marginTop: "20px" }}
      >
        {loading ? (
          <span className="auth-btn__loading">
            <span className="auth-spinner" aria-hidden="true" />
            Signing you in…
          </span>
        ) : (
          `Sign in${role === "provider" ? " as Provider" : ""} →`
        )}
      </button>

      {/* Dev hint — remove before production */}
      <p className="login-demo-hint" aria-hidden="true">
        💡 Demo: type <strong>"wrong"</strong> as password to see error state
      </p>

    </form>
  );
}

/**
 * SuccessScreen
 * Temporary dev-only screen. In production: useNavigate() replaces this.
 */
function SuccessScreen({ role }) {
  const destination = role === "provider" ? "/provider/dashboard" : "/dashboard";
  const label       = role === "provider" ? "Provider Dashboard" : "Student Dashboard";

  return (
    <div className="auth-form-panel auth-form-panel--centered">
      <div className="auth-success-circle" aria-hidden="true">✓</div>
      <h2 className="auth-form__heading">You're in!</h2>
      <p className="auth-form__sub">Taking you to your {label}…</p>
      <a
        href={destination}
        className="auth-btn auth-btn--primary auth-btn--full"
        style={{ textAlign: "center", marginTop: "8px" }}
      >
        Go to {label} →
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────

/**
 * Login  (refined)
 * ─────────────────────────────────────────────────────────
 * Key change: the duplicate "New to Scholarix?" paragraph
 * that appeared at the bottom of the form has been removed.
 * One sign-up prompt only — in the sub-heading below the title.
 */
export default function Login() {
  const [role, setRole]       = useState("student");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  function handleSuccess(loggedInRole) {
    setSuccess(true);
    setTimeout(() => {
      if (loggedInRole === "provider") {
        navigate("/provider/dashboard");
      } else {
        navigate("/dashboard");
      }
    }, 1000);
  }

  return (
    <div className="auth-root">

      {/* Left: lighter panel with illustration */}
      <LeftPanel role={role} />

      {/* Right: form */}
      <main className="auth-right" aria-label="Sign in to Scholarix">

        {success ? (
          <SuccessScreen role={role} />
        ) : (
          <div className="auth-form-panel">

            <h2 className="auth-form__heading">Sign in to Scholarix</h2>

            {/*
             * Single sign-up prompt — only one on this page.
             * The duplicate bottom link from v1 has been removed.
             */}
            <p className="auth-form__sub">
              Don't have an account?{" "}
              <a href="/register" className="auth-switch__link">Create one →</a>
            </p>

            <RoleTabs active={role} onChange={setRole} />

            {/* key={role} resets form state when tab switches */}
            <LoginForm key={role} role={role} onSuccess={handleSuccess} />

          </div>
        )}

      </main>
    </div>
  );
}