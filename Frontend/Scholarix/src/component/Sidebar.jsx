import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "./Sidebar.css";

/**
 * Off-canvas nav drawer, shared by the student and provider shells.
 * Closed by default; the hamburger button slides it into view over a
 * backdrop. Self-contained (owns its own open/closed state) so Layout
 * only has to render it — no state to lift.
 */
export default function Sidebar({ navItems, homeHref = "/" }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close whenever the route changes (a nav link was followed).
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      <button
        type="button"
        className={`sbx-hamburger ${open ? "sbx-hamburger--open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
      >
        <span className="sbx-hamburger__bar" />
        <span className="sbx-hamburger__bar" />
        <span className="sbx-hamburger__bar" />
      </button>

      {open && <div className="sbx-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}

      <nav className={`sbx-root ${open ? "sbx-root--open" : ""}`} aria-label="Main navigation">
        <a href={homeHref} className="sbx-logo" aria-label="Scholarix home">
          <span className="sbx-logo__mark" aria-hidden="true">SX</span>
          <span className="sbx-logo__text">Scholarix</span>
        </a>

        <ul className="sbx-links" role="list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sbx-link ${isActive ? "sbx-link--active" : ""}`}
              >
                <span className="sbx-link__icon" aria-hidden="true">{item.icon}</span>
                <span className="sbx-link__label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <button type="button" className="sbx-signout" onClick={handleLogout}>
          <span className="sbx-link__icon" aria-hidden="true">🚪</span>
          <span className="sbx-link__label">Sign Out</span>
        </button>
      </nav>
    </>
  );
}
