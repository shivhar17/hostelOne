import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

export default function StudentComplaints() {
    const navigate = useNavigate();

  const [studentId, setStudentId] = useState("");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComplaints = () => {
    if (!studentId) {
      alert("Please enter your Student ID");
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "complaints"),
      where("studentId", "==", studentId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setComplaints(data);
      setLoading(false);
    });

    return () => unsub();
  };

  const getStatusColor = (status: string) => {
    if (status === "Pending") return "bg-yellow-500/20 text-yellow-400";
    if (status === "In Progress") return "bg-blue-500/20 text-blue-400";
    if (status === "Resolved") return "bg-emerald-500/20 text-emerald-400";
    return "bg-slate-500/20 text-slate-400";
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
        >
          ⬅ Back
        </button>

        <h2 className="text-2xl font-bold">
          📋 My Maintenance Complaints
        </h2>
      </div>

      {/* Student ID Input */}
      <div className="max-w-md mx-auto mb-6 bg-[#1E293B] p-4 rounded-xl">
        <label className="text-sm text-slate-400">Enter Your Student ID</label>
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="e.g. 21BCE001"
          className="w-full mt-1 p-2 rounded-lg bg-[#0F172A] border border-slate-700 outline-none"
        />

        <button
          onClick={fetchComplaints}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg"
        >
          View My Complaints
        </button>
      </div>

      {/* Complaint List */}
      <div className="max-w-md mx-auto space-y-4">
        {loading && <p className="text-center text-slate-400">Loading...</p>}

        {!loading && complaints.length === 0 && (
          <p className="text-center text-slate-400">
            No complaints found for this ID.
          </p>
        )}

        {complaints.map((c) => (
          <div
            key={c.id}
            className="bg-[#1E293B] p-4 rounded-xl border border-slate-700"
          >
            <div className="flex justify-between mb-2">
              <span className="text-xs text-slate-400">
                Room: {c.room}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                  c.status
                )}`}
              >
                {c.status}
              </span>
            </div>

            <h3 className="font-bold mb-1">{c.description}</h3>

            <p className="text-xs text-slate-400">
              Category: {c.category}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Submitted on: {c.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
