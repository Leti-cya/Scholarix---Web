import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getScholarshipById, getStudentApplications, applyScholarship } from "../service/Api";
import "./StudentDashboard.css";

export default function ScholarshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState("");

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [essayText, setEssayText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getScholarshipById(id);
      setScholarship(res.data);

      // Check user application status
      try {
        const appsRes = await getStudentApplications();
        const existing = appsRes.data.find(a => a.scholarship_id === parseInt(id));
        if (existing) {
          setIsApplied(true);
          setAppliedStatus(existing.status);
        }
      } catch (err) {
        // Not a student or error
      }
    } catch (e) {
      console.error("Fetch Scholarship Details Error:", e);
      toast.error("Failed to load scholarship details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!essayText.trim()) {
      toast.error("An essay statement is required to apply.");
      return;
    }

    try {
      setSubmitting(true);
      await applyScholarship({ scholarshipId: parseInt(id), essay: essayText });
      toast.success("Application submitted successfully!");
      setApplyModalOpen(false);
      setEssayText("");
      fetchDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A', color: 'white' }}>
        <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #F5C842', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500' }}>Loading details...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", background: "#0F172A", minHeight: "100vh", color: "white" }}>
        <h2>Scholarship Not Found</h2>
        <p style={{ color: "#94A3B8", marginTop: "8px" }}>The opportunity you are looking for may have been removed.</p>
        <button
          className="sd-btn-outline"
          style={{ marginTop: "24px" }}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const deadlineDate = new Date(scholarship.deadline);
  const diffDays = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{ background: "#0F172A", minHeight: "100vh", color: "#F8FAFC", paddingBottom: "60px" }}>
      {/* Header Bar */}
      <header style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", color: "#F5C842", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            ← Back
          </button>
          <span style={{ fontSize: "13px", color: "#94A3B8" }}>Opportunity #{scholarship.id}</span>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1300px", margin: "32px auto", padding: "0 24px" }}>
        {/* Banner Card */}
        <div style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)", border: "1px solid #334155", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              {scholarship.provider_id ? (
                <Link
                  to={`/providers/${scholarship.provider_id}`}
                  style={{
                    background: "rgba(245, 200, 66, 0.15)",
                    color: "#F5C842",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    textDecoration: "none",
                    display: "inline-block",
                    border: "1px solid rgba(245, 200, 66, 0.3)"
                  }}
                >
                  🏛️ {scholarship.provider_name} →
                </Link>
              ) : (
                <span style={{ background: "rgba(245, 200, 66, 0.15)", color: "#F5C842", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>
                  {scholarship.provider_name}
                </span>
              )}
              <h1 style={{ fontSize: "28px", fontWeight: "800", marginTop: "12px", marginBottom: "8px", color: "#FFFFFF" }}>
                {scholarship.name}
              </h1>
              <p style={{ color: "#94A3B8", fontSize: "14px" }}>
                ⏰ Deadline: {deadlineDate.toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}
                {" · "}
                <span style={{ color: diffDays <= 3 ? "#EF4444" : diffDays <= 10 ? "#F59E0B" : "#10B981", fontWeight: "600" }}>
                  {diffDays <= 0 ? "Application Closed" : `${diffDays} days remaining`}
                </span>
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "32px", fontWeight: "800", color: "#F5C842" }}>
                {scholarship.amount}
              </div>
              <div style={{ fontSize: "13px", color: "#94A3B8" }}>Award Value</div>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #334155", display: "flex", justifyContent: "flex-end" }}>
            {isApplied ? (
              <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10B981", color: "#34D399", padding: "12px 24px", borderRadius: "10px", fontWeight: "600", fontSize: "15px", textTransform: "capitalize" }}>
                ✓ Application Submitted ({appliedStatus.replace("_", " ")})
              </div>
            ) : diffDays <= 0 ? (
              <button disabled style={{ background: "#334155", color: "#94A3B8", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "600", cursor: "not-allowed" }}>
                Applications Closed
              </button>
            ) : (
              <button
                onClick={() => setApplyModalOpen(true)}
                style={{ background: "linear-gradient(135deg, #F5C842 0%, #E5A810 100%)", color: "#0F172A", border: "none", padding: "12px 32px", borderRadius: "10px", fontWeight: "700", fontSize: "16px", cursor: "pointer", boxShadow: "0 4px 14px rgba(245, 200, 66, 0.3)" }}
              >
                Apply for this Scholarship →
              </button>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          {/* Left Column: Description & Eligibility */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Eligibility Grid */}
            <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "12px", padding: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#F8FAFC", marginBottom: "16px" }}>
                Eligibility Criteria
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <div style={{ background: "#0F172A", padding: "12px", borderRadius: "8px", border: "1px solid #334155" }}>
                  <div style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase" }}>Education Level</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#E2E8F0", marginTop: "4px" }}>{scholarship.level}</div>
                </div>
                <div style={{ background: "#0F172A", padding: "12px", borderRadius: "8px", border: "1px solid #334155" }}>
                  <div style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase" }}>Field of Study</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#E2E8F0", marginTop: "4px" }}>{scholarship.field}</div>
                </div>
                <div style={{ background: "#0F172A", padding: "12px", borderRadius: "8px", border: "1px solid #334155" }}>
                  <div style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase" }}>Region / Country</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#E2E8F0", marginTop: "4px" }}>{scholarship.country}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "12px", padding: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#F8FAFC", marginBottom: "12px" }}>
                Full Description
              </h3>
              <p style={{ color: "#CBD5E1", fontSize: "15px", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                {scholarship.description}
              </p>
            </div>

            {/* Requirements */}
            {scholarship.requirements && (
              <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "12px", padding: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#F8FAFC", marginBottom: "12px" }}>
                  Qualifications & Requirements
                </h3>
                <p style={{ color: "#CBD5E1", fontSize: "15px", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                  {scholarship.requirements}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Provider Profile */}
          <div>
            <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "12px", padding: "24px", position: "sticky", top: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#F8FAFC", marginBottom: "16px" }}>
                Provider Information
              </h3>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#F5C842", marginBottom: "4px" }}>
                {scholarship.org_name || scholarship.provider_name}
              </div>
              {scholarship.org_type && (
                <div style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>
                  {scholarship.org_type}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", borderTop: "1px solid #334155", paddingTop: "16px" }}>
                {scholarship.website && (
                  <div>
                    <span style={{ color: "#94A3B8", fontSize: "12px", display: "block" }}>Website</span>
                    <a
                      href={scholarship.website.startsWith("http") ? scholarship.website : `https://${scholarship.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#60A5FA", textDecoration: "none" }}
                    >
                      🌐 Visit Website ↗
                    </a>
                  </div>
                )}

                {scholarship.contact_name && (
                  <div>
                    <span style={{ color: "#94A3B8", fontSize: "12px", display: "block" }}>Contact Representative</span>
                    <span style={{ color: "#E2E8F0" }}>{scholarship.contact_name} {scholarship.contact_title ? `(${scholarship.contact_title})` : ""}</span>
                  </div>
                )}

                {scholarship.provider_email && (
                  <div>
                    <span style={{ color: "#94A3B8", fontSize: "12px", display: "block" }}>Contact Email</span>
                    <span style={{ color: "#E2E8F0" }}>✉ {scholarship.provider_email}</span>
                  </div>
                )}

                {scholarship.provider_id && (
                  <div style={{ marginTop: "8px", paddingTop: "12px", borderTop: "1px solid #334155" }}>
                    <Link
                      to={`/providers/${scholarship.provider_id}`}
                      style={{
                        display: "block",
                        textAlign: "center",
                        background: "rgba(245, 200, 66, 0.1)",
                        color: "#F5C842",
                        border: "1px solid rgba(245, 200, 66, 0.3)",
                        padding: "10px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "13px",
                        textDecoration: "none"
                      }}
                    >
                      🏛️ View Full Provider Profile →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Application Modal */}
      {applyModalOpen && (
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
            maxWidth: "540px",
            color: "white",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>
                Apply for {scholarship.name}
              </h3>
              <button
                onClick={() => setApplyModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", marginBottom: "20px", lineHeight: "1.5" }}>
              Please write a brief essay or personal statement explaining your eligibility and how this scholarship will support your educational goals.
            </p>
            <form onSubmit={handleSubmitApplication}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#CBD5E1", marginBottom: "8px" }}>
                  Personal Statement / Qualification Essay
                </label>
                <textarea
                  rows={6}
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  placeholder="Explain why you qualify for this scholarship..."
                  style={{
                    width: "100%",
                    background: "#0F172A",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    padding: "12px",
                    color: "white",
                    fontSize: "14px",
                    resize: "vertical",
                    outline: "none"
                  }}
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
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
                  disabled={submitting}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #F5C842 0%, #E5A810 100%)",
                    border: "none",
                    color: "#0F172A",
                    fontWeight: "700",
                    cursor: "pointer",
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Application →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
