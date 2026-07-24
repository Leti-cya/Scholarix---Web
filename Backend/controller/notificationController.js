const {
    getUserNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead
} = require("../model/notificationModel");

const listNotifications = async (req, res) => {
    try {
        const notifications = await getUserNotifications(req.user.id);
        const unread = await getUnreadCount(req.user.id);
        res.status(200).json({ notifications, unread });
    } catch (e) {
        console.error("LIST NOTIFICATIONS ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const unreadCount = async (req, res) => {
    try {
        const count = await getUnreadCount(req.user.id);
        res.status(200).json({ unread: count });
    } catch (e) {
        console.error("UNREAD COUNT ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const readNotification = async (req, res) => {
    try {
        const updated = await markNotificationRead(req.params.id, req.user.id);
        if (!updated) {
            return res.status(404).json({ message: "Notification not found." });
        }
        res.status(200).json({ message: "Notification marked as read.", notification: updated });
    } catch (e) {
        console.error("READ NOTIFICATION ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const readAllNotifications = async (req, res) => {
    try {
        const count = await markAllNotificationsRead(req.user.id);
        res.status(200).json({ message: "All notifications marked as read.", updated: count });
    } catch (e) {
        console.error("READ ALL NOTIFICATIONS ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

module.exports = {
    listNotifications,
    unreadCount,
    readNotification,
    readAllNotifications
};
