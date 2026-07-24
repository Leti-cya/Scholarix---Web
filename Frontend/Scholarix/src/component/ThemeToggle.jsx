import React from "react";
import { useTheme } from "../theme/ThemeContext";

export default function ThemeToggle({ style }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 42,
        height: 42,
        flexShrink: 0,
        borderRadius: 10,
        border: "1px solid var(--surf-border)",
        background: "var(--surf-card)",
        color: "var(--surf-text)",
        fontSize: "1.05rem",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        transition: "background 160ms ease, transform 160ms ease, box-shadow 160ms ease",
        ...style,
      }}
      onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
    </button>
  );
}
