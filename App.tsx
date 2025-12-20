import React, { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
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

import { Laundry } from "./screens/Laundry";

// NEW FIXED IMPORTS
import { StaffAnnouncementList } from "./screens/StaffAnnouncementList";
import { StaffEditAnnouncement } from "./screens/StaffEditAnnouncement";

import { BottomNav } from "./components/BottomNav";


// PROTECTED ROUTE
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn =
    localStorage.getItem("student") || localStorage.getItem("staff");

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};


const AppRoutes: React.FC = () => {
  const location = useLocation();

  const isStaffRoute = location.pathname.startsWith("/staff");
  const isLoginRoute = location.pathname === "/login";
  const isOnboarding = location.pathname === "/onboarding";
  const isAnnouncementPreview = location.pathname.startsWith("/announcement/");

  const showBottomNav =
    !isStaffRoute &&
    !isLoginRoute &&
    !isOnboarding &&
    !isAnnouncementPreview;


  return (
    <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-950 shadow-2xl overflow-y-auto relative no-scrollbar">

      <Routes>

        {/* HOME FIX */}
        <Route
          path="/"
          element={
            localStorage.getItem("student") || localStorage.getItem("staff")
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* LOGIN + ONBOARDING */}
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* STUDENT ROUTES */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/mess" element={<ProtectedRoute><MessMenu /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
        <Route path="/announcement/:id" element={<ProtectedRoute><AnnouncementPreview /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/my-complaints" element={<ProtectedRoute><StudentComplaints /></ProtectedRoute>} />
        <Route path="/laundry" element={<ProtectedRoute><Laundry /></ProtectedRoute>} />

        {/* STAFF ROUTES */}
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="/staff/complaint/:id" element={<ComplaintDetail />} />
        <Route path="/staff/edit-menu" element={<EditMessMenu />} />
        <Route path="/staff/students" element={<StudentsDirectory />} />
        <Route path="/staff/student/:id" element={<StudentProfile />} />
        <Route path="/staff/new-announcement" element={<StaffNewAnnouncement />} />

        {/* NEW ANNOUNCEMENT MANAGEMENT SCREENS */}
        <Route path="/staff/announcements-list" element={<StaffAnnouncementList />} />
        <Route path="/staff/edit-notice/:id" element={<StaffEditAnnouncement />} />

      </Routes>

      {showBottomNav && <BottomNav />}
    </div>
  );
};


const App: React.FC = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
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
