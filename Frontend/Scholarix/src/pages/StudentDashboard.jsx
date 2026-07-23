/**
 * StudentDashboard.jsx
 * ---------------------
 * Location: src/pages/StudentDashboard.jsx
 *
 * The main baseline dashboard view for a logged-in student. Shows a personalised
 * welcome banner, profile summary, scholarship statistics, upcoming deadlines,
 * recent application tracking, AI-matched recommendations, and profile details.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../component/Layout";
import "./StudentDashboard.css";
import {
  getProfile,
  updateProfile,
  getMatches,
  getStudentApplications,
  applyScholarship
} from "../service/Api";

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

function deadlineUrgency(daysLeft) {
  if (daysLeft <= 3) return "urgent";
  if (daysLeft <= 10) return "soon";
  return "ok";
}

// ─────────────────────────────────────────────
// SMALL SUB-COMPONENTS (BASELINE WIDGETS)
// ─────────────────────────────────────────────

function ProfileCard({ student, onEdit }) {
  const initials = student.firstName ? `${student.firstName[0]}${student.lastName ? student.lastName[0] : ""}` : "S";

  return (
    <div className="sd-profile-card">
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <div
          className="sd-avatar"
          aria-label={`Avatar for ${student.firstName}`}
          style={{ margin: "0 auto" }}
        >
          {initials}
        </div>
      </div>

      <div className="sd-profile-info">
        <h3 className="sd-profile-name">{student.firstName} {student.lastName}</h3>
        <p className="sd-profile-course">{student.level || "Degree Level Not Set"}</p>
        <p className="sd-profile-institution">{student.institution || "Institution Not Set"}</p>

        <div className="sd-profile-meta">
          <span className="sd-meta-pill">📍 {student.country || "Country Not Set"}</span>
          <span className="sd-meta-pill">📚 {student.field || "Field Not Set"}</span>
          {student.gpa && <span className="sd-meta-pill">📊 GPA {student.gpa}</span>}
        </div>
      </div>

      {/* Profile completion progress */}
      <div className="sd-profile-completion">
        <div className="sd-completion-header">
          <span className="sd-completion-label">Profile completion</span>
          <span className="sd-completion-pct">{student.profileCompletion}%</span>
        </div>
        <div
          className="sd-progress-track"
          role="progressbar"
          aria-valuenow={student.profileCompletion}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Profile completion"
        >
          <div
            className="sd-progress-fill"
            style={{ width: `${student.profileCompletion}%` }}
          />
        </div>
        {student.profileCompletion < 100 && (
          <p className="sd-completion-tip">
            Complete your profile details to unlock better scholarship matches.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ stat }) {
  return (
    <div className={`sd-stat-card sd-stat-${stat.color}`}>
      <div className="sd-stat-header">
        <span className="sd-stat-label">{stat.label}</span>
        <span className="sd-stat-icon" aria-hidden="true">
          {stat.icon}
        </span>
      </div>
      <div className="sd-stat-value">{stat.value}</div>
      {stat.delta && (
        <div className="sd-stat-delta delta-neutral">
          {stat.delta}
        </div>
      )}
    </div>
  );
}

function DeadlineItem({ item, onViewDetails }) {
  const urgency = deadlineUrgency(item.daysLeft);
  return (
    <li className="sd-deadline-item" style={{ cursor: "pointer" }} onClick={() => onViewDetails(item.id)}>
      <div className={`sd-deadline-dot dot-${urgency}`} aria-hidden="true" />

      <div className="sd-deadline-info">
        <strong className="sd-deadline-name">{item.name}</strong>
        <span className="sd-deadline-provider">{item.provider_name}</span>
        <span className="sd-deadline-amount">{item.amount}</span>
      </div>

      <div className={`sd-deadline-badge badge-${urgency}`}>
        {item.daysLeft <= 0 ? "Closed" : item.daysLeft === 1 ? "Today!" : `${item.daysLeft}d`}
      </div>
    </li>
  );
}

function RecommendationCard({ item, onApply, onViewDetails, isApplied }) {
  return (
    <div className="sd-rec-card card-blue">
      <div className="sd-rec-match" title="AI match score">
        <span className="sd-rec-match-value">95%</span>
        <span className="sd-rec-match-label">match</span>
      </div>

      <div className="sd-rec-body">
        <h4 className="sd-rec-name" style={{ cursor: "pointer" }} onClick={() => onViewDetails(item.id)}>
          {item.name}
        </h4>
        <p className="sd-rec-provider">{item.provider_name}</p>
        <span className="sd-rec-field-badge">{item.field}</span>
      </div>

      <div className="sd-rec-footer">
        <div className="sd-rec-amount">{item.amount}</div>
        <div className="sd-rec-deadline">⏰ {new Date(item.deadline).toLocaleDateString()}</div>
      </div>

      <div className="sd-rec-actions" style={{ display: "flex", gap: "8px" }}>
        <button
          className="sd-btn-outline"
          style={{ flex: 1, padding: "8px", fontSize: "13px" }}
          onClick={() => onViewDetails(item.id)}
        >
          Details
        </button>
        {isApplied ? (
          <button className="sd-btn-primary" style={{ flex: 1, background: "var(--sx-border)", color: "var(--sx-text-muted)", cursor: "default", padding: "8px", fontSize: "13px" }} disabled>
            ✓ Applied
          </button>
        ) : (
          <button className="sd-btn-primary" style={{ flex: 1, padding: "8px", fontSize: "13px" }} onClick={() => onApply(item.id, item.name)}>
            Apply →
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ─────────────────────────────────────────────

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [student, setStudent] = useState({
    firstName: "Student",
    lastName: "",
    email: "",
    level: "",
    field: "",
    institution: "",
    country: "",
    gpa: "",
    profileCompletion: 50
  });

  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit profile modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Application modal state
  const [applyModal, setApplyModal] = useState({ isOpen: false, scholarshipId: null, scholarshipName: "" });
  const [essayText, setEssayText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      try {
        const profileRes = await getProfile();
        const p = profileRes.data;
        const fields = [p.first_name || p.firstName, p.last_name || p.lastName, p.email, p.level, p.field, p.institution, p.gpa, p.country];
        const filled = fields.filter(val => val !== undefined && val !== null && String(val).trim() !== "").length;
        const completionPct = Math.round((filled / fields.length) * 100);

        const loadedStudent = {
          firstName: p.first_name || p.firstName || "Student",
          lastName: p.last_name || p.lastName || "",
          email: p.email || "",
          level: p.level || "",
          field: p.field || "",
          country: p.country || "",
          institution: p.institution || "",
          gpa: p.gpa || "",
          profileCompletion: completionPct
        };
        setStudent(loadedStudent);
        setProfileForm(loadedStudent);
      } catch (err) {
        console.error("Profile load error:", err);
      }

      try {
        const matchesRes = await getMatches();
        setScholarships(matchesRes.data || []);
      } catch (err) {
        console.error("Matches load error:", err);
      }

      try {
        const appsRes = await getStudentApplications();
        setApplications(appsRes.data || []);
      } catch (err) {
        console.error("Apps load error:", err);
      }

    } catch (e) {
      console.error(e);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenEditProfile = () => {
    navigate("/profile");
  };

  const handleOpenApplyModal = (scholarshipId, scholarshipName) => {
    setApplyModal({ isOpen: true, scholarshipId, scholarshipName });
    setEssayText("");
  };

  const handleCloseApplyModal = () => {
    setApplyModal({ isOpen: false, scholarshipId: null, scholarshipName: "" });
    setEssayText("");
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!essayText.trim()) {
      toast.error("An essay statement is required to apply.");
      return;
    }

    try {
      setSubmitting(true);
      await applyScholarship({ scholarship_id: applyModal.scholarshipId, essay: essayText });
      toast.success("Application submitted successfully!");
      handleCloseApplyModal();
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const totalAvailable = scholarships.length;
  const appliedCount = applications.length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;

  const stats = [
    {
      id: 1,
      label: "Matched For You",
      value: totalAvailable.toString(),
      icon: "🎓",
      color: "blue",
      delta: "Based on eligibility"
    },
    {
      id: 2,
      label: "Applications Sent",
      value: appliedCount.toString(),
      icon: "📤",
      color: "gold",
      delta: "Track status below"
    },
    {
      id: 3,
      label: "Awards Approved",
      value: approvedCount.toString(),
      icon: "🏆",
      color: "green",
      delta: "Accepted offers"
    }
  ];

  const upcomingDeadlines = scholarships
    .map(s => {
      const diffTime = new Date(s.deadline) - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...s, daysLeft: diffDays };
    })
    .filter(s => s.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4);

  if (loading) {
    return (
      <Layout role="student">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--sx-border)', borderTop: '4px solid var(--sx-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500', color: 'var(--sx-text-primary)' }}>Loading your dashboard...</p>
        </div>
      </Layout>
    );
  }

  // Display ONLY latest 2 applications on dashboard
  const recentApplicationsDisplay = applications.slice(0, 2);

  return (
    <Layout role="student">
      <div className="sd-page" style={{ maxWidth: "1400px", margin: "0 auto", width: "100%", padding: "24px 32px 48px" }}>
        {/* ── WELCOME BANNER (Cleaned Header) ────────────────────────────────── */}
        <header className="sd-welcome-banner">
          <div className="sd-welcome-text">
            <h1 className="sd-welcome-heading">
              {getGreeting()}, {student.firstName} 👋
            </h1>
            <p className="sd-welcome-sub">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {" · "}
              {upcomingDeadlines.filter((d) => d.daysLeft <= 10).length} deadline(s) in the next 10 days
            </p>
          </div>
        </header>

        {/* ── MAIN BASELINE GRID ────────────────────────────────────────────── */}
        <div className="sd-grid">
          {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
          <aside className="sd-left-col">
            {/* PROFILE CARD */}
            <section className="sd-section" aria-labelledby="profile-heading">
              <h2 className="sd-section-heading" id="profile-heading">
                My Profile
              </h2>
              <ProfileCard student={student} onEdit={handleOpenEditProfile} />
            </section>

            {/* UPCOMING DEADLINES */}
            <section className="sd-section" aria-labelledby="deadlines-heading">
              <div className="sd-section-header">
                <h2 className="sd-section-heading" id="deadlines-heading">
                  Upcoming Deadlines
                </h2>
              </div>
              {upcomingDeadlines.length > 0 ? (
                <ul className="sd-deadline-list" aria-label="Upcoming scholarship deadlines">
                  {upcomingDeadlines.map((item) => (
                    <DeadlineItem key={item.id} item={item} onViewDetails={(sId) => navigate('/scholarships/' + sId)} />
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--sx-text-muted)', fontSize: '14px', padding: '12px' }}>No upcoming deadlines for your matched scholarships.</p>
              )}
            </section>

            {/* RECENT APPLICATIONS TRACKING (LATEST 2) */}
            <section className="sd-section" aria-labelledby="notif-heading">
              <div className="sd-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="sd-section-heading" id="notif-heading">
                  Application Tracking
                </h2>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--sx-gold)', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}
                  onClick={() => navigate('/applications')}
                >
                  View All →
                </button>
              </div>
              {recentApplicationsDisplay.length > 0 ? (
                <ul className="sd-notif-list" aria-label="Submitted applications list">
                  {recentApplicationsDisplay.map((item) => {
                    let statusColor = "notif-info";
                    let statusEmoji = "⏳";
                    if (item.status === "approved") {
                      statusColor = "notif-success";
                      statusEmoji = "🎉";
                    } else if (item.status === "rejected") {
                      statusColor = "notif-error";
                      statusEmoji = "❌";
                    } else if (item.status === "shortlisted") {
                      statusColor = "notif-warning";
                      statusEmoji = "📋";
                    }

                    return (
                      <li key={item.application_id} className="sd-notif-item" style={{ cursor: "default" }}>
                        <span className={`sd-notif-icon ${statusColor}`} aria-hidden="true">
                          {statusEmoji}
                        </span>
                        <div className="sd-notif-content">
                          <strong className="sd-notif-title">{item.scholarship_name}</strong>
                          <p className="sd-notif-body">
                            Status: <span style={{ textTransform: "capitalize", fontWeight: "600" }}>{item.status.replace("_", " ")}</span>
                          </p>
                          <time className="sd-notif-time">
                            Applied: {new Date(item.submitted_at).toLocaleDateString()}
                          </time>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p style={{ color: 'var(--sx-text-muted)', fontSize: '14px', padding: '12px' }}>You haven't submitted any applications yet.</p>
              )}
            </section>
          </aside>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
          <div className="sd-right-col">
            {/* STATISTICS ROW */}
            <section aria-labelledby="stats-heading">
              <h2 className="sd-sr-only" id="stats-heading">
                Scholarship statistics
              </h2>
              <div className="sd-stats-grid">
                {stats.map((stat) => (
                  <StatCard key={stat.id} stat={stat} />
                ))}
              </div>
            </section>

            {/* PROFILE DETAILS (QUICK ACTIONS) */}
            <section className="sd-section" aria-labelledby="qa-heading">
              <div className="sd-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="sd-section-heading" id="qa-heading">
                  My Profile Details
                </h2>
                <button
                  onClick={() => navigate('/profile')}
                  style={{ background: 'none', border: 'none', color: 'var(--sx-gold)', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}
                >
                  Edit Profile →
                </button>
              </div>
              <div style={{ background: 'var(--sx-surface)', padding: '18px', borderRadius: '12px', border: '1px solid var(--sx-border)', color: 'var(--sx-text-primary)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Registered Email:</strong> {student.email}</div>
                <div><strong>Education Level:</strong> {student.level || "Not specified"}</div>
                <div><strong>Field of Study:</strong> {student.field || "Not specified"}</div>
                <div><strong>Institution:</strong> {student.institution || "Not specified"}</div>
                <div><strong>GPA Score:</strong> {student.gpa || "Not specified"}</div>
              </div>
            </section>

            {/* RECOMMENDED SCHOLARSHIPS (AI MATCHES) */}
            <section className="sd-section" aria-labelledby="rec-heading">
              <div className="sd-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="sd-section-heading" id="rec-heading">
                    Recommended For You
                  </h2>
                  <p className="sd-section-sub">
                    Matches based on your profile criteria ({student.level || 'All'}, {student.field || 'All'}, {student.country || 'Global'})
                  </p>
                </div>
                <button
                  onClick={() => navigate('/scholarships')}
                  style={{ background: 'none', border: 'none', color: 'var(--sx-gold)', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}
                >
                  View All →
                </button>
              </div>
              {scholarships.length > 0 ? (
                <div className="sd-rec-grid">
                  {scholarships.slice(0, 4).map((item) => {
                    const isAlreadyApplied = applications.some(a => a.scholarship_id === item.id);
                    return (
                      <RecommendationCard
                        key={item.id}
                        item={item}
                        onApply={handleOpenApplyModal}
                        onViewDetails={(sId) => navigate('/scholarships/' + sId)}
                        isApplied={isAlreadyApplied}
                      />
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px', background: 'var(--sx-surface)', borderRadius: '12px', border: '1px solid var(--sx-border)' }}>
                  <p style={{ color: 'var(--sx-text-secondary)', fontSize: '15px' }}>No scholarships currently match your profile criteria.</p>
                  <button onClick={() => navigate('/profile')} style={{ marginTop: '8px', background: 'none', border: 'none', color: 'var(--sx-gold)', cursor: 'pointer', fontWeight: '600' }}>
                    Update your profile details →
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* APPLY MODAL */}
        {applyModal.isOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ background: "var(--sx-surface)", border: "1px solid var(--sx-border)", borderRadius: "16px", padding: "32px", maxWidth: "540px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--sx-text-primary)", margin: 0 }}>
                  Apply for {applyModal.scholarshipName}
                </h3>
                <button onClick={handleCloseApplyModal} style={{ background: "none", border: "none", color: "var(--sx-text-muted)", fontSize: "20px", cursor: "pointer" }}>✕</button>
              </div>
              <form onSubmit={handleSubmitApplication}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--sx-text-secondary)", marginBottom: "8px" }}>
                    Personal Statement / Qualification Essay
                  </label>
                  <textarea
                    rows={6}
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                    placeholder="Explain why you qualify for this scholarship..."
                    required
                    style={{ width: "100%", background: "var(--sx-bg)", border: "1px solid var(--sx-border)", borderRadius: "8px", padding: "12px", color: "var(--sx-text-primary)", fontSize: "14px", resize: "vertical" }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <button type="button" onClick={handleCloseApplyModal} style={{ padding: "10px 18px", borderRadius: "8px", background: "transparent", border: "1px solid var(--sx-border)", color: "var(--sx-text-secondary)", cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} style={{ padding: "10px 20px", borderRadius: "8px", background: "var(--sx-gold)", color: "#0F172A", fontWeight: "700", border: "none", cursor: "pointer" }}>
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}