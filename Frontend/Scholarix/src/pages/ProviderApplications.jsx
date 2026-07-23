/**
 * ProviderApplications.jsx
 * ------------------------
 * Location: src/pages/ProviderApplications.jsx
 *
 * Dedicated Application Management page for scholarship providers.
 * Full-screen interface for reviewing, filtering, grouping, and updating
 * applicant statuses with modal inspection.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./ProviderDashboard.css";
import Api from "../service/Api";

export default function ProviderApplications() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState({ orgName: "Provider Org", contactName: "" });
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [appFilter, setAppFilter] = useState("all");
  const [applicantModal, setApplicantModal] = useState({ isOpen: false, applicant: null });

  const fetchProviderData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Profile details
      const profileRes = await Api.get("/api/auth/profile");
      const pData = profileRes.data;
      setProvider({
        orgName: pData.org_name || "Organisation",
        contactName: pData.contact_name || "Representative"
      });

      // 2. Fetch Provider's Listed Scholarships
      const scholarshipsRes = await Api.get("/api/scholarships/provider");
      setScholarships(scholarshipsRes.data);

      // 3. Fetch Applications submitted to Provider's Scholarships
      const appsRes = await Api.get("/api/applications/provider");
      setApplications(appsRes.data);

    } catch (e) {
      console.error("Provider Applications Load Error:", e);
      toast.error("Failed to load provider applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, []);

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await Api.patch(`/api/applications/${applicationId}/status`, { status });
      toast.success(`Application status updated to ${status.replace("_", " ")}.`);
      
      const appsRes = await Api.get("/api/applications/provider");
      setApplications(appsRes.data);

      setApplicantModal(prev => {
        if (prev.isOpen && prev.applicant && prev.applicant.application_id === applicationId) {
          return {
            ...prev,
            applicant: { ...prev.applicant, status }
          };
        }
        return prev;
      });
    } catch (error) {
      toast.error("Failed to update application status.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Metrics
  const activeCount = scholarships.length;
  const totalAppsCount = applications.length;
  const submittedCount = applications.filter(a => a.status === "submitted").length;
  const underReviewCount = applications.filter(a => a.status === "under_review").length;
  const shortlistedCount = applications.filter(a => a.status === "shortlisted").length;
  const approvedCount = applications.filter(a => a.status === "approved").length;
  const rejectedCount = applications.filter(a => a.status === "rejected").length;

  const STATUS_TABS = [
    { key: "all", label: "All", count: totalAppsCount },
    { key: "submitted", label: "Submitted", count: submittedCount },
    { key: "under_review", label: "Under Review", count: underReviewCount },
    { key: "shortlisted", label: "Shortlisted", count: shortlistedCount },
    { key: "approved", label: "Approved", count: approvedCount },
    { key: "rejected", label: "Rejected", count: rejectedCount }
  ];

  // Filter & Group Applications by Scholarship
  const filteredApps = appFilter === "all"
    ? applications
    : applications.filter(a => a.status === appFilter);

  const groupedApps = filteredApps.reduce((acc, app) => {
    const key = app.scholarship_id || app.scholarship_name;
    if (!acc[key]) {
      acc[key] = {
        scholarship_id: app.scholarship_id,
        scholarship_name: app.scholarship_name,
        scholarship_amount: app.scholarship_amount,
        apps: []
      };
    }
    acc[key].apps.push(app);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="sd-loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A', color: 'white' }}>
        <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500' }}>Loading applications...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="pd-page">
      {/* ── HEADER BANNER ────────────────────────────────────────────── */}
      <header className="pd-welcome-banner">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => navigate("/provider/dashboard")}
            className="pd-btn pd-btn-outline"
            style={{ borderColor: "#F5C842", color: "#F5C842", padding: "8px 14px" }}
          >
            ← Dashboard
          </button>
          <div>
            <h1 className="pd-welcome-heading" style={{ fontSize: "24px" }}>
              Application Management
            </h1>
            <p className="pd-welcome-sub">
              {provider.orgName} · Review and manage applicant submissions
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="pd-btn pd-btn-outline" style={{ borderColor: '#EF4444', color: '#EF4444' }} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* ── STATISTICS ROW ────────────────────────────────────────────── */}
      <div className="pd-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Total Applications</span>
            <span className="pd-stat-icon">📥</span>
          </div>
          <div className="pd-stat-value">{totalAppsCount}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Submitted</span>
            <span className="pd-stat-icon">📤</span>
          </div>
          <div className="pd-stat-value" style={{ color: "#3B82F6" }}>{submittedCount}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Under Review</span>
            <span className="pd-stat-icon">🔍</span>
          </div>
          <div className="pd-stat-value" style={{ color: "#F59E0B" }}>{underReviewCount}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Shortlisted</span>
            <span className="pd-stat-icon">📋</span>
          </div>
          <div className="pd-stat-value" style={{ color: "#A855F7" }}>{shortlistedCount}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Approved</span>
            <span className="pd-stat-icon">✅</span>
          </div>
          <div className="pd-stat-value" style={{ color: "#10B981" }}>{approvedCount}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Rejected</span>
            <span className="pd-stat-icon">❌</span>
          </div>
          <div className="pd-stat-value" style={{ color: "#EF4444" }}>{rejectedCount}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Active Listings</span>
            <span className="pd-stat-icon">🎓</span>
          </div>
          <div className="pd-stat-value">{activeCount}</div>
        </div>
      </div>

      {/* ── APPLICATIONS SECTION ────────────────────────────────────────────── */}
      <section className="pd-section" style={{ maxWidth: "1400px", margin: "0 auto 32px auto" }}>
        <div className="pd-section-header">
          <h2 className="pd-section-heading">Applications Received ({filteredApps.length})</h2>
        </div>

        {/* Status Filter Tabs */}
        <div className="pd-tabs-wrapper">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              className={`pd-tab ${appFilter === tab.key ? "active" : ""}`}
              onClick={() => setAppFilter(tab.key)}
            >
              {tab.label}
              <span className="pd-tab-badge">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Grouped Applications by Scholarship */}
        {Object.keys(groupedApps).length > 0 ? (
          Object.values(groupedApps).map(group => (
            <div key={group.scholarship_id || group.scholarship_name} className="pd-scholarship-group">
              <div className="pd-scholarship-group-header">
                <h3 className="pd-scholarship-group-title">
                  🎓 {group.scholarship_name}
                  {group.scholarship_amount && (
                    <span style={{ fontSize: "13px", color: "#F5C842", fontWeight: "600" }}>
                      ({group.scholarship_amount})
                    </span>
                  )}
                </h3>
                <span className="pd-scholarship-group-count">
                  {group.apps.length} Applicant{group.apps.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="pd-scholarship-group-body">
                {group.apps.map(app => (
                  <div key={app.application_id} className="pd-applicant-card">
                    <div className="pd-app-student-info" style={{ marginBottom: "12px", borderBottom: "1px solid var(--pd-border)", paddingBottom: "10px" }}>
                      <div>
                        <strong style={{ fontSize: "16px", color: "white" }}>
                          {app.first_name} {app.last_name}
                        </strong>
                        <div style={{ fontSize: "13px", color: "var(--pd-text-muted)", marginTop: "4px" }}>
                          📧 {app.student_email} · 📍 {app.student_country || "N/A"}
                        </div>
                      </div>
                      <span className={`status-badge ${app.status}`}>
                        {app.status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Student profile details */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "12px", fontSize: "13px", color: "#94A3B8", background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "8px" }}>
                      <div><strong>Institution:</strong> {app.student_institution || "N/A"}</div>
                      <div><strong>Study Level:</strong> {app.student_level || "N/A"}</div>
                      <div><strong>Field:</strong> {app.student_field || "N/A"}</div>
                      <div><strong>GPA Score:</strong> {app.student_gpa || "N/A"}</div>
                      <div><strong>Submitted:</strong> {new Date(app.submitted_at).toLocaleDateString()}</div>
                    </div>

                    {app.essay && (
                      <div className="pd-app-essay" style={{ marginBottom: "12px", fontSize: "13px" }}>
                        <strong>Essay Statement Preview:</strong>
                        <p style={{ marginTop: "4px", color: "#CBD5E1", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {app.essay}
                        </p>
                      </div>
                    )}

                    <div className="pd-app-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <button
                        className="pd-btn pd-btn-outline"
                        style={{ fontSize: "13px", padding: "6px 12px", borderColor: "#38BDF8", color: "#38BDF8" }}
                        onClick={() => setApplicantModal({ isOpen: true, applicant: app })}
                      >
                        View Full Details 👁️
                      </button>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {app.status === "submitted" && (
                          <button className="pd-btn pd-btn-outline" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleUpdateStatus(app.application_id, "under_review")}>
                            Mark Under Review
                          </button>
                        )}
                        {app.status === "under_review" && (
                          <button className="pd-btn pd-btn-outline" style={{ fontSize: "12px", padding: "6px 12px", borderColor: "#A855F7", color: "#A855F7" }} onClick={() => handleUpdateStatus(app.application_id, "shortlisted")}>
                            Shortlist
                          </button>
                        )}
                        {app.status !== "approved" && app.status !== "rejected" && (
                          <>
                            <button className="pd-btn pd-btn-danger" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleUpdateStatus(app.application_id, "rejected")}>
                              Reject
                            </button>
                            <button className="pd-btn pd-btn-primary" style={{ fontSize: "12px", padding: "6px 12px", background: "#10B981" }} onClick={() => handleUpdateStatus(app.application_id, "approved")}>
                              Approve Award
                            </button>
                          </>
                        )}
                        {(app.status === "approved" || app.status === "rejected") && (
                          <span style={{ fontSize: "12px", color: "var(--pd-text-muted)" }}>
                            Decision made on {new Date(app.submitted_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", background: "#0F172A", border: "1px solid var(--pd-border)", borderRadius: "12px" }}>
            <p style={{ color: "var(--pd-text-muted)", fontSize: "14px", margin: 0 }}>
              {appFilter === "all"
                ? "No applications received yet for your listed scholarships."
                : `No applications currently matching status "${appFilter.replace("_", " ")}".`}
            </p>
          </div>
        )}
      </section>

      {/* ── APPLICANT DETAILS MODAL ────────────────────────────────────────── */}
      {applicantModal.isOpen && applicantModal.applicant && (
        <div className="pd-modal-overlay" onClick={() => setApplicantModal({ isOpen: false, applicant: null })}>
          <div className="pd-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "white", margin: 0 }}>
                  👤 {applicantModal.applicant.first_name} {applicantModal.applicant.last_name}
                </h3>
                <span style={{ fontSize: "13px", color: "var(--pd-text-muted)", marginTop: "2px", display: "block" }}>
                  Applicant for {applicantModal.applicant.scholarship_name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className={`status-badge ${applicantModal.applicant.status}`}>
                  {applicantModal.applicant.status.replace("_", " ")}
                </span>
                <button
                  onClick={() => setApplicantModal({ isOpen: false, applicant: null })}
                  style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "20px", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="pd-modal-body">
              {/* Student Profile Info */}
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#F5C842", margin: "0 0 10px 0" }}>
                  Student Profile Information
                </h4>
                <div className="pd-detail-grid">
                  <div className="pd-detail-item">
                    <span className="pd-detail-label">Full Name</span>
                    <span className="pd-detail-val">{applicantModal.applicant.first_name} {applicantModal.applicant.last_name}</span>
                  </div>
                  <div className="pd-detail-item">
                    <span className="pd-detail-label">Email Address</span>
                    <span className="pd-detail-val">{applicantModal.applicant.student_email}</span>
                  </div>
                  <div className="pd-detail-item">
                    <span className="pd-detail-label">Phone Number</span>
                    <span className="pd-detail-val">{applicantModal.applicant.student_phone || "Not provided"}</span>
                  </div>
                  <div className="pd-detail-item">
                    <span className="pd-detail-label">Country / Nationality</span>
                    <span className="pd-detail-val">{applicantModal.applicant.student_country || "Not specified"}</span>
                  </div>
                  <div className="pd-detail-item">
                    <span className="pd-detail-label">Institution</span>
                    <span className="pd-detail-val">{applicantModal.applicant.student_institution || "Not specified"}</span>
                  </div>
                  <div className="pd-detail-item">
                    <span className="pd-detail-label">Study Level</span>
                    <span className="pd-detail-val">{applicantModal.applicant.student_level || "Not specified"}</span>
                  </div>
                  <div className="pd-detail-item">
                    <span className="pd-detail-label">Field of Study</span>
                    <span className="pd-detail-val">{applicantModal.applicant.student_field || "Not specified"}</span>
                  </div>
                  <div className="pd-detail-item">
                    <span className="pd-detail-label">GPA Score</span>
                    <span className="pd-detail-val">{applicantModal.applicant.student_gpa || "Not specified"}</span>
                  </div>
                  <div className="pd-detail-item">
                    <span className="pd-detail-label">Scholarship Applied</span>
                    <span className="pd-detail-val">{applicantModal.applicant.scholarship_name} ({applicantModal.applicant.scholarship_amount})</span>
                  </div>
                  <div className="pd-detail-item">
                    <span className="pd-detail-label">Submission Date</span>
                    <span className="pd-detail-val">{new Date(applicantModal.applicant.submitted_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Essay Statement */}
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#F5C842", margin: "0 0 8px 0" }}>
                  Application Essay Statement
                </h4>
                <div className="pd-app-essay" style={{ margin: 0, maxHeight: "200px", overflowY: "auto" }}>
                  <p style={{ margin: 0, whiteSpace: "pre-line", lineHeight: "1.6", color: "#CBD5E1" }}>
                    {applicantModal.applicant.essay || "No essay statement provided."}
                  </p>
                </div>
              </div>

              {/* Application Status Action Controls */}
              <div style={{ background: "#0F172A", padding: "16px", borderRadius: "10px", border: "1px solid var(--pd-border)" }}>
                <strong style={{ display: "block", marginBottom: "10px", fontSize: "13px", color: "var(--pd-text-muted)" }}>
                  Change Application Status:
                </strong>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    className="pd-btn pd-btn-outline"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                    disabled={applicantModal.applicant.status === "submitted"}
                    onClick={() => handleUpdateStatus(applicantModal.applicant.application_id, "submitted")}
                  >
                    Submitted
                  </button>
                  <button
                    className="pd-btn pd-btn-outline"
                    style={{ fontSize: "12px", padding: "6px 12px", borderColor: "#F59E0B", color: "#F59E0B" }}
                    disabled={applicantModal.applicant.status === "under_review"}
                    onClick={() => handleUpdateStatus(applicantModal.applicant.application_id, "under_review")}
                  >
                    Under Review
                  </button>
                  <button
                    className="pd-btn pd-btn-outline"
                    style={{ fontSize: "12px", padding: "6px 12px", borderColor: "#A855F7", color: "#A855F7" }}
                    disabled={applicantModal.applicant.status === "shortlisted"}
                    onClick={() => handleUpdateStatus(applicantModal.applicant.application_id, "shortlisted")}
                  >
                    Shortlist
                  </button>
                  <button
                    className="pd-btn pd-btn-primary"
                    style={{ fontSize: "12px", padding: "6px 12px", background: "#10B981" }}
                    disabled={applicantModal.applicant.status === "approved"}
                    onClick={() => handleUpdateStatus(applicantModal.applicant.application_id, "approved")}
                  >
                    Approve Award
                  </button>
                  <button
                    className="pd-btn pd-btn-danger"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                    disabled={applicantModal.applicant.status === "rejected"}
                    onClick={() => handleUpdateStatus(applicantModal.applicant.application_id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--pd-border)", display: "flex", justifyContent: "flex-end" }}>
              <button
                className="pd-btn pd-btn-outline"
                onClick={() => setApplicantModal({ isOpen: false, applicant: null })}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
