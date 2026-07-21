const {
    createApplication,
    getApplicationsForProvider,
    getStudentApplications,
    updateApplicationStatus
} = require("../model/applicationModel");

const submitApplication = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can apply for scholarships."
            });
        }

        const { scholarshipId, essay } = req.body;

        if (!scholarshipId) {
            return res.status(400).json({
                message: "Scholarship ID is required."
            });
        }

        const application = await createApplication(req.user.id, scholarshipId, essay);
        res.status(201).json({
            message: "Application submitted successfully",
            application
        });
    } catch (e) {
        console.error("SUBMIT APPLICATION ERROR:", e);
        if (e.code === '23505') { // Postgres unique constraint error code
            return res.status(400).json({
                message: "You have already applied for this scholarship."
            });
        }
        res.status(500).json({
            message: e.message
        });
    }
};

const listProviderApplications = async (req, res) => {
    try {
        if (req.user.role !== "provider") {
            return res.status(403).json({
                message: "Access denied. Provider role required."
            });
        }

        const applications = await getApplicationsForProvider(req.user.id);
        res.status(200).json(applications);
    } catch (e) {
        console.error("LIST PROVIDER APPLICATIONS ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
};

const listStudentApplications = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Access denied. Student role required."
            });
        }

        const applications = await getStudentApplications(req.user.id);
        res.status(200).json(applications);
    } catch (e) {
        console.error("LIST STUDENT APPLICATIONS ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
};

const changeApplicationStatus = async (req, res) => {
    try {
        if (req.user.role !== "provider") {
            return res.status(403).json({
                message: "Access denied. Provider role required."
            });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['submitted', 'under_review', 'shortlisted', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: "A valid status is required."
            });
        }

        const updated = await updateApplicationStatus(id, req.user.id, status);
        if (!updated) {
            return res.status(404).json({
                message: "Application not found or unauthorized to update."
            });
        }

        res.status(200).json({
            message: "Application status updated successfully",
            application: updated
        });
    } catch (e) {
        console.error("UPDATE APPLICATION STATUS ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
};

module.exports = {
    submitApplication,
    listProviderApplications,
    listStudentApplications,
    changeApplicationStatus
};
