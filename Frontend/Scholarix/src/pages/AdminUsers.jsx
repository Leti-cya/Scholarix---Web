import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import "./ProviderDashboard.css";
import "./AdminDashboard.css";
import ThemeToggle from "../component/ThemeToggle";
import NotificationBell from "../component/NotificationBell";
import {
  getAdminUsers,
  getAdminUserDetail,
  suspendAdminUser,
  deleteAdminUser,
} from "../service/Api";

const ROLE_TABS = [
  { id: "all", label: "All" },
  { id: "student", label: "Students" },
  { id: "provider", label: "Providers" },
  { id: "admin", label: "Admins" },
];

function displayName(u) {
  if (u.role === "provider") return u.org_name || "Unnamed organisation";
  const full = `${u.first_name || ""} ${u.last_name || ""}`.trim();
  return full || "Unnamed";
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [detailModal, setDetailModal] = useState({ isOpen: false, user: null, loading: false });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [deleting, setDeleting] = useState(false);
  const [suspendingId, setSuspendingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminUsers({ search: search || undefined, role: roleFilter });
      setUsers(res.data);
    } catch (e) {
      console.error("Fetch Admin Users Error:", e);
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300); // debounce search typing
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleViewDetail = async (id) => {
    setDetailModal({ isOpen: true, user: null, loading: true });
    try {
      const res = await getAdminUserDetail(id);
      setDetailModal({ isOpen: true, user: res.data, loading: false });
    } catch (e) {
      toast.error("Failed to load user details.");
      setDetailModal({ isOpen: false, user: null, loading: false });
    }
  };

  const handleToggleSuspend = async (user) => {
    try {
      setSuspendingId(user.id);
      const next = !user.is_suspended;
      await suspendAdminUser(user.id, next);
      toast.success(next ? `${displayName(user)} suspended.` : `${displayName(user)} reactivated.`);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_suspended: next } : u)));
      setDetailModal((prev) =>
        prev.isOpen && prev.user && prev.user.id === user.id
          ? { ...prev, user: { ...prev.user, is_suspended: next } }
          : prev
      );
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update account status.");
    } finally {
      setSuspendingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.user) return;
    try {
      setDeleting(true);
      await deleteAdminUser(deleteModal.user.id);
      toast.success("User deleted successfully.");
      setUsers((prev) => prev.filter((u) => u.id !== deleteModal.user.id));
      setDeleteModal({ isOpen: false, user: null });
      setDetailModal({ isOpen: false, user: null, loading: false });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="pd-page">
      <header className="pd-welcome-banner">
        <div>
          <h1 className="pd-welcome-heading">User Management</h1>
          <p className="pd-welcome-sub">Search, verify, suspend, or remove accounts</p>
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
            placeholder="Search by name, email, or organisation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="ad-filter-tabs">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`pd-tab ${roleFilter === tab.id ? "active" : ""}`}
                onClick={() => setRoleFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="ad-empty-state">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="ad-empty-state">No users match your search.</p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Name / Organisation</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="ad-cell-primary">{displayName(u)}</td>
                    <td className="ad-cell-muted">{u.email}</td>
                    <td><span className={`ad-role-badge ${u.role}`}>{u.role}</span></td>
                    <td>
                      {u.is_suspended ? (
                        <span className="ad-status-dot suspended">Suspended</span>
                      ) : u.role === "provider" && !u.is_verified ? (
                        <span className="ad-status-dot unverified">Unverified</span>
                      ) : (
                        <span className="ad-status-dot active">Active</span>
                      )}
                    </td>
                    <td className="ad-cell-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="ad-table-actions">
                        <button className="pd-btn pd-btn-outline" style={{ padding: "5px 10px", fontSize: "12px" }} onClick={() => handleViewDetail(u.id)}>
                          View
                        </button>
                        {u.role !== "admin" && (
                          <>
                            <button
                              className="pd-btn pd-btn-outline"
                              style={{ padding: "5px 10px", fontSize: "12px", borderColor: u.is_suspended ? "#10B981" : "#F59E0B", color: u.is_suspended ? "#10B981" : "#F59E0B" }}
                              disabled={suspendingId === u.id}
                              onClick={() => handleToggleSuspend(u)}
                            >
                              {suspendingId === u.id ? "…" : u.is_suspended ? "Reactivate" : "Suspend"}
                            </button>
                            <button
                              className="pd-btn pd-btn-danger"
                              style={{ padding: "5px 10px", fontSize: "12px" }}
                              onClick={() => setDeleteModal({ isOpen: true, user: u })}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Detail modal */}
      {detailModal.isOpen && (
        <div className="pd-modal-overlay" onClick={() => setDetailModal({ isOpen: false, user: null, loading: false })}>
          <div className="pd-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div className="pd-modal-header">
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--pd-text-main)", margin: 0 }}>
                {detailModal.user ? displayName(detailModal.user) : "Loading…"}
              </h3>
              <button onClick={() => setDetailModal({ isOpen: false, user: null, loading: false })} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <div className="pd-modal-body">
              {detailModal.loading || !detailModal.user ? (
                <p className="ad-empty-state">Loading details…</p>
              ) : (
                <>
                  <div className="pd-detail-grid">
                    <div className="pd-detail-item">
                      <span className="pd-detail-label">Role</span>
                      <span className="pd-detail-val"><span className={`ad-role-badge ${detailModal.user.role}`}>{detailModal.user.role}</span></span>
                    </div>
                    <div className="pd-detail-item">
                      <span className="pd-detail-label">Email</span>
                      <span className="pd-detail-val">{detailModal.user.email}</span>
                    </div>
                    <div className="pd-detail-item">
                      <span className="pd-detail-label">Account Status</span>
                      <span className="pd-detail-val">{detailModal.user.is_suspended ? "Suspended" : "Active"}</span>
                    </div>
                    <div className="pd-detail-item">
                      <span className="pd-detail-label">Joined</span>
                      <span className="pd-detail-val">{new Date(detailModal.user.created_at).toLocaleDateString()}</span>
                    </div>

                    {detailModal.user.role === "student" && (
                      <>
                        <div className="pd-detail-item">
                          <span className="pd-detail-label">Country</span>
                          <span className="pd-detail-val">{detailModal.user.country || "Not specified"}</span>
                        </div>
                        <div className="pd-detail-item">
                          <span className="pd-detail-label">Phone</span>
                          <span className="pd-detail-val">{detailModal.user.phone || "Not provided"}</span>
                        </div>
                        <div className="pd-detail-item">
                          <span className="pd-detail-label">Study Level</span>
                          <span className="pd-detail-val">{detailModal.user.level || "Not specified"}</span>
                        </div>
                        <div className="pd-detail-item">
                          <span className="pd-detail-label">Field</span>
                          <span className="pd-detail-val">{detailModal.user.field || "Not specified"}</span>
                        </div>
                        <div className="pd-detail-item">
                          <span className="pd-detail-label">Institution</span>
                          <span className="pd-detail-val">{detailModal.user.institution || "Not specified"}</span>
                        </div>
                        <div className="pd-detail-item">
                          <span className="pd-detail-label">GPA</span>
                          <span className="pd-detail-val">{detailModal.user.gpa || "Not specified"}</span>
                        </div>
                        <div className="pd-detail-item">
                          <span className="pd-detail-label">Applications Submitted</span>
                          <span className="pd-detail-val">{detailModal.user.application_count ?? 0}</span>
                        </div>
                      </>
                    )}

                    {detailModal.user.role === "provider" && (
                      <>
                        <div className="pd-detail-item">
                          <span className="pd-detail-label">Organisation Type</span>
                          <span className="pd-detail-val">{detailModal.user.org_type || "Not specified"}</span>
                        </div>
                        <div className="pd-detail-item">
                          <span className="pd-detail-label">Website</span>
                          <span className="pd-detail-val">{detailModal.user.website || "Not provided"}</span>
                        </div>
                        <div className="pd-detail-item">
                          <span className="pd-detail-label">Contact Person</span>
                          <span className="pd-detail-val">{detailModal.user.contact_name || "Not specified"}{detailModal.user.contact_title ? ` · ${detailModal.user.contact_title}` : ""}</span>
                        </div>
                        <div className="pd-detail-item">
                          <span className="pd-detail-label">Registration No.</span>
                          <span className="pd-detail-val">{detailModal.user.reg_number || "Not provided"}</span>
                        </div>
                        <div className="pd-detail-item">
                          <span className="pd-detail-label">Email Verified</span>
                          <span className="pd-detail-val">{detailModal.user.is_verified ? "Yes" : "No"}</span>
                        </div>
                        <div className="pd-detail-item">
                          <span className="pd-detail-label">Scholarships Posted</span>
                          <span className="pd-detail-val">{detailModal.user.scholarship_count ?? 0}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {detailModal.user.description && (
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#F5C842", margin: "0 0 8px 0" }}>About</h4>
                      <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.6, color: "var(--pd-text-dim)" }}>{detailModal.user.description}</p>
                    </div>
                  )}

                  {detailModal.user.role !== "admin" && (
                    <div style={{ background: "var(--pd-bg)", padding: "16px", borderRadius: "10px", border: "1px solid var(--pd-border)", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        className="pd-btn pd-btn-outline"
                        style={{ borderColor: detailModal.user.is_suspended ? "#10B981" : "#F59E0B", color: detailModal.user.is_suspended ? "#10B981" : "#F59E0B" }}
                        onClick={() => handleToggleSuspend(detailModal.user)}
                        disabled={suspendingId === detailModal.user.id}
                      >
                        {detailModal.user.is_suspended ? "Reactivate Account" : "Suspend Account"}
                      </button>
                      <button
                        className="pd-btn pd-btn-danger"
                        onClick={() => setDeleteModal({ isOpen: true, user: detailModal.user })}
                      >
                        Delete Account
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModal.isOpen && (
        <div className="pd-modal-overlay" onClick={() => setDeleteModal({ isOpen: false, user: null })}>
          <div className="pd-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 12px 0", color: "#F87171" }}>Confirm Deletion</h3>
              <p style={{ color: "var(--pd-text-dim)", fontSize: "14px", lineHeight: 1.5, margin: "0 0 20px 0" }}>
                Are you sure you want to permanently delete <strong>{deleteModal.user ? displayName(deleteModal.user) : "this account"}</strong>?
                {deleteModal.user?.role === "provider"
                  ? " All of their scholarship listings and the applications submitted to them will also be permanently removed."
                  : " All of their applications, documents, and saved scholarships will also be permanently removed."}
                {" "}This cannot be undone.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, user: null })}
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
                  {deleting ? "Deleting…" : "Yes, Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
