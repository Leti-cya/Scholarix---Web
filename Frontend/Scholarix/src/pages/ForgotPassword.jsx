/**
 * ForgotPassword.jsx
 * ─────────────────────────────────────────────────────────
 * Location: src/pages/ForgotPassword.jsx
 *
 * Step 1 of the password-recovery flow: the user proves they own the
 * account's inbox before a password can be changed.
 *
 *   "request" — Single email field. Submitting asks the backend to email
 *               a reset link (if the account exists). The response is
 *               always generic, so this page can't be used to check
 *               whether an email is registered.
 *
 *   "sent"    — Confirmation that a link was sent, with a resend option.
 *
 * Clicking the emailed link takes the user to /reset-password?token=xxx
 * (ResetPassword.jsx), which validates the token and lets them set a new
 * password. Only that page can actually change the password — this page
 * never collects one.
 */

import React, { useState } from "react";
import "./Auth.css";
import { forgotPassword } from "../service/Api";
import ThemeToggle from "../component/ThemeToggle";

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
          We'll email you a secure link to reset your password. Your profile and applications stay completely safe.
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
      await forgotPassword(email);
      setLoading(false);
      onSuccess(email);
    } catch (err) {
      setLoading(false);
      setGlobalError(
        err.response?.data?.message || "Something went wrong. Please try again."
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
        Enter your registered email and we'll send you a link to reset your password.
      </p>

      {globalError && (
        <div className="auth-alert auth-alert--error" role="alert">
          <span aria-hidden="true">⚠</span> {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate aria-label="Password reset request form">
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
              Sending reset link…
            </span>
          ) : (
            "Send Reset Link →"
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

function StateSent({ email, onResend, resending }) {
  return (
    <div className="auth-form-panel">
      <div className="fp-sent-icon" aria-hidden="true">
        <span>📬</span>
      </div>

      <h2 className="auth-form__heading">Check your email</h2>

      <p className="auth-form__sub">
        If an account exists for <strong className="fp-email-highlight">{email}</strong>, we've sent a link to reset your password. The link expires in 1 hour.
      </p>

      <div className="auth-alert auth-alert--success" role="status" style={{ marginTop: "16px" }}>
        <span aria-hidden="true">✓</span> Click the link in the email to choose a new password.
      </div>

      <button
        type="button"
        className="auth-btn auth-btn--outline auth-btn--full"
        style={{ marginTop: "20px" }}
        onClick={onResend}
        disabled={resending}
      >
        {resending ? "Resending…" : "Didn't get it? Resend link"}
      </button>

      <a
        href="/login"
        className="auth-btn auth-btn--primary auth-btn--full"
        style={{ marginTop: "12px", textAlign: "center", textDecoration: "none" }}
      >
        Back to sign in →
      </a>
    </div>
  );
}

export default function ForgotPassword() {
  const [view, setView] = useState("request");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);

  async function handleResend() {
    try {
      setResending(true);
      await forgotPassword(email);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-root">
      <ThemeToggle style={{ position: "fixed", top: 20, right: 20, zIndex: 50 }} />
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
          <StateSent email={email} onResend={handleResend} resending={resending} />
        )}
      </main>
    </div>
  );
}
