const pool = require("../database/db")

const createScholarship = async (data, providerId) => {
    const result = await pool.query(
        `INSERT INTO scholarships (
            provider_id,
            name,
            provider_name,
            description,
            amount,
            deadline,
            level,
            field,
            country,
            requirements
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
            providerId,
            data.name,
            data.providerName,
            data.description,
            data.amount,
            data.deadline,
            data.level,
            data.field,
            data.country,
            data.requirements
        ]
    );
    return result.rows[0];
};

const getAllScholarships = async (filters = {}) => {
    let query = "SELECT * FROM scholarships WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (filters.level && filters.level !== "All Levels" && filters.level !== "Select level") {
        query += ` AND level = $${paramIndex}`;
        params.push(filters.level);
        paramIndex++;
    }

    if (filters.field && filters.field !== "All Fields" && filters.field !== "Select field") {
        query += ` AND field = $${paramIndex}`;
        params.push(filters.field);
        paramIndex++;
    }

    if (filters.country && filters.country !== "Select country" && filters.country !== "Global") {
        query += ` AND (country = $${paramIndex} OR country = 'Global' OR country = 'Other')`;
        params.push(filters.country);
        paramIndex++;
    }

    if (filters.search) {
        query += ` AND (name ILIKE $${paramIndex} OR provider_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        params.push(`%${filters.search}%`);
        paramIndex++;
    }

    query += " ORDER BY deadline ASC";

    const result = await pool.query(query, params);
    return result.rows;
};

const getScholarshipsByProvider = async (providerId) => {
    const result = await pool.query(
        "SELECT * FROM scholarships WHERE provider_id = $1 ORDER BY created_at DESC",
        [providerId]
    );
    return result.rows;
};

const getScholarshipById = async (id) => {
    const result = await pool.query(
        `SELECT s.*,
                u.org_name, u.org_type, u.website, u.contact_name, u.contact_title, u.email as provider_email
         FROM scholarships s
         LEFT JOIN users u ON s.provider_id = u.id
         WHERE s.id = $1`,
        [id]
    );
    return result.rows[0];
};

const deleteScholarship = async (id, providerId) => {
    const result = await pool.query(
        "DELETE FROM scholarships WHERE id = $1 AND provider_id = $2 RETURNING *",
        [id, providerId]
    );
    return result.rows[0];
};

const getMatchingScholarships = async (level, field, country) => {
    const result = await pool.query(
        `SELECT * FROM scholarships 
         WHERE (level = $1 OR level = 'All Levels')
           AND (field = $2 OR field = 'All Fields')
           AND (country = $3 OR country = 'Global' OR country = 'Other')
         ORDER BY deadline ASC`,
        [level, field, country]
    );
    return result.rows;
};

/**
 * Pure eligibility check — mirrors the wildcard rules used by
 * getMatchingScholarships (level "All Levels", field "All Fields",
 * country "Global"/"Other" all match anyone). Used to gate applications
 * so a student can't apply to a scholarship they don't qualify for.
 */
const isEligibleForScholarship = (scholarship, student) => {
    const reasons = [];

    if (scholarship.level !== "All Levels" && scholarship.level !== student.level) {
        reasons.push(`requires level "${scholarship.level}" — your profile is set to "${student.level || "not set"}"`);
    }

    if (scholarship.field !== "All Fields" && scholarship.field !== student.field) {
        reasons.push(`requires field "${scholarship.field}" — your profile is set to "${student.field || "not set"}"`);
    }

    if (
        scholarship.country !== "Global" &&
        scholarship.country !== "Other" &&
        scholarship.country !== student.country
    ) {
        reasons.push(`is limited to "${scholarship.country}" — your profile is set to "${student.country || "not set"}"`);
    }

    return { eligible: reasons.length === 0, reasons };
};

const updateScholarship = async (id, providerId, data) => {
    const result = await pool.query(
        `UPDATE scholarships
         SET name = $1, provider_name = $2, description = $3, amount = $4,
             deadline = $5, level = $6, field = $7, country = $8, requirements = $9
         WHERE id = $10 AND provider_id = $11
         RETURNING *`,
        [
            data.name,
            data.providerName,
            data.description,
            data.amount,
            data.deadline,
            data.level,
            data.field,
            data.country,
            data.requirements,
            id,
            providerId
        ]
    );
    return result.rows[0];
};

module.exports = {
    createScholarship,
    getAllScholarships,
    getScholarshipsByProvider,
    getScholarshipById,
    updateScholarship,
    deleteScholarship,
    getMatchingScholarships,
    isEligibleForScholarship
};
