const {
    createApplication,
    getApplicationsForProvider,
    getStudentApplications,
    updateApplicationStatus
} = require("../model/applicationModel");

const { getScholarshipById, isEligibleForScholarship } = require("../model/scholarshipModel");
const { findUserByEmail } = require("../model/userModel");
const { createNotification } = require("../model/notificationModel");

const STATUS_COPY = {
    submitted:    { type: "info",    label: "received" },
    under_review: { type: "info",    label: "under review" },
    shortlisted:  { type: "warning", label: "shortlisted" },
    approved:     { type: "success", label: "approved 🎉" },
    rejected:     { type: "error",   label: "not successful this time" }
};

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

        const scholarship = await getScholarshipById(scholarshipId);
        if (!scholarship) {
            return res.status(404).json({
                message: "Scholarship not found."
            });
        }

        const student = await findUserByEmail(req.user.email);
        const { eligible, reasons } = isEligibleForScholarship(scholarship, student);

        if (!eligible) {
            return res.status(403).json({
                message: `You don't meet the eligibility criteria for this scholarship: ${reasons.join("; ")}.`,
                reasons
            });
        }

        const application = await createApplication(req.user.id, scholarshipId, essay);

        try {
            if (scholarship.provider_id) {
                await createNotification({
                    userId: scholarship.provider_id,
                    type: "info",
                    title: "New application received 📥",
                    body: `A student applied for "${scholarship.name}".`,
                    link: "/provider/dashboard"
                });
            }
        } catch (notifErr) {
            console.error("APPLY NOTIFICATION ERROR:", notifErr.message);
        }

        res.status(201).json({
            message: "Application submitted successfully",
            application
        });
    } catch (e) {
        console.error("SUBMIT APPLICATION ERROR:", e);
        if (e.code === '23505') { 
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

        try {
            const scholarship = await getScholarshipById(updated.scholarship_id);
            const copy = STATUS_COPY[status] || { type: "info", label: status };
            await createNotification({
                userId: updated.student_id,
                type: copy.type,
                title: "Application update",
                body: `Your application for "${scholarship ? scholarship.name : "a scholarship"}" is now ${copy.label}.`,
                link: "/dashboard"
            });
        } catch (notifErr) {
            console.error("STATUS NOTIFICATION ERROR:", notifErr.message);
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
