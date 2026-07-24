/**
 * NotificationBell.jsx
 * --------------------
 * A self-contained bell icon + dropdown that shows the logged-in user's
 * in-app notifications. Used in both the student and provider dashboards.
 *
 * - Polls the unread count every 30s.
 * - Opens a dropdown listing recent notifications.
 * - Clicking an unread item marks it read (and navigates if it has a link).
 * - "Mark all read" clears the unread badge.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../service/Api";
import "./NotificationBell.css";

const TYPE_ICON = {
  success: "🎉",
  warning: "📋",
  error: "❌",
  info: "🔔",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const wrapRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await getNotifications();
      setItems(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch {
      /* silent — bell should never break the page */
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(t);
  }, [load]);

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleItemClick(n) {
    if (!n.is_read) {
      try {
        await markNotificationRead(n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
        setUnread((u) => Math.max(0, u - 1));
      } catch {
        /* ignore */
      }
    }
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="nb-wrap" ref={wrapRef}>
      <button
        type="button"
        className="nb-bell"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true">🔔</span>
        {unread > 0 && <span className="nb-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="nb-panel" role="menu">
          <div className="nb-panel-head">
            <span className="nb-panel-title">Notifications</span>
            {unread > 0 && (
              <button type="button" className="nb-mark-all" onClick={handleMarkAll}>
                Mark all read
              </button>
            )}
          </div>

          <div className="nb-list">
            {items.length === 0 ? (
              <p className="nb-empty">You're all caught up 🎯</p>
            ) : (
              items.map((n) => (
                <button
                  type="button"
                  key={n.id}
                  className={`nb-item ${n.is_read ? "" : "nb-item--unread"}`}
                  onClick={() => handleItemClick(n)}
                >
                  <span className="nb-item-icon" aria-hidden="true">
                    {TYPE_ICON[n.type] || TYPE_ICON.info}
                  </span>
                  <span className="nb-item-body">
                    <span className="nb-item-title">{n.title}</span>
                    {n.body && <span className="nb-item-text">{n.body}</span>}
                    <span className="nb-item-time">{timeAgo(n.created_at)}</span>
                  </span>
                  {!n.is_read && <span className="nb-item-dot" aria-hidden="true" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
