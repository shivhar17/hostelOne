// src/screens/Announcements.tsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, Utensils, PartyPopper, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: any;
  readBy?: string[];
}

export const Announcements: React.FC = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  // 🔐 Get studentId from localStorage
  useEffect(() => {
    const savedStudent = localStorage.getItem("student");
    if (savedStudent) {
      try {
        const parsed = JSON.parse(savedStudent);
        if (parsed.studentId) {
          setStudentId(parsed.studentId);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // 🔥 Live announcements listener
  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((snap) => {
          const raw = snap.data() as any;
          return {
            id: snap.id,
            title: raw.title || "",
            message: raw.message || "",
            type: raw.type || "general",
            createdAt: raw.createdAt,
            readBy: raw.readBy || [],
          } as Announcement;
        });

        setAnnouncements(data);
        setLoading(false);
      },
      (err) => {
        console.error("Announcements listener error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // ✅ Mark all announcements as read for this student when the screen is open
  useEffect(() => {
    if (!studentId || announcements.length === 0) return;

    announcements.forEach(async (ann) => {
      const alreadyRead = ann.readBy?.includes(studentId);
      if (alreadyRead) return;

      try {
        const ref = doc(db, "announcements", ann.id);
        await updateDoc(ref, {
          readBy: arrayUnion(studentId),
        });
      } catch (err) {
        console.error("Failed to update readBy for announcement:", ann.id, err);
      }
    });
  }, [studentId, announcements]);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "mess":
        return Utensils;
      case "event":
        return PartyPopper;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col transition-colors duration-300 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-6 pt-12 pb-6 shadow-sm flex items-center gap-4 sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full"
        >
          <ArrowLeft size={24} className="text-slate-800 dark:text-white" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          Announcements
        </h1>
      </div>

      {/* List */}
      <div className="p-6 space-y-4">
        {loading && (
          <p className="text-center text-slate-500">Loading announcements...</p>
        )}

        {!loading && announcements.length === 0 && (
          <p className="text-center text-slate-400">
            No announcements yet
          </p>
        )}

        {announcements.map((notice) => {
          const Icon = getIcon(notice.type);

          return (
            <div
              key={notice.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm flex items-center gap-4 active:scale-98 transition-all border-l-4 border-teal-500"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400">
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {notice.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {notice.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
