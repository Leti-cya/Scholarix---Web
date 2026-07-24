const pool = require("../database/db");

const saveScholarship = async (studentId, scholarshipId) => {
    const result = await pool.query(
        `INSERT INTO saved_scholarships (student_id, scholarship_id)
         VALUES ($1, $2)
         ON CONFLICT (scholarship_id, student_id) DO NOTHING
         RETURNING *`,
        [studentId, scholarshipId]
    );
    return result.rows[0];
};

const unsaveScholarship = async (studentId, scholarshipId) => {
    const result = await pool.query(
        "DELETE FROM saved_scholarships WHERE student_id = $1 AND scholarship_id = $2 RETURNING *",
        [studentId, scholarshipId]
    );
    return result.rows[0];
};

const getSavedScholarships = async (studentId) => {
    const result = await pool.query(
        `SELECT s.*, ss.saved_at
         FROM saved_scholarships ss
         JOIN scholarships s ON ss.scholarship_id = s.id
         WHERE ss.student_id = $1
         ORDER BY ss.saved_at DESC`,
        [studentId]
    );
    return result.rows;
};

// Returns just the set of scholarship IDs a student has saved — cheap way
// for the frontend to know which "Save" buttons should render as "Saved".
const getSavedScholarshipIds = async (studentId) => {
    const result = await pool.query(
        "SELECT scholarship_id FROM saved_scholarships WHERE student_id = $1",
        [studentId]
    );
    return result.rows.map((r) => r.scholarship_id);
};

module.exports = {
    saveScholarship,
    unsaveScholarship,
    getSavedScholarships,
    getSavedScholarshipIds,
};
