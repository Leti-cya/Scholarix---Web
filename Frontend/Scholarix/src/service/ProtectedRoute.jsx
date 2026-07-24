import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function roleHome(role) {
    if (role === "provider") return "/provider/dashboard";
    if (role === "admin") return "/admin/dashboard";
    return "/dashboard";
}

export default function ProtectedRoute({ allowedRoles, loginPath = "/login" }) {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");

    if (!token || !userJson) {
        return <Navigate to={loginPath} replace />;
    }

    try {
        const user = JSON.parse(userJson);
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // If role is not allowed, redirect to their proper dashboard
            return <Navigate to={roleHome(user.role)} replace />;
        }
    } catch (e) {
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
