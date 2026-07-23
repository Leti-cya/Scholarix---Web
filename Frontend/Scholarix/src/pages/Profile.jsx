/**
 * Profile.jsx
 * -----------
 * Dedicated Profile Page for both Student and Provider roles.
 * Allows viewing and editing profile details with full API integration.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../component/Layout";
import { getProfile, updateProfile } from "../service/Api";
import "./StudentDashboard.css";
import "./ProviderDashboard.css";

export default function Profile({ role: propRole }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState(propRole || "student");
  const [rawUser, setRawUser] = useState(null);

  // Student Profile Form State
  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    level: "",
    field: "",
    institution: "",
    gpa: ""
  });

  // Provider Profile Form State
  const [providerForm, setProviderForm] = useState({
    orgName: "",
    orgType: "",
    website: "",
    contactName: "",
    contactTitle: "",
    regNumber: "",
    description: "",
    email: ""
  });

  const LEVELS = [
    "High School / Secondary",
    "Undergraduate (Bachelor's)",
    "Postgraduate (Master's)",
    "Doctoral (PhD)",
    "Postdoctoral",
    "Vocational / Certificate"
  ];

  const FIELDS = [
    "Arts & Humanities",
    "Business & Management",
    "Computer Science & IT",
    "Education",
    "Engineering & Technology",
    "Environment & Sustainability",
    "Law",
    "Medicine & Health",
    "Natural Sciences",
    "Social Sciences"
  ];

  const COUNTRIES = [
    "Global", "Australia", "Bangladesh", "Brazil", "Canada", "China",
    "Egypt", "Ethiopia", "France", "Germany", "Ghana",
    "India", "Indonesia", "Japan", "Kenya", "Mexico",
    "Nepal", "Nigeria", "Pakistan", "Philippines", "Sierra Leone",
    "South Africa", "South Korea", "Sri Lanka", "Tanzania", "Uganda",
    "United Kingdom", "United States", "Vietnam", "Zimbabwe", "Other"
  ];

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      const p = res.data;
      setRawUser(p);
      const role = p.role || propRole || "student";
      setUserRole(role);

      if (role === "student") {
        setStudentForm({
          firstName: p.first_name || p.firstName || "",
          lastName: p.last_name || p.lastName || "",
          email: p.email || "",
          phone: p.phone || "",
          country: p.country || "",
          level: p.level || "",
          field: p.field || "",
          institution: p.institution || "",
          gpa: p.gpa || ""
        });
      } else {
        setProviderForm({
          orgName: p.org_name || p.orgName || "",
          orgType: p.org_type || p.orgType || "",
          website: p.website || "",
          contactName: p.contact_name || p.contactName || "",
          contactTitle: p.contact_title || p.contactTitle || "",
          regNumber: p.reg_number || p.regNumber || "",
          description: p.description || "",
          email: p.email || ""
        });
      }
    } catch (e) {
      console.error("Fetch Profile Error:", e);
      toast.error("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSaveStudentProfile = async (e) => {
    e.preventDefault();
    if (!studentForm.firstName.trim()) {
      toast.error("First name is required.");
      return;
    }

    try {
      setSaving(true);
      const res = await updateProfile(studentForm);
      toast.success("Student profile updated successfully!");

      // Update local storage user
      const existing = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...existing, ...res.data.user }));

      fetchProfileData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProviderProfile = async (e) => {
    e.preventDefault();
    if (!providerForm.orgName.trim()) {
      toast.error("Organization name is required.");
      return;
    }

    try {
      setSaving(true);
      const res = await updateProfile(providerForm);
      toast.success("Organization profile updated successfully!");

      // Update local storage user
      const existing = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...existing, ...res.data.user }));

      fetchProfileData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout role={userRole}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--sx-text-primary)' }}>
          <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--sx-border)', borderTop: '4px solid var(--sx-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500' }}>Loading profile...</p>
        </div>
      </Layout>
    );
  }

  // Calculate profile completion percentage for student
  const studentFields = [studentForm.firstName, studentForm.lastName, studentForm.email, studentForm.level, studentForm.field, studentForm.institution, studentForm.gpa, studentForm.country];
  const filledCount = studentFields.filter(f => f && String(f).trim() !== "").length;
  const completionPct = Math.round((filledCount / studentFields.length) * 100);

  return (
    <Layout role={userRole}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 32px 48px", color: "var(--sx-text-primary)" }}>
        {/* Header */}
        <div style={{ background: "var(--sx-surface)", border: "1px solid var(--sx-border)", borderRadius: "16px", padding: "24px 32px", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "5px solid var(--sx-gold)" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 4px 0", color: "var(--sx-text-primary)" }}>
              {userRole === "student" ? "My Profile & Qualifications" : "Organization Profile"}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--sx-text-muted)", margin: 0 }}>
              {userRole === "student"
                ? "Keep your academic and personal details up-to-date for accurate AI scholarship matches."
                : "Manage your organization information and official contact details."}
            </p>
          </div>
          {userRole === "provider" && rawUser?.id && (
            <button
              onClick={() => navigate(`/providers/${rawUser.id}`)}
              style={{ padding: "8px 16px", borderRadius: "8px", background: "var(--sx-blue-bg)", border: "1px solid var(--sx-blue)", color: "var(--sx-blue)", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
            >
              View Public Profile 👁️
            </button>
          )}
        </div>

        {/* Student Profile Content */}
        {userRole === "student" ? (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "28px" }}>
            {/* Sidebar Summary Card */}
            <div style={{ background: "var(--sx-surface)", border: "1px solid var(--sx-border)", borderRadius: "16px", padding: "24px", height: "fit-content" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--sx-gold)", color: "#0F172A", fontSize: "28px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                  {(studentForm.firstName || "S")[0].toUpperCase()}
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 4px 0" }}>
                  {studentForm.firstName} {studentForm.lastName}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--sx-gold)", fontWeight: "600", margin: "0 0 12px 0" }}>
                  {studentForm.level || "Degree Level Not Set"}
                </p>
                <p style={{ fontSize: "12px", color: "var(--sx-text-muted)", margin: "0 0 16px 0" }}>
                  {studentForm.email}
                </p>

                {/* Progress bar */}
                <div style={{ width: "100%", background: "rgba(245, 200, 66, 0.1)", border: "1px solid rgba(245, 200, 66, 0.3)", borderRadius: "12px", padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "6px" }}>
                    <span style={{ color: "var(--sx-text-muted)" }}>Profile Completion</span>
                    <span style={{ color: "var(--sx-gold)" }}>{completionPct}%</span>
                  </div>
                  <div style={{ height: "8px", background: "rgba(0,0,0,0.2)", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ width: `${completionPct}%`, height: "100%", background: "var(--sx-gold)", borderRadius: "10px", transition: "width 0.5s ease" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background: "var(--sx-surface)", border: "1px solid var(--sx-border)", borderRadius: "16px", padding: "28px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px", borderBottom: "1px solid var(--sx-border)", paddingBottom: "12px" }}>
                Edit Personal & Academic Details
              </h2>
              <form onSubmit={handleSaveStudentProfile} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--sx-text-muted)" }}>First Name *</label>
                    <input
                      type="text"
                      value={studentForm.firstName}
                      onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                      required
                      style={{ width: "100%", background: "var(--sx-bg)", border: "1px solid var(--sx-border)", borderRadius: "8px", padding: "10px 14px", color: "var(--sx-text-primary)", fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--sx-text-muted)" }}>Last Name</label>
                    <input
                      type="text"
                      value={studentForm.lastName}
                      onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                      style={{ width: "100%", background: "var(--sx-bg)", border: "1px solid var(--sx-border)", borderRadius: "8px", padding: "10px 14px", color: "var(--sx-text-primary)", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--sx-text-muted)" }}>Email Address (Account)</label>
                    <input
                      type="email"
                      value={studentForm.email}
                      disabled
                      style={{ width: "100%", background: "var(--sx-bg)", border: "1px solid var(--sx-border)", borderRadius: "8px", padding: "10px 14px", color: "var(--sx-text-muted)", fontSize: "14px", opacity: 0.7 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--sx-text-muted)" }}>Phone Number</label>
                    <input
                      type="text"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      placeholder="e.g. +1 555-0192"
                      style={{ width: "100%", background: "var(--sx-bg)", border: "1px solid var(--sx-border)", borderRadius: "8px", padding: "10px 14px", color: "var(--sx-text-primary)", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--sx-text-muted)" }}>Country / Nationality</label>
                    <select
                      value={studentForm.country}
                      onChange={(e) => setStudentForm({ ...studentForm, country: e.target.value })}
                      style={{ width: "100%", background: "var(--sx-bg)", border: "1px solid var(--sx-border)", borderRadius: "8px", padding: "10px 14px", color: "var(--sx-text-primary)", fontSize: "14px" }}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--sx-text-muted)" }}>Education Level</label>
                    <select
                      value={studentForm.level}
                      onChange={(e) => setStudentForm({ ...studentForm, level: e.target.value })}
                      style={{ width: "100%", background: "var(--sx-bg)", border: "1px solid var(--sx-border)", borderRadius: "8px", padding: "10px 14px", color: "var(--sx-text-primary)", fontSize: "14px" }}
                    >
                      <option value="">Select level</option>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--sx-text-muted)" }}>Field of Study</label>
                    <select
                      value={studentForm.field}
                      onChange={(e) => setStudentForm({ ...studentForm, field: e.target.value })}
                      style={{ width: "100%", background: "var(--sx-bg)", border: "1px solid var(--sx-border)", borderRadius: "8px", padding: "10px 14px", color: "var(--sx-text-primary)", fontSize: "14px" }}
                    >
                      <option value="">Select field</option>
                      {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--sx-text-muted)" }}>GPA Score (e.g. 3.8 / 4.0)</label>
                    <input
                      type="text"
                      value={studentForm.gpa}
                      onChange={(e) => setStudentForm({ ...studentForm, gpa: e.target.value })}
                      placeholder="e.g. 3.85"
                      style={{ width: "100%", background: "var(--sx-bg)", border: "1px solid var(--sx-border)", borderRadius: "8px", padding: "10px 14px", color: "var(--sx-text-primary)", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--sx-text-muted)" }}>Institution / University</label>
                  <input
                    type="text"
                    value={studentForm.institution}
                    onChange={(e) => setStudentForm({ ...studentForm, institution: e.target.value })}
                    placeholder="e.g. Harvard University"
                    style={{ width: "100%", background: "var(--sx-bg)", border: "1px solid var(--sx-border)", borderRadius: "8px", padding: "10px 14px", color: "var(--sx-text-primary)", fontSize: "14px" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ padding: "12px 28px", borderRadius: "8px", background: "var(--sx-gold)", color: "#0F172A", fontWeight: "800", border: "none", cursor: "pointer", fontSize: "15px" }}
                  >
                    {saving ? "Saving..." : "Save Profile Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Provider Profile Content */
          <div style={{ background: "var(--pd-card-bg)", border: "1px solid var(--pd-border)", borderRadius: "16px", padding: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", borderBottom: "1px solid var(--pd-border)", paddingBottom: "12px", color: "var(--sx-text-primary)" }}>
              Edit Organization Details
            </h2>
            <form onSubmit={handleSaveProviderProfile} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--pd-text-muted)" }}>Organization Name *</label>
                  <input
                    type="text"
                    className="pd-input"
                    value={providerForm.orgName}
                    onChange={(e) => setProviderForm({ ...providerForm, orgName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--pd-text-muted)" }}>Organization Type</label>
                  <input
                    type="text"
                    className="pd-input"
                    placeholder="e.g. University, Foundation, NGO"
                    value={providerForm.orgType}
                    onChange={(e) => setProviderForm({ ...providerForm, orgType: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--pd-text-muted)" }}>Official Website</label>
                  <input
                    type="text"
                    className="pd-input"
                    placeholder="e.g. https://foundation.org"
                    value={providerForm.website}
                    onChange={(e) => setProviderForm({ ...providerForm, website: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--pd-text-muted)" }}>Registration / License Number</label>
                  <input
                    type="text"
                    className="pd-input"
                    placeholder="e.g. REG-884920"
                    value={providerForm.regNumber}
                    onChange={(e) => setProviderForm({ ...providerForm, regNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--pd-text-muted)" }}>Contact Representative Name</label>
                  <input
                    type="text"
                    className="pd-input"
                    placeholder="e.g. Jane Doe"
                    value={providerForm.contactName}
                    onChange={(e) => setProviderForm({ ...providerForm, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--pd-text-muted)" }}>Contact Representative Title</label>
                  <input
                    type="text"
                    className="pd-input"
                    placeholder="e.g. Program Director"
                    value={providerForm.contactTitle}
                    onChange={(e) => setProviderForm({ ...providerForm, contactTitle: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--pd-text-muted)" }}>Organization Description</label>
                <textarea
                  rows={4}
                  className="pd-textarea"
                  placeholder="Describe your organization's mission, background, and scholarship goals..."
                  value={providerForm.description}
                  onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="pd-btn pd-btn-primary"
                  style={{ padding: "12px 28px", fontWeight: "700" }}
                >
                  {saving ? "Saving..." : "Save Organization Profile"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
