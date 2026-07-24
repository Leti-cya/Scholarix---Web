require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../database/db");

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@scholarix.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";

async function migrate() {
    console.log("Running admin migration...");

    // 1. Widen the role check constraint to allow 'admin' (find it by
    // definition rather than assuming the auto-generated name, so this
    // works regardless of how the constraint ended up named).
    const constraintResult = await pool.query(
        `SELECT conname FROM pg_constraint
         WHERE conrelid = 'users'::regclass
           AND contype = 'c'
           AND pg_get_constraintdef(oid) ILIKE '%role%'`
    );
    for (const row of constraintResult.rows) {
        await pool.query(`ALTER TABLE users DROP CONSTRAINT "${row.conname}"`);
    }
    await pool.query(
        `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'provider', 'admin'))`
    );
    console.log("  role check constraint now allows 'admin'");

    // 2. Add the account-suspension flag used by admin user management.
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false`);
    console.log("  is_suspended column ensured");

    // 3. Seed one admin account if none exists yet (admin accounts aren't
    // self-registerable through the signup form).
    const existing = await pool.query(`SELECT id, email FROM users WHERE role = 'admin' LIMIT 1`);
    if (existing.rows.length === 0) {
        const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await pool.query(
            `INSERT INTO users (role, email, password, first_name, last_name, is_verified)
             VALUES ('admin', $1, $2, 'Platform', 'Admin', true)`,
            [ADMIN_EMAIL, hashed]
        );
        console.log(`  seed admin account created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    } else {
        console.log(`  admin account already exists (${existing.rows[0].email}), skipping seed`);
    }

    console.log("Migration complete.");
    await pool.end();
}

migrate().catch((e) => {
    console.error("MIGRATION FAILED:", e);
    process.exit(1);
});
