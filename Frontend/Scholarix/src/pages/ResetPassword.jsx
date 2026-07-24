/**
 * ResetPassword.jsx
 * ─────────────────────────────────────────────────────────
 * Location: src/pages/ResetPassword.jsx
 *
 * Step 2 of the password-recovery flow, reached via the link emailed by
 * ForgotPassword.jsx (/reset-password?token=xxx).
 *
 * States:
 *   checking — validating the token with the backend before showing a form
 *   form     — token is valid; user enters + confirms a new password
 *   invalid  — token missing / invalid / expired; offers to request a new link
 *   done     — password updated; link to sign in
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { verifyResetToken, resetPassword } from "../service/Api";
import ThemeToggle from "../component/ThemeToggle";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("checking"); // checking | form | invalid | done
  const [invalidMessage, setInvalidMessage] = useState("This reset link is invalid or has expired.");
  const [token, setToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");

    if (!t) {
      setStage("invalid");
      setInvalidMessage("No reset token was provided in the link.");
      return;
    }

    setToken(t);

    (async () => {
      try {
        await verifyResetToken(t);
        setStage("form");
      } catch (err) {
        setStage("invalid");
        setInvalidMessage(
          err.response?.data?.message || "This reset link is invalid or has expired."
        );
      }
    })();
  }, []);

  function validate() {
    const errs = {};
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
      await resetPassword({ token, newPassword });
      setLoading(false);
      setStage("done");
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || "Failed to reset password. Please try again.";
      // A token that expired between the initial check and submission — send back to "invalid".
      if (err.response?.status === 400 && /expired|invalid/i.test(message)) {
        setStage("invalid");
        setInvalidMessage(message);
      } else {
        setGlobalError(message);
      }
    }
  }

  return (
    <div className="auth-root auth-root--single">
      <ThemeToggle style={{ position: "fixed", top: 20, right: 20, zIndex: 50 }} />
      <main className="auth-right" aria-label="Reset password">
        {stage === "checking" && (
          <div className="auth-form-panel auth-form-panel--centered" style={{ maxWidth: "440px" }}>
            <div className="auth-success-circle" aria-hidden="true">⏳</div>
            <h2 className="auth-form__heading">Checking your link…</h2>
            <p className="auth-form__sub">Just a moment while we verify your reset link.</p>
          </div>
        )}

        {stage === "invalid" && (
          <div className="auth-form-panel auth-form-panel--centered" style={{ maxWidth: "440px" }}>
            <div className="auth-success-circle" aria-hidden="true">⚠️</div>
            <h2 className="auth-form__heading">Link invalid or expired</h2>
            <p className="auth-form__sub">{invalidMessage}</p>
            <div className="auth-success-actions" style={{ marginTop: "24px" }}>
              <button
                className="auth-btn auth-btn--primary auth-btn--full"
                onClick={() => navigate("/forgot-password")}
              >
                Request a new link
              </button>
              <button
                className="auth-btn auth-btn--outline auth-btn--full"
                onClick={() => navigate("/login")}
              >
                Back to sign in
              </button>
            </div>
          </div>
        )}

        {stage === "form" && (
          <div className="auth-form-panel">
            <h2 className="auth-form__heading">Choose a new password</h2>
            <p className="auth-form__sub">Your link checked out — set a new password for your account.</p>

            {globalError && (
              <div className="auth-alert auth-alert--error" role="alert">
                <span aria-hidden="true">⚠</span> {globalError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate aria-label="New password form">
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="rp-new-password">
                  New Password
                </label>
                <div className="auth-field__wrap">
                  <span className="auth-field__icon" aria-hidden="true">🔒</span>
                  <input
                    id="rp-new-password"
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
                    autoFocus
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

              <div className="auth-field">
                <label className="auth-field__label" htmlFor="rp-confirm-password">
                  Confirm New Password
                </label>
                <div className="auth-field__wrap">
                  <span className="auth-field__icon" aria-hidden="true">🔒</span>
                  <input
                    id="rp-confirm-password"
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
                    Updating password…
                  </span>
                ) : (
                  "Update Password →"
                )}
              </button>
            </form>

            <p className="auth-switch" style={{ marginTop: "16px" }}>
              <a href="/login" className="auth-switch__link">← Back to sign in</a>
            </p>
          </div>
        )}

        {stage === "done" && (
          <div className="auth-form-panel auth-form-panel--centered" style={{ maxWidth: "440px" }}>
            <div className="auth-success-circle" aria-hidden="true">✅</div>
            <h2 className="auth-form__heading">Password updated!</h2>
            <p className="auth-form__sub">
              Your password has been changed successfully. You can now sign in with your new password.
            </p>
            <div className="auth-success-actions" style={{ marginTop: "24px" }}>
              <button
                className="auth-btn auth-btn--primary auth-btn--full"
                onClick={() => navigate("/login")}
              >
                Sign in now →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
