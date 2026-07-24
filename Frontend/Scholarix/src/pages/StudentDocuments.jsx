import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import "./StudentDashboard.css";
import ThemeToggle from "../component/ThemeToggle";
import { getMyDocuments, uploadDocument, deleteDocument, downloadDocument } from "../service/Api";

const DOC_TYPES = [
  { value: "transcript", label: "Academic Transcript", icon: "📄" },
  { value: "recommendation_letter", label: "Recommendation Letter", icon: "✉️" },
  { value: "certificate", label: "Certificate / Award", icon: "🏆" },
  { value: "id_proof", label: "ID Proof", icon: "🪪" },
  { value: "other", label: "Other", icon: "📎" },
];

const DOC_TYPE_MAP = Object.fromEntries(DOC_TYPES.map((t) => [t.value, t]));

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StudentDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState("transcript");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await getMyDocuments();
      setDocuments(res.data);
    } catch (e) {
      console.error("Fetch Documents Error:", e);
      toast.error("Failed to load your documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0] || null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please choose a file first.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max size is 10MB.");
      return;
    }

    try {
      setUploading(true);
      await uploadDocument(selectedFile, docType);
      toast.success("Document uploaded successfully!");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success("Document deleted.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (doc) => {
    try {
      await downloadDocument(doc.id, doc.original_filename);
    } catch (error) {
      toast.error("Failed to download document.");
    }
  };

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", color: "var(--color-text)", paddingBottom: "60px" }}>
      <header style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", padding: "16px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "var(--color-text)" }}>
            📎 My Documents
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main style={{ maxWidth: "900px", margin: "32px auto", padding: "0 24px" }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "24px" }}>
          Upload transcripts, recommendation letters, certificates, and other supporting documents once — providers can view them when you apply to their scholarships.
        </p>

        {/* Upload form */}
        <form
          onSubmit={handleUpload}
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "24px", marginBottom: "28px" }}
        >
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 16px" }}>Upload a document</h2>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr auto", gap: "12px", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "6px" }}>Document type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "10px", color: "var(--color-text)", fontSize: "13.5px" }}
              >
                {DOC_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "6px" }}>File (PDF, JPG, PNG, DOC — max 10MB)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                onChange={handleFileChange}
                style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "8px", color: "var(--color-text)", fontSize: "13px" }}
              />
            </div>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              style={{
                background: "#2563EB", color: "white", border: "none", borderRadius: "8px",
                padding: "10px 20px", fontWeight: "600", fontSize: "13.5px", cursor: uploading || !selectedFile ? "not-allowed" : "pointer",
                opacity: uploading || !selectedFile ? 0.6 : 1, whiteSpace: "nowrap"
              }}
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>

        {/* Document list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="auth-spinner" style={{ width: "32px", height: "32px", margin: "0 auto", borderTopColor: "#F5C842" }} />
          </div>
        ) : documents.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {documents.map((doc) => {
              const typeInfo = DOC_TYPE_MAP[doc.doc_type] || DOC_TYPE_MAP.other;
              return (
                <div
                  key={doc.id}
                  style={{
                    background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "10px",
                    padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px"
                  }}
                >
                  <span style={{ fontSize: "22px" }}>{typeInfo.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {doc.original_filename}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                      {typeInfo.label} · {formatFileSize(doc.file_size)} · {new Date(doc.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(doc)}
                    title="Download"
                    style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", fontWeight: 600, color: "var(--color-text-dim)", cursor: "pointer" }}
                  >
                    ⬇ Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    title="Delete"
                    style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", fontWeight: 600, color: "#EF4444", cursor: deletingId === doc.id ? "not-allowed" : "pointer", opacity: deletingId === doc.id ? 0.6 : 1 }}
                  >
                    {deletingId === doc.id ? "…" : "🗑"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "50px", background: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "28px", marginBottom: "10px" }}>📎</p>
            <p style={{ color: "var(--color-text)", fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>No documents uploaded yet</p>
            <p style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>Upload your first document using the form above.</p>
          </div>
        )}
      </main>
    </div>
  );
}
