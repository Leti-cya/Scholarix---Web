const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
    addScholarship,
    listScholarships,
    getScholarshipDetails,
    listProviderScholarships,
    editScholarship,
    removeScholarship,
    listMatchingScholarships
} = require("../controller/scholarshipController");

const router = express.Router();

router.post("/", verifyToken, addScholarship);
router.get("/", listScholarships);
router.get("/matches", verifyToken, listMatchingScholarships);
router.get("/provider", verifyToken, listProviderScholarships);
router.get("/:id", getScholarshipDetails);
router.put("/:id", verifyToken, editScholarship);
router.delete("/:id", verifyToken, removeScholarship);

module.exports = router;
