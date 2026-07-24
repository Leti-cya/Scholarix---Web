const pool = require("../database/db");

/**
 * Create a single in-app notification for a user.
 * Safe to call from anywhere — failures are surfaced to the caller,
 * but callers generally wrap this in try/catch so a notification
 * failure never blocks the primary action (applying, status change, etc.).
 */
const createNotification = async ({ userId, type = "info", title, body = null, link = null }) => {
    const result = await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, link)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, type, title, body, link]
    );
    return result.rows[0];
};

const getUserNotifications = async (userId, limit = 30) => {
    const result = await pool.query(
        `SELECT * FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
    );
    return result.rows;
};

const getUnreadCount = async (userId) => {
    const result = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM notifications
         WHERE user_id = $1 AND is_read = false`,
        [userId]
    );
    return result.rows[0].count;
};

const markNotificationRead = async (id, userId) => {
    const result = await pool.query(
        `UPDATE notifications
         SET is_read = true
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, userId]
    );
    return result.rows[0];
};

const markAllNotificationsRead = async (userId) => {
    const result = await pool.query(
        `UPDATE notifications
         SET is_read = true
         WHERE user_id = $1 AND is_read = false`,
        [userId]
    );
    return result.rowCount;
};

module.exports = {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead
};
