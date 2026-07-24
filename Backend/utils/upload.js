const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "documents");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        // Random filename — never trust/reuse the client-supplied name on disk,
        // avoids path traversal and collisions. Original name is kept separately in the DB.
        const randomName = crypto.randomBytes(24).toString("hex");
        const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
        cb(null, `${randomName}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            return cb(new Error("Unsupported file type. Allowed: PDF, JPG, PNG, WEBP, DOC, DOCX."));
        }
        cb(null, true);
    },
});

module.exports = { upload, UPLOAD_DIR };
