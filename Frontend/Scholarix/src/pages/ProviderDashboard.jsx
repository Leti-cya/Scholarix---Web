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
  const [appFilter, setAppFilter] = useState("all");
  const [applicantModal, setApplicantModal] = useState({ isOpen: false, applicant: null });

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
      const pData = profileRes.data;
      setProvider({
        orgName: pData.org_name || "Organisation",
        orgType: pData.org_type || "",
        website: pData.website || "",
        contactName: pData.contact_name || "Representative",
        contactTitle: pData.contact_title || "",
        regNumber: pData.reg_number || "",
        description: pData.description || ""
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

  const [editOrgProfileModal, setEditOrgProfileModal] = useState(false);
  const [orgProfileForm, setOrgProfileForm] = useState({
    orgName: "",
    orgType: "",
    website: "",
    contactName: "",
    contactTitle: "",
    regNumber: "",
    description: ""
  });
  const [savingOrgProfile, setSavingOrgProfile] = useState(false);

  const handleOpenEditOrgProfile = () => {
    setOrgProfileForm({
      orgName: provider.orgName || "",
      orgType: provider.orgType || "",
      website: provider.website || "",
      contactName: provider.contactName || "",
      contactTitle: provider.contactTitle || "",
      regNumber: provider.regNumber || "",
      description: provider.description || ""
    });
    setEditOrgProfileModal(true);
  };

  const handleSaveOrgProfile = async (e) => {
    e.preventDefault();
    if (!orgProfileForm.orgName.trim()) {
      toast.error("Organization name is required.");
      return;
    }

    try {
      setSavingOrgProfile(true);
      await Api.put("/api/auth/profile", orgProfileForm);
      toast.success("Organization profile updated successfully!");
      setEditOrgProfileModal(false);
      fetchProviderData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update organization profile.");
    } finally {
      setSavingOrgProfile(false);
    }
  };

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
  const approvedCount = applications.filter(a => a.status === "approved").length;
  const pendingReviewsCount = submittedCount + underReviewCount;

  // Maximum 5 recent applications for dashboard overview
  const recentApps = applications.slice(0, 5);

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
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="pd-btn pd-btn-outline"
            style={{ borderColor: '#38BDF8', color: '#38BDF8' }}
            onClick={() => navigate('/provider/applications')}
          >
            Manage Applications 📋
          </button>
          <button className="pd-btn pd-btn-outline" style={{ borderColor: '#F5C842', color: '#F5C842' }} onClick={handleOpenEditOrgProfile}>
            ✏️ Edit Org Profile
          </button>
          <button className="pd-btn pd-btn-outline" style={{ borderColor: '#EF4444', color: '#EF4444' }} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
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
            <span className="pd-stat-label">Pending Reviews</span>
            <span className="pd-stat-icon">⏳</span>
          </div>
          <div className="pd-stat-value" style={{ color: "#F59E0B" }}>{pendingReviewsCount}</div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-header">
            <span className="pd-stat-label">Awards Approved</span>
            <span className="pd-stat-icon">✅</span>
          </div>
          <div className="pd-stat-value" style={{ color: "#10B981" }}>{approvedCount}</div>
        </div>
      </div>

      {/* ── MAIN DASHBOARD GRID ────────────────────────────────────────────── */}
      <div className="pd-grid">
        {/* LEFT COLUMN: RECENT APPLICATIONS & ACTIVE LISTINGS */}
        <div>
          {/* RECENT APPLICATIONS SECTION */}
          <section className="pd-section">
            <div className="pd-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h2 className="pd-section-heading" style={{ margin: 0 }}>Recent Applications</h2>
                <span style={{ fontSize: "12px", background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", padding: "4px 10px", borderRadius: "12px", fontWeight: "600" }}>
                  Pending Reviews: {pendingReviewsCount}
                </span>
              </div>
              <button
                className="pd-btn pd-btn-outline"
                style={{ fontSize: "13px", padding: "6px 14px", borderColor: "#F5C842", color: "#F5C842" }}
                onClick={() => navigate("/provider/applications")}
              >
                View All Applications →
              </button>
            </div>

            {recentApps.length > 0 ? (
              <div>
                {recentApps.map((app) => (
                  <div key={app.application_id} className="pd-applicant-card" style={{ marginBottom: "14px" }}>
                    <div className="pd-app-student-info" style={{ marginBottom: "10px", borderBottom: "1px solid var(--pd-border)", paddingBottom: "8px" }}>
                      <div>
                        <strong style={{ fontSize: "15px", color: "white" }}>
                          {app.first_name} {app.last_name}
                        </strong>
                        <div style={{ fontSize: "12px", color: "var(--pd-text-muted)", marginTop: "2px" }}>
                          Applied for: <strong>{app.scholarship_name}</strong> ({app.scholarship_amount || "N/A"})
                        </div>
                      </div>
                      <span className={`status-badge ${app.status}`}>
                        {app.status.replace("_", " ")}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px", marginBottom: "10px", fontSize: "12px", color: "#94A3B8" }}>
                      <div><strong>Institution:</strong> {app.student_institution || "N/A"}</div>
                      <div><strong>Level:</strong> {app.student_level || "N/A"}</div>
                      <div><strong>GPA:</strong> {app.student_gpa || "N/A"}</div>
                      <div><strong>Submitted:</strong> {new Date(app.submitted_at).toLocaleDateString()}</div>
                    </div>

                    <div className="pd-app-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button
                        className="pd-btn pd-btn-outline"
                        style={{ fontSize: "12px", padding: "5px 10px", borderColor: "#38BDF8", color: "#38BDF8" }}
                        onClick={() => setApplicantModal({ isOpen: true, applicant: app })}
                      >
                        View Details 👁️
                      </button>
                      <button
                        className="pd-btn pd-btn-outline"
                        style={{ fontSize: "12px", padding: "5px 10px" }}
                        onClick={() => navigate("/provider/applications")}
                      >
                        Review on Full Page →
                      </button>
                    </div>
                  </div>
                ))}

                {applications.length > 5 && (
                  <div style={{ textAlign: "center", marginTop: "16px" }}>
                    <button
                      className="pd-btn pd-btn-outline"
                      style={{ width: "100%", padding: "10px", borderColor: "#F5C842", color: "#F5C842", fontWeight: "600" }}
                      onClick={() => navigate("/provider/applications")}
                    >
                      View All {applications.length} Applications →
                    </button>
                  </div>
                )}
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
      {editOrgProfileModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#1E293B",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "28px",
            width: "100%",
            maxWidth: "600px",
            color: "white",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#F5C842" }}>
                ✏️ Edit Organization Profile
              </h3>
              <button
                onClick={() => setEditOrgProfileModal(false)}
                style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", marginBottom: "20px" }}>
              Update your organization and primary contact information.
            </p>

            <form onSubmit={handleSaveOrgProfile}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#CBD5E1", marginBottom: "6px" }}>Organization Name</label>
                  <input
                    type="text"
                    className="pd-input"
                    value={orgProfileForm.orgName}
                    onChange={(e) => setOrgProfileForm({ ...orgProfileForm, orgName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#CBD5E1", marginBottom: "6px" }}>Organization Type</label>
                  <input
                    type="text"
                    className="pd-input"
                    value={orgProfileForm.orgType}
                    onChange={(e) => setOrgProfileForm({ ...orgProfileForm, orgType: e.target.value })}
                    placeholder="e.g. Non-profit Foundation"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#CBD5E1", marginBottom: "6px" }}>Website URL</label>
                  <input
                    type="text"
                    className="pd-input"
                    value={orgProfileForm.website}
                    onChange={(e) => setOrgProfileForm({ ...orgProfileForm, website: e.target.value })}
                    placeholder="https://example.org"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#CBD5E1", marginBottom: "6px" }}>Registration No.</label>
                  <input
                    type="text"
                    className="pd-input"
                    value={orgProfileForm.regNumber}
                    onChange={(e) => setOrgProfileForm({ ...orgProfileForm, regNumber: e.target.value })}
                    placeholder="e.g. REG-98124"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#CBD5E1", marginBottom: "6px" }}>Contact Person Name</label>
                  <input
                    type="text"
                    className="pd-input"
                    value={orgProfileForm.contactName}
                    onChange={(e) => setOrgProfileForm({ ...orgProfileForm, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#CBD5E1", marginBottom: "6px" }}>Contact Job Title</label>
                  <input
                    type="text"
                    className="pd-input"
                    value={orgProfileForm.contactTitle}
                    onChange={(e) => setOrgProfileForm({ ...orgProfileForm, contactTitle: e.target.value })}
                    placeholder="e.g. Head of Grants"
                  />
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#CBD5E1", marginBottom: "6px" }}>About Organization</label>
                <textarea
                  rows={4}
                  className="pd-input"
                  value={orgProfileForm.description}
                  onChange={(e) => setOrgProfileForm({ ...orgProfileForm, description: e.target.value })}
                  placeholder="Describe your organization's mission and funding objectives..."
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setEditOrgProfileModal(false)}
                  style={{ padding: "10px 18px", borderRadius: "8px", background: "transparent", border: "1px solid #475569", color: "#CBD5E1", fontWeight: "600", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOrgProfile}
                  style={{ padding: "10px 20px", borderRadius: "8px", background: "#F5C842", border: "none", color: "#0F172A", fontWeight: "700", cursor: "pointer", opacity: savingOrgProfile ? 0.7 : 1 }}
                >
                  {savingOrgProfile ? "Saving Changes..." : "Save Org Profile →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
