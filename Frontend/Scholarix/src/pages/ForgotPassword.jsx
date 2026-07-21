/**
 * ForgotPassword.jsx  (refined)
 * ─────────────────────────────────────────────────────────
 * Location: src/pages/ForgotPassword.jsx
 *
 * Simplified from v1's 4-step flow to 2 focused states:
 *
 *   "request" — Single email field + Send Reset Link button.
 *               Shows inline validation error if email is
 *               empty or malformed.
 *
 *   "sent"    — Clean success confirmation. Shows the email
 *               address that was used, a resend option, and
 *               a back-to-login link.
 *
 * The separate "reset" and "done" steps have been removed
 * from this page. In production, clicking the emailed link
 * would navigate to /reset-password?token=xxx — a separate
 * page with its own form. Keeping concerns separate makes
 * each page easier to maintain and explain.
 *
 * Left panel: matches the lighter .auth-left--light variant
 * from Login — short heading, one sentence, no feature list.
 * A minimal decorative key illustration replaces the old
 * feature bullets.
 *
 * Design tokens: identical to Login + SignUp via Auth.css.
 * No backend code — API call simulated with setTimeout.
 */

import React, { useState } from "react";
import "./Auth.css";

// ─────────────────────────────────────────────────────────
// LEFT PANEL ILLUSTRATION
// A simple inline SVG key icon with brand colours.
// Keeps the left panel visually interesting without adding
// text density. The key metaphor fits "account recovery".
// ─────────────────────────────────────────────────────────

/**
 * KeyIllustration
 * Minimal decorative SVG — a stylised key with gold accents.
 * Replace with an imported .svg asset in production if needed.
 */
function KeyIllustration() {
  return (
    <div className="auth-left__illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="auth-panel-svg"
      >
        {/* Background glow rings */}
        <circle cx="140" cy="100" r="75" fill="rgba(255,255,255,0.03)" />
        <circle cx="140" cy="100" r="52" fill="rgba(255,255,255,0.04)" />

        {/* Key bow (circular head) */}
        <circle
          cx="108" cy="88"
          r="34"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="10"
          fill="none"
        />
        {/* Key bow inner hole */}
        <circle
          cx="108" cy="88"
          r="16"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="6"
          fill="none"
        />

        {/* Key shaft */}
        <rect
          x="136" y="83"
          width="82" height="10"
          rx="5"
          fill="rgba(255,255,255,0.18)"
        />

        {/* Key teeth */}
        <rect x="170" y="93" width="8"  height="14" rx="3" fill="rgba(255,255,255,0.16)" />
        <rect x="188" y="93" width="8"  height="18" rx="3" fill="rgba(255,255,255,0.16)" />
        <rect x="206" y="93" width="8"  height="11" rx="3" fill="rgba(255,255,255,0.16)" />

        {/* Gold accent dot on bow */}
        <circle cx="108" cy="88" r="6" fill="#F5C842" opacity="0.9" />

        {/* Floating chip: "60 min" expiry */}
        <rect x="24" y="40" width="82" height="34" rx="8"
          fill="rgba(255,255,255,0.07)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <text x="38" y="55" fill="#F5C842" fontSize="9" fontWeight="700"
          fontFamily="Space Grotesk, sans-serif">60 min</text>
        <text x="38" y="67" fill="rgba(255,255,255,0.4)" fontSize="7.5"
          fontFamily="Inter, sans-serif">link expires</text>

        {/* Floating chip: "Secure" */}
        <rect x="174" y="128" width="78" height="34" rx="8"
          fill="rgba(255,255,255,0.07)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <text x="188" y="143" fill="#F5C842" fontSize="9" fontWeight="700"
          fontFamily="Space Grotesk, sans-serif">Secure</text>
        <text x="188" y="155" fill="rgba(255,255,255,0.4)" fontSize="7.5"
          fontFamily="Inter, sans-serif">encrypted</text>

        {/* Floating chip: "Safe" */}
        <rect x="24" y="128" width="80" height="34" rx="8"
          fill="rgba(255,255,255,0.07)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <text x="38" y="143" fill="#F5C842" fontSize="9" fontWeight="700"
          fontFamily="Space Grotesk, sans-serif">Your data</text>
        <text x="38" y="155" fill="rgba(255,255,255,0.4)" fontSize="7.5"
          fontFamily="Inter, sans-serif">stays safe</text>

        {/* Connector dots */}
        <circle cx="106" cy="40"  r="2.5" fill="#F5C842" opacity="0.4" />
        <circle cx="104" cy="128" r="2.5" fill="#F5C842" opacity="0.4" />
        <circle cx="174" cy="138" r="2.5" fill="#F5C842" opacity="0.4" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LEFT PANEL
// ─────────────────────────────────────────────────────────

/**
 * LeftPanel
 * Matches the Login page's lighter treatment exactly:
 *   · .auth-left--light gradient (not full dark navy)
 *   · Heading + one-sentence sub only (no feature list)
 *   · KeyIllustration fills the visual space
 *   · Short reassurance quote at the bottom
 *
 * Refinement rationale: The old left panel had 3 feature
 * bullets + a full quote. On a password-reset page the user
 * is anxious and wants to act fast — less text, more calm.
 */
function LeftPanel() {
  return (
    <div className="auth-left auth-left--light">

      {/* Logo */}
      <a href="/" className="auth-logo" aria-label="Back to Scholarix home">
        <span className="auth-logo__mark" aria-hidden="true">SX</span>
        <span className="auth-logo__text">Scholarix</span>
      </a>

      <div className="auth-left__body">

        {/* Eyebrow */}
        <p className="auth-left__eyebrow">Account recovery</p>

        {/*
         * Short, human heading.
         * "Happens to everyone." → reassuring, not clinical.
         * Last line in gold italic — matches Login/SignUp pattern.
         */}
        <h1 className="auth-left__heading">
          Happens to<br />
          <span className="auth-left__heading-accent">everyone.</span>
        </h1>

        {/* Single supporting sentence — no feature list */}
        <p className="auth-left__sub">
          We'll get you back in quickly. Your applications and profile are completely safe.
        </p>

        {/* Key illustration — fills the visual space */}
        <KeyIllustration />

        {/* Short quote — one social-proof signal is enough */}
        <blockquote className="auth-left__quote">
          <p className="auth-left__quote-text">
            "I forgot my password during application season and Scholarix had me back in two minutes."
          </p>
          <footer className="auth-left__quote-footer">
            <span className="auth-left__quote-author">Priya S.</span>
            <span className="auth-left__quote-role">MSc Data Science · Imperial College London</span>
          </footer>
        </blockquote>

      </div>

      <p className="auth-left__foot">© 2026 Scholarix Inc.</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// STATE: REQUEST
// ─────────────────────────────────────────────────────────

/**
 * StateRequest
 * The primary form state.
 *
 * Refinements from v1:
 *   · Icon badge removed — added visual noise without meaning
 *   · Heading shortened to one line: "Reset your password"
 *   · Sub-text trimmed to one sentence
 *   · Error appears inline below the field (not as a banner)
 *   · "Remembered it?" switch link kept — useful escape hatch
 */
function StateRequest({ onSuccess }) {
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // ── Validation ────────────────────────────────────────
  function validate() {
    if (!email.trim())
      return "Please enter your email address.";
    if (!/\S+@\S+\.\S+/.test(email))
      return "That doesn't look like a valid email address.";
    return "";
  }

  // ── Submit ────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");
    setLoading(true);

    /*
     * Simulated POST /auth/forgot-password
     * In production: replace with real fetch() call.
     * On success the API returns 200 regardless of whether
     * the email exists (security best practice — never
     * confirm whether an account exists).
     */
    setTimeout(() => {
      setLoading(false);
      onSuccess(email); // carry the email to the sent state
    }, 1400);
  }

  return (
    <div className="auth-form-panel">

      {/* Back link — always visible, keyboard accessible */}
      <a href="/login" className="auth-back-link" aria-label="Return to sign in page">
        ← Back to sign in
      </a>

      <h2 className="auth-form__heading">Reset your password</h2>
      <p className="auth-form__sub">
        Enter your account email and we'll send a secure reset link.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Password reset form"
      >

        {/* ── Email field ──────────────────────────────── */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="fp-email">
            Email address
          </label>
          <div className="auth-field__wrap">
            <span className="auth-field__icon" aria-hidden="true">✉</span>
            <input
              id="fp-email"
              type="email"
              className={`auth-field__input auth-field__input--icon ${
                error ? "auth-field__input--error" : ""
              }`}
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(""); // clear error as user types
              }}
              autoComplete="email"
              autoFocus
              aria-describedby={error ? "fp-email-err" : undefined}
              aria-invalid={!!error}
            />
          </div>

          {/*
           * Inline error — sits directly under the field.
           * role="alert" announces it immediately to screen readers.
           */}
          {error && (
            <p
              id="fp-email-err"
              className="auth-field__error"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        {/* ── Submit button ────────────────────────────── */}
        <button
          type="submit"
          className="auth-btn auth-btn--primary auth-btn--full"
          disabled={loading}
          aria-busy={loading}
          style={{ marginTop: "8px" }}
        >
          {loading ? (
            <span className="auth-btn__loading">
              <span className="auth-spinner" aria-hidden="true" />
              Sending reset link…
            </span>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>

      {/* Switch link — single, at the bottom */}
      <p className="auth-switch">
        Remembered it?{" "}
        <a href="/login" className="auth-switch__link">Sign in instead</a>
      </p>

    </div>
  );
}

// ─────────────────────────────────────────────────────────
// STATE: SENT (success)
// ─────────────────────────────────────────────────────────

/**
 * StateSent
 * Clean confirmation screen shown after the reset email
 * is dispatched.
 *
 * Refinements from v1:
 *   · Removed the numbered step list (too instructional)
 *   · Kept the resend button — genuinely useful
 *   · Resent confirmation uses a subtle success inline alert
 *     rather than a separate banner component
 *   · "Demo: I clicked the link" shortcut removed — the
 *     reset form is now a separate page (/reset-password)
 *   · Spacing is tighter; fewer words, more white space
 */
function StateSent({ email, onResend }) {
  const [resent,         setResent]         = useState(false);
  const [resendLoading,  setResendLoading]  = useState(false);

  function handleResend() {
    setResendLoading(true);
    /*
     * Simulated resend — in production: POST /auth/forgot-password
     * again with the same email address.
     */
    setTimeout(() => {
      setResendLoading(false);
      setResent(true);
      onResend();
      // Auto-clear the "resent" confirmation after 5 s
      setTimeout(() => setResent(false), 5000);
    }, 1000);
  }

  return (
    <div className="auth-form-panel">

      {/* Large success icon — centred, immediately reassuring */}
      <div className="fp-sent-icon" aria-hidden="true">
        <span>📬</span>
      </div>

      <h2 className="auth-form__heading">Check your inbox</h2>

      {/*
       * Show the actual email address — prevents the user from
       * wondering "which email did I use?"
       */}
      <p className="auth-form__sub">
        We've sent a reset link to{" "}
        <strong className="fp-email-highlight">{email}</strong>.
        It expires in 60 minutes.
      </p>

      {/* Resent confirmation — only shown after resend is clicked */}
      {resent && (
        <div className="auth-alert auth-alert--success" role="status">
          <span aria-hidden="true">✓</span>{" "}
          Reset link resent to {email}
        </div>
      )}

      {/* ── Resend button ────────────────────────────── */}
      <button
        type="button"
        className="auth-btn auth-btn--outline auth-btn--full"
        onClick={handleResend}
        disabled={resendLoading}
        aria-busy={resendLoading}
        style={{ marginTop: "4px" }}
      >
        {resendLoading ? (
          <span className="auth-btn__loading">
            <span className="auth-spinner auth-spinner--dark" aria-hidden="true" />
            Resending…
          </span>
        ) : (
          "Resend email"
        )}
      </button>

      {/* Spam folder hint — small, unobtrusive */}
      <p className="fp-hint">
        Can't find it? Check your spam folder.
      </p>

      {/* Back to sign in */}
      <p className="auth-switch" style={{ marginTop: "12px" }}>
        <a href="/login" className="auth-switch__link">← Back to sign in</a>
      </p>

    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────

/**
 * ForgotPassword  (refined)
 * ─────────────────────────────────────────────────────────
 * Two states only:
 *   "request" — email input + send button
 *   "sent"    — success confirmation + resend
 *
 * The "reset" and "done" states from v1 live on a separate
 * /reset-password page (not generated here) that reads
 * the token from the URL query string.
 *
 * State:
 *   view  — "request" | "sent"
 *   email — carried from request to sent for display
 */
export default function ForgotPassword() {
  const [view,  setView]  = useState("request"); // "request" | "sent"
  const [email, setEmail] = useState("");

  return (
    <div className="auth-root">

      {/* Left: lighter brand panel */}
      <LeftPanel />

      {/* Right: active state */}
      <main className="auth-right" aria-label="Password recovery">

        {view === "request" && (
          <StateRequest
            onSuccess={(em) => {
              setEmail(em);
              setView("sent");
            }}
          />
        )}

        {view === "sent" && (
          <StateSent
            email={email}
            onResend={() => {
              /* In production: re-call the API */
            }}
          />
        )}

      </main>
    </div>
  );
}