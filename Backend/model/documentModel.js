const pool = require("../database/db");

const createDocument = async (userId, docType, originalFilename, storedFilename, fileSize, mimeType) => {
    const result = await pool.query(
        `INSERT INTO documents (user_id, doc_type, original_filename, stored_filename, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, docType, originalFilename, storedFilename, fileSize, mimeType]
    );
    return result.rows[0];
};

const getDocumentsByUser = async (userId) => {
    const result = await pool.query(
        `SELECT id, doc_type, original_filename, file_size, mime_type, uploaded_at
         FROM documents
         WHERE user_id = $1
         ORDER BY uploaded_at DESC`,
        [userId]
    );
    return result.rows;
};

const getDocumentById = async (id) => {
    const result = await pool.query("SELECT * FROM documents WHERE id = $1", [id]);
    return result.rows[0];
};

const deleteDocument = async (id, userId) => {
    const result = await pool.query(
        "DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *",
        [id, userId]
    );
    return result.rows[0];
};

/**
 * A provider may view a student's documents only once that student has
 * applied to at least one of the provider's scholarships — legitimate
 * need-to-know access, not open to every provider on the platform.
 */
const providerHasAccessToStudent = async (providerId, studentId) => {
    const result = await pool.query(
        `SELECT 1 FROM applications a
         JOIN scholarships s ON a.scholarship_id = s.id
         WHERE s.provider_id = $1 AND a.student_id = $2
         LIMIT 1`,
        [providerId, studentId]
    );
    return result.rows.length > 0;
};

module.exports = {
    createDocument,
    getDocumentsByUser,
    getDocumentById,
    deleteDocument,
    providerHasAccessToStudent,
};
