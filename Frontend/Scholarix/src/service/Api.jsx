import axios from "axios";

const Api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:8000"
});

Api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const registerUser = (data) => {
    return Api.post("/api/auth/register", data);
};

export const loginUser = (data) => {
    return Api.post("/api/auth/login", data);
};

export const checkEmailExists = (email) => {
    return Api.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
};

export const verifyEmail = (token) => {
    return Api.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
};

export const resendVerification = () => {
    return Api.post("/api/auth/resend-verification");
};

export const getNotifications = () => {
    return Api.get("/api/notifications");
};

export const getUnreadCount = () => {
    return Api.get("/api/notifications/unread-count");
};

export const markNotificationRead = (id) => {
    return Api.patch(`/api/notifications/${id}/read`);
};

export const markAllNotificationsRead = () => {
    return Api.patch("/api/notifications/read-all");
};

export const getProfile = () => {
    return Api.get("/api/auth/profile");
};

export const updateProfile = (data) => {
    return Api.put("/api/auth/profile", data);
};

export const getMatches = () => {
    return Api.get("/api/scholarships/matches");
};

export const getStudentApplications = () => {
    return Api.get("/api/applications/student");
};

export const applyScholarship = (data) => {
    return Api.post("/api/applications", data);
};

// ─── Forgot / reset password ────────────────────────────────
export const forgotPassword = (email) => {
    return Api.post("/api/auth/forgot-password", { email });
};

export const verifyResetToken = (token) => {
    return Api.get(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
};

// data: { token, newPassword }
export const resetPassword = (data) => {
    return Api.post("/api/auth/reset-password", data);
};

export const getScholarshipById = (id) => {
    return Api.get(`/api/scholarships/${id}`);
};

export const updateScholarship = (id, data) => {
    return Api.put(`/api/scholarships/${id}`, data);
};

export const getProviderPublicProfile = (id) => {
    return Api.get(`/api/auth/provider/${id}`);
};

// ─── Saved scholarships ─────────────────────────────────────
export const saveScholarship = (scholarshipId) => {
    return Api.post(`/api/saved-scholarships/${scholarshipId}`);
};

export const unsaveScholarship = (scholarshipId) => {
    return Api.delete(`/api/saved-scholarships/${scholarshipId}`);
};

export const getSavedScholarships = () => {
    return Api.get("/api/saved-scholarships");
};

export const getSavedScholarshipIds = () => {
    return Api.get("/api/saved-scholarships/ids");
};

// ─── Documents ──────────────────────────────────────────────
export const uploadDocument = (file, docType) => {
    const form = new FormData();
    form.append("file", file);
    form.append("docType", docType);
    return Api.post("/api/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const getMyDocuments = () => {
    return Api.get("/api/documents");
};

export const deleteDocument = (id) => {
    return Api.delete(`/api/documents/${id}`);
};

// Download requires the Authorization header, so it can't be a plain <a href>
// link — fetch as a blob (the auth interceptor attaches the token) and hand
// back the blob + filename for the caller to trigger a save-as.
export const downloadDocument = async (id, fallbackFilename) => {
    const res = await Api.get(`/api/documents/${id}/download`, { responseType: "blob" });
    const disposition = res.headers["content-disposition"] || "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : fallbackFilename || "document";
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export const getStudentDocumentsForProvider = (studentId) => {
    return Api.get(`/api/documents/student/${studentId}`);
};

// ─── Admin ──────────────────────────────────────────────────
export const getAdminStats = () => {
    return Api.get("/api/admin/stats");
};

export const getAdminGrowth = () => {
    return Api.get("/api/admin/growth");
};

export const getAdminApplicationStatus = () => {
    return Api.get("/api/admin/application-status");
};

export const getAdminActivity = () => {
    return Api.get("/api/admin/activity");
};

export const getAdminUsers = (params = {}) => {
    return Api.get("/api/admin/users", { params });
};

export const getAdminUserDetail = (id) => {
    return Api.get(`/api/admin/users/${id}`);
};

export const suspendAdminUser = (id, suspended) => {
    return Api.patch(`/api/admin/users/${id}/suspend`, { suspended });
};

export const deleteAdminUser = (id) => {
    return Api.delete(`/api/admin/users/${id}`);
};

export const getAdminScholarships = (params = {}) => {
    return Api.get("/api/admin/scholarships", { params });
};

export const deleteAdminScholarship = (id) => {
    return Api.delete(`/api/admin/scholarships/${id}`);
};

export default Api;