import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./StudentDashboard.css";
import BarChart from "../component/BarChart";
import ThemeToggle from "../component/ThemeToggle";
import { getStudentApplications, getMatches } from "../service/Api";

const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_ORDER = ["submitted", "under_review", "shortlisted", "approved", "rejected"];

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date) {
  return date.toLocaleDateString("en-GB", { month: "short" });
}

export default function StudentAnalytics() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [appsRes, matchesRes] = await Promise.all([getStudentApplications(), getMatches()]);
        setApplications(appsRes.data);
        setMatchedCount(matchesRes.data.length);
      } catch (e) {
        console.error("Fetch Analytics Error:", e);
        toast.error("Failed to load your analytics.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="sd-loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--color-border)', borderTop: '4px solid #F5C842', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500' }}>Loading your analytics...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const totalApplied = applications.length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const successRate = totalApplied > 0 ? Math.round((approvedCount / totalApplied) * 100) : 0;

  const statusData = STATUS_ORDER.map((status) => ({
    label: STATUS_LABELS[status],
    value: applications.filter((a) => a.status === status).length,
    color: `var(--chart-${status.replace("_", "-")})`,
  }));

  // Last 6 months, oldest first
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: monthKey(d), label: monthLabel(d) };
  });
  const timelineData = months.map(({ key, label }) => ({
    label,
    value: applications.filter((a) => monthKey(new Date(a.submitted_at)) === key).length,
    color: "var(--chart-sequential)",
  }));

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", color: "var(--color-text)", paddingBottom: "60px" }}>
      <header style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "var(--color-text)" }}>
            My Analytics
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "32px auto", padding: "0 24px" }}>
        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)" }}>Matched</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text)", marginTop: "6px" }}>{matchedCount}</div>
          </div>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)" }}>Applied</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text)", marginTop: "6px" }}>{totalApplied}</div>
          </div>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)" }}>Approved</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--chart-approved)", marginTop: "6px" }}>{approvedCount}</div>
          </div>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)" }}>Success Rate</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text)", marginTop: "6px" }}>{successRate}%</div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "22px" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text)", margin: "0 0 4px" }}>Applications by Status</h2>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", margin: "0 0 18px" }}>Where your {totalApplied} application{totalApplied === 1 ? "" : "s"} currently stand</p>
            <BarChart data={statusData} emptyMessage="You haven't applied to any scholarships yet." />
          </div>

          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "22px" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text)", margin: "0 0 4px" }}>Applications Over Time</h2>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", margin: "0 0 18px" }}>Submissions per month, last 6 months</p>
            <BarChart data={timelineData} emptyMessage="No applications submitted in the last 6 months." />
          </div>
        </div>

        {totalApplied === 0 && (
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <button className="sd-btn-primary" onClick={() => navigate("/scholarships")}>
              Explore Scholarships →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
