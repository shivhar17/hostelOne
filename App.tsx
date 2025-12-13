// src/App.tsx
import React, { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { Onboarding } from "./screens/Onboarding";
import { Login } from "./screens/Login";
import { Dashboard } from "./screens/Dashboard";
import { MessMenu } from "./screens/Mess";
import Maintenance from "./screens/Maintenance";
import StudentComplaints from "./pages/StudentComplaints";
import { Community } from "./screens/Community";
import { Announcements } from "./screens/Announcements";
import { AnnouncementPreview } from "./screens/AnnouncementPreview";
import { Profile } from "./screens/Profile";

import { StaffDashboard } from "./screens/StaffDashboard";
import { ComplaintDetail } from "./screens/ComplaintDetail";
import { EditMessMenu } from "./screens/EditMessMenu";
import { StudentsDirectory } from "./screens/StudentDirectory";
import { StudentProfile } from "./screens/StudentProfile";
import { StaffNewAnnouncement } from "./screens/StaffNewAnnouncement";

import { BottomNav } from "./components/BottomNav";
import { Laundry } from "./screens/Laundry";

const AppRoutes: React.FC = () => {
  const location = useLocation();

  // hide on these pages
  const isStaffRoute = location.pathname.startsWith("/staff");
  const isLoginRoute = location.pathname === "/login";
  const isOnboardingRoute = location.pathname === "/onboarding";
  const isAnnouncementPreview = location.pathname.startsWith(
    "/announcement/"
  );

  const showBottomNav =
    !isStaffRoute &&
    !isLoginRoute &&
    !isOnboardingRoute &&
    !isAnnouncementPreview;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-950 shadow-2xl overflow-y-auto relative no-scrollbar transition-colors duration-300">

      <Routes>
        {/* student routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mess" element={<MessMenu />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/community" element={<Community />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/announcement/:id" element={<AnnouncementPreview />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-complaints" element={<StudentComplaints />} />
        <Route path="/laundry" element={<Laundry />} />

        {/* staff */}
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="/staff/complaint/:id" element={<ComplaintDetail />} />
        <Route path="/staff/edit-menu" element={<EditMessMenu />} />
        <Route path="/staff/students" element={<StudentsDirectory />} />
        <Route path="/staff/student/:id" element={<StudentProfile />} />
        <Route path="/staff/new-announcement" element={<StaffNewAnnouncement />} />
      </Routes>

      {showBottomNav && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDarkMode)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;