import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./StudentDashboard.css";
import ThemeToggle from "../component/ThemeToggle";
import { getSavedScholarships, unsaveScholarship, getStudentApplications } from "../service/Api";

export default function SavedScholarships() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const [savedRes, appsRes] = await Promise.all([getSavedScholarships(), getStudentApplications()]);
      setSaved(savedRes.data);
      setApplications(appsRes.data);
    } catch (e) {
      console.error("Fetch Saved Scholarships Error:", e);
      toast.error("Failed to load your saved scholarships.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = async (scholarshipId) => {
    try {
      await unsaveScholarship(scholarshipId);
      setSaved((prev) => prev.filter((s) => s.id !== scholarshipId));
      toast.success("Removed from saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove.");
    }
  };

  if (loading) {
    return (
      <div className="sd-loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--color-border)', borderTop: '4px solid #F5C842', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500' }}>Loading your saved scholarships...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", color: "var(--color-text)", paddingBottom: "60px" }}>
      <header style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "var(--color-text)" }}>
            🔖 Saved Scholarships
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
              {saved.length} saved
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1400px", margin: "32px auto", padding: "0 24px" }}>
        {saved.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {saved.map((s) => {
              const isApplied = applications.some((a) => a.scholarship_id === s.id);
              const deadlineDate = new Date(s.deadline);
              const diffDays = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));

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
                    onClick={() => handleUnsave(s.id)}
                    title="Remove from saved"
                    aria-label="Remove from saved"
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
                      border: "1px solid rgba(245, 200, 66, 0.4)",
                      background: "rgba(245, 200, 66, 0.15)",
                    }}
                  >
                    🔖
                  </button>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", paddingRight: "40px" }}>
                      <span
                        onClick={() => { if (s.provider_id) navigate(`/providers/${s.provider_id}`); }}
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
                      <span style={{ background: "var(--color-pill-bg)", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", color: "var(--color-text-dim)" }}>{s.level}</span>
                      <span style={{ background: "var(--color-pill-bg)", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", color: "var(--color-text-dim)" }}>{s.field}</span>
                      <span style={{ background: "var(--color-pill-bg)", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", color: "var(--color-text-dim)" }}>{s.country}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
                      ⏰ Deadline: {deadlineDate.toLocaleDateString()} ({diffDays <= 0 ? "Closed" : `${diffDays} days left`})
                    </div>

                    <button
                      onClick={() => navigate(`/scholarships/${s.id}`)}
                      style={{ width: "100%", background: isApplied ? "var(--color-border)" : "#2563EB", color: isApplied ? "var(--color-text-muted)" : "white", border: "none", borderRadius: "8px", padding: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                    >
                      {isApplied ? "✓ Already Applied — View" : "View Details →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px", background: "var(--color-surface)", borderRadius: "16px", border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "32px", marginBottom: "12px" }}>🔖</p>
            <p style={{ color: "var(--color-text)", fontSize: "16px", fontWeight: "600", marginBottom: "6px" }}>Nothing saved yet</p>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "20px" }}>
              Browse scholarships and tap the bookmark icon to save ones you're interested in.
            </p>
            <button
              onClick={() => navigate("/scholarships")}
              style={{ background: "#2563EB", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "600", cursor: "pointer" }}
            >
              Explore Scholarships →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
