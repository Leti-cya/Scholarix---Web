/**
 * ProviderDashboard.jsx
 * ---------------------
 * Location: src/pages/ProviderDashboard.jsx
 *
 * The dashboard view for a logged-in scholarship provider.
 * Allows managing listings (CRUD) and tracking/approving applications.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./ProviderDashboard.css";
import Api from "../service/Api";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState({ orgName: "Provider Org", contactName: "" });
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for creating a scholarship
  const [newScholarship, setNewScholarship] = useState({
    name: "",
    providerName: "",
    description: "",
    amount: "",
    deadline: "",
    level: "Select level",
    field: "Select field",
    country: "Select country",
    requirements: ""
  });
  const [creating, setCreating] = useState(false);

  const fetchProviderData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Provider Profile details
      const profileRes = await Api.get("/api/auth/profile");
      setProvider({
        orgName: profileRes.data.org_name || "Organisation",
        contactName: profileRes.data.contact_name || "Representative"
      });

      // Automatically prefill providerName in the form
      setNewScholarship(prev => ({
        ...prev,
        providerName: profileRes.data.org_name || ""
      }));

      // 2. Fetch Provider's Listed Scholarships
      const scholarshipsRes = await Api.get("/api/scholarships/provider");
      setScholarships(scholarshipsRes.data);

      // 3. Fetch Applications submitted to Provider's Scholarships
      const appsRes = await Api.get("/api/applications/provider");
      setApplications(appsRes.data);

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

  const handleCreateScholarship = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!newScholarship.name.trim() || !newScholarship.description.trim() || !newScholarship.amount.trim() || !newScholarship.deadline) {
      toast.error("Please fill in all core scholarship details.");
      return;
    }
    if (newScholarship.level === "Select level" || newScholarship.field === "Select field" || newScholarship.country === "Select country") {
      toast.error("Please select specific eligibility criteria (Level, Field, Country).");
      return;
    }

    try {
      setCreating(true);
      await Api.post("/api/scholarships", newScholarship);
      toast.success("Scholarship listed successfully!");
      
      // Reset form (except providerName)
      setNewScholarship(prev => ({
        name: "",
        providerName: prev.providerName,
        description: "",
        amount: "",
        deadline: "",
        level: "Select level",
        field: "Select field",
        country: "Select country",
        requirements: ""
      }));

      // Reload listings
      const listRes = await Api.get("/api/scholarships/provider");
      setScholarships(listRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create scholarship listing.");
    } finally {
      setCreating(false);
    }
  };

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, scholarshipId: null });
  const [deleting, setDeleting] = useState(false);

  const [editModal, setEditModal] = useState({ isOpen: false, scholarshipId: null });
  const [editForm, setEditForm] = useState({
    name: "",
    providerName: "",
    description: "",
    amount: "",
    deadline: "",
    level: "Select level",
    field: "Select field",
    country: "Select country",
    requirements: ""
  });
  const [updating, setUpdating] = useState(false);

  const handleOpenEditModal = (s) => {
    const formattedDeadline = s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : "";
    setEditModal({ isOpen: true, scholarshipId: s.id });
    setEditForm({
      name: s.name || "",
      providerName: s.provider_name || "",
      description: s.description || "",
      amount: s.amount || "",
      deadline: formattedDeadline,
      level: s.level || "Select level",
      field: s.field || "Select field",
      country: s.country || "Select country",
      requirements: s.requirements || ""
    });
  };

  const handleCloseEditModal = () => {
    setEditModal({ isOpen: false, scholarshipId: null });
  };

  const handleSaveEditScholarship = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.description.trim() || !editForm.amount.trim() || !editForm.deadline) {
      toast.error("Please fill in all core scholarship details.");
      return;
    }

    try {
      setUpdating(true);
      await Api.put(`/api/scholarships/${editModal.scholarshipId}`, editForm);
      toast.success("Scholarship listing updated successfully!");
      handleCloseEditModal();
      fetchProviderData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update scholarship listing.");
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenDeleteModal = (id) => {
    setDeleteModal({ isOpen: true, scholarshipId: id });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, scholarshipId: null });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.scholarshipId) return;
    try {
      setDeleting(true);
      await Api.delete(`/api/scholarships/${deleteModal.scholarshipId}`);
      toast.success("Scholarship listing deleted successfully.");
      handleCloseDeleteModal();
      fetchProviderData();
    } catch (error) {
      toast.error("Failed to delete scholarship.");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await Api.patch(`/api/applications/${applicationId}/status`, { status });
      toast.success(`Application status updated to ${status.replace("_", " ")}.`);
      
      // Reload applications list
      const appsRes = await Api.get("/api/applications/provider");
      setApplications(appsRes.data);
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
  const approvedCount = applications.filter(a => a.status === "approved").length;
  const reviewPendingCount = applications.filter(a => a.status === "submitted").length;

  const LEVELS = [
    "Select level",
    "High School / Secondary",
    "Undergraduate (Bachelor's)",
    "Postgraduate (Master's)",
    "Doctoral (PhD)",
    "Postdoctoral",
    "Vocational / Certificate",
    "All Levels"
  ];

  const FIELDS = [
    "Select field",
    "Arts & Humanities",
    "Business & Management",
    "Computer Science & IT",
    "Education",
    "Engineering & Technology",
    "Environment & Sustainability",
    "Law",
    "Medicine & Health",
    "Natural Sciences",
    "Social Sciences",
    "All Fields"
  ];

  const COUNTRIES = [
    "Select country",
    "Global",
    "Australia", "Bangladesh", "Brazil", "Canada", "China",
    "Egypt", "Ethiopia", "France", "Germany", "Ghana",
    "India", "Indonesia", "Japan", "Kenya", "Mexico",
    "Nepal", "Nigeria", "Pakistan", "Philippines", "Sierra Leone",
    "South Africa", "South Korea", "Sri Lanka", "Tanzania", "Uganda",
    "United Kingdom", "United States", "Vietnam", "Zimbabwe", "Other"
  ];

  if (loading) {
    return (
      <div className="sd-loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A', color: 'white' }}>
        <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500' }}>Loading provider dashboard...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="pd-page">
      {/* ── HEADER BANNER ────────────────────────────────────────────── */}
      <header className="pd-welcome-banner">
        <div>
          <h1 className="pd-welcome-heading">{provider.orgName}</h1>
          <p className="pd-welcome-sub">Welcome back, {provider.contactName} · Manage your listings and applications</p>
        </div>
        <button className="pd-btn pd-btn-outline" style={{ borderColor: '#EF4444', color: '#EF4444' }} onClick={handleLogout}>
          Sign Out
        </button>
      </header>

      {/* ── STATISTICS ROW ────────────────────────────────────────────── */}
      <div className="pd-stats-grid">
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Active Listings</span>
            <span className="pd-stat-icon">🎓</span>
          </div>
          <div className="pd-stat-value">{activeCount}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Total Applications</span>
            <span className="pd-stat-icon">📥</span>
          </div>
          <div className="pd-stat-value">{totalAppsCount}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Awards Approved</span>
            <span className="pd-stat-icon">✅</span>
          </div>
          <div className="pd-stat-value">{approvedCount}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Review Pending</span>
            <span className="pd-stat-icon">⏳</span>
          </div>
          <div className="pd-stat-value">{reviewPendingCount}</div>
        </div>
      </div>

      {/* ── MAIN DASHBOARD GRID ────────────────────────────────────────────── */}
      <div className="pd-grid">
        {/* LEFT COLUMN: ACTIVE LISTINGS & APPLICATIONS */}
        <div>
          {/* APPLICATIONS REVIEW SECTION */}
          <section className="pd-section">
            <div className="pd-section-header">
              <h2 className="pd-section-heading">Applications Received ({totalAppsCount})</h2>
            </div>
            {applications.length > 0 ? (
              <div>
                {applications.map((app) => (
                  <div key={app.application_id} className="pd-app-card">
                    <div className="pd-app-student-info">
                      <div>
                        <strong style={{ fontSize: "16px", color: "white" }}>
                          {app.first_name} {app.last_name}
                        </strong>
                        <div style={{ fontSize: "13px", color: "var(--pd-text-muted)", marginTop: "4px" }}>
                          {app.student_email} · 📍 {app.student_country}
                        </div>
                      </div>
                      <span className={`status-badge ${app.status}`}>
                        {app.status.replace("_", " ")}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px", fontSize: "13px", color: "#94A3B8" }}>
                      <div><strong>GPA Score:</strong> {app.student_gpa || "N/A"}</div>
                      <div><strong>Study Level:</strong> {app.student_level || "N/A"}</div>
                      <div><strong>Field of Study:</strong> {app.student_field || "N/A"}</div>
                    </div>

                    <div style={{ fontSize: "13px", color: "var(--pd-text-muted)", marginBottom: "4px" }}>
                      <strong>Applied for:</strong> {app.scholarship_name} ({app.scholarship_amount})
                    </div>

                    <div className="pd-app-essay">
                      <strong>Applicant Essay Statement:</strong>
                      <p style={{ marginTop: "6px", whiteSpace: "pre-line" }}>{app.essay || "No statement provided."}</p>
                    </div>

                    <div className="pd-app-actions">
                      {app.status === "submitted" && (
                        <button className="pd-btn pd-btn-outline" onClick={() => handleUpdateStatus(app.application_id, "under_review")}>
                          Mark Under Review
                        </button>
                      )}
                      {app.status === "under_review" && (
                        <button className="pd-btn pd-btn-outline" style={{ borderColor: "#A855F7", color: "#A855F7" }} onClick={() => handleUpdateStatus(app.application_id, "shortlisted")}>
                          Shortlist
                        </button>
                      )}
                      {app.status !== "approved" && app.status !== "rejected" && (
                        <>
                          <button className="pd-btn pd-btn-danger" onClick={() => handleUpdateStatus(app.application_id, "rejected")}>
                            Reject
                          </button>
                          <button className="pd-btn pd-btn-primary" style={{ background: "#10B981" }} onClick={() => handleUpdateStatus(app.application_id, "approved")}>
                            Approve Award
                          </button>
                        </>
                      )}
                      {(app.status === "approved" || app.status === "rejected") && (
                        <span style={{ fontSize: "13px", color: "var(--pd-text-muted)" }}>
                          Decision made on {new Date(app.submitted_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--pd-text-muted)", fontSize: "14px" }}>No applications received yet for your listings.</p>
            )}
          </section>

          {/* ACTIVE LISTINGS LIST */}
          <section className="pd-section">
            <div className="pd-section-header">
              <h2 className="pd-section-heading">Your Active Listings ({activeCount})</h2>
            </div>
            {scholarships.length > 0 ? (
              <ul className="pd-list">
                {scholarships.map((s) => (
                  <li key={s.id} className="pd-item">
                    <div className="pd-item-header">
                      <div>
                        <h3 className="pd-item-title">{s.name}</h3>
                        <div className="pd-item-meta">
                          <span>💰 {s.amount}</span>
                          <span>⏰ Deadline: {new Date(s.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="pd-btn pd-btn-outline" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleOpenEditModal(s)}>
                          Edit Listing
                        </button>
                        <button className="pd-btn pd-btn-danger" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleOpenDeleteModal(s.id)}>
                          Delete Listing
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: "13.5px", color: "#CBD5E1", marginTop: "12px", lineHeight: "1.4" }}>
                      {s.description}
                    </p>
                    <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "12px" }}>
                      <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px", color: "var(--pd-text-muted)" }}>Level: {s.level}</span>
                      <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px", color: "var(--pd-text-muted)" }}>Field: {s.field}</span>
                      <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px", color: "var(--pd-text-muted)" }}>Country: {s.country}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "var(--pd-text-muted)", fontSize: "14px" }}>You have not listed any scholarships yet. Use the sidebar to create one!</p>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: CREATE SCHOLARSHIP FORM */}
        <div>
          <section className="pd-section">
            <h2 className="pd-section-heading" style={{ marginBottom: "20px" }}>Post a Scholarship</h2>
            <form className="pd-form" onSubmit={handleCreateScholarship}>
              <div className="pd-input-group">
                <label htmlFor="s-name">Scholarship Name</label>
                <input
                  id="s-name"
                  type="text"
                  className="pd-input"
                  placeholder="e.g. Master's STEM Grant"
                  value={newScholarship.name}
                  onChange={(e) => setNewScholarship({ ...newScholarship, name: e.target.value })}
                />
              </div>

              <div className="pd-row-split">
                <div className="pd-input-group">
                  <label htmlFor="s-amount">Award Amount</label>
                  <input
                    id="s-amount"
                    type="text"
                    className="pd-input"
                    placeholder="e.g. $10,000"
                    value={newScholarship.amount}
                    onChange={(e) => setNewScholarship({ ...newScholarship, amount: e.target.value })}
                  />
                </div>
                <div className="pd-input-group">
                  <label htmlFor="s-deadline">Deadline Date</label>
                  <input
                    id="s-deadline"
                    type="date"
                    className="pd-input"
                    value={newScholarship.deadline}
                    onChange={(e) => setNewScholarship({ ...newScholarship, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="pd-input-group">
                <label htmlFor="s-level">Target Education Level</label>
                <select
                  id="s-level"
                  className="pd-input"
                  value={newScholarship.level}
                  onChange={(e) => setNewScholarship({ ...newScholarship, level: e.target.value })}
                >
                  {LEVELS.map(l => (
                    <option key={l} value={l} disabled={l === "Select level"}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="pd-input-group">
                <label htmlFor="s-field">Target Field of Study</label>
                <select
                  id="s-field"
                  className="pd-input"
                  value={newScholarship.field}
                  onChange={(e) => setNewScholarship({ ...newScholarship, field: e.target.value })}
                >
                  {FIELDS.map(f => (
                    <option key={f} value={f} disabled={f === "Select field"}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="pd-input-group">
                <label htmlFor="s-country">Target Region / Nationality</label>
                <select
                  id="s-country"
                  className="pd-input"
                  value={newScholarship.country}
                  onChange={(e) => setNewScholarship({ ...newScholarship, country: e.target.value })}
                >
                  {COUNTRIES.map(c => (
                    <option key={c} value={c} disabled={c === "Select country"}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="pd-input-group">
                <label htmlFor="s-desc">Description</label>
                <textarea
                  id="s-desc"
                  className="pd-textarea"
                  rows={4}
                  placeholder="Describe the opportunity details and funding terms..."
                  value={newScholarship.description}
                  onChange={(e) => setNewScholarship({ ...newScholarship, description: e.target.value })}
                />
              </div>

              <div className="pd-input-group">
                <label htmlFor="s-req">Requirements / Qualifications (optional)</label>
                <input
                  id="s-req"
                  type="text"
                  className="pd-input"
                  placeholder="e.g. GPA 3.5+, Female students"
                  value={newScholarship.requirements}
                  onChange={(e) => setNewScholarship({ ...newScholarship, requirements: e.target.value })}
                />
              </div>

              <button type="submit" className="pd-btn pd-btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={creating}>
                {creating ? "Posting Listing..." : "Post Scholarship Opportunity"}
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "16px"
        }}>
          <div style={{
            background: "#1E293B",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "24px",
            width: "100%",
            maxWidth: "440px",
            color: "white",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 12px 0", color: "#F87171" }}>
              Confirm Deletion
            </h3>
            <p style={{ color: "#CBD5E1", fontSize: "14px", lineHeight: "1.5", margin: "0 0 20px 0" }}>
              Are you sure you want to delete this scholarship listing? All associated applications will also be permanently removed.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "1px solid #475569",
                  color: "#CBD5E1",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "#EF4444",
                  border: "none",
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                  opacity: deleting ? 0.7 : 1
                }}
              >
                {deleting ? "Deleting..." : "Yes, Delete Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Scholarship Modal */}
      {editModal.isOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "16px"
        }}>
          <div style={{
            background: "#1E293B",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "28px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            color: "white",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#F5C842" }}>
                Edit Scholarship Listing
              </h3>
              <button
                onClick={handleCloseEditModal}
                style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form className="pd-form" onSubmit={handleSaveEditScholarship}>
              <div className="pd-input-group">
                <label htmlFor="edit-name">Scholarship Name</label>
                <input
                  id="edit-name"
                  type="text"
                  className="pd-input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="pd-row-split">
                <div className="pd-input-group">
                  <label htmlFor="edit-amount">Award Amount</label>
                  <input
                    id="edit-amount"
                    type="text"
                    className="pd-input"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  />
                </div>
                <div className="pd-input-group">
                  <label htmlFor="edit-deadline">Deadline Date</label>
                  <input
                    id="edit-deadline"
                    type="date"
                    className="pd-input"
                    value={editForm.deadline}
                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="pd-input-group">
                <label htmlFor="edit-level">Target Education Level</label>
                <select
                  id="edit-level"
                  className="pd-input"
                  value={editForm.level}
                  onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                >
                  {LEVELS.map(l => (
                    <option key={l} value={l} disabled={l === "Select level"}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="pd-input-group">
                <label htmlFor="edit-field">Target Field of Study</label>
                <select
                  id="edit-field"
                  className="pd-input"
                  value={editForm.field}
                  onChange={(e) => setEditForm({ ...editForm, field: e.target.value })}
                >
                  {FIELDS.map(f => (
                    <option key={f} value={f} disabled={f === "Select field"}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="pd-input-group">
                <label htmlFor="edit-country">Target Region / Nationality</label>
                <select
                  id="edit-country"
                  className="pd-input"
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                >
                  {COUNTRIES.map(c => (
                    <option key={c} value={c} disabled={c === "Select country"}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="pd-input-group">
                <label htmlFor="edit-desc">Description</label>
                <textarea
                  id="edit-desc"
                  className="pd-textarea"
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div className="pd-input-group">
                <label htmlFor="edit-req">Requirements / Qualifications</label>
                <input
                  id="edit-req"
                  type="text"
                  className="pd-input"
                  value={editForm.requirements}
                  onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    background: "transparent",
                    border: "1px solid #475569",
                    color: "#CBD5E1",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    background: "#10B981",
                    border: "none",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    opacity: updating ? 0.7 : 1
                  }}
                >
                  {updating ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
