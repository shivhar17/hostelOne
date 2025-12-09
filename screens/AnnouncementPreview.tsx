// src/screens/AnnouncementPreview.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

interface AnnouncementDoc {
  title: string;
  message: string;
  type?: string;        // e.g. "mess", "event", "urgent"
  audience?: string;    // e.g. "All Students", "Block A"
  createdAt?: any;
}

export const AnnouncementPreview: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<AnnouncementDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const ref = doc(db, "announcements", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const raw = snap.data() as any;
          setData({
            title: raw.title || "",
            message: raw.message || "",
            type: raw.type || "general",
            audience: raw.audience || "All Students",
            createdAt: raw.createdAt,
          });
        }
      } catch (err) {
        console.error("Failed to load announcement:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const formattedDate = () => {
    if (!data?.createdAt) return "";
    try {
      const d =
        typeof data.createdAt.toDate === "function"
          ? data.createdAt.toDate()
          : new Date();
      return d.toLocaleString();
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050316] text-white flex items-center justify-center">
        <p className="text-sm text-slate-300">Loading announcement…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050316] text-white flex flex-col">
        <div className="px-5 pt-12 pb-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold">Announcement</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Announcement not found.</p>
        </div>
      </div>
    );
  }

  const isUrgent = data.type?.toLowerCase() === "urgent";

  return (
    <div className="min-h-screen bg-[#050316] text-white flex flex-col">
      {/* Top bar */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">Announcement Preview</h1>
      </div>

      {/* Card */}
      <div className="flex-1 px-5 pb-10">
        <div className="bg-white rounded-3xl px-6 pt-6 pb-10 text-slate-900 shadow-xl">
          {/* Chips */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-4 py-1 rounded-full bg-[#F1E6FF] text-[#6C3BF4] text-xs font-semibold">
              For: {data.audience || "All Students"}
            </span>
            <span
              className={`px-4 py-1 rounded-full text-xs font-semibold ${
                isUrgent
                  ? "bg-[#FFE0E5] text-[#E1063C]"
                  : "bg-[#E9E9FF] text-[#4C3FFF]"
              }`}
            >
              {isUrgent ? "Urgent" : "General"}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold leading-tight mb-4">
            {data.title}
          </h2>

          {/* Message */}
          <p className="text-[15px] leading-relaxed text-slate-700 mb-6">
            {data.message}
          </p>

          {/* Footer info */}
          {formattedDate() && (
            <p className="text-[11px] text-slate-400">
              Posted on {formattedDate()}
            </p>
          )}
        </div>
      </div>

      {/* Bottom buttons (visual only for student) */}
      <div className="px-5 pb-6 flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 h-12 rounded-full bg-white/10 text-sm font-semibold"
        >
          Back
        </button>
        <button
          disabled
          className="flex-1 h-12 rounded-full bg-[#7C3AED] text-sm font-semibold"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
