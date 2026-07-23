/**
 * ProviderScholarships.jsx
 * ------------------------
 * Dedicated page for scholarship providers to manage their listings (full CRUD).
 * Includes listing creation, full active listings view, editing, and deletion.
 * All colors converted to shared theme CSS variables.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../component/Layout";
import "./ProviderDashboard.css";
import Api from "../service/Api";

export default function ProviderScholarships() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState({ orgName: "Provider Org", contactName: "" });
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Edit Modal State
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

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, scholarshipId: null });
  const [deleting, setDeleting] = useState(false);

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

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      const profileRes = await Api.get("/api/auth/profile");
      const pData = profileRes.data;
      setProvider({
        orgName: pData.org_name || "Organisation",
        contactName: pData.contact_name || "Representative"
      });

      setNewScholarship(prev => ({
        ...prev,
        providerName: pData.org_name || ""
      }));

      const scholarshipsRes = await Api.get("/api/scholarships/provider");
      setScholarships(scholarshipsRes.data || []);
    } catch (e) {
      console.error("Fetch Scholarships Error:", e);
      toast.error("Failed to load scholarship listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, []);

  const handleCreateScholarship = async (e) => {
    e.preventDefault();
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
      fetchProviderData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create scholarship listing.");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEditModal = (s) => {
    const formattedDeadline = s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : "";
    setEditModal({ isOpen: true, scholarshipId: s.id });
    setEditForm({
      name: s.name || "",
      providerName: s.provider_name || provider.orgName,
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
      toast.error("Failed to delete scholarship listing.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredScholarships = scholarships.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.field?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Layout role="provider">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--sx-text-primary)' }}>
          <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--sx-border)', borderTop: '4px solid var(--sx-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500' }}>Loading your scholarships...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="provider">
      <div className="pd-page" style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 32px 48px" }}>
        {/* Header Banner */}
        <header className="pd-welcome-banner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="pd-welcome-heading">My Scholarships</h1>
            <p className="pd-welcome-sub">{provider.orgName} · Manage listings & post new opportunities</p>
          </div>
          <button
            className="pd-btn pd-btn-outline"
            style={{ borderColor: "var(--sx-gold)", color: "var(--sx-gold)" }}
            onClick={() => navigate("/provider/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </header>

        {/* Main Grid: Left List (Full active listings) and Right Form (Post New Scholarship) */}
        <div className="pd-grid">
          {/* Left Column: Active Listings */}
          <div>
            <section className="pd-section">
              <div className="pd-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 className="pd-section-heading" style={{ margin: 0 }}>Active Listings ({scholarships.length})</h2>
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: "var(--sx-bg)",
                    border: "1px solid var(--pd-border)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    color: "var(--sx-text-primary)",
                    fontSize: "13px",
                    width: "200px"
                  }}
                />
              </div>

              {filteredScholarships.length > 0 ? (
                <ul className="pd-list">
                  {filteredScholarships.map((s) => (
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
                            Edit Listing ✏️
                          </button>
                          <button className="pd-btn pd-btn-danger" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleOpenDeleteModal(s.id)}>
                            Delete Listing 🗑️
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: "13.5px", color: "var(--sx-text-secondary)", marginTop: "12px", lineHeight: "1.4" }}>
                        {s.description}
                      </p>
                      {s.requirements && (
                        <p style={{ fontSize: "12.5px", color: "var(--sx-text-muted)", marginTop: "6px" }}>
                          <strong>Requirements:</strong> {s.requirements}
                        </p>
                      )}
                      <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "12px" }}>
                        <span style={{ background: "var(--sx-surface-hover)", padding: "4px 8px", borderRadius: "4px", color: "var(--pd-text-muted)" }}>Level: {s.level}</span>
                        <span style={{ background: "var(--sx-surface-hover)", padding: "4px 8px", borderRadius: "4px", color: "var(--pd-text-muted)" }}>Field: {s.field}</span>
                        <span style={{ background: "var(--sx-surface-hover)", padding: "4px 8px", borderRadius: "4px", color: "var(--pd-text-muted)" }}>Country: {s.country}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--pd-text-muted)", fontSize: "14px", textAlign: "center", padding: "30px 0" }}>
                  {searchQuery ? "No scholarships match your search." : "You have not listed any scholarships yet. Use the form on the right to post your first opportunity!"}
                </p>
              )}
            </section>
          </div>

          {/* Right Column: Post a Scholarship Form */}
          <div>
            <section className="pd-section">
              <h2 className="pd-section-heading" style={{ marginBottom: "20px" }}>Post a Scholarship Opportunity</h2>
              <form className="pd-form" onSubmit={handleCreateScholarship}>
                <div className="pd-input-group">
                  <label htmlFor="s-name">Scholarship Name</label>
                  <input
                    id="s-name"
                    type="text"
                    className="pd-input"
                    placeholder="e.g. STEM Leadership Grant 2026"
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
                      placeholder="e.g. $10,000 / year"
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
                    placeholder="e.g. GPA 3.5+, Female STEM students"
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
          <div className="pd-modal-overlay" onClick={handleCloseDeleteModal}>
            <div className="pd-modal-container" style={{ maxWidth: "440px", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 12px 0", color: "var(--sx-red)" }}>Confirm Deletion</h3>
              <p style={{ color: "var(--sx-text-secondary)", fontSize: "14px", margin: "0 0 20px 0" }}>Are you sure you want to delete this scholarship listing? All associated applications will also be permanently removed.</p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" onClick={handleCloseDeleteModal} className="pd-btn pd-btn-outline">Cancel</button>
                <button type="button" onClick={handleConfirmDelete} disabled={deleting} className="pd-btn pd-btn-danger">
                  {deleting ? "Deleting..." : "Yes, Delete Listing"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Scholarship Modal */}
        {editModal.isOpen && (
          <div className="pd-modal-overlay" onClick={handleCloseEditModal}>
            <div className="pd-modal-container" style={{ maxWidth: "600px", padding: "28px" }} onClick={(e) => e.stopPropagation()}>
              <div className="pd-modal-header" style={{ padding: "0 0 16px 0" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "var(--sx-gold)" }}>Edit Scholarship Listing</h3>
                <button onClick={handleCloseEditModal} style={{ background: "none", border: "none", color: "var(--sx-text-muted)", fontSize: "20px", cursor: "pointer" }}>✕</button>
              </div>
              <form className="pd-form" onSubmit={handleSaveEditScholarship} style={{ marginTop: "16px" }}>
                <div className="pd-input-group">
                  <label htmlFor="edit-name">Scholarship Name</label>
                  <input id="edit-name" type="text" className="pd-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="pd-row-split">
                  <div className="pd-input-group">
                    <label htmlFor="edit-amount">Award Amount</label>
                    <input id="edit-amount" type="text" className="pd-input" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
                  </div>
                  <div className="pd-input-group">
                    <label htmlFor="edit-deadline">Deadline Date</label>
                    <input id="edit-deadline" type="date" className="pd-input" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} />
                  </div>
                </div>
                <div className="pd-input-group">
                  <label htmlFor="edit-level">Target Education Level</label>
                  <select id="edit-level" className="pd-input" value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}>
                    {LEVELS.map(l => (<option key={l} value={l} disabled={l === "Select level"}>{l}</option>))}
                  </select>
                </div>
                <div className="pd-input-group">
                  <label htmlFor="edit-field">Target Field of Study</label>
                  <select id="edit-field" className="pd-input" value={editForm.field} onChange={(e) => setEditForm({ ...editForm, field: e.target.value })}>
                    {FIELDS.map(f => (<option key={f} value={f} disabled={f === "Select field"}>{f}</option>))}
                  </select>
                </div>
                <div className="pd-input-group">
                  <label htmlFor="edit-country">Target Region / Nationality</label>
                  <select id="edit-country" className="pd-input" value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}>
                    {COUNTRIES.map(c => (<option key={c} value={c} disabled={c === "Select country"}>{c}</option>))}
                  </select>
                </div>
                <div className="pd-input-group">
                  <label htmlFor="edit-desc">Description</label>
                  <textarea id="edit-desc" className="pd-textarea" rows={4} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
                <div className="pd-input-group">
                  <label htmlFor="edit-req">Requirements</label>
                  <input id="edit-req" type="text" className="pd-input" value={editForm.requirements} onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                  <button type="button" onClick={handleCloseEditModal} className="pd-btn pd-btn-outline">Cancel</button>
                  <button type="submit" disabled={updating} className="pd-btn pd-btn-primary">{updating ? "Saving..." : "Save Changes"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
