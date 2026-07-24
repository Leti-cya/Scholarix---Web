import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

/**
 * Shared shell for logged-in routes — renders the off-canvas nav drawer
 * (hamburger-triggered) beside the routed page. Reused by both the
 * student and provider route groups with a different `navItems` list.
 */
export default function Layout({ navItems, homeHref }) {
  return (
    <div className="app-shell">
      <Sidebar navItems={navItems} homeHref={homeHref} />
      <Outlet />
    </div>
  );
}
