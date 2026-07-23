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

const updateUserProfile = async (id, role, data) => {
    let query = "";
    let params = [];
    if (role === "student") {
        query = `
            UPDATE users
            SET first_name = $1, last_name = $2, country = $3, phone = $4,
                level = $5, field = $6, institution = $7, gpa = $8
            WHERE id = $9
            RETURNING *
        `;
        params = [
            data.firstName || data.first_name,
            data.lastName || data.last_name,
            data.country,
            data.phone,
            data.level,
            data.field,
            data.institution,
            data.gpa,
            id
        ];
    } else {
        query = `
            UPDATE users
            SET org_name = $1, org_type = $2, website = $3,
                contact_name = $4, contact_title = $5, reg_number = $6, description = $7
            WHERE id = $8
            RETURNING *
        `;
        params = [
            data.orgName || data.org_name,
            data.orgType || data.org_type,
            data.website,
            data.contactName || data.contact_name,
            data.contactTitle || data.contact_title,
            data.regNumber || data.reg_number,
            data.description,
            id
        ];
    }
    const result = await pool.query(query, params);
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
    updateUserPassword,
    updateUserProfile
}