const pool = require("../database/db");

const getPlatformStats = async () => {
    const usersResult = await pool.query(
        `SELECT
            COUNT(*) FILTER (WHERE role = 'student')::int  AS total_students,
            COUNT(*) FILTER (WHERE role = 'provider')::int AS total_providers,
            COUNT(*) FILTER (WHERE role = 'provider' AND is_verified = false)::int AS unverified_providers,
            COUNT(*) FILTER (WHERE is_suspended = true)::int AS suspended_users
         FROM users`
    );
    const scholarshipsResult = await pool.query(`SELECT COUNT(*)::int AS total_scholarships FROM scholarships`);
    const applicationsResult = await pool.query(`SELECT COUNT(*)::int AS total_applications FROM applications`);
    const documentsResult = await pool.query(`SELECT COUNT(*)::int AS total_documents FROM documents`);

    return {
        ...usersResult.rows[0],
        ...scholarshipsResult.rows[0],
        ...applicationsResult.rows[0],
        ...documentsResult.rows[0]
    };
};

// Total signups per month, last 6 months (this month inclusive).
const getUserGrowth = async () => {
    const result = await pool.query(
        `SELECT
            TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') AS month,
            COUNT(*)::int AS count
         FROM users
         WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '5 months'
         GROUP BY month
         ORDER BY month ASC`
    );
    return result.rows;
};

const getApplicationStatusBreakdown = async () => {
    const result = await pool.query(
        `SELECT status, COUNT(*)::int AS count FROM applications GROUP BY status`
    );
    return result.rows;
};

const getRecentActivity = async () => {
    const recentUsers = await pool.query(
        `SELECT id, role, email, first_name, last_name, org_name, created_at
         FROM users ORDER BY created_at DESC LIMIT 8`
    );
    const recentScholarships = await pool.query(
        `SELECT id, name, provider_name, amount, created_at
         FROM scholarships ORDER BY created_at DESC LIMIT 8`
    );
    return { recentUsers: recentUsers.rows, recentScholarships: recentScholarships.rows };
};

const getAllUsersAdmin = async ({ search, role } = {}) => {
    let query = `
        SELECT id, role, email, first_name, last_name, country, phone,
               level, field, institution,
               org_name, org_type, website, contact_name, contact_title,
               is_verified, is_suspended, created_at
        FROM users
        WHERE 1=1`;
    const params = [];
    let i = 1;

    if (role && role !== "all") {
        query += ` AND role = $${i}`;
        params.push(role);
        i++;
    }

    if (search) {
        query += ` AND (email ILIKE $${i} OR first_name ILIKE $${i} OR last_name ILIKE $${i} OR org_name ILIKE $${i})`;
        params.push(`%${search}%`);
        i++;
    }

    query += " ORDER BY created_at DESC LIMIT 300";

    const result = await pool.query(query, params);
    return result.rows;
};

const getUserDetailAdmin = async (id) => {
    const userResult = await pool.query(
        `SELECT id, role, email, first_name, last_name, country, phone, level, field, institution, gpa,
                org_name, org_type, website, contact_name, contact_title, reg_number, description,
                is_verified, is_suspended, created_at
         FROM users WHERE id = $1`,
        [id]
    );
    const user = userResult.rows[0];
    if (!user) return null;

    if (user.role === "student") {
        const appsResult = await pool.query(`SELECT COUNT(*)::int AS count FROM applications WHERE student_id = $1`, [id]);
        user.application_count = appsResult.rows[0].count;
    } else if (user.role === "provider") {
        const scholResult = await pool.query(`SELECT COUNT(*)::int AS count FROM scholarships WHERE provider_id = $1`, [id]);
        user.scholarship_count = scholResult.rows[0].count;
    }

    return user;
};

const getRoleById = async (id) => {
    const result = await pool.query(`SELECT id, role FROM users WHERE id = $1`, [id]);
    return result.rows[0];
};

const setUserSuspended = async (id, suspended) => {
    const result = await pool.query(
        `UPDATE users SET is_suspended = $1 WHERE id = $2 RETURNING id, email, role, is_suspended`,
        [suspended, id]
    );
    return result.rows[0];
};

const deleteUserAdmin = async (id) => {
    const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING id, email, role`, [id]);
    return result.rows[0];
};

const getAllScholarshipsAdmin = async ({ search } = {}) => {
    let query = `
        SELECT s.*, u.email AS provider_email, u.is_verified AS provider_verified
        FROM scholarships s
        LEFT JOIN users u ON s.provider_id = u.id
        WHERE 1=1`;
    const params = [];
    let i = 1;

    if (search) {
        query += ` AND (s.name ILIKE $${i} OR s.provider_name ILIKE $${i})`;
        params.push(`%${search}%`);
        i++;
    }

    query += " ORDER BY s.created_at DESC LIMIT 300";

    const result = await pool.query(query, params);
    return result.rows;
};

const deleteScholarshipAdmin = async (id) => {
    const result = await pool.query(`DELETE FROM scholarships WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
};

module.exports = {
    getPlatformStats,
    getUserGrowth,
    getApplicationStatusBreakdown,
    getRecentActivity,
    getAllUsersAdmin,
    getUserDetailAdmin,
    getRoleById,
    setUserSuspended,
    deleteUserAdmin,
    getAllScholarshipsAdmin,
    deleteScholarshipAdmin
};
