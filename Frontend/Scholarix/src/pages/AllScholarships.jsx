import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Api, { getStudentApplications, applyScholarship } from "../service/Api";
import "./StudentDashboard.css";

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
    <div style={{ background: "#0F172A", minHeight: "100vh", color: "#F8FAFC", paddingBottom: "60px" }}>
      {/* Top Navbar Header */}
      <header style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ background: "none", border: "none", color: "#F5C842", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}
            >
              ← Dashboard
            </button>
            <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "white" }}>
              Explore All Scholarships
            </h1>
          </div>
          <span style={{ fontSize: "14px", color: "#94A3B8" }}>
            {scholarships.length} opportunities available
          </span>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "32px auto", padding: "0 24px" }}>
        {/* Search & Filter Bar */}
        <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search by title, provider, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: "#0F172A",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "12px 16px",
                color: "white",
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
              <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Education Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                style={{ width: "100%", background: "#0F172A", border: "1px solid #334155", borderRadius: "8px", padding: "10px", color: "white", fontSize: "13.5px" }}
              >
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Field of Study</label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                style={{ width: "100%", background: "#0F172A", border: "1px solid #334155", borderRadius: "8px", padding: "10px", color: "white", fontSize: "13.5px" }}
              >
                {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Target Region / Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                style={{ width: "100%", background: "#0F172A", border: "1px solid #334155", borderRadius: "8px", padding: "10px", color: "white", fontSize: "13.5px" }}
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{ width: "100%", background: "transparent", border: "1px solid #475569", color: "#CBD5E1", borderRadius: "8px", padding: "10px", fontWeight: "600", cursor: "pointer", fontSize: "13.5px" }}
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
            <p style={{ marginTop: "16px", color: "#94A3B8" }}>Fetching scholarships...</p>
          </div>
        ) : scholarships.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {scholarships.map((s) => {
              const isApplied = applications.some(a => a.scholarship_id === s.id);
              const deadlineDate = new Date(s.deadline);
              const diffDays = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={s.id}
                  style={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "14px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <span style={{ background: "rgba(245, 200, 66, 0.15)", color: "#F5C842", padding: "4px 10px", borderRadius: "16px", fontSize: "12px", fontWeight: "600" }}>
                        {s.provider_name}
                      </span>
                      <span style={{ fontSize: "18px", fontWeight: "800", color: "#F5C842" }}>
                        {s.amount}
                      </span>
                    </div>

                    <h3
                      onClick={() => navigate(`/scholarships/${s.id}`)}
                      style={{ fontSize: "18px", fontWeight: "700", color: "white", marginBottom: "8px", cursor: "pointer" }}
                    >
                      {s.name}
                    </h3>

                    <p style={{ color: "#94A3B8", fontSize: "13.5px", lineHeight: "1.5", marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {s.description}
                    </p>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                      <span style={{ background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", color: "#CBD5E1" }}>{s.level}</span>
                      <span style={{ background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", color: "#CBD5E1" }}>{s.field}</span>
                      <span style={{ background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", color: "#CBD5E1" }}>{s.country}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "16px" }}>
                      ⏰ Deadline: {deadlineDate.toLocaleDateString()} ({diffDays <= 0 ? "Closed" : `${diffDays} days left`})
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => navigate(`/scholarships/${s.id}`)}
                        style={{ flex: 1, background: "transparent", border: "1px solid #475569", color: "#CBD5E1", borderRadius: "8px", padding: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                      >
                        Details
                      </button>

                      {isApplied ? (
                        <button disabled style={{ flex: 1, background: "#334155", color: "#94A3B8", border: "none", borderRadius: "8px", padding: "8px", fontSize: "13px", fontWeight: "600", cursor: "default" }}>
                          ✓ Applied
                        </button>
                      ) : diffDays <= 0 ? (
                        <button disabled style={{ flex: 1, background: "#334155", color: "#94A3B8", border: "none", borderRadius: "8px", padding: "8px", fontSize: "13px", fontWeight: "600", cursor: "not-allowed" }}>
                          Closed
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
          <div style={{ textAlign: "center", padding: "60px", background: "#1E293B", borderRadius: "16px", border: "1px solid #334155" }}>
            <p style={{ color: "#94A3B8", fontSize: "16px" }}>No scholarships match your search criteria.</p>
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
                Apply for {applyModal.scholarshipName}
              </h3>
              <button
                onClick={handleCloseApplyModal}
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
                  onClick={handleCloseApplyModal}
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
