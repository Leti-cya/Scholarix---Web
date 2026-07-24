const fs = require("fs");
const path = require("path");
const {
    createDocument,
    getDocumentsByUser,
    getDocumentById,
    deleteDocument,
    providerHasAccessToStudent,
} = require("../model/documentModel");
const { findUserById } = require("../model/userModel");
const { UPLOAD_DIR } = require("../utils/upload");

const DOC_TYPES = ["transcript", "recommendation_letter", "certificate", "id_proof", "other"];

const uploadDocument = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            if (req.file) fs.unlink(path.join(UPLOAD_DIR, req.file.filename), () => {});
            return res.status(403).json({ message: "Only students can upload documents." });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file was uploaded." });
        }

        const docType = DOC_TYPES.includes(req.body.docType) ? req.body.docType : "other";

        const doc = await createDocument(
            req.user.id,
            docType,
            req.file.originalname,
            req.file.filename,
            req.file.size,
            req.file.mimetype
        );

        res.status(201).json({
            message: "Document uploaded successfully",
            document: {
                id: doc.id,
                doc_type: doc.doc_type,
                original_filename: doc.original_filename,
                file_size: doc.file_size,
                mime_type: doc.mime_type,
                uploaded_at: doc.uploaded_at,
            },
        });
    } catch (e) {
        if (req.file) fs.unlink(path.join(UPLOAD_DIR, req.file.filename), () => {});
        console.error("UPLOAD DOCUMENT ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const listMyDocuments = async (req, res) => {
    try {
        const documents = await getDocumentsByUser(req.user.id);
        res.status(200).json(documents);
    } catch (e) {
        console.error("LIST DOCUMENTS ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const removeDocument = async (req, res) => {
    try {
        const doc = await deleteDocument(req.params.id, req.user.id);
        if (!doc) {
            return res.status(404).json({ message: "Document not found or not yours to delete." });
        }
        fs.unlink(path.join(UPLOAD_DIR, doc.stored_filename), (err) => {
            if (err) console.error("DELETE FILE ERROR:", err.message);
        });
        res.status(200).json({ message: "Document deleted successfully" });
    } catch (e) {
        console.error("DELETE DOCUMENT ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const downloadDocument = async (req, res) => {
    try {
        const doc = await getDocumentById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: "Document not found." });
        }

        const isOwner = doc.user_id === req.user.id;
        const isAuthorizedProvider =
            req.user.role === "provider" && (await providerHasAccessToStudent(req.user.id, doc.user_id));

        if (!isOwner && !isAuthorizedProvider) {
            return res.status(403).json({ message: "You don't have permission to access this document." });
        }

        const filePath = path.join(UPLOAD_DIR, doc.stored_filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "File is missing from storage." });
        }

        res.download(filePath, doc.original_filename);
    } catch (e) {
        console.error("DOWNLOAD DOCUMENT ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

/**
 * Provider-facing: list a specific student's documents (e.g. from the
 * applicant-details modal), gated by providerHasAccessToStudent.
 */
const listStudentDocumentsForProvider = async (req, res) => {
    try {
        if (req.user.role !== "provider") {
            return res.status(403).json({ message: "Access denied. Provider role required." });
        }

        const studentId = req.params.studentId;
        const hasAccess = await providerHasAccessToStudent(req.user.id, studentId);
        if (!hasAccess) {
            return res.status(403).json({ message: "This student hasn't applied to any of your scholarships." });
        }

        const student = await findUserById(studentId);
        const documents = await getDocumentsByUser(studentId);
        res.status(200).json({ student, documents });
    } catch (e) {
        console.error("LIST STUDENT DOCUMENTS ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

module.exports = {
    uploadDocument,
    listMyDocuments,
    removeDocument,
    downloadDocument,
    listStudentDocumentsForProvider,
};
