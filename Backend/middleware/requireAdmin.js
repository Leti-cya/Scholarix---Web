// Runs after verifyToken — req.user is already populated from the JWT.
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
    }
    next();
};

module.exports = requireAdmin;
