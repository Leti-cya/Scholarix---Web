const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
    submitApplication,
    listProviderApplications,
    listStudentApplications,
    changeApplicationStatus
} = require("../controller/applicationController");

const router = express.Router();

router.post("/", verifyToken, submitApplication);
router.get("/provider", verifyToken, listProviderApplications);
router.get("/student", verifyToken, listStudentApplications);
router.patch("/:id/status", verifyToken, changeApplicationStatus);

module.exports = router;
