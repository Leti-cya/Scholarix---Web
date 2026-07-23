const pool = require("../database/db")

const createApplication = async (studentId, scholarshipId, essay) => {
    const result = await pool.query(
        `INSERT INTO applications (student_id, scholarship_id, essay, status)
        VALUES ($1, $2, $3, 'submitted')
        RETURNING *`,
        [studentId, scholarshipId, essay]
    );
    return result.rows[0];
};

const getApplicationsForProvider = async (providerId) => {
    const result = await pool.query(
        `SELECT 
            a.id as application_id,
            a.status,
            a.essay,
            a.submitted_at,
            s.id as scholarship_id,
            s.name as scholarship_name,
            s.amount as scholarship_amount,
            u.id as student_id,
            u.first_name,
            u.last_name,
            u.email as student_email,
            u.gpa as student_gpa,
            u.level as student_level,
            u.field as student_field,
            u.institution as student_institution,
            u.country as student_country,
            u.phone as student_phone
         FROM applications a
         JOIN scholarships s ON a.scholarship_id = s.id
         JOIN users u ON a.student_id = u.id
         WHERE s.provider_id = $1
         ORDER BY a.submitted_at DESC`,
        [providerId]
    );
    return result.rows;
};

const getStudentApplications = async (studentId) => {
    const result = await pool.query(
        `SELECT 
            a.id as application_id,
            a.status,
            a.essay,
            a.submitted_at,
            s.id as scholarship_id,
            s.name as scholarship_name,
            s.provider_name,
            s.amount as scholarship_amount,
            s.deadline as scholarship_deadline
         FROM applications a
         JOIN scholarships s ON a.scholarship_id = s.id
         WHERE a.student_id = $1
         ORDER BY a.submitted_at DESC`,
        [studentId]
    );
    return result.rows;
};

const updateApplicationStatus = async (applicationId, providerId, status) => {
    const result = await pool.query(
        `UPDATE applications a
         SET status = $1
         FROM scholarships s
         WHERE a.scholarship_id = s.id 
           AND a.id = $2 
           AND s.provider_id = $3
         RETURNING a.*`,
        [status, applicationId, providerId]
    );
    return result.rows[0];
};

module.exports = {
    createApplication,
    getApplicationsForProvider,
    getStudentApplications,
    updateApplicationStatus
};
