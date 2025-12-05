import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Users } from "lucide-react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  lastLogin?: any;
  loginCount?: number;
}

export const StudentsDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("name"));
    const unsub = onSnapshot(q, (snap) => {
      const data: Student[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setStudents(data);
    });

    return () => unsub();
  }, []);

  const filtered = students.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.studentId.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-3 bg-[#0F172A] sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Users size={22} className="text-emerald-400" />
          <h1 className="text-xl font-bold">Student Directory</h1>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 mt-4 mb-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or email"
            className="w-full bg-[#1E293B] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="px-6 space-y-3">
        {filtered.length === 0 && (
          <p className="text-slate-400 text-sm mt-6">
            No students found. They will appear here after logging in.
          </p>
        )}

        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-[#1E293B] border border-slate-700/60 rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-slate-400">{s.email}</p>
              <p className="text-xs text-emerald-400 mt-1">
                ID: {s.studentId}
              </p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>Logins: {s.loginCount ?? 1}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
