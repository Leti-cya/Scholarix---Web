const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
    addScholarship,
    listScholarships,
    listProviderScholarships,
    removeScholarship,
    listMatchingScholarships
} = require("../controller/scholarshipController");

const router = express.Router();

router.post("/", verifyToken, addScholarship);
router.get("/", listScholarships);
router.get("/matches", verifyToken, listMatchingScholarships);
router.get("/provider", verifyToken, listProviderScholarships);
router.delete("/:id", verifyToken, removeScholarship);

module.exports = router;
