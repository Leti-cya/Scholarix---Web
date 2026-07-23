/**
 * ProviderApplications.jsx
 * ------------------------
 * Location: src/pages/ProviderApplications.jsx
 *
 * Dedicated Application Management page for scholarship providers.
 * Full-screen interface for reviewing, filtering, grouping, and updating
 * applicant statuses with modal inspection and student read-only profile views.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../component/Layout";
import "./ProviderDashboard.css";
import Api from "../service/Api";

export default function ProviderApplications() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState({ orgName: "Provider Org", contactName: "" });
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [appFilter, setAppFilter] = useState("all");
  const [applicantModal, setApplicantModal] = useState({ isOpen: false, applicant: null, activeTab: "profile" });

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
      setScholarships(scholarshipsRes.data || []);

      // 3. Fetch Applications submitted to Provider's Scholarships
      const appsRes = await Api.get("/api/applications/provider");
      setApplications(appsRes.data || []);

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
      setApplications(appsRes.data || []);

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
      <Layout role="provider">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--sx-text-primary)' }}>
          <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--sx-border)', borderTop: '4px solid var(--sx-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500' }}>Loading applications...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="provider">
      <div className="pd-page" style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 32px 48px" }}>
        {/* ── HEADER BANNER ────────────────────────────────────────────── */}
        <header className="pd-welcome-banner">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => navigate("/provider/dashboard")}
              className="pd-btn pd-btn-outline"
              style={{ borderColor: "var(--sx-gold)", color: "var(--sx-gold)", padding: "8px 14px" }}
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
        </header>

        {/* ── STATISTICS ROW ────────────────────────────────────────────── */}
        <div className="pd-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          <div className="pd-stat-card">
            <div className="pd-stat-header">
              <span className="pd-stat-label">Total Apps</span>
              <span className="pd-stat-icon">📥</span>
            </div>
            <div className="pd-stat-value">{totalAppsCount}</div>
          </div>
          <div className="pd-stat-card">
            <div className="pd-stat-header">
              <span className="pd-stat-label">Submitted</span>
              <span className="pd-stat-icon">📤</span>
            </div>
            <div className="pd-stat-value" style={{ color: "var(--sx-blue)" }}>{submittedCount}</div>
          </div>
          <div className="pd-stat-card">
            <div className="pd-stat-header">
              <span className="pd-stat-label">Under Review</span>
              <span className="pd-stat-icon">🔍</span>
            </div>
            <div className="pd-stat-value" style={{ color: "var(--sx-amber)" }}>{underReviewCount}</div>
          </div>
          <div className="pd-stat-card">
            <div className="pd-stat-header">
              <span className="pd-stat-label">Shortlisted</span>
              <span className="pd-stat-icon">📋</span>
            </div>
            <div className="pd-stat-value" style={{ color: "var(--sx-purple)" }}>{shortlistedCount}</div>
          </div>
          <div className="pd-stat-card">
            <div className="pd-stat-header">
              <span className="pd-stat-label">Approved</span>
              <span className="pd-stat-icon">✅</span>
            </div>
            <div className="pd-stat-value" style={{ color: "var(--sx-green)" }}>{approvedCount}</div>
          </div>
          <div className="pd-stat-card">
            <div className="pd-stat-header">
              <span className="pd-stat-label">Rejected</span>
              <span className="pd-stat-icon">❌</span>
            </div>
            <div className="pd-stat-value" style={{ color: "var(--sx-red)" }}>{rejectedCount}</div>
          </div>
        </div>

        {/* ── APPLICATIONS SECTION ────────────────────────────────────────────── */}
        <section className="pd-section">
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
                      <span style={{ fontSize: "13px", color: "var(--sx-gold)", fontWeight: "600" }}>
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
                          <strong style={{ fontSize: "16px", color: "var(--sx-text-primary)" }}>
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

                      {/* Student profile summary */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "12px", fontSize: "13px", color: "var(--sx-text-muted)", background: "var(--sx-surface-hover)", padding: "10px", borderRadius: "8px" }}>
                        <div><strong>Institution:</strong> {app.student_institution || "N/A"}</div>
                        <div><strong>Study Level:</strong> {app.student_level || "N/A"}</div>
                        <div><strong>Field:</strong> {app.student_field || "N/A"}</div>
                        <div><strong>GPA Score:</strong> {app.student_gpa || "N/A"}</div>
                        <div><strong>Submitted:</strong> {new Date(app.submitted_at).toLocaleDateString()}</div>
                      </div>

                      {app.essay && (
                        <div className="pd-app-essay" style={{ marginBottom: "12px", fontSize: "13px" }}>
                          <strong>Essay Statement Preview:</strong>
                          <p style={{ marginTop: "4px", color: "var(--sx-text-secondary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {app.essay}
                          </p>
                        </div>
                      )}

                      <div className="pd-app-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                        <button
                          className="pd-btn pd-btn-outline"
                          style={{ fontSize: "13px", padding: "6px 12px", borderColor: "var(--sx-blue)", color: "var(--sx-blue)" }}
                          onClick={() => setApplicantModal({ isOpen: true, applicant: app, activeTab: "profile" })}
                        >
                          View Student Profile 🎓
                        </button>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {app.status === "submitted" && (
                            <button className="pd-btn pd-btn-outline" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleUpdateStatus(app.application_id, "under_review")}>
                              Mark Under Review
                            </button>
                          )}
                          {app.status === "under_review" && (
                            <button className="pd-btn pd-btn-outline" style={{ fontSize: "12px", padding: "6px 12px", borderColor: "var(--sx-purple)", color: "var(--sx-purple)" }} onClick={() => handleUpdateStatus(app.application_id, "shortlisted")}>
                              Shortlist
                            </button>
                          )}
                          {app.status !== "approved" && app.status !== "rejected" && (
                            <>
                              <button className="pd-btn pd-btn-danger" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleUpdateStatus(app.application_id, "rejected")}>
                                Reject
                              </button>
                              <button className="pd-btn pd-btn-primary" style={{ fontSize: "12px", padding: "6px 12px", background: "var(--sx-green)", color: "white" }} onClick={() => handleUpdateStatus(app.application_id, "approved")}>
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
            <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--sx-surface)", border: "1px solid var(--pd-border)", borderRadius: "12px" }}>
              <p style={{ color: "var(--pd-text-muted)", fontSize: "14px", margin: 0 }}>
                {appFilter === "all"
                  ? "No applications received yet for your listed scholarships."
                  : `No applications currently matching status "${appFilter.replace("_", " ")}".`}
              </p>
            </div>
          )}
        </section>

        {/* ── APPLICANT & READ-ONLY STUDENT PROFILE MODAL ────────────────────────────────────────── */}
        {applicantModal.isOpen && applicantModal.applicant && (
          <div className="pd-modal-overlay" onClick={() => setApplicantModal({ isOpen: false, applicant: null, activeTab: "profile" })}>
            <div className="pd-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="pd-modal-header">
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--sx-text-primary)", margin: 0 }}>
                    🎓 {applicantModal.applicant.first_name} {applicantModal.applicant.last_name}
                  </h3>
                  <span style={{ fontSize: "13px", color: "var(--pd-text-muted)", marginTop: "2px", display: "block" }}>
                    Student Academic Profile · {applicantModal.applicant.scholarship_name}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className={`status-badge ${applicantModal.applicant.status}`}>
                    {applicantModal.applicant.status.replace("_", " ")}
                  </span>
                  <button
                    onClick={() => setApplicantModal({ isOpen: false, applicant: null, activeTab: "profile" })}
                    style={{ background: "none", border: "none", color: "var(--sx-text-muted)", fontSize: "20px", cursor: "pointer" }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="pd-modal-body">
                {/* Student Profile Info (Clean Read-Only Layout) */}
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--sx-gold)", margin: "0 0 10px 0" }}>
                    Academic & Personal Information (Read-Only)
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
                      <span className="pd-detail-label">Institution / University</span>
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
                  <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--sx-gold)", margin: "0 0 8px 0" }}>
                    Application Essay Statement
                  </h4>
                  <div className="pd-app-essay" style={{ margin: 0, maxHeight: "200px", overflowY: "auto" }}>
                    <p style={{ margin: 0, whiteSpace: "pre-line", lineHeight: "1.6", color: "var(--sx-text-secondary)" }}>
                      {applicantModal.applicant.essay || "No essay statement provided."}
                    </p>
                  </div>
                </div>

                {/* Application Status Action Controls */}
                <div style={{ background: "var(--sx-bg)", padding: "16px", borderRadius: "10px", border: "1px solid var(--pd-border)" }}>
                  <strong style={{ display: "block", marginBottom: "10px", fontSize: "13px", color: "var(--pd-text-muted)" }}>
                    Update Application Status:
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
                      style={{ fontSize: "12px", padding: "6px 12px", borderColor: "var(--sx-amber)", color: "var(--sx-amber)" }}
                      disabled={applicantModal.applicant.status === "under_review"}
                      onClick={() => handleUpdateStatus(applicantModal.applicant.application_id, "under_review")}
                    >
                      Under Review
                    </button>
                    <button
                      className="pd-btn pd-btn-outline"
                      style={{ fontSize: "12px", padding: "6px 12px", borderColor: "var(--sx-purple)", color: "var(--sx-purple)" }}
                      disabled={applicantModal.applicant.status === "shortlisted"}
                      onClick={() => handleUpdateStatus(applicantModal.applicant.application_id, "shortlisted")}
                    >
                      Shortlist
                    </button>
                    <button
                      className="pd-btn pd-btn-primary"
                      style={{ fontSize: "12px", padding: "6px 12px", background: "var(--sx-green)", color: "white" }}
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
                  onClick={() => setApplicantModal({ isOpen: false, applicant: null, activeTab: "profile" })}
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
