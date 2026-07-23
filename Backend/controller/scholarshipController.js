const {
    createScholarship,
    getAllScholarships,
    getScholarshipsByProvider,
    getScholarshipById,
    updateScholarship,
    deleteScholarship,
    getMatchingScholarships
} = require("../model/scholarshipModel");
const { findUserByEmail } = require("../model/userModel");

const addScholarship = async (req, res) => {
    try {
        if (req.user.role !== "provider") {
            return res.status(403).json({
                message: "Only scholarship providers can create scholarships."
            });
        }

        const data = req.body;

        if (!data.name || !data.providerName || !data.description || !data.amount || !data.deadline || !data.level || !data.field || !data.country) {
            return res.status(400).json({
                message: "All fields are required to create a scholarship."
            });
        }

        const scholarship = await createScholarship(data, req.user.id);
        res.status(201).json({
            message: "Scholarship created successfully",
            scholarship
        });
    } catch (e) {
        console.error("ADD SCHOLARSHIP ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
};

const listScholarships = async (req, res) => {
    try {
        const { level, field, country, search } = req.query;
        const scholarships = await getAllScholarships({ level, field, country, search });
        res.status(200).json(scholarships);
    } catch (e) {
        console.error("LIST SCHOLARSHIPS ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
};

const getScholarshipDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const scholarship = await getScholarshipById(id);
        if (!scholarship) {
            return res.status(404).json({
                message: "Scholarship not found."
            });
        }
        res.status(200).json(scholarship);
    } catch (e) {
        console.error("GET SCHOLARSHIP DETAILS ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
};

const listProviderScholarships = async (req, res) => {
    try {
        if (req.user.role !== "provider") {
            return res.status(403).json({
                message: "Access denied. Provider role required."
            });
        }
        const scholarships = await getScholarshipsByProvider(req.user.id);
        res.status(200).json(scholarships);
    } catch (e) {
        console.error("LIST PROVIDER SCHOLARSHIPS ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
};

const removeScholarship = async (req, res) => {
    try {
        if (req.user.role !== "provider") {
            return res.status(403).json({
                message: "Access denied. Provider role required."
            });
        }
        const { id } = req.params;
        const deleted = await deleteScholarship(id, req.user.id);
        if (!deleted) {
            return res.status(404).json({
                message: "Scholarship not found or unauthorized to delete."
            });
        }
        res.status(200).json({
            message: "Scholarship deleted successfully",
            deleted
        });
    } catch (e) {
        console.error("DELETE SCHOLARSHIP ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
};

const listMatchingScholarships = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Access denied. Student role required."
            });
        }
        
        const user = await findUserByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        
        const matches = await getMatchingScholarships(user.level, user.field, user.country);
        res.status(200).json(matches);
    } catch (e) {
        console.error("LIST MATCHING SCHOLARSHIPS ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
};

const editScholarship = async (req, res) => {
    try {
        if (req.user.role !== "provider") {
            return res.status(403).json({
                message: "Access denied. Provider role required."
            });
        }
        const { id } = req.params;
        const data = req.body;
        const updated = await updateScholarship(id, req.user.id, data);
        if (!updated) {
            return res.status(404).json({
                message: "Scholarship not found or unauthorized to edit."
            });
        }
        res.status(200).json({
            message: "Scholarship updated successfully",
            scholarship: updated
        });
    } catch (e) {
        console.error("EDIT SCHOLARSHIP ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
};

module.exports = {
    addScholarship,
    listScholarships,
    getScholarshipDetails,
    listProviderScholarships,
    editScholarship,
    removeScholarship,
    listMatchingScholarships
};
