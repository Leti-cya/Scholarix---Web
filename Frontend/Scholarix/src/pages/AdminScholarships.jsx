import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import "./ProviderDashboard.css";
import "./AdminDashboard.css";
import ThemeToggle from "../component/ThemeToggle";
import NotificationBell from "../component/NotificationBell";
import { getAdminScholarships, deleteAdminScholarship } from "../service/Api";

export default function AdminScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, scholarship: null });
  const [deleting, setDeleting] = useState(false);

  const fetchScholarships = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminScholarships({ search: search || undefined });
      setScholarships(res.data);
    } catch (e) {
      console.error("Fetch Admin Scholarships Error:", e);
      toast.error("Failed to load scholarships.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchScholarships, 300);
    return () => clearTimeout(t);
  }, [fetchScholarships]);

  const handleConfirmDelete = async () => {
    if (!deleteModal.scholarship) return;
    try {
      setDeleting(true);
      await deleteAdminScholarship(deleteModal.scholarship.id);
      toast.success("Scholarship removed successfully.");
      setScholarships((prev) => prev.filter((s) => s.id !== deleteModal.scholarship.id));
      setDeleteModal({ isOpen: false, scholarship: null });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to remove scholarship.");
    } finally {
      setDeleting(false);
    }
  };

  const isExpired = (deadline) => new Date(deadline) < new Date();

  return (
    <div className="pd-page">
      <header className="pd-welcome-banner">
        <div>
          <h1 className="pd-welcome-heading">Scholarship Moderation</h1>
          <p className="pd-welcome-sub">Every listing on the platform, across all providers</p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <ThemeToggle />
          <NotificationBell />
        </div>
      </header>

      <section className="pd-section">
        <div className="ad-toolbar">
          <input
            type="text"
            className="ad-search-input"
            placeholder="Search by scholarship name or provider…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="ad-empty-state">Loading scholarships…</p>
        ) : scholarships.length === 0 ? (
          <p className="ad-empty-state">No scholarships match your search.</p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Scholarship</th>
                  <th>Provider</th>
                  <th>Amount</th>
                  <th>Eligibility</th>
                  <th>Deadline</th>
                  <th>Posted</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scholarships.map((s) => (
                  <tr key={s.id}>
                    <td className="ad-cell-primary">{s.name}</td>
                    <td>
                      <div className="ad-cell-primary" style={{ fontWeight: 500 }}>{s.provider_name}</div>
                      <div className="ad-cell-muted">
                        {s.provider_email || "no provider account"}
                        {s.provider_email && (
                          <span className={`ad-status-dot ${s.provider_verified ? "active" : "unverified"}`} style={{ marginLeft: "8px" }}>
                            {s.provider_verified ? "Verified" : "Unverified"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="ad-cell-muted">{s.amount}</td>
                    <td className="ad-cell-muted">{s.level} · {s.field} · {s.country}</td>
                    <td>
                      <span className={`ad-status-dot ${isExpired(s.deadline) ? "suspended" : "active"}`}>
                        {new Date(s.deadline).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="ad-cell-muted">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="ad-table-actions">
                        <a
                          href={`/scholarships/${s.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pd-btn pd-btn-outline"
                          style={{ padding: "5px 10px", fontSize: "12px", textDecoration: "none", display: "inline-block" }}
                        >
                          View Live
                        </a>
                        <button
                          className="pd-btn pd-btn-danger"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          onClick={() => setDeleteModal({ isOpen: true, scholarship: s })}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Delete confirmation modal */}
      {deleteModal.isOpen && (
        <div className="pd-modal-overlay" onClick={() => setDeleteModal({ isOpen: false, scholarship: null })}>
          <div className="pd-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 12px 0", color: "#F87171" }}>Confirm Removal</h3>
              <p style={{ color: "var(--pd-text-dim)", fontSize: "14px", lineHeight: 1.5, margin: "0 0 20px 0" }}>
                Are you sure you want to remove <strong>{deleteModal.scholarship?.name}</strong> from the platform?
                All applications submitted to it will also be permanently removed. This cannot be undone.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, scholarship: null })}
                  style={{ padding: "8px 16px", borderRadius: "8px", background: "transparent", border: "1px solid var(--pd-border-strong)", color: "var(--pd-text-dim)", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  style={{ padding: "8px 16px", borderRadius: "8px", background: "#EF4444", border: "none", color: "white", fontWeight: 600, cursor: "pointer", opacity: deleting ? 0.7 : 1 }}
                >
                  {deleting ? "Removing…" : "Yes, Remove Listing"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
