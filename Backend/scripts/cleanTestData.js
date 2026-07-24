// One-off dev cleanup: removes every account created while building and
// testing this app (all non-admin users), which cascades — via existing
// FK ON DELETE CASCADE — to their scholarships, applications, documents,
// notifications, and saved scholarships. Also clears any orphaned files
// left in uploads/documents. The seeded admin account is untouched.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../database/db");

async function clean() {
    console.log("Cleaning test/seed data...");

    const usersResult = await pool.query(`DELETE FROM users WHERE role != 'admin' RETURNING id, role, email`);
    console.log(`  removed ${usersResult.rowCount} non-admin users (and everything cascading from them)`);

    const uploadDir = path.join(__dirname, "../uploads/documents");
    if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        for (const f of files) {
            fs.unlinkSync(path.join(uploadDir, f));
        }
        console.log(`  removed ${files.length} orphaned uploaded file(s)`);
    }

    const remainingUsers = await pool.query(`SELECT id, role, email FROM users`);
    const remainingScholarships = await pool.query(`SELECT COUNT(*)::int AS count FROM scholarships`);
    const remainingApplications = await pool.query(`SELECT COUNT(*)::int AS count FROM applications`);

    console.log("Remaining state:");
    console.log(`  users: ${JSON.stringify(remainingUsers.rows)}`);
    console.log(`  scholarships: ${remainingScholarships.rows[0].count}`);
    console.log(`  applications: ${remainingApplications.rows[0].count}`);

    console.log("Cleanup complete.");
    await pool.end();
}

clean().catch((e) => {
    console.error("CLEANUP FAILED:", e);
    process.exit(1);
});
