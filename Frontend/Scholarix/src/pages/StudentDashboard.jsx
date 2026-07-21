/**
 * StudentDashboard.jsx
 * ---------------------
 * Location: src/pages/StudentDashboard.jsx
 *
 * The main dashboard view for a logged-in student. Shows a personalised
 * welcome, profile summary, scholarship statistics, upcoming deadlines,
 * recent notifications, AI-matched recommendations, and quick actions.
 *
 * Fetches real data from the backend APIs (user profile, matches, applications).
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./StudentDashboard.css";
import {
  getProfile,
  getMatches,
  getStudentApplications,
  applyScholarship
} from "../service/Api";

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Returns a CSS class name based on how many days are left.
 * Used to colour the deadline badge: red (urgent), amber, green.
 */
function deadlineUrgency(daysLeft) {
  if (daysLeft <= 3) return "urgent";
  if (daysLeft <= 10) return "soon";
  return "ok";
}

/**
 * Maps a notification type string to an emoji icon.
 */
function notificationIcon(type) {
  const icons = { success: "🏆", warning: "⚠️", info: "💡", error: "❌" };
  return icons[type] || "🔔";
}

// ─────────────────────────────────────────────
// SMALL SUB-COMPONENTS
// ─────────────────────────────────────────────

/**
 * ProfileCard — student's photo/initials, name, course, and
 * a completion progress bar that nudges them to fill their profile.
 */
function ProfileCard({ student }) {
  const initials = student.firstName ? `${student.firstName[0]}${student.lastName ? student.lastName[0] : ""}` : "S";

  return (
    <div className="sd-profile-card">
      <div className="sd-avatar" aria-label={`Avatar for ${student.firstName}`}>
        {initials}
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

/**
 * StatCard — one of the four summary tiles at the top of the dashboard.
 */
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

/**
 * DeadlineItem — a single row in the upcoming deadlines list.
 */
function DeadlineItem({ item }) {
  const urgency = deadlineUrgency(item.daysLeft);
  return (
    <li className="sd-deadline-item">
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

/**
 * RecommendationCard — one recommended scholarship.
 */
function RecommendationCard({ item, onApply, isApplied }) {
  return (
    <div className="sd-rec-card card-blue">
      <div className="sd-rec-match" title="AI match score">
        <span className="sd-rec-match-value">95%</span>
        <span className="sd-rec-match-label">match</span>
      </div>

      <div className="sd-rec-body">
        <h4 className="sd-rec-name">{item.name}</h4>
        <p className="sd-rec-provider">{item.provider_name}</p>
        <span className="sd-rec-field-badge">{item.field}</span>
      </div>

      <div className="sd-rec-footer">
        <div className="sd-rec-amount">{item.amount}</div>
        <div className="sd-rec-deadline">⏰ {new Date(item.deadline).toLocaleDateString()}</div>
      </div>

      <div className="sd-rec-actions">
        {isApplied ? (
          <button className="sd-btn-primary" style={{ width: "100%", background: "#4A5568", cursor: "default" }} disabled>
            ✓ Applied
          </button>
        ) : (
          <button className="sd-btn-primary" style={{ width: "100%" }} onClick={() => onApply(item.id, item.name)}>
            Apply →
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
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

  // Dynamic Statistics
  const totalAvailable = scholarships.length;
  const appliedCount = applications.length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const pendingCount = applications.filter(a => a.status === 'submitted' || a.status === 'under_review' || a.status === 'shortlisted').length;

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
      icon: "✅",
      color: "green",
      delta: "Congratulations!"
    },
    {
      id: 4,
      label: "Pending Review",
      value: pendingCount.toString(),
      icon: "⏳",
      color: "amber",
      delta: "Awaiting provider check"
    }
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Student Profile details
      const profileRes = await getProfile();
      const pData = profileRes.data;
      
      // Calculate completion score dynamically
      const fields = [pData.first_name, pData.last_name, pData.country, pData.phone, pData.level, pData.field, pData.institution, pData.gpa];
      const filledCount = fields.filter(f => f && f.trim() !== "" && f !== "Select level" && f !== "Select field" && f !== "Select country").length;
      const completionPct = Math.round((filledCount / 8) * 100);

      setStudent({
        firstName: pData.first_name || "Student",
        lastName: pData.last_name || "",
        email: pData.email || "",
        level: pData.level,
        field: pData.field,
        institution: pData.institution,
        country: pData.country,
        gpa: pData.gpa,
        profileCompletion: completionPct
      });

      // 2. Fetch Matched Scholarships
      const matchesRes = await getMatches();
      setScholarships(matchesRes.data);

      // 3. Fetch Student Applications
      const appsRes = await getStudentApplications();
      setApplications(appsRes.data);

    } catch (e) {
      console.error("Dashboard Loading Error:", e);
      toast.error("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApply = async (scholarshipId, scholarshipName) => {
    const essay = window.prompt(`Apply for ${scholarshipName}\n\nEnter a brief statement/essay stating why you qualify:`);
    if (essay === null) return; // cancelled
    if (!essay.trim()) {
      toast.error("An essay statement is required to apply.");
      return;
    }

    try {
      await applyScholarship({ scholarshipId, essay });
      toast.success("Application submitted successfully!");
      fetchDashboardData(); // reload
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Calculate upcoming deadlines (scholarships closing soonest)
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
      <div className="sd-loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A', color: 'white' }}>
        <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #F5C842', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500' }}>Loading your dashboard...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="sd-page">
      {/* ── WELCOME BANNER ────────────────────────────────────────────── */}
      <header className="sd-welcome-banner">
        <div className="sd-welcome-text">
          <h1 className="sd-welcome-heading">
            {greeting}, {student.firstName} 👋
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="sd-btn-outline" style={{ border: '1px solid #EF4444', color: '#EF4444' }} onClick={handleLogout} aria-label="Sign out">
            Sign Out
          </button>
        </div>
      </header>

      {/* ── MAIN GRID ──────────────────────────────────────────────────── */}
      <div className="sd-grid">
        {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
        <aside className="sd-left-col">
          {/* PROFILE CARD */}
          <section className="sd-section" aria-labelledby="profile-heading">
            <h2 className="sd-section-heading" id="profile-heading">
              My Profile
            </h2>
            <ProfileCard student={student} />
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
                  <DeadlineItem key={item.id} item={item} />
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--sd-muted)', fontSize: '14px', padding: '12px' }}>No upcoming deadlines for your matched scholarships.</p>
            )}
          </section>

          {/* SUBMITTED APPLICATIONS LIST */}
          <section className="sd-section" aria-labelledby="notif-heading">
            <div className="sd-section-header">
              <h2 className="sd-section-heading" id="notif-heading">
                Application Tracking
              </h2>
            </div>
            {applications.length > 0 ? (
              <ul className="sd-notif-list" aria-label="Submitted applications list">
                {applications.map((item) => {
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
              <p style={{ color: 'var(--sd-muted)', fontSize: '14px', padding: '12px' }}>You haven't submitted any applications yet.</p>
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

          {/* QUICK ACTIONS */}
          <section className="sd-section" aria-labelledby="qa-heading">
            <h2 className="sd-section-heading" id="qa-heading">
              My Profile Details
            </h2>
            <div style={{ background: '#1E293B', padding: '16px', borderRadius: '12px', border: '1px solid #334155', color: '#CBD5E1', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Registered Email:</strong> {student.email}</div>
              <div><strong>Education Level:</strong> {student.level || "Not specified"}</div>
              <div><strong>Field of Study:</strong> {student.field || "Not specified"}</div>
              <div><strong>Institution:</strong> {student.institution || "Not specified"}</div>
              <div><strong>GPA Score:</strong> {student.gpa || "Not specified"}</div>
            </div>
          </section>

          {/* RECOMMENDED SCHOLARSHIPS */}
          <section className="sd-section" aria-labelledby="rec-heading">
            <div className="sd-section-header">
              <div>
                <h2 className="sd-section-heading" id="rec-heading">
                  Recommended For You
                </h2>
                <p className="sd-section-sub">
                  Matches based on your profile criteria ({student.level}, {student.field}, {student.country})
                </p>
              </div>
            </div>
            {scholarships.length > 0 ? (
              <div className="sd-rec-grid">
                {scholarships.map((item) => {
                  const isAlreadyApplied = applications.some(a => a.scholarship_id === item.id);
                  return (
                    <RecommendationCard
                      key={item.id}
                      item={item}
                      onApply={handleApply}
                      isApplied={isAlreadyApplied}
                    />
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', background: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
                <p style={{ color: '#94A3B8', fontSize: '15px' }}>No scholarships currently match your profile criteria.</p>
                <p style={{ color: '#64748B', fontSize: '13px', marginTop: '4px' }}>Try editing your profile details to see other opportunities.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}