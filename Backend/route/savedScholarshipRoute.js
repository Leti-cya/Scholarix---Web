const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { addSaved, removeSaved, listSaved, listSavedIds } = require("../controller/savedScholarshipController");

const router = express.Router();

router.get("/", verifyToken, listSaved);
router.get("/ids", verifyToken, listSavedIds);
router.post("/:scholarshipId", verifyToken, addSaved);
router.delete("/:scholarshipId", verifyToken, removeSaved);

module.exports = router;
