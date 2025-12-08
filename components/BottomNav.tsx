// src/components/BottomNav.tsx
import React from "react";
import { Home, Users, Bell, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMaintenanceUnread } from "../hooks/useMaintenanceUnread";
import { useAnnouncementsUnread } from "../hooks/useAnnouncementsUnread";

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const hasChatUnread = useMaintenanceUnread();
  const hasAnnouncementsUnread = useAnnouncementsUnread();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-30">
      {/* Home */}
      <button
        onClick={() => navigate("/")}
        className="flex flex-col items-center text-[11px]"
      >
        <Home
          size={22}
          className={
            isActive("/") ? "text-emerald-500" : "text-slate-400"
          }
        />
        <span className={isActive("/") ? "text-emerald-500" : ""}>Home</span>
      </button>

      {/* Community + unread badge */}
      <button
        onClick={() => navigate("/community")}
        className="relative flex flex-col items-center text-[11px]"
      >
        <Users
          size={22}
          className={
            isActive("/community") ? "text-emerald-500" : "text-slate-400"
          }
        />
        {hasChatUnread && !isActive("/community") && (
          <span className="absolute -top-0.5 right-2 w-2 h-2 rounded-full bg-red-500" />
        )}
        <span className={isActive("/community") ? "text-emerald-500" : ""}>
          Community
        </span>
      </button>

      {/* Updates / Announcements + unread badge */}
      <button
        onClick={() => navigate("/announcements")}
        className="relative flex flex-col items-center text-[11px]"
      >
        <Bell
          size={22}
          className={
            isActive("/announcements") ? "text-emerald-500" : "text-slate-400"
          }
        />
        {hasAnnouncementsUnread && !isActive("/announcements") && (
          <span className="absolute -top-0.5 right-2 w-2 h-2 rounded-full bg-red-500" />
        )}
        <span
          className={isActive("/announcements") ? "text-emerald-500" : ""}
        >
          Updates
        </span>
      </button>

      {/* Profile */}
      <button
        onClick={() => navigate("/profile")}
        className="flex flex-col items-center text-[11px]"
      >
        <User
          size={22}
          className={
            isActive("/profile") ? "text-emerald-500" : "text-slate-400"
          }
        />
        <span className={isActive("/profile") ? "text-emerald-500" : ""}>
          Profile
        </span>
      </button>
    </div>
  );
};
