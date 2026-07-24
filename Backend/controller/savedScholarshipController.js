const {
    saveScholarship,
    unsaveScholarship,
    getSavedScholarships,
    getSavedScholarshipIds,
} = require("../model/savedScholarshipModel");

const addSaved = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can save scholarships." });
        }
        const saved = await saveScholarship(req.user.id, req.params.scholarshipId);
        res.status(201).json({ message: "Scholarship saved", saved });
    } catch (e) {
        console.error("SAVE SCHOLARSHIP ERROR:", e);
        if (e.code === "23503") { // FK violation — scholarship doesn't exist
            return res.status(404).json({ message: "Scholarship not found." });
        }
        res.status(500).json({ message: e.message });
    }
};

const removeSaved = async (req, res) => {
    try {
        const removed = await unsaveScholarship(req.user.id, req.params.scholarshipId);
        if (!removed) {
            return res.status(404).json({ message: "This scholarship wasn't saved." });
        }
        res.status(200).json({ message: "Scholarship removed from saved list" });
    } catch (e) {
        console.error("UNSAVE SCHOLARSHIP ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const listSaved = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Access denied. Student role required." });
        }
        const saved = await getSavedScholarships(req.user.id);
        res.status(200).json(saved);
    } catch (e) {
        console.error("LIST SAVED SCHOLARSHIPS ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

const listSavedIds = async (req, res) => {
    try {
        const ids = await getSavedScholarshipIds(req.user.id);
        res.status(200).json({ ids });
    } catch (e) {
        console.error("LIST SAVED IDS ERROR:", e);
        res.status(500).json({ message: e.message });
    }
};

module.exports = { addSaved, removeSaved, listSaved, listSavedIds };
