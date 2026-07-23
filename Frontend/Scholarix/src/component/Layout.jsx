import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import "./Layout.css";

const STUDENT_NAV = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/scholarships", label: "Scholarships", icon: "🎓" },
  { path: "/applications", label: "Applications", icon: "📝" },
  { path: "/profile", label: "Profile", icon: "👤" }
];

const PROVIDER_NAV = [
  { path: "/provider/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/provider/scholarships", label: "My Scholarships", icon: "🎓" },
  { path: "/provider/applications", label: "Applications", icon: "📥" },
  { path: "/provider/profile", label: "Profile", icon: "🏢" }
];

export default function Layout({ role, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const uStr = localStorage.getItem("user");
      if (uStr) {
        setUser(JSON.parse(uStr));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const currentRole = role || user?.role || "student";
  const navItems = currentRole === "provider" ? PROVIDER_NAV : STUDENT_NAV;

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getDashboardPath = () => {
    return currentRole === "provider" ? "/provider/dashboard" : "/dashboard";
  };

  return (
    <div className="sx-layout-wrapper">
      {/* Single Consistent Top Bar */}
      <header className="sx-top-bar">
        <div className="sx-top-bar-left">
          <button
            className="sx-hamburger-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation drawer"
            title="Open Menu"
          >
            ☰
          </button>
          <Link to={getDashboardPath()} className="sx-brand-link">
            <span className="sx-brand-badge">🎓</span>
            <span className="sx-brand-name">Scholarix</span>
          </Link>
        </div>

        <div className="sx-top-bar-right">
          <button
            className="sx-theme-toggle-top"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </header>

      {/* Mobile & Desktop Drawer Overlay with Backdrop Blur */}
      <div
        className={`sx-drawer-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Collapsible Smooth Sliding Sidebar */}
      <aside className={`sx-collapsible-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sx-sidebar-inner">
          <div className="sx-sidebar-header">
            <Link to={getDashboardPath()} className="sx-brand-link" onClick={() => setSidebarOpen(false)}>
              <span className="sx-brand-badge">🎓</span>
              <span className="sx-brand-name">Scholarix</span>
            </Link>
            <button
              className="sx-close-sidebar-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* User Info Snippet */}
          {user && (
            <div className="sx-sidebar-user">
              <div className="sx-sidebar-user-avatar">
                {(user.firstName || user.first_name || user.orgName || user.org_name || user.email || "U")[0].toUpperCase()}
              </div>
              <div className="sx-sidebar-user-info">
                <span className="sx-sidebar-user-name">
                  {user.firstName || user.first_name ? `${user.firstName || user.first_name} ${user.lastName || user.last_name || ""}` : user.orgName || user.org_name || user.email}
                </span>
                <span className="sx-sidebar-user-role">{currentRole.toUpperCase()}</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="sx-sidebar-nav">
            <ul className="sx-nav-list">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`sx-nav-item ${isActive ? "active" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sx-nav-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="sx-sidebar-footer">
          <button className="sx-signout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="sx-main-content">
        {children}
      </main>
    </div>
  );
}
