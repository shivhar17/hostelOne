import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Building2,
  Users,
  AlertCircle,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const navItems = [
  { label: "Dashboard", icon: Home, path: "/admin-dashboard" },
  { label: "Rooms", icon: Building2, path: "/admin-rooms" },
  { label: "Students", icon: Users, path: "/admin-students" },
  { label: "Complaints", icon: AlertCircle, path: "/admin-complaints" },
  { label: "Staff Management", icon: UserCog, path: "/admin-staff" },
  { label: "Settings", icon: Settings, path: "/admin-settings" },
];

export default function AdminDashboard() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("student") || "{}");
  const hostelId = user?.hostelId;

  // ======================
  // NEW COMPLAINT COUNT
  // ======================
  const [newComplaintCount, setNewComplaintCount] = useState(0);

  useEffect(() => {
    if (!hostelId) return;

    const q = query(
      collection(db, "complaints"),
      where("hostelId", "==", hostelId),
      where("status", "==", "NEW")
    );

    const unsub = onSnapshot(q, (snap) => {
      setNewComplaintCount(snap.size);
    });

    return () => unsub();
  }, [hostelId]);

  // ======================
  // DASHBOARD STATS
  // ======================
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeToday: 0,
  });

  useEffect(() => {
    const unsubStudents = onSnapshot(
      collection(db, "students"),
      (snap) => {
        setStats((prev) => ({
          ...prev,
          totalStudents: snap.size,
        }));
      }
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeQuery = query(
      collection(db, "students"),
      where("lastLogin", ">=", Timestamp.fromDate(today))
    );

    const unsubActive = onSnapshot(activeQuery, (snap) => {
      setStats((prev) => ({
        ...prev,
        activeToday: snap.size,
      }));
    });

    return () => {
      unsubStudents();
      unsubActive();
    };
  }, []);

  const handleNav = (path: string) => {
    setOpen(false);

    // Routes that actually exist
    const existingRoutes = ["/admin-dashboard"];

    if (!existingRoutes.includes(path)) {
      alert("🚧 Coming Soon");
      return;
    }

    navigate(path);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* ================= HEADER ================= */}
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm sticky top-0 z-30">
        <button onClick={() => setOpen(true)}>
          <Menu size={24} />
        </button>

        <h1 className="font-bold text-lg">HostelOne Admin</h1>

        <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
          AD
        </div>
      </header>

      {/* ================= OVERLAY ================= */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ================= DRAWER ================= */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="font-semibold">Admin Panel</h2>
          <button onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);

            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  active
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="p-4">
        <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Total Students</p>
            <h3 className="text-3xl font-bold">{stats.totalStudents}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Active Today</p>
            <h3 className="text-3xl font-bold">{stats.activeToday}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">New Complaints</p>
            <h3 className="text-3xl font-bold">{newComplaintCount}</h3>
          </div>
        </div>
      </main>
    </div>
  );
}
