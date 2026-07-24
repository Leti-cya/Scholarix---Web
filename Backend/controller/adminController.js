const {
    getPlatformStats,
    getUserGrowth,
    getApplicationStatusBreakdown,
    getRecentActivity,
    getAllUsersAdmin,
    getUserDetailAdmin,
    getRoleById,
    setUserSuspended,
    deleteUserAdmin,
    getAllScholarshipsAdmin,
    deleteScholarshipAdmin
} = require("../model/adminModel");

const getStats = async (req, res) => {
    try {
        const stats = await getPlatformStats();
        res.status(200).json(stats);
    } catch (e) {
        console.error("ADMIN STATS ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const getGrowth = async (req, res) => {
    try {
        const growth = await getUserGrowth();
        res.status(200).json(growth);
    } catch (e) {
        console.error("ADMIN GROWTH ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const getApplicationStatus = async (req, res) => {
    try {
        const breakdown = await getApplicationStatusBreakdown();
        res.status(200).json(breakdown);
    } catch (e) {
        console.error("ADMIN APPLICATION STATUS ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const getActivity = async (req, res) => {
    try {
        const activity = await getRecentActivity();
        res.status(200).json(activity);
    } catch (e) {
        console.error("ADMIN ACTIVITY ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const listUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        const users = await getAllUsersAdmin({ search, role });
        res.status(200).json(users);
    } catch (e) {
        console.error("ADMIN LIST USERS ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const getUserDetail = async (req, res) => {
    try {
        const user = await getUserDetailAdmin(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(user);
    } catch (e) {
        console.error("ADMIN GET USER ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { suspended } = req.body;

        if (Number(id) === req.user.id) {
            return res.status(400).json({ message: "You cannot suspend your own account." });
        }

        const target = await getRoleById(id);
        if (!target) {
            return res.status(404).json({ message: "User not found." });
        }
        if (target.role === "admin") {
            return res.status(400).json({ message: "Admin accounts cannot be suspended." });
        }

        const updated = await setUserSuspended(id, !!suspended);
        res.status(200).json({
            message: suspended ? "User suspended." : "User reactivated.",
            user: updated
        });
    } catch (e) {
        console.error("ADMIN SUSPEND USER ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (Number(id) === req.user.id) {
            return res.status(400).json({ message: "You cannot delete your own account." });
        }

        const target = await getRoleById(id);
        if (!target) {
            return res.status(404).json({ message: "User not found." });
        }
        if (target.role === "admin") {
            return res.status(400).json({ message: "Admin accounts cannot be deleted here." });
        }

        await deleteUserAdmin(id);
        res.status(200).json({ message: "User deleted successfully." });
    } catch (e) {
        console.error("ADMIN DELETE USER ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const listScholarships = async (req, res) => {
    try {
        const { search } = req.query;
        const scholarships = await getAllScholarshipsAdmin({ search });
        res.status(200).json(scholarships);
    } catch (e) {
        console.error("ADMIN LIST SCHOLARSHIPS ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const deleteScholarship = async (req, res) => {
    try {
        const deleted = await deleteScholarshipAdmin(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Scholarship not found." });
        }
        res.status(200).json({ message: "Scholarship removed successfully." });
    } catch (e) {
        console.error("ADMIN DELETE SCHOLARSHIP ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

module.exports = {
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
};
