const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { upload } = require("../utils/upload");
const {
    uploadDocument,
    listMyDocuments,
    removeDocument,
    downloadDocument,
    listStudentDocumentsForProvider,
} = require("../controller/documentController");

const router = express.Router();

// Wraps multer's single-file middleware so upload errors (bad type, too
// large) come back as a normal JSON error response instead of Express's
// default HTML error page / an unhandled exception.
function uploadSingle(req, res, next) {
    upload.single("file")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || "Upload failed." });
        }
        next();
    });
}

router.post("/", verifyToken, uploadSingle, uploadDocument);
router.get("/", verifyToken, listMyDocuments);
router.delete("/:id", verifyToken, removeDocument);
router.get("/:id/download", verifyToken, downloadDocument);
router.get("/student/:studentId", verifyToken, listStudentDocumentsForProvider);

module.exports = router;
