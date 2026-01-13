import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

/*
  WHY THIS PAGE EXISTS:
  - Gives admins real-time visibility
  - Shows workload, efficiency, and usage
  - Designed to scale across multiple hostels
*/

type ComplaintStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

interface Complaint {
  id: string;
  title: string;
  category: string;
  room: string;
  studentId: string;
  priority: "URGENT" | "NORMAL";
  status: ComplaintStatus;
  createdAt: any;
  hostelId: string;
}

interface Student {
  id: string;
  hostelId: string;
  lastLogin?: any;
}

export default function AdminDashboard() {
  /* ================= AUTH / CONTEXT ================= */
  const user = JSON.parse(localStorage.getItem("student") || "{}");
  const hostelId = user.hostelId || "HOSTEL_001";

  /* ================= STATE ================= */
  const [students, setStudents] = useState<Student[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] =
    useState<"ALL" | ComplaintStatus | "URGENT">("ALL");

  /* ================= DATA SUBSCRIPTIONS ================= */

  // STUDENTS (used for Total Students + Active Today)
  useEffect(() => {
    const q = query(
      collection(db, "students"),
      where("hostelId", "==", hostelId)
    );

    const unsub = onSnapshot(q, (snap) => {
      setStudents(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }))
      );
    });

    return () => unsub();
  }, [hostelId]);

  // COMPLAINTS (used for stats + management)
  useEffect(() => {
    const q = query(
      collection(db, "complaints"),
      where("hostelId", "==", hostelId)
    );

    const unsub = onSnapshot(q, (snap) => {
      setComplaints(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }))
      );
      setLoading(false);
    });

    return () => unsub();
  }, [hostelId]);

  /* ================= DERIVED METRICS ================= */

  const today = new Date().toDateString();

  const activeTodayCount = useMemo(() => {
    return students.filter((s) => {
      if (!s.lastLogin?.toDate) return false;
      return s.lastLogin.toDate().toDateString() === today;
    }).length;
  }, [students, today]);

  const complaintCounts = useMemo(() => {
    return {
      NEW: complaints.filter((c) => c.status === "NEW").length,
      IN_PROGRESS: complaints.filter((c) => c.status === "IN_PROGRESS").length,
      RESOLVED: complaints.filter((c) => c.status === "RESOLVED").length,
    };
  }, [complaints]);

  /* ================= FILTERED COMPLAINTS ================= */

  const visibleComplaints = useMemo(() => {
    if (activeTab === "ALL") return complaints;
    if (activeTab === "URGENT")
      return complaints.filter((c) => c.priority === "URGENT");
    return complaints.filter((c) => c.status === activeTab);
  }, [complaints, activeTab]);

  /* ================= ACTIONS ================= */

  const updateStatus = async (
    id: string,
    status: ComplaintStatus
  ) => {
    const confirm = window.confirm(
      `Are you sure you want to mark this complaint as ${status}?`
    );
    if (!confirm) return;

    await updateDoc(doc(db, "complaints", id), { status });
    alert("✅ Status updated");
  };

  /* ================= UI ================= */

  if (loading) {
    return <div className="p-6">Loading Admin Dashboard…</div>;
  }

  return (
    <div className="p-6 space-y-8">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">
          Hostel Overview • {hostelId}
        </p>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Students" value={students.length} />
        <StatCard label="Active Today" value={activeTodayCount} />
        <StatCard label="New Complaints" value={complaintCounts.NEW} />
        <StatCard
          label="In Progress"
          value={complaintCounts.IN_PROGRESS}
        />
        <StatCard label="Resolved" value={complaintCounts.RESOLVED} />
        <StatCard label="Laundry Utilization" value="— %" />
      </div>

      {/* ================= COMPLAINT MANAGEMENT ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-3">
          Complaint Management
        </h2>

        {/* TABS */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["ALL", "NEW", "IN_PROGRESS", "RESOLVED", "URGENT"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1 rounded text-sm ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            )
          )}
        </div>

        {/* COMPLAINT LIST */}
        {visibleComplaints.length === 0 && (
          <p className="text-gray-500">No complaints found 🎉</p>
        )}

        <div className="space-y-3">
          {visibleComplaints.map((c) => (
            <div
              key={c.id}
              className="border rounded-lg p-4 bg-white"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    {c.title} ({c.category})
                  </p>
                  <p className="text-sm text-gray-600">
                    Room {c.room} • Student {c.studentId}
                  </p>
                  <p className="text-xs text-gray-500">
                    Priority: {c.priority} • Status: {c.status}
                  </p>
                </div>

                <div className="flex gap-2">
                  {c.status === "NEW" && (
                    <button
                      onClick={() =>
                        updateStatus(c.id, "IN_PROGRESS")
                      }
                      className="text-sm bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Start Work
                    </button>
                  )}
                  {c.status === "IN_PROGRESS" && (
                    <button
                      onClick={() =>
                        updateStatus(c.id, "RESOLVED")
                      }
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ================= REUSABLE COMPONENT ================= */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border rounded-xl p-4 bg-white">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
