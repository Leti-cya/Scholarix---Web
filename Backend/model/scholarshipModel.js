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
        "SELECT * FROM scholarships WHERE id = $1",
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

module.exports = {
    createScholarship,
    getAllScholarships,
    getScholarshipsByProvider,
    getScholarshipById,
    deleteScholarship,
    getMatchingScholarships
};
