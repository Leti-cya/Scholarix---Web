/**
 * VerifyEmail.jsx
 * ----------------
 * Landing page for the email-verification link
 * (/verify-email?token=xxxx).
 *
 * States:
 *   - loading : validating the token
 *   - success : email confirmed
 *   - error   : token missing / invalid / expired
 *   - resend  : logged-in user with no token can request a fresh link
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Auth.css";
import { verifyEmail, resendVerification } from "../service/Api";
import ThemeToggle from "../component/ThemeToggle";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error | resend
  const [message, setMessage] = useState("Verifying your email…");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      // No token in URL — offer to resend if the user is logged in.
      const loggedIn = !!localStorage.getItem("token");
      setStatus(loggedIn ? "resend" : "error");
      setMessage(
        loggedIn
          ? "Confirm your email address to unlock all features."
          : "No verification token was provided in the link."
      );
      return;
    }

    (async () => {
      try {
        const res = await verifyEmail(token);
        setStatus("success");
        setMessage(res.data.message || "Your email has been verified.");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "This verification link is invalid or has expired."
        );
      }
    })();
  }, []);

  async function handleResend() {
    try {
      setResending(true);
      const res = await resendVerification();
      toast.success("Verification email sent — check your inbox.");
      // In dev (no SMTP) the backend returns the token so we can verify directly.
      if (res.data.devVerificationToken) {
        setMessage(
          "Dev mode: no email server configured. Use the link printed in the backend console, or click below."
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not resend verification email.");
    } finally {
      setResending(false);
    }
  }

  const dashboardHref = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.role === "provider" ? "/provider/dashboard" : "/dashboard";
    } catch {
      return "/login";
    }
  };

  return (
    <div className="auth-root auth-root--single">
      <ThemeToggle style={{ position: "fixed", top: 20, right: 20, zIndex: 50 }} />
      <main className="auth-right" aria-label="Email verification">
        <div className="auth-form-panel auth-form-panel--centered" style={{ maxWidth: "440px" }}>
          <div className="auth-success-circle" aria-hidden="true">
            {status === "loading" && "⏳"}
            {status === "success" && "✅"}
            {status === "error" && "⚠️"}
            {status === "resend" && "✉️"}
          </div>

          <h2 className="auth-form__heading">
            {status === "loading" && "Verifying…"}
            {status === "success" && "Email verified!"}
            {status === "error" && "Verification failed"}
            {status === "resend" && "Verify your email"}
          </h2>

          <p className="auth-form__sub">{message}</p>

          <div className="auth-success-actions" style={{ marginTop: "24px" }}>
            {status === "success" && (
              <button
                className="auth-btn auth-btn--primary auth-btn--full"
                onClick={() => navigate(dashboardHref())}
              >
                Go to my dashboard →
              </button>
            )}

            {(status === "error" || status === "resend") && (
              <>
                {localStorage.getItem("token") && (
                  <button
                    className="auth-btn auth-btn--primary auth-btn--full"
                    onClick={handleResend}
                    disabled={resending}
                  >
                    {resending ? "Sending…" : "Resend verification email"}
                  </button>
                )}
                <button
                  className="auth-btn auth-btn--outline auth-btn--full"
                  onClick={() => navigate(localStorage.getItem("token") ? dashboardHref() : "/login")}
                >
                  {localStorage.getItem("token") ? "Back to dashboard" : "Back to sign in"}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
