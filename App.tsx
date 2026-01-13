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
import StaffLaundry from "./screens/StaffLaundry";
import StaffCreateLaundrySlot from "./screens/StaffCreateLaundrySlot";

import AdminDashboard from "./screens/AdminDashboard";

import { StaffAnnouncementList } from "./screens/StaffAnnouncementList";
import { StaffEditAnnouncement } from "./screens/StaffEditAnnouncement";

import { BottomNav } from "./components/BottomNav";

/* -------------------- PROTECTED ROUTE -------------------- */
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  hostelId: string;
  [key: string]: any; // For any additional properties
}

const ProtectedRoute = ({
  children,
  roles = [] as Array<'student' | 'staff' | 'admin'>
}: {
  children: React.ReactNode,
  roles?: Array<'student' | 'staff' | 'admin'>
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If route requires specific roles and user doesn't have any of them
  if (roles.length > 0 && !roles.includes(user.role)) {
    // If user is admin but trying to access staff route, allow it
    if (user.role === 'admin' && roles.includes('staff')) {
      return <>{children}</>;
    }
    // If user is staff but trying to access admin route, redirect to staff dashboard
    if (user.role === 'staff' && roles.includes('admin')) {
      return <Navigate to="/staff-dashboard" replace />;
    }
    // For any other role mismatch, redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

/* -------------------- ROUTES -------------------- */
const AppRoutes: React.FC = () => {
  const location = useLocation();

  const isStaffRoute = location.pathname.startsWith("/staff");
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isLoginRoute = location.pathname === "/login";
  const isOnboarding = location.pathname === "/onboarding";
  const isAnnouncementPreview = location.pathname.startsWith("/announcement/");

  const showBottomNav =
    !isStaffRoute &&
    !isAdminRoute &&
    !isLoginRoute &&
    !isOnboarding &&
    !isAnnouncementPreview;

  const admin = localStorage.getItem("admin");

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-950 shadow-2xl overflow-y-auto relative">

      <Routes>
        {/* ROOT */}
        <Route
          path="/"
          element={
            localStorage.getItem("user")
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* STUDENT */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/mess" element={<ProtectedRoute><MessMenu /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
        <Route path="/announcement/:id" element={<ProtectedRoute><AnnouncementPreview /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/my-complaints" element={<ProtectedRoute><StudentComplaints /></ProtectedRoute>} />
        <Route path="/laundry" element={<ProtectedRoute><Laundry /></ProtectedRoute>} />

        {/* STAFF */}
        <Route 
          path="/staff-dashboard" 
          element={
            <ProtectedRoute roles={['staff', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/complaint/:id" 
          element={
            <ProtectedRoute roles={['staff', 'admin']}>
              <ComplaintDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/edit-menu" 
          element={
            <ProtectedRoute roles={['staff', 'admin']}>
              <EditMessMenu />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/students" 
          element={
            <ProtectedRoute roles={['staff', 'admin']}>
              <StudentsDirectory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/student/:id" 
          element={
            <ProtectedRoute roles={['staff', 'admin']}>
              <StudentProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/new-announcement" 
          element={
            <ProtectedRoute roles={['staff', 'admin']}>
              <StaffNewAnnouncement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/announcements-list" 
          element={
            <ProtectedRoute roles={['staff', 'admin']}>
              <StaffAnnouncementList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/edit-notice/:id" 
          element={
            <ProtectedRoute roles={['staff', 'admin']}>
              <StaffEditAnnouncement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff-laundry" 
          element={
            <ProtectedRoute roles={['staff', 'admin']}>
              <StaffLaundry />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff-laundry/add-slot" 
          element={
            <ProtectedRoute roles={['staff', 'admin']}>
              <StaffCreateLaundrySlot />
            </ProtectedRoute>
          } 
        />

        {/* ADMIN */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>

      {showBottomNav && <BottomNav />}
    </div>
  );
};

/* -------------------- APP -------------------- */
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
