const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
    listNotifications,
    unreadCount,
    readNotification,
    readAllNotifications
} = require("../controller/notificationController");

const router = express.Router();

router.get("/", verifyToken, listNotifications);
router.get("/unread-count", verifyToken, unreadCount);
router.patch("/read-all", verifyToken, readAllNotifications);
router.patch("/:id/read", verifyToken, readNotification);

module.exports = router;
