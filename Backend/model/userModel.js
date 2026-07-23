const pool = require("../database/db")

const findUserByEmail = async (email) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    )

    return result.rows[0]
}

const createUser = async (data) => {
    const result = await pool.query(
        `INSERT INTO users (
            role,
            email,
            password,

            first_name,
            last_name,
            country,
            phone,

            level,
            field,
            institution,
            gpa,

            org_name,
            org_type,
            website,

            contact_name,
            contact_title,
            reg_number,
            description
        )
        VALUES (
            $1,$2,$3,
            $4,$5,$6,$7,
            $8,$9,$10,$11,
            $12,$13,$14,
            $15,$16,$17,$18
        )
        RETURNING *`,
        [
            data.role,
            data.email,
            data.password,

            data.firstName,
            data.lastName,
            data.country,
            data.phone,

            data.level,
            data.field,
            data.institution,
            data.gpa,

            data.orgName,
            data.orgType,
            data.website,

            data.contactName,
            data.contactTitle,
            data.regNumber,
            data.description
        ]
    )

    return result.rows[0]
}

const updateUserPassword = async (email, hashedPassword) => {
    const result = await pool.query(
        "UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, role",
        [hashedPassword, email]
    );
    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await pool.query(
        "SELECT id, role, email, org_name, org_type, website, contact_name, contact_title, description, created_at FROM users WHERE id = $1",
        [id]
    );
    return result.rows[0];
};

module.exports = {
    findUserByEmail,
    findUserById,
    createUser,
    updateUserPassword
}