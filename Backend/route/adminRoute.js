const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const requireAdmin = require("../middleware/requireAdmin");
const {
    getStats,
    getGrowth,
    getApplicationStatus,
    getActivity,
    listUsers,
    getUserDetail,
    suspendUser,
    deleteUser,
    listScholarships,
    deleteScholarship
} = require("../controller/adminController");

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get("/stats", getStats);
router.get("/growth", getGrowth);
router.get("/application-status", getApplicationStatus);
router.get("/activity", getActivity);

router.get("/users", listUsers);
router.get("/users/:id", getUserDetail);
router.patch("/users/:id/suspend", suspendUser);
router.delete("/users/:id", deleteUser);

router.get("/scholarships", listScholarships);
router.delete("/scholarships/:id", deleteScholarship);

module.exports = router;
