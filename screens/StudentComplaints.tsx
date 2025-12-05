import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

type StudentSession = {
  studentId: string;
  name: string;
  email: string;
};

type Complaint = {
  id: string;
  title: string;
  category: string;
  room: string;
  details: string;
  status: string;
  studentId: string;
  createdAt: any;
};

const StudentComplaints: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("student");
    if (!stored) {
      alert("Student session not found. Please log in again.");
      navigate("/login");
      return;
    }

    const student: StudentSession = JSON.parse(stored);
    const q = query(
      collection(db, "complaints"),
      where("studentId", "==", student.studentId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Complaint[];
      setComplaints(data.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });

    return () => unsub();
  }, [navigate]);

  const getStatusIcon = (status: string) => {
    if (status === "Resolved") return <CheckCircle size={20} className="text-emerald-500" />;
    if (status === "In Progress") return <Clock size={20} className="text-blue-500" />;
    return <AlertCircle size={20} className="text-yellow-500" />;
  };

  const getStatusColor = (status: string) => {
    if (status === "Resolved") return "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800";
    if (status === "In Progress") return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
    return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-6 py-6 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            My Complaints
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View all your submitted complaints
          </p>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-slate-500 dark:text-slate-400">Loading complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle size={40} className="text-slate-400 dark:text-slate-600 mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">No complaints yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            Your submitted complaints will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className={`rounded-xl border p-4 ${getStatusColor(complaint.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex-1">
                  {complaint.title}
                </h3>
                <div className="ml-2">{getStatusIcon(complaint.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Category:</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium capitalize">
                    {complaint.category}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Room:</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {complaint.room || "N/A"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 line-clamp-2">
                {complaint.details}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Status: <span className="font-semibold capitalize">{complaint.status}</span>
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {complaint.createdAt?.toDate?.()?.toLocaleDateString?.() || "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentComplaints;
