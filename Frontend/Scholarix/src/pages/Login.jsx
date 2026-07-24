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
import ThemeToggle from "../component/ThemeToggle";

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



    </form>
  );
}

/**
 * SuccessScreen
 * Temporary dev-only screen. In production: useNavigate() replaces this.
 */
function SuccessScreen({ role }) {
  const destination = role === "provider" ? "/provider/dashboard" : role === "admin" ? "/admin/dashboard" : "/dashboard";
  const label       = role === "provider" ? "Provider Dashboard" : role === "admin" ? "Admin Dashboard" : "Student Dashboard";

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
  // The server's actual returned role — may differ from the selected tab
  // above (e.g. an admin account signing in), so the success screen and
  // redirect must key off this, not the tab.
  const [loggedInRole, setLoggedInRole] = useState(null);

  const navigate = useNavigate();

  function handleSuccess(actualRole) {
    setLoggedInRole(actualRole);
    setSuccess(true);
    setTimeout(() => {
      if (actualRole === "provider") {
        navigate("/provider/dashboard");
      } else if (actualRole === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }, 1000);
  }

  return (
    <div className="auth-root">
      <ThemeToggle style={{ position: "fixed", top: 20, right: 20, zIndex: 50 }} />

      {/* Left: lighter panel with illustration */}
      <LeftPanel role={role} />

      {/* Right: form */}
      <main className="auth-right" aria-label="Sign in to Scholarix">

        {success ? (
          <SuccessScreen role={loggedInRole} />
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