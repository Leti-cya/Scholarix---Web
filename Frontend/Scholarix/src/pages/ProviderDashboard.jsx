/**
 * ProviderDashboard.jsx
 * ---------------------
 * Baseline dashboard view for logged-in scholarship providers.
 * Shows statistics, previews latest 2 active scholarship listings with "View All →",
 * and previews latest 2 recent applications with "View All →".
 *
 * Full CRUD operations live on dedicated "My Scholarships" page.
 * Full Application Management lives on dedicated "Applications" page.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../component/Layout";
import "./ProviderDashboard.css";
import Api from "../service/Api";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState({ orgName: "Provider Org", contactName: "" });
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicantModal, setApplicantModal] = useState({ isOpen: false, applicant: null });

  const fetchProviderData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Provider Profile details
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
      console.error("Provider Dashboard Load Error:", e);
      toast.error("Failed to load provider data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, []);

  // Metrics
  const activeCount = scholarships.length;
  const totalAppsCount = applications.length;
  const submittedCount = applications.filter(a => a.status === "submitted").length;
  const underReviewCount = applications.filter(a => a.status === "under_review").length;
  const approvedCount = applications.filter(a => a.status === "approved").length;
  const pendingReviewsCount = submittedCount + underReviewCount;

  // ONLY display latest 2 scholarships & latest 2 applications on dashboard
  const latestScholarships = scholarships.slice(0, 2);
  const latestApplications = applications.slice(0, 2);

  if (loading) {
    return (
      <Layout role="provider">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--sx-text-primary)' }}>
          <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--sx-border)', borderTop: '4px solid var(--sx-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500' }}>Loading provider dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="provider">
      <div className="pd-page" style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 32px 48px" }}>
        {/* ── HEADER BANNER (Visually mirrors Student Dashboard) ────────────────────────────────── */}
        <header className="pd-welcome-banner">
          <div>
            <h1 className="pd-welcome-heading">{provider.orgName} 👋</h1>
            <p className="pd-welcome-sub">Welcome back, {provider.contactName} · Overview of your listings and applications</p>
          </div>
        </header>

        {/* ── STATISTICS ROW ────────────────────────────────────────────── */}
        <div className="pd-stats-grid">
          <div className="pd-stat-card" style={{ borderLeft: "3px solid var(--sx-blue)" }}>
            <div className="pd-stat-header">
              <span className="pd-stat-label">Active Listings</span>
              <span className="pd-stat-icon" style={{ background: "var(--sx-blue-bg)", color: "var(--sx-blue)" }}>🎓</span>
            </div>
            <div className="pd-stat-value">{activeCount}</div>
          </div>
          <div className="pd-stat-card" style={{ borderLeft: "3px solid var(--sx-gold)" }}>
            <div className="pd-stat-header">
              <span className="pd-stat-label">Total Applications</span>
              <span className="pd-stat-icon" style={{ background: "var(--sx-gold-bg)", color: "var(--sx-gold)" }}>📥</span>
            </div>
            <div className="pd-stat-value">{totalAppsCount}</div>
          </div>
          <div className="pd-stat-card" style={{ borderLeft: "3px solid var(--sx-amber)" }}>
            <div className="pd-stat-header">
              <span className="pd-stat-label">Pending Reviews</span>
              <span className="pd-stat-icon" style={{ background: "var(--sx-amber-bg)", color: "var(--sx-amber)" }}>⏳</span>
            </div>
            <div className="pd-stat-value" style={{ color: "var(--sx-amber)" }}>{pendingReviewsCount}</div>
          </div>
          <div className="pd-stat-card" style={{ borderLeft: "3px solid var(--sx-green)" }}>
            <div className="pd-stat-header">
              <span className="pd-stat-label">Awards Approved</span>
              <span className="pd-stat-icon" style={{ background: "var(--sx-green-bg)", color: "var(--sx-green)" }}>✅</span>
            </div>
            <div className="pd-stat-value" style={{ color: "var(--sx-green)" }}>{approvedCount}</div>
          </div>
        </div>

        {/* ── MAIN DASHBOARD GRID (Clean 2-column preview layout) ────────────── */}
        <div className="pd-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* LATEST 2 SCHOLARSHIPS SECTION */}
          <section className="pd-section">
            <div className="pd-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="pd-section-heading" style={{ margin: 0 }}>
                Active Listings ({activeCount})
              </h2>
              <button
                className="pd-btn pd-btn-outline"
                style={{ fontSize: "13px", padding: "6px 14px", borderColor: "var(--sx-gold)", color: "var(--sx-gold)", fontWeight: "700" }}
                onClick={() => navigate("/provider/scholarships")}
              >
                View All →
              </button>
            </div>

            {latestScholarships.length > 0 ? (
              <ul className="pd-list">
                {latestScholarships.map((s) => (
                  <li key={s.id} className="pd-item">
                    <div className="pd-item-header">
                      <div>
                        <h3 className="pd-item-title">{s.name}</h3>
                        <div className="pd-item-meta">
                          <span>💰 {s.amount}</span>
                          <span>⏰ Deadline: {new Date(s.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: "13.5px", color: "var(--sx-text-secondary)", marginTop: "10px", lineHeight: "1.4" }}>
                      {s.description}
                    </p>
                    <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "12px" }}>
                      <span style={{ background: "var(--sx-surface-hover)", padding: "4px 8px", borderRadius: "4px", color: "var(--pd-text-muted)" }}>Level: {s.level}</span>
                      <span style={{ background: "var(--sx-surface-hover)", padding: "4px 8px", borderRadius: "4px", color: "var(--pd-text-muted)" }}>Field: {s.field}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ textAlign: "center", padding: "28px", color: "var(--pd-text-muted)", fontSize: "14px" }}>
                <p>No active listings posted yet.</p>
                <button
                  className="pd-btn pd-btn-outline"
                  style={{ marginTop: "8px", borderColor: "var(--sx-gold)", color: "var(--sx-gold)" }}
                  onClick={() => navigate("/provider/scholarships")}
                >
                  Create Scholarship Listing →
                </button>
              </div>
            )}
          </section>

          {/* LATEST 2 APPLICATIONS SECTION */}
          <section className="pd-section">
            <div className="pd-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="pd-section-heading" style={{ margin: 0 }}>
                Recent Applications ({totalAppsCount})
              </h2>
              <button
                className="pd-btn pd-btn-outline"
                style={{ fontSize: "13px", padding: "6px 14px", borderColor: "var(--sx-gold)", color: "var(--sx-gold)", fontWeight: "700" }}
                onClick={() => navigate("/provider/applications")}
              >
                View All →
              </button>
            </div>

            {latestApplications.length > 0 ? (
              <div>
                {latestApplications.map((app) => (
                  <div key={app.application_id} className="pd-applicant-card" style={{ marginBottom: "14px" }}>
                    <div className="pd-app-student-info" style={{ marginBottom: "10px", borderBottom: "1px solid var(--pd-border)", paddingBottom: "8px" }}>
                      <div>
                        <strong style={{ fontSize: "15px", color: "var(--sx-text-primary)" }}>
                          {app.first_name} {app.last_name}
                        </strong>
                        <div style={{ fontSize: "12px", color: "var(--pd-text-muted)", marginTop: "2px" }}>
                          Applied for: <strong>{app.scholarship_name}</strong>
                        </div>
                      </div>
                      <span className={`status-badge ${app.status}`}>
                        {app.status.replace("_", " ")}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "10px", fontSize: "12px", color: "var(--sx-text-muted)" }}>
                      <div><strong>Institution:</strong> {app.student_institution || "N/A"}</div>
                      <div><strong>Submitted:</strong> {new Date(app.submitted_at).toLocaleDateString()}</div>
                    </div>

                    <div className="pd-app-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button
                        className="pd-btn pd-btn-outline"
                        style={{ fontSize: "12px", padding: "5px 10px", borderColor: "var(--sx-blue)", color: "var(--sx-blue)" }}
                        onClick={() => setApplicantModal({ isOpen: true, applicant: app })}
                      >
                        View Profile 👁️
                      </button>
                      <button
                        className="pd-btn pd-btn-outline"
                        style={{ fontSize: "12px", padding: "5px 10px" }}
                        onClick={() => navigate("/provider/applications")}
                      >
                        Manage on Full Page →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--pd-text-muted)", fontSize: "14px", textAlign: "center", padding: "28px" }}>
                No applications received yet.
              </p>
            )}
          </section>
        </div>

        {/* ── APPLICANT & READ-ONLY STUDENT PROFILE MODAL ────────────────────────────────────────── */}
        {applicantModal.isOpen && applicantModal.applicant && (
          <div className="pd-modal-overlay" onClick={() => setApplicantModal({ isOpen: false, applicant: null })}>
            <div className="pd-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="pd-modal-header">
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--sx-text-primary)", margin: 0 }}>
                    🎓 {applicantModal.applicant.first_name} {applicantModal.applicant.last_name}
                  </h3>
                  <span style={{ fontSize: "13px", color: "var(--pd-text-muted)", marginTop: "2px", display: "block" }}>
                    Student Academic Profile · Applicant for {applicantModal.applicant.scholarship_name}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className={`status-badge ${applicantModal.applicant.status}`}>
                    {applicantModal.applicant.status.replace("_", " ")}
                  </span>
                  <button
                    onClick={() => setApplicantModal({ isOpen: false, applicant: null })}
                    style={{ background: "none", border: "none", color: "var(--sx-text-muted)", fontSize: "20px", cursor: "pointer" }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="pd-modal-body">
                {/* Clean Read-Only Student Academic Profile Layout */}
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
                      <span className="pd-detail-label">Country / Nationality</span>
                      <span className="pd-detail-val">{applicantModal.applicant.student_country || "Not specified"}</span>
                    </div>
                    <div className="pd-detail-item">
                      <span className="pd-detail-label">Institution / University</span>
                      <span className="pd-detail-val">{applicantModal.applicant.student_institution || "Not specified"}</span>
                    </div>
                    <div className="pd-detail-item">
                      <span className="pd-detail-label">Education Level</span>
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
                      <span className="pd-detail-label">Submission Date</span>
                      <span className="pd-detail-val">{new Date(applicantModal.applicant.submitted_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

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
              </div>

              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--pd-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  className="pd-btn pd-btn-outline"
                  onClick={() => navigate("/provider/applications")}
                  style={{ fontSize: "13px" }}
                >
                  Go to Full Application Manager →
                </button>
                <button
                  className="pd-btn pd-btn-outline"
                  onClick={() => setApplicantModal({ isOpen: false, applicant: null })}
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
