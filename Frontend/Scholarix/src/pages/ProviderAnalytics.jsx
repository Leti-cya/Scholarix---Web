import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./ProviderDashboard.css";
import BarChart from "../component/BarChart";
import ThemeToggle from "../component/ThemeToggle";
import Api from "../service/Api";

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

export default function ProviderAnalytics() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [scholarshipCount, setScholarshipCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [appsRes, scholarshipsRes] = await Promise.all([
          Api.get("/api/applications/provider"),
          Api.get("/api/scholarships/provider"),
        ]);
        setApplications(appsRes.data);
        setScholarshipCount(scholarshipsRes.data.length);
      } catch (e) {
        console.error("Fetch Provider Analytics Error:", e);
        toast.error("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="sd-loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--pd-bg)', color: 'var(--pd-text-main)' }}>
        <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--pd-border)', borderTop: '4px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500' }}>Loading analytics...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const totalApplications = applications.length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const approvalRate = totalApplications > 0 ? Math.round((approvedCount / totalApplications) * 100) : 0;
  const avgPerListing = scholarshipCount > 0 ? (totalApplications / scholarshipCount).toFixed(1) : "0";

  const statusData = STATUS_ORDER.map((status) => ({
    label: STATUS_LABELS[status],
    value: applications.filter((a) => a.status === status).length,
    color: `var(--chart-${status.replace("_", "-")})`,
  }));

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

  // Top scholarships by applicant count
  const byScholarship = {};
  applications.forEach((a) => {
    byScholarship[a.scholarship_name] = (byScholarship[a.scholarship_name] || 0) + 1;
  });
  const topScholarships = Object.entries(byScholarship)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({
      label: name.length > 14 ? name.slice(0, 13) + "…" : name,
      value: count,
      color: "var(--chart-sequential)",
    }));

  return (
    <div style={{ background: "var(--pd-bg)", minHeight: "100vh", color: "var(--pd-text-main)", paddingBottom: "60px" }}>
      <header style={{ background: "var(--pd-card-bg)", borderBottom: "1px solid var(--pd-border)", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "var(--pd-text-main)" }}>
              Analytics
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "32px auto", padding: "0 24px" }}>
        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "var(--pd-card-bg)", border: "1px solid var(--pd-border)", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--pd-text-muted)" }}>Active Listings</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--pd-text-main)", marginTop: "6px" }}>{scholarshipCount}</div>
          </div>
          <div style={{ background: "var(--pd-card-bg)", border: "1px solid var(--pd-border)", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--pd-text-muted)" }}>Total Applications</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--pd-text-main)", marginTop: "6px" }}>{totalApplications}</div>
          </div>
          <div style={{ background: "var(--pd-card-bg)", border: "1px solid var(--pd-border)", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--pd-text-muted)" }}>Approval Rate</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--chart-approved)", marginTop: "6px" }}>{approvalRate}%</div>
          </div>
          <div style={{ background: "var(--pd-card-bg)", border: "1px solid var(--pd-border)", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--pd-text-muted)" }}>Avg. Applicants / Listing</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--pd-text-main)", marginTop: "6px" }}>{avgPerListing}</div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div style={{ background: "var(--pd-card-bg)", border: "1px solid var(--pd-border)", borderRadius: "14px", padding: "22px" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--pd-text-main)", margin: "0 0 4px" }}>Applications by Status</h2>
            <p style={{ fontSize: "0.78rem", color: "var(--pd-text-muted)", margin: "0 0 18px" }}>Across all {scholarshipCount} of your listings</p>
            <BarChart data={statusData} emptyMessage="No applications received yet." />
          </div>

          <div style={{ background: "var(--pd-card-bg)", border: "1px solid var(--pd-border)", borderRadius: "14px", padding: "22px" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--pd-text-main)", margin: "0 0 4px" }}>Applications Received Over Time</h2>
            <p style={{ fontSize: "0.78rem", color: "var(--pd-text-muted)", margin: "0 0 18px" }}>Submissions per month, last 6 months</p>
            <BarChart data={timelineData} emptyMessage="No applications received in the last 6 months." />
          </div>
        </div>

        <div style={{ background: "var(--pd-card-bg)", border: "1px solid var(--pd-border)", borderRadius: "14px", padding: "22px" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--pd-text-main)", margin: "0 0 4px" }}>Top Scholarships by Applicants</h2>
          <p style={{ fontSize: "0.78rem", color: "var(--pd-text-muted)", margin: "0 0 18px" }}>Your {Math.min(topScholarships.length, 6)} most-applied-to listings</p>
          <BarChart data={topScholarships} emptyMessage="No applications received yet." height={200} />
        </div>
      </main>
    </div>
  );
}
