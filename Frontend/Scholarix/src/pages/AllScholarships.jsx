import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Api, { getStudentApplications, applyScholarship, getProfile, saveScholarship, unsaveScholarship, getSavedScholarshipIds } from "../service/Api";
import "./StudentDashboard.css";
import ThemeToggle from "../component/ThemeToggle";
import { checkEligibility } from "../utils/eligibility";

const LEVELS = [
  "All Levels",
  "High School / Secondary",
  "Undergraduate (Bachelor's)",
  "Postgraduate (Master's)",
  "Doctoral (PhD)",
  "Postdoctoral",
  "Vocational / Certificate"
];

const FIELDS = [
  "All Fields",
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
  "Other"
];

const COUNTRIES = [
  "Global",
  "Australia", "Bangladesh", "Brazil", "Canada", "China",
  "Egypt", "Ethiopia", "France", "Germany", "Ghana",
  "India", "Indonesia", "Japan", "Kenya", "Mexico",
  "Nepal", "Nigeria", "Pakistan", "Philippines", "Sierra Leone",
  "South Africa", "South Korea", "Sri Lanka", "Tanzania", "Uganda",
  "United Kingdom", "United States", "Vietnam", "Zimbabwe", "Other"
];

export default function AllScholarships() {
  const navigate = useNavigate();

  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [student, setStudent] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filter & Search state
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedField, setSelectedField] = useState("All Fields");
  const [selectedCountry, setSelectedCountry] = useState("Global");

  // Application Modal state
  const [applyModal, setApplyModal] = useState({ isOpen: false, scholarshipId: null, scholarshipName: "" });
  const [essayText, setEssayText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (selectedLevel !== "All Levels") params.append("level", selectedLevel);
      if (selectedField !== "All Fields") params.append("field", selectedField);
      if (selectedCountry !== "Global") params.append("country", selectedCountry);

      const res = await Api.get(`/api/scholarships?${params.toString()}`);
      setScholarships(res.data);

      try {
        const appsRes = await getStudentApplications();
        setApplications(appsRes.data);
      } catch (err) {
        // user might not be student
      }
    } catch (e) {
      console.error("Fetch Scholarships Error:", e);
      toast.error("Failed to load scholarships.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [selectedLevel, selectedField, selectedCountry]);

  useEffect(() => {
    getProfile()
      .then(res => setStudent(res.data))
      .catch(() => {}); // not a student / not logged in — eligibility checks just no-op
  }, []);

  useEffect(() => {
    getSavedScholarshipIds()
      .then(res => setSavedIds(new Set(res.data.ids)))
      .catch(() => {});
  }, []);

  const handleToggleSave = async (e, scholarshipId) => {
    e.stopPropagation();
    const isSaved = savedIds.has(scholarshipId);
    try {
      if (isSaved) {
        await unsaveScholarship(scholarshipId);
        setSavedIds(prev => { const next = new Set(prev); next.delete(scholarshipId); return next; });
      } else {
        await saveScholarship(scholarshipId);
        setSavedIds(prev => new Set(prev).add(scholarshipId));
        toast.success("Saved to your list");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update saved scholarships.");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchScholarships();
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedLevel("All Levels");
    setSelectedField("All Fields");
    setSelectedCountry("Global");
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
      await applyScholarship({ scholarshipId: applyModal.scholarshipId, essay: essayText });
      toast.success("Application submitted successfully!");
      handleCloseApplyModal();
      fetchScholarships();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", color: "var(--color-text)", paddingBottom: "60px" }}>
      {/* Top Navbar Header */}
      <header style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "var(--color-text)" }}>
              Explore All Scholarships
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
              {scholarships.length} opportunities available
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1400px", margin: "32px auto", padding: "0 24px" }}>
        {/* Search & Filter Bar */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search by title, provider, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "12px 16px",
                color: "var(--color-text)",
                fontSize: "14px",
                outline: "none"
              }}
            />
            <button
              type="submit"
              style={{
                background: "#2563EB",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Search 🔍
            </button>
          </form>

          {/* Dropdown Filters */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "6px" }}>Education Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "10px", color: "var(--color-text)", fontSize: "13.5px" }}
              >
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "6px" }}>Field of Study</label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "10px", color: "var(--color-text)", fontSize: "13.5px" }}
              >
                {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "6px" }}>Target Region / Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "10px", color: "var(--color-text)", fontSize: "13.5px" }}
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{ width: "100%", background: "transparent", border: "1px solid var(--color-border-dark)", color: "var(--color-text-dim)", borderRadius: "8px", padding: "10px", fontWeight: "600", cursor: "pointer", fontSize: "13.5px" }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Scholarships Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div className="auth-spinner" style={{ width: "36px", height: "36px", margin: "0 auto", borderTopColor: "#F5C842" }} />
            <p style={{ marginTop: "16px", color: "var(--color-text-muted)" }}>Fetching scholarships...</p>
          </div>
        ) : scholarships.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {scholarships.map((s) => {
              const isApplied = applications.some(a => a.scholarship_id === s.id);
              const deadlineDate = new Date(s.deadline);
              const diffDays = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));
              const { eligible, reasons } = checkEligibility(s, student);
              const levelMismatch = student && s.level !== "All Levels" && s.level !== student.level;
              const fieldMismatch = student && s.field !== "All Fields" && s.field !== student.field;
              const countryMismatch = student && s.country !== "Global" && s.country !== "Other" && s.country !== student.country;
              const mismatchPillStyle = { background: "rgba(239, 68, 68, 0.12)", color: "#EF4444", border: "1px solid rgba(239, 68, 68, 0.3)" };

              const isSaved = savedIds.has(s.id);

              return (
                <div
                  key={s.id}
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "14px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative"
                  }}
                >
                  <button
                    onClick={(e) => handleToggleSave(e, s.id)}
                    title={isSaved ? "Remove from saved" : "Save this scholarship"}
                    aria-label={isSaved ? "Remove from saved" : "Save this scholarship"}
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      width: "32px",
                      height: "32px",
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "15px",
                      border: isSaved ? "1px solid rgba(245, 200, 66, 0.4)" : "1px solid var(--color-border)",
                      background: isSaved ? "rgba(245, 200, 66, 0.15)" : "var(--color-bg)",
                    }}
                  >
                    {isSaved ? "🔖" : "🏷️"}
                  </button>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", paddingRight: "40px" }}>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (s.provider_id) navigate(`/providers/${s.provider_id}`);
                        }}
                        title="View provider profile"
                        style={{
                          background: "rgba(245, 200, 66, 0.15)",
                          color: "#F5C842",
                          padding: "4px 10px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: s.provider_id ? "pointer" : "default",
                          border: "1px solid rgba(245, 200, 66, 0.2)"
                        }}
                      >
                        🏛️ {s.provider_name}
                      </span>
                      <span style={{ fontSize: "18px", fontWeight: "800", color: "#F5C842" }}>
                        {s.amount}
                      </span>
                    </div>

                    <h3
                      onClick={() => navigate(`/scholarships/${s.id}`)}
                      style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-text)", marginBottom: "8px", cursor: "pointer" }}
                    >
                      {s.name}
                    </h3>

                    <p style={{ color: "var(--color-text-muted)", fontSize: "13.5px", lineHeight: "1.5", marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {s.description}
                    </p>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", ...(levelMismatch ? mismatchPillStyle : { background: "var(--color-pill-bg)", color: "var(--color-text-dim)" }) }}>{s.level}</span>
                      <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", ...(fieldMismatch ? mismatchPillStyle : { background: "var(--color-pill-bg)", color: "var(--color-text-dim)" }) }}>{s.field}</span>
                      <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", ...(countryMismatch ? mismatchPillStyle : { background: "var(--color-pill-bg)", color: "var(--color-text-dim)" }) }}>{s.country}</span>
                    </div>
                    {!eligible && (
                      <p style={{ color: "#EF4444", fontSize: "11.5px", lineHeight: "1.4", marginBottom: "16px", marginTop: "-8px" }}>
                        ⚠ You don't meet all requirements for this scholarship.
                      </p>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
                      ⏰ Deadline: {deadlineDate.toLocaleDateString()} ({diffDays <= 0 ? "Closed" : `${diffDays} days left`})
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => navigate(`/scholarships/${s.id}`)}
                        style={{ flex: 1, background: "transparent", border: "1px solid var(--color-border-dark)", color: "var(--color-text-dim)", borderRadius: "8px", padding: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                      >
                        Details
                      </button>

                      {isApplied ? (
                        <button disabled style={{ flex: 1, background: "var(--color-border)", color: "var(--color-text-muted)", border: "none", borderRadius: "8px", padding: "8px", fontSize: "13px", fontWeight: "600", cursor: "default" }}>
                          ✓ Applied
                        </button>
                      ) : diffDays <= 0 ? (
                        <button disabled style={{ flex: 1, background: "var(--color-border)", color: "var(--color-text-muted)", border: "none", borderRadius: "8px", padding: "8px", fontSize: "13px", fontWeight: "600", cursor: "not-allowed" }}>
                          Closed
                        </button>
                      ) : !eligible ? (
                        <button
                          disabled
                          title={reasons.join(" · ")}
                          style={{ flex: 1, background: "rgba(239, 68, 68, 0.12)", color: "#EF4444", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "8px", fontSize: "13px", fontWeight: "600", cursor: "not-allowed" }}
                        >
                          Not Eligible
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenApplyModal(s.id, s.name)}
                          style={{ flex: 1, background: "#2563EB", color: "white", border: "none", borderRadius: "8px", padding: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                        >
                          Apply →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px", background: "var(--color-surface)", borderRadius: "16px", border: "1px solid var(--color-border)" }}>
            <p style={{ color: "var(--color-text-muted)", fontSize: "16px" }}>No scholarships match your search criteria.</p>
            <button
              onClick={handleResetFilters}
              style={{ marginTop: "16px", background: "#2563EB", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "600", cursor: "pointer" }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      {/* Application Modal */}
      {applyModal.isOpen && (
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
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            padding: "28px",
            width: "100%",
            maxWidth: "540px",
            color: "var(--color-text)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>
                Apply for {applyModal.scholarshipName}
              </h3>
              <button
                onClick={handleCloseApplyModal}
                style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "20px", lineHeight: "1.5" }}>
              Please write a brief essay or personal statement explaining your eligibility and how this scholarship will support your educational goals.
            </p>
            <form onSubmit={handleSubmitApplication}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--color-text-dim)", marginBottom: "8px" }}>
                  Personal Statement / Qualification Essay
                </label>
                <textarea
                  rows={6}
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  placeholder="Explain why you qualify for this scholarship..."
                  style={{
                    width: "100%",
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    padding: "12px",
                    color: "var(--color-text)",
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
                  onClick={handleCloseApplyModal}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    background: "transparent",
                    border: "1px solid var(--color-border-dark)",
                    color: "var(--color-text-dim)",
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
                    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                    border: "none",
                    color: "white",
                    fontWeight: "600",
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
