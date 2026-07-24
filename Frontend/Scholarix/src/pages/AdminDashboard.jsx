import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "./ProviderDashboard.css";
import "./AdminDashboard.css";
import BarChart from "../component/BarChart";
import ThemeToggle from "../component/ThemeToggle";
import NotificationBell from "../component/NotificationBell";
import {
  getAdminStats,
  getAdminGrowth,
  getAdminApplicationStatus,
  getAdminActivity,
} from "../service/Api";

const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_ORDER = ["submitted", "under_review", "shortlisted", "approved", "rejected"];

function monthLabel(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "short" });
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [activity, setActivity] = useState({ recentUsers: [], recentScholarships: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [statsRes, growthRes, statusRes, activityRes] = await Promise.all([
          getAdminStats(),
          getAdminGrowth(),
          getAdminApplicationStatus(),
          getAdminActivity(),
        ]);
        setStats(statsRes.data);
        setGrowth(growthRes.data);
        setStatusBreakdown(statusRes.data);
        setActivity(activityRes.data);
      } catch (e) {
        console.error("Fetch Admin Dashboard Error:", e);
        toast.error("Failed to load platform overview.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--pd-bg)", color: "var(--pd-text-main)" }}>
        <div className="auth-spinner" style={{ width: "40px", height: "40px", border: "4px solid var(--pd-border)", borderTop: "4px solid #2563EB", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "16px", fontSize: "18px", fontWeight: "500" }}>Loading platform overview...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const growthData = growth.map((row) => ({
    label: monthLabel(row.month),
    value: row.count,
    color: "var(--chart-sequential)",
  }));

  const statusData = STATUS_ORDER.map((status) => {
    const row = statusBreakdown.find((r) => r.status === status);
    return {
      label: STATUS_LABELS[status],
      value: row ? row.count : 0,
      color: `var(--chart-${status.replace("_", "-")})`,
    };
  });

  return (
    <div className="pd-page">
      <header className="pd-welcome-banner">
        <div>
          <h1 className="pd-welcome-heading">Platform Overview</h1>
          <p className="pd-welcome-sub">Scholarix-wide health, growth, and moderation signals</p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <ThemeToggle />
          <NotificationBell />
        </div>
      </header>

      <div className="pd-stats-grid">
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Students</span>
            <span className="pd-stat-icon">🎓</span>
          </div>
          <div className="pd-stat-value">{stats.total_students}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Providers</span>
            <span className="pd-stat-icon">🏛️</span>
          </div>
          <div className="pd-stat-value">{stats.total_providers}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Scholarships Listed</span>
            <span className="pd-stat-icon">📜</span>
          </div>
          <div className="pd-stat-value">{stats.total_scholarships}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Total Applications</span>
            <span className="pd-stat-icon">📥</span>
          </div>
          <div className="pd-stat-value">{stats.total_applications}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Unverified Providers</span>
            <span className="pd-stat-icon">📩</span>
          </div>
          <div className="pd-stat-value" style={{ color: "#F59E0B" }}>{stats.unverified_providers}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Suspended Accounts</span>
            <span className="pd-stat-icon">⛔</span>
          </div>
          <div className="pd-stat-value" style={{ color: stats.suspended_users > 0 ? "#EF4444" : "var(--pd-text-main)" }}>{stats.suspended_users}</div>
        </div>
      </div>

      <div className="ad-two-col" style={{ marginBottom: "24px" }}>
        <div className="pd-section" style={{ marginBottom: 0 }}>
          <h2 className="pd-section-heading" style={{ marginBottom: "4px" }}>Platform Signups</h2>
          <p style={{ fontSize: "0.78rem", color: "var(--pd-text-muted)", margin: "0 0 18px" }}>New students + providers per month, last 6 months</p>
          <BarChart data={growthData} emptyMessage="No signups in the last 6 months." />
        </div>

        <div className="pd-section" style={{ marginBottom: 0 }}>
          <h2 className="pd-section-heading" style={{ marginBottom: "4px" }}>Applications by Status</h2>
          <p style={{ fontSize: "0.78rem", color: "var(--pd-text-muted)", margin: "0 0 18px" }}>Across all scholarships, platform-wide</p>
          <BarChart data={statusData} emptyMessage="No applications submitted yet." />
        </div>
      </div>

      <div className="ad-two-col">
        <section className="pd-section">
          <div className="pd-section-header">
            <h2 className="pd-section-heading">Recent Signups</h2>
          </div>
          {activity.recentUsers.length > 0 ? (
            <ul className="ad-activity-list">
              {activity.recentUsers.map((u) => (
                <li key={u.id} className="ad-activity-item">
                  <div style={{ minWidth: 0 }}>
                    <div className="ad-activity-main">
                      {u.role === "provider" ? (u.org_name || "Unnamed org") : `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email}
                    </div>
                    <div className="ad-activity-sub">
                      <span className={`ad-role-badge ${u.role}`}>{u.role}</span> · {u.email}
                    </div>
                  </div>
                  <span className="ad-activity-date">{timeAgo(u.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ad-empty-state">No signups yet.</p>
          )}
        </section>

        <section className="pd-section">
          <div className="pd-section-header">
            <h2 className="pd-section-heading">Recently Posted Scholarships</h2>
          </div>
          {activity.recentScholarships.length > 0 ? (
            <ul className="ad-activity-list">
              {activity.recentScholarships.map((s) => (
                <li key={s.id} className="ad-activity-item">
                  <div style={{ minWidth: 0 }}>
                    <div className="ad-activity-main">{s.name}</div>
                    <div className="ad-activity-sub">{s.provider_name} · {s.amount}</div>
                  </div>
                  <span className="ad-activity-date">{timeAgo(s.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ad-empty-state">No scholarships posted yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
