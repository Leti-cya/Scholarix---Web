import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProviderDashboard.css";
import ThemeToggle from "../component/ThemeToggle";
import { loginUser } from "../service/Api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      const { token, user } = res.data;

      if (user.role !== "admin") {
        setError("This sign-in is for administrators only.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--pd-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <ThemeToggle style={{ position: "fixed", top: 20, right: 20 }} />

      <a
        href="/"
        style={{ position: "fixed", top: 24, left: 24, fontSize: "13px", fontWeight: 600, color: "var(--pd-text-muted)", textDecoration: "none" }}
      >
        ← Back to Scholarix
      </a>

      <div style={{ width: "100%", maxWidth: "380px", background: "var(--pd-card-bg)", border: "1px solid var(--pd-border)", borderRadius: "16px", padding: "36px 32px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ width: 36, height: 36, borderRadius: 8, background: "#0D1B2A", color: "#F5C842", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "13px", flexShrink: 0 }}>SX</span>
          <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--pd-text-main)" }}>Scholarix Admin</span>
        </div>
        <p style={{ fontSize: "13px", color: "var(--pd-text-muted)", margin: "0 0 24px" }}>
          Restricted access — platform administrators only.
        </p>

        {error && (
          <div role="alert" style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#EF4444", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", marginBottom: "18px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="pd-form">
          <div className="pd-input-group">
            <label htmlFor="admin-email">Admin email</label>
            <input
              id="admin-email"
              type="email"
              className="pd-input"
              placeholder="admin@scholarix.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>
          <div className="pd-input-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              className="pd-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="pd-btn pd-btn-primary" style={{ width: "100%", marginTop: "6px" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign in to Admin →"}
          </button>
        </form>
      </div>
    </div>
  );
}
