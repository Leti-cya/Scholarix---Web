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

export default Api;