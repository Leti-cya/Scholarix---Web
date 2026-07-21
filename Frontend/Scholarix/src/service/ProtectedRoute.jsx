import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");

    if (!token || !userJson) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userJson);
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // If role is not allowed, redirect to their proper dashboard
            return <Navigate to={user.role === "provider" ? "/provider/dashboard" : "/dashboard"} replace />;
        }
    } catch (e) {
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
