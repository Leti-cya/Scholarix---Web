/**
 * StudentApplications.jsx
 * ------------------------
 * Location: src/pages/StudentApplications.jsx
 *
 * Dedicated Student Applications Page.
 * Displays all scholarship applications submitted by the logged-in student,
 * fetched directly from the backend API.
 *
 * Features:
 * - Real backend data fetching with loading & error states
 * - Filter tabs (All, Submitted, Under Review, Shortlisted, Approved, Rejected)
 * - Expandable application cards showing full essay, submission timestamp, and scholarship details link
 * - High visual fidelity consistent with Scholarix dark theme design
 */

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./StudentDashboard.css";
import "./StudentApplications.css";
import { getStudentApplications } from "../service/Api";
import ThemeToggle from "../component/ThemeToggle";

const STATUS_CONFIG = {
  submitted: {
    label: "Submitted",
    badgeClass: "sa-status-submitted",
    icon: "📤"
  },
  under_review: {
    label: "Under Review",
    badgeClass: "sa-status-under_review",
    icon: "🔍"
  },
  shortlisted: {
    label: "Shortlisted",
    badgeClass: "sa-status-shortlisted",
    icon: "📋"
  },
  approved: {
    label: "Approved",
    badgeClass: "sa-status-approved",
    icon: "🎉"
  },
  rejected: {
    label: "Rejected",
    badgeClass: "sa-status-rejected",
    icon: "❌"
  }
};

const TABS = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under Review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" }
];

export default function StudentApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedAppId, setExpandedAppId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getStudentApplications();
      setApplications(response.data || []);
    } catch (err) {
      console.error("Failed to fetch student applications:", err);
      toast.error("Failed to load your applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (appId, e) => {
    // Avoid toggling if link was clicked
    if (e.target.closest("a")) return;
    setExpandedAppId(prev => (prev === appId ? null : appId));
  };

  const getFilteredApplications = () => {
    if (activeTab === "all") return applications;
    return applications.filter(app => app.status === activeTab);
  };

  const getTabCount = (tabKey) => {
    if (tabKey === "all") return applications.length;
    return applications.filter(app => app.status === tabKey).length;
  };

  const filteredApps = getFilteredApplications();

  return (
    <div className="sa-page">
      {/* Navigation Header */}
      <header className="sa-header">
        <div className="sa-header-inner">
          <div className="sa-nav-left">
            <h1 className="sa-title">My Applications</h1>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="sa-container">
        <div className="sa-hero">
          <h2 className="sa-hero-title">Track Your Scholarship Applications</h2>
          <p className="sa-hero-sub">
            View status updates, submission history, and essays for all scholarships you've applied to.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="sa-tabs-wrapper" role="tablist" aria-label="Filter applications by status">
          {TABS.map(tab => {
            const count = getTabCount(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                className={`sa-tab ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                <span className="sa-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--color-text-muted)" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                margin: "0 auto 16px auto",
                border: "3px solid var(--color-border)",
                borderTop: "3px solid #F5C842",
                borderRadius: "50%",
                animation: "sa-spin 1s linear infinite"
              }}
            />
            <p style={{ fontSize: "16px", fontWeight: "500" }}>Fetching your applications...</p>
            <style>{`@keyframes sa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="sa-empty-state">
            <div className="sa-empty-icon">📝</div>
            <h3 className="sa-empty-title">
              {activeTab === "all"
                ? "No applications submitted yet"
                : `No applications with status "${TABS.find(t => t.key === activeTab)?.label}"`}
            </h3>
            <p className="sa-empty-desc">
              {activeTab === "all"
                ? "Browse available scholarships and submit your first application to start tracking your progress here."
                : "You don't have any applications matching this filter status."}
            </p>
            {activeTab === "all" ? (
              <button className="sa-btn-primary" onClick={() => navigate("/scholarships")}>
                Explore Available Scholarships →
              </button>
            ) : (
              <button
                className="sa-btn-primary"
                style={{ background: "var(--color-border)", color: "var(--color-text)" }}
                onClick={() => setActiveTab("all")}
              >
                View All Applications
              </button>
            )}
          </div>
        ) : (
          <div className="sa-applications-grid">
            {filteredApps.map(app => {
              const isExpanded = expandedAppId === app.application_id;
              const statusInfo = STATUS_CONFIG[app.status] || {
                label: app.status.replace("_", " "),
                badgeClass: "sa-status-submitted",
                icon: "📌"
              };

              const formattedDate = app.submitted_at
                ? new Date(app.submitted_at).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })
                : "N/A";

              const deadlineDate = app.scholarship_deadline
                ? new Date(app.scholarship_deadline).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })
                : null;

              return (
                <div
                  key={app.application_id}
                  className={`sa-card ${isExpanded ? "expanded" : ""}`}
                  onClick={(e) => handleToggleExpand(app.application_id, e)}
                >
                  <div className="sa-card-header">
                    <div className="sa-card-info">
                      <h3 className="sa-scholarship-name">
                        {app.scholarship_name}
                      </h3>
                      <p className="sa-provider-name">
                        🏢 Provider: {app.provider_name || "Institution / Provider"}
                      </p>
                    </div>

                    <div className={`sa-status-badge ${statusInfo.badgeClass}`}>
                      <span>{statusInfo.icon}</span>
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>

                  <div className="sa-meta-row">
                    <div className="sa-meta-item">
                      📅 Submitted: <strong>{formattedDate}</strong>
                    </div>
                    {app.scholarship_amount && (
                      <div className="sa-meta-item">
                        💰 Amount: <strong>{app.scholarship_amount}</strong>
                      </div>
                    )}
                    {deadlineDate && (
                      <div className="sa-meta-item">
                        ⏰ Deadline: <strong>{deadlineDate}</strong>
                      </div>
                    )}
                  </div>

                  {/* Essay Section */}
                  {app.essay && (
                    <div className="sa-essay-box" onClick={(e) => e.stopPropagation()}>
                      <div className="sa-essay-label">
                        <span>Application Statement / Essay</span>
                        <span style={{ fontSize: "11px", color: "var(--color-text-faint)" }}>
                          {isExpanded ? "Full text" : "Preview"}
                        </span>
                      </div>
                      <p className={`sa-essay-text ${isExpanded ? "full" : "preview"}`}>
                        {app.essay}
                      </p>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="sa-card-footer">
                    <button className="sa-expand-btn">
                      {isExpanded ? "▲ Collapse Details" : "▼ Click to View Full Details"}
                    </button>

                    {app.scholarship_id && (
                      <Link
                        to={`/scholarships/${app.scholarship_id}`}
                        className="sa-details-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Scholarship Details →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
