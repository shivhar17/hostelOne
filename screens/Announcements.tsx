import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  Megaphone,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  image?: string | null;
  pinned: boolean;
  createdAt: any;
  readBy: string[];
  audience: string;
}

export const Announcements: React.FC = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const student = JSON.parse(localStorage.getItem("student") || "{}");
  const studentId = student?.id || "unknown";

  // ICON SELECTOR
  const getIcon = (type: string) => {
    switch (type) {
      case "urgent":
      case "warning":
        return AlertTriangle;
      case "event":
        return Megaphone;
      case "success":
        return CheckCircle;
      default:
        return Info;
    }
  };

  // DATE SEPARATOR LOGIC
  const formatDateSeparator = (timestamp: any) => {
    if (!timestamp) return "";

    const date = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // FETCH FIRESTORE ANNOUNCEMENTS
  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list: Announcement[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Announcement[];

      setAnnouncements(list);
      setLoading(false);

      // mark as read
      list.forEach(async (a) => {
        if (!a.readBy?.includes(studentId)) {
          await updateDoc(doc(db, "announcements", a.id), {
            readBy: [...(a.readBy || []), studentId],
          });
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const pinned = announcements.filter((a) => a.pinned);
  const others = announcements.filter((a) => !a.pinned);

  // GROUP BY DATE
  const groupedByDate: { [key: string]: Announcement[] } = {};
  others.forEach((a) => {
    const key = formatDateSeparator(a.createdAt);
    if (!groupedByDate[key]) groupedByDate[key] = [];
    groupedByDate[key].push(a);
  });

  return (
    <div className="p-5 space-y-6">

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-400">Loading announcements...</p>
      )}

      {/* NO DATA */}
      {!loading && announcements.length === 0 && (
        <p className="text-center text-gray-400 mt-10">No announcements yet</p>
      )}

      {/* 🔥 PINNED SECTION */}
      {pinned.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-2 text-yellow-500">
            📌 Pinned Notices
          </h2>

          <div className="space-y-4">
            {pinned.map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/announcement/${a.id}`)}
                className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-5 rounded-3xl shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <h3 className="text-lg font-bold">{a.title}</h3>
                <p className="text-sm mt-1 opacity-90">{a.message}</p>

                {a.image && (
                  <img
                    src={a.image}
                    className="mt-3 rounded-xl shadow border border-white/20"
                    alt=""
                  />
                )}

                <div className="mt-3 text-xs opacity-80">
                  {a.audience} • {a.type.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔵 DATE-GROUPED ANNOUNCEMENTS */}
      <div className="space-y-10">
        {Object.keys(groupedByDate).map((dateKey) => (
          <div key={dateKey}>
            {/* Date separator */}
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 px-1">
              {dateKey}
            </h2>

            <div className="space-y-4">
              {groupedByDate[dateKey].map((a) => {
                const Icon = getIcon(a.type);

                return (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/announcement/${a.id}`)}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-md flex gap-4 active:scale-[0.98] transition cursor-pointer"
                  >
                    {/* Icon bubble */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                      <Icon
                        size={22}
                        className="text-slate-600 dark:text-slate-300"
                      />
                    </div>

                    {/* Body */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 dark:text-white">
                        {a.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {a.message}
                      </p>

                      {a.image && (
                        <img
                          src={a.image}
                          alt=""
                          className="mt-3 rounded-lg shadow border border-slate-200 dark:border-slate-700"
                        />
                      )}

                      <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                        {a.audience} • {a.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

