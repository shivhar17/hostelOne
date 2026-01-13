import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

type Complaint = {
  id: string;
  title: string;
  category: string;
  room: string;
  studentName?: string;
  priority: "URGENT" | "NORMAL";
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  createdAt?: any;
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<
    "ALL" | "NEW" | "IN_PROGRESS" | "RESOLVED" | "URGENT"
  >("NEW");

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeToday: 0,
  });

  // ======================
  // FETCH DASHBOARD STATS
  // ======================
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

    const q = query(
      collection(db, "students"),
      where("lastLogin", ">=", today)
    );

    const unsubActive = onSnapshot(q, (snap) => {
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

  // ======================
  // FETCH COMPLAINTS
  // ======================
  useEffect(() => {
    const q = query(collection(db, "complaints"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Complaint[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setComplaints(list);
    });

    return () => unsub();
  }, []);

  // ======================
  // FILTER LOGIC
  // ======================
  const filteredComplaints = complaints.filter((c) => {
    if (filter === "ALL") return true;
    if (filter === "URGENT") return c.priority === "URGENT";
    return c.status === filter;
  });

  // ======================
  // ACTIONS
  // ======================
  const startWork = async (id: string) => {
    if (!window.confirm("Start work on this complaint?")) return;
    await updateDoc(doc(db, "complaints", id), {
      status: "IN_PROGRESS",
    });
  };

  const resolveComplaint = async (id: string) => {
    if (!window.confirm("Mark this complaint as resolved?")) return;
    await updateDoc(doc(db, "complaints", id), {
      status: "RESOLVED",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Total Students" value={stats.totalStudents} />
        <StatCard label="Active Today" value={stats.activeToday} />
      </div>

      {/* COMPLAINT MANAGEMENT */}
      <h2 className="text-xl font-semibold mb-3">
        Complaint Management
      </h2>

      {/* TABS */}
      <div className="flex gap-4 mb-4 overflow-x-auto">
        {["ALL", "NEW", "IN_PROGRESS", "RESOLVED", "URGENT"].map(
          (t) => (
            <button
              key={t}
              onClick={() => setFilter(t as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {t === "IN_PROGRESS" ? "In Progress" : t}
            </button>
          )
        )}
      </div>

      {/* LIST */}
      {filteredComplaints.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No complaints found 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl p-4 shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    c.priority === "URGENT"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {c.priority}
                </span>
                <span className="text-xs text-gray-400">
                  {c.status.replace("_", " ")}
                </span>
              </div>

              <h3 className="font-semibold text-lg">
                {c.title || c.category}
              </h3>

              <p className="text-sm text-gray-500">
                Room: {c.room} •{" "}
                {c.studentName || "Unknown Student"}
              </p>

              <div className="flex gap-2 mt-4">
                {c.status === "NEW" && (
                  <button
                    onClick={() => startWork(c.id)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                  >
                    Start Work
                  </button>
                )}

                {c.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => resolveComplaint(c.id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                  >
                    Resolve
                  </button>
                )}

                <button
                  onClick={() =>
                    navigate(`/complaint/${c.id}`)
                  }
                  className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================
// SMALL COMPONENT
// ======================
function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
