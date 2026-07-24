import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getStudentDocumentsForProvider, downloadDocument } from "../service/Api";

const DOC_TYPE_ICON = {
  transcript: "📄",
  recommendation_letter: "✉️",
  certificate: "🏆",
  id_proof: "🪪",
  other: "📎",
};

/**
 * Shown inside the applicant-details modal on both provider pages
 * (ProviderDashboard, ProviderApplications). Access is enforced
 * server-side — this only renders what the backend actually returns.
 */
export default function ApplicantDocuments({ studentId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getStudentDocumentsForProvider(studentId)
      .then((res) => setDocuments(res.data.documents || []))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleDownload = async (doc) => {
    try {
      await downloadDocument(doc.id, doc.original_filename);
    } catch {
      toast.error("Failed to download document.");
    }
  };

  if (loading) {
    return <p style={{ fontSize: "13px", color: "var(--pd-text-muted)" }}>Loading documents…</p>;
  }

  if (documents.length === 0) {
    return <p style={{ fontSize: "13px", color: "var(--pd-text-muted)" }}>No documents uploaded.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {documents.map((doc) => (
        <div
          key={doc.id}
          style={{
            display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between",
            background: "var(--pd-bg)", border: "1px solid var(--pd-border)", borderRadius: "8px", padding: "8px 12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <span>{DOC_TYPE_ICON[doc.doc_type] || "📎"}</span>
            <span style={{ fontSize: "13px", color: "var(--pd-text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {doc.original_filename}
            </span>
          </div>
          <button
            onClick={() => handleDownload(doc)}
            style={{ flexShrink: 0, background: "transparent", border: "1px solid var(--pd-border-strong)", borderRadius: "6px", padding: "5px 10px", fontSize: "12px", fontWeight: 600, color: "var(--pd-text-dim)", cursor: "pointer" }}
          >
            ⬇ Download
          </button>
        </div>
      ))}
    </div>
  );
}
