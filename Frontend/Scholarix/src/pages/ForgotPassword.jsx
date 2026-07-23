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
import { resetPassword } from "../service/Api";

// ─────────────────────────────────────────────────────────
// LEFT PANEL ILLUSTRATION
// A simple inline SVG key icon with brand colours.
// ─────────────────────────────────────────────────────────

function KeyIllustration() {
  return (
    <div className="auth-left__illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="auth-panel-svg"
      >
        <circle cx="140" cy="100" r="75" fill="rgba(255,255,255,0.03)" />
        <circle cx="140" cy="100" r="52" fill="rgba(255,255,255,0.04)" />

        <circle
          cx="108" cy="88"
          r="34"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="108" cy="88"
          r="16"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="6"
          fill="none"
        />

        <rect
          x="136" y="83"
          width="82" height="10"
          rx="5"
          fill="rgba(255,255,255,0.18)"
        />

        <rect x="170" y="93" width="8"  height="14" rx="3" fill="rgba(255,255,255,0.16)" />
        <rect x="188" y="93" width="8"  height="18" rx="3" fill="rgba(255,255,255,0.16)" />
        <rect x="206" y="93" width="8"  height="11" rx="3" fill="rgba(255,255,255,0.16)" />

        <circle cx="108" cy="88" r="6" fill="#F5C842" opacity="0.9" />

        <rect x="24" y="40" width="82" height="34" rx="8"
          fill="rgba(255,255,255,0.07)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <text x="38" y="55" fill="#F5C842" fontSize="9" fontWeight="700"
          fontFamily="Space Grotesk, sans-serif">Instant</text>
        <text x="38" y="67" fill="rgba(255,255,255,0.4)" fontSize="7.5"
          fontFamily="Inter, sans-serif">DB update</text>

        <rect x="174" y="128" width="78" height="34" rx="8"
          fill="rgba(255,255,255,0.07)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <text x="188" y="143" fill="#F5C842" fontSize="9" fontWeight="700"
          fontFamily="Space Grotesk, sans-serif">Secure</text>
        <text x="188" y="155" fill="rgba(255,255,255,0.4)" fontSize="7.5"
          fontFamily="Inter, sans-serif">encrypted</text>

        <rect x="24" y="128" width="80" height="34" rx="8"
          fill="rgba(255,255,255,0.07)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <text x="38" y="143" fill="#F5C842" fontSize="9" fontWeight="700"
          fontFamily="Space Grotesk, sans-serif">Your data</text>
        <text x="38" y="155" fill="rgba(255,255,255,0.4)" fontSize="7.5"
          fontFamily="Inter, sans-serif">stays safe</text>

        <circle cx="106" cy="40"  r="2.5" fill="#F5C842" opacity="0.4" />
        <circle cx="104" cy="128" r="2.5" fill="#F5C842" opacity="0.4" />
        <circle cx="174" cy="138" r="2.5" fill="#F5C842" opacity="0.4" />
      </svg>
    </div>
  );
}

function LeftPanel() {
  return (
    <div className="auth-left auth-left--light">
      <a href="/" className="auth-logo" aria-label="Back to Scholarix home">
        <span className="auth-logo__mark" aria-hidden="true">SX</span>
        <span className="auth-logo__text">Scholarix</span>
      </a>

      <div className="auth-left__body">
        <p className="auth-left__eyebrow">Account recovery</p>

        <h1 className="auth-left__heading">
          Happens to<br />
          <span className="auth-left__heading-accent">everyone.</span>
        </h1>

        <p className="auth-left__sub">
          Set a new password instantly. Your profile and applications remain completely safe.
        </p>

        <KeyIllustration />

        <blockquote className="auth-left__quote">
          <p className="auth-left__quote-text">
            "I reset my password in seconds and got right back to completing my applications."
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

function StateRequest({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = {};
    if (!email.trim()) {
      errs.email = "Please enter your registered email address.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }

    if (!newPassword) {
      errs.newPassword = "Please enter a new password.";
    } else if (newPassword.length < 6) {
      errs.newPassword = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setGlobalError("");
    setLoading(true);

    try {
      await resetPassword({ email, newPassword });
      setLoading(false);
      onSuccess(email);
    } catch (err) {
      setLoading(false);
      setGlobalError(
        err.response?.data?.message || "Failed to reset password. Please check your email."
      );
    }
  }

  return (
    <div className="auth-form-panel">
      <a href="/login" className="auth-back-link" aria-label="Return to sign in page">
        ← Back to sign in
      </a>

      <h2 className="auth-form__heading">Reset your password</h2>
      <p className="auth-form__sub">
        Enter your registered email and choose a new password.
      </p>

      {globalError && (
        <div className="auth-alert auth-alert--error" role="alert">
          <span aria-hidden="true">⚠</span> {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate aria-label="Password reset form">
        {/* Email field */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="fp-email">
            Registered Email Address
          </label>
          <div className="auth-field__wrap">
            <span className="auth-field__icon" aria-hidden="true">✉</span>
            <input
              id="fp-email"
              type="email"
              className={`auth-field__input auth-field__input--icon ${
                errors.email ? "auth-field__input--error" : ""
              }`}
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                setGlobalError("");
              }}
              autoComplete="email"
              autoFocus
            />
          </div>
          {errors.email && (
            <p className="auth-field__error" role="alert">{errors.email}</p>
          )}
        </div>

        {/* New Password field */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="fp-new-password">
            New Password
          </label>
          <div className="auth-field__wrap">
            <span className="auth-field__icon" aria-hidden="true">🔒</span>
            <input
              id="fp-new-password"
              type={showPass ? "text" : "password"}
              className={`auth-field__input auth-field__input--icon ${
                errors.newPassword ? "auth-field__input--error" : ""
              }`}
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: "" }));
                setGlobalError("");
              }}
              autoComplete="new-password"
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
          {errors.newPassword && (
            <p className="auth-field__error" role="alert">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password field */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="fp-confirm-password">
            Confirm New Password
          </label>
          <div className="auth-field__wrap">
            <span className="auth-field__icon" aria-hidden="true">🔒</span>
            <input
              id="fp-confirm-password"
              type={showPass ? "text" : "password"}
              className={`auth-field__input auth-field__input--icon ${
                errors.confirmPassword ? "auth-field__input--error" : ""
              }`}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                setGlobalError("");
              }}
              autoComplete="new-password"
            />
          </div>
          {errors.confirmPassword && (
            <p className="auth-field__error" role="alert">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="auth-btn auth-btn--primary auth-btn--full"
          disabled={loading}
          aria-busy={loading}
          style={{ marginTop: "16px" }}
        >
          {loading ? (
            <span className="auth-btn__loading">
              <span className="auth-spinner" aria-hidden="true" />
              Updating password in database…
            </span>
          ) : (
            "Update Password →"
          )}
        </button>
      </form>

      <p className="auth-switch" style={{ marginTop: "16px" }}>
        Remembered it?{" "}
        <a href="/login" className="auth-switch__link">Sign in instead</a>
      </p>
    </div>
  );
}

function StateSent({ email }) {
  return (
    <div className="auth-form-panel">
      <div className="fp-sent-icon" aria-hidden="true">
        <span>✅</span>
      </div>

      <h2 className="auth-form__heading">Password Updated!</h2>

      <p className="auth-form__sub">
        The password for <strong className="fp-email-highlight">{email}</strong> has been successfully updated in PostgreSQL.
      </p>

      <div className="auth-alert auth-alert--success" role="status" style={{ marginTop: "16px" }}>
        <span aria-hidden="true">✓</span> Your account is now secured with your new password.
      </div>

      <a
        href="/login"
        className="auth-btn auth-btn--primary auth-btn--full"
        style={{ marginTop: "24px", textAlign: "center", textDecoration: "none" }}
      >
        Sign in now →
      </a>
    </div>
  );
}

export default function ForgotPassword() {
  const [view, setView] = useState("request");
  const [email, setEmail] = useState("");

  return (
    <div className="auth-root">
      <LeftPanel />

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
          <StateSent email={email} />
        )}
      </main>
    </div>
  );
}