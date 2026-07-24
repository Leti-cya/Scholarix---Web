import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProviderPublicProfile } from "../service/Api";
import "./ProviderDashboard.css";
import ThemeToggle from "../component/ThemeToggle";

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProviderProfile();
  }, [id]);

  const fetchProviderProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getProviderPublicProfile(id);
      setProvider(response.data.provider);
      setScholarships(response.data.scholarships || []);
    } catch (err) {
      console.error("Fetch Provider Profile Error:", err);
      setError(err.response?.data?.message || "Failed to load provider profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "var(--pd-bg)", minHeight: "100vh", color: "var(--pd-text-main)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "16px" }}>🏛️</div>
          <p style={{ color: "var(--pd-text-muted)", fontSize: "16px" }}>Loading provider profile...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div style={{ background: "var(--pd-bg)", minHeight: "100vh", color: "var(--pd-text-main)", padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "var(--pd-card-bg)", border: "1px solid var(--pd-border)", borderRadius: "16px", padding: "40px", maxWidth: "480px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px", color: "var(--pd-text-main)" }}>Provider Not Found</h2>
          <p style={{ color: "var(--pd-text-muted)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.5" }}>
            {error || "We couldn't find the organization profile you were looking for."}
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#F5C842",
              color: "#0F172A",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            ← Back to Previous Page
          </button>
        </div>
      </div>
    );
  }

  const websiteUrl = provider.website && !provider.website.startsWith("http")
    ? `https://${provider.website}`
    : provider.website;

  return (
    <div style={{ background: "var(--pd-bg)", minHeight: "100vh", color: "var(--pd-text-main)", paddingBottom: "60px" }}>
      {/* Top Navbar / Header Bar */}
      <header style={{ background: "var(--pd-card-bg)", borderBottom: "1px solid var(--pd-border)", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", color: "#F5C842", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            ← Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "13px", color: "var(--pd-text-muted)" }}>Organization Profile</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1300px", margin: "32px auto", padding: "0 24px" }}>
        {/* Organization Banner Card */}
        <div style={{ background: "linear-gradient(135deg, var(--pd-card-bg) 0%, var(--pd-bg) 100%)", border: "1px solid var(--pd-border)", borderRadius: "20px", padding: "36px", marginBottom: "32px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px" }}>
            <div style={{ flex: "1 1 500px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "32px" }}>🏛️</span>
                {provider.org_type && (
                  <span style={{ background: "rgba(245, 200, 66, 0.15)", color: "#F5C842", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", border: "1px solid rgba(245, 200, 66, 0.3)" }}>
                    {provider.org_type}
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: "32px", fontWeight: "800", margin: "0 0 12px 0", color: "var(--pd-text-main)", letterSpacing: "-0.5px" }}>
                {provider.org_name || "Scholarship Provider"}
              </h1>

              {provider.description && (
                <p style={{ color: "var(--pd-text-dim)", fontSize: "15px", lineHeight: "1.6", marginBottom: "20px", maxWidth: "800px" }}>
                  {provider.description}
                </p>
              )}

              {/* Website Link */}
              {provider.website && (
                <div style={{ marginTop: "16px" }}>
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(37, 99, 235, 0.15)",
                      color: "#60A5FA",
                      border: "1px solid rgba(96, 165, 250, 0.3)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      textDecoration: "none"
                    }}
                  >
                    🌐 Visit Official Website →
                  </a>
                </div>
              )}
            </div>

            {/* Right Contact Card Panel */}
            <div style={{
              background: "var(--pd-bg)",
              border: "1px solid var(--pd-border)",
              borderRadius: "14px",
              padding: "24px",
              minWidth: "280px",
              flex: "0 0 300px"
            }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#F5C842", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Contact Representative
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                {provider.contact_name && (
                  <div>
                    <span style={{ color: "var(--pd-text-muted)", fontSize: "12px", display: "block" }}>Contact Name</span>
                    <strong style={{ color: "var(--pd-text-main)" }}>{provider.contact_name}</strong>
                  </div>
                )}
                {provider.contact_title && (
                  <div>
                    <span style={{ color: "var(--pd-text-muted)", fontSize: "12px", display: "block" }}>Title / Role</span>
                    <span style={{ color: "var(--pd-text-dim)" }}>{provider.contact_title}</span>
                  </div>
                )}
                {provider.email && (
                  <div>
                    <span style={{ color: "var(--pd-text-muted)", fontSize: "12px", display: "block" }}>Official Email</span>
                    <a href={`mailto:${provider.email}`} style={{ color: "#60A5FA", textDecoration: "none" }}>
                      ✉️ {provider.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scholarships Offered Section */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--pd-text-main)", margin: 0 }}>
              Scholarships Offered ({scholarships.length})
            </h2>
          </div>

          {scholarships.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" }}>
              {scholarships.map((s) => {
                const deadlineDate = new Date(s.deadline);
                const diffDays = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={s.id}
                    style={{
                      background: "var(--pd-card-bg)",
                      border: "1px solid var(--pd-border)",
                      borderRadius: "16px",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "transform 0.2s, border-color 0.2s",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--pd-text-main)", lineHeight: "1.3" }}>
                          {s.name}
                        </h3>
                        <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399", padding: "4px 10px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", whiteSpace: "nowrap" }}>
                          {s.amount}
                        </span>
                      </div>

                      <p style={{ color: "var(--pd-text-dim)", fontSize: "13.5px", lineHeight: "1.5", marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {s.description}
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px", fontSize: "12px" }}>
                        <span style={{ background: "var(--pd-bg)", border: "1px solid var(--pd-border)", padding: "4px 10px", borderRadius: "6px", color: "var(--pd-text-muted)" }}>
                          🎓 {s.level}
                        </span>
                        <span style={{ background: "var(--pd-bg)", border: "1px solid var(--pd-border)", padding: "4px 10px", borderRadius: "6px", color: "var(--pd-text-muted)" }}>
                          📚 {s.field}
                        </span>
                        <span style={{ background: "var(--pd-bg)", border: "1px solid var(--pd-border)", padding: "4px 10px", borderRadius: "6px", color: "var(--pd-text-muted)" }}>
                          🌍 {s.country}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid var(--pd-border)" }}>
                        <span style={{ fontSize: "12.5px", color: diffDays <= 3 ? "#EF4444" : diffDays <= 10 ? "#F59E0B" : "var(--pd-text-muted)", fontWeight: "600" }}>
                          ⏰ {diffDays <= 0 ? "Closed" : `${diffDays} days left`}
                        </span>

                        <Link
                          to={`/scholarships/${s.id}`}
                          style={{
                            background: "#F5C842",
                            color: "#0F172A",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontWeight: "700",
                            fontSize: "13px",
                            textDecoration: "none",
                            display: "inline-block"
                          }}
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: "var(--pd-card-bg)", border: "1px solid var(--pd-border)", borderRadius: "16px", padding: "40px", textAlign: "center" }}>
              <p style={{ color: "var(--pd-text-muted)", fontSize: "15px", margin: 0 }}>This provider currently has no active scholarship listings.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}