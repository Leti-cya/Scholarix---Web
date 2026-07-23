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

export const resetPassword = (data) => {
    return Api.post("/api/auth/reset-password", data);
};

export const getScholarshipById = (id) => {
    return Api.get(`/api/scholarships/${id}`);
};

export const updateScholarship = (id, data) => {
    return Api.put(`/api/scholarships/${id}`, data);
};

export default Api;