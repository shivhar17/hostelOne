// src/screens/StaffNewAnnouncement.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

type AudienceOption =
  | "All Students"
  | "All Girls"
  | "All Boys"
  | "First Year"
  | "Final Year"
  | "Block A"
  | "Block B";

type AnnouncementType = "general" | "urgent";

export const StaffNewAnnouncement: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<AudienceOption>("All Students");
  const [type, setType] = useState<AnnouncementType>("general");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Please enter both title and message.");
      return;
    }

    try {
      setSending(true);
      await addDoc(collection(db, "announcements"), {
        title: title.trim(),
        message: message.trim(),
        audience,
        type,
        createdAt: serverTimestamp(),
        readBy: [], // students will be added here
      });

      setSending(false);
      // after send, go to student Announcements list
      navigate("/announcements");
    } catch (err) {
      console.error("Failed to send announcement", err);
      setSending(false);
      alert("Failed to send. Please try again.");
    }
  };

  const handlePreview = () => {
    if (!title.trim() || !message.trim()) {
      alert("Please enter both title and message before preview.");
      return;
    }
    setPreviewOpen(true);
  };

  const audienceOptions: AudienceOption[] = [
    "All Students",
    "All Girls",
    "All Boys",
    "First Year",
    "Final Year",
    "Block A",
    "Block B",
  ];

  return (
    <div className="min-h-screen bg-[#050316] text-white flex flex-col">
      {/* Top bar */}
      <div className="px-5 pt-12 pb-5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-semibold">New Announcement</h1>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 space-y-6 pb-8 overflow-y-auto">
        {/* Title */}
        <div>
          <label className="block mb-2 text-sm font-semibold tracking-wide">
            Title
          </label>
          <div className="bg-[#11101A] rounded-3xl px-4 py-3 border border-white/5">
            <textarea
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-sm outline-none resize-none text-white placeholder:text-slate-500"
              placeholder="e.g, Water Supply Maintenance"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block mb-2 text-sm font-semibold tracking-wide">
            Message
          </label>
          <div className="bg-[#11101A] rounded-3xl px-4 py-3 border border-white/5">
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-transparent text-sm outline-none resize-none text-white placeholder:text-slate-500"
              placeholder="Enter the details of the announcement here..."
            />
          </div>
        </div>

        {/* Type (Urgent / General) */}
        <div>
          <label className="block mb-2 text-sm font-semibold tracking-wide">
            Priority
          </label>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setType("general")}
              className={`px-4 py-2 rounded-full text-xs font-semibold border ${
                type === "general"
                  ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                  : "bg-[#11101A] border-white/10 text-slate-200"
              }`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setType("urgent")}
              className={`px-4 py-2 rounded-full text-xs font-semibold border ${
                type === "urgent"
                  ? "bg-[#F97373] border-[#F97373] text-white"
                  : "bg-[#11101A] border-white/10 text-slate-200"
              }`}
            >
              Urgent
            </button>
          </div>
        </div>

        {/* Audience selection */}
        <div>
          <label className="block mb-2 text-sm font-semibold tracking-wide">
            Send To
          </label>
          <div className="flex flex-wrap gap-3">
            {audienceOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAudience(opt)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border ${
                  audience === opt
                    ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                    : "bg-[#11101A] border-white/10 text-slate-100"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="px-5 pb-7 flex gap-4">
        <button
          onClick={handlePreview}
          className="flex-1 h-12 rounded-full border border-[#7C3AED] text-[#7C3AED] text-sm font-semibold bg-transparent"
        >
          Preview
        </button>
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex-1 h-12 rounded-full bg-[#7C3AED] text-white text-sm font-semibold disabled:bg-[#4B2BB8]"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Preview overlay */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="w-[90%] max-w-md bg-[#050316] rounded-3xl p-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200">
                Announcement Preview
              </h2>
              <button
                onClick={() => setPreviewOpen(false)}
                className="text-xs text-slate-400"
              >
                Close
              </button>
            </div>

            {/* White card like design */}
            <div className="bg-white text-slate-900 rounded-3xl px-5 pt-5 pb-8">
              {/* Chips */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-1 rounded-full bg-[#F1E6FF] text-[#6C3BF4] text-xs font-semibold">
                  For: {audience}
                </span>
                <span
                  className={`px-4 py-1 rounded-full text-xs font-semibold ${
                    type === "urgent"
                      ? "bg-[#FFE0E5] text-[#E1063C]"
                      : "bg-[#E9E9FF] text-[#4C3FFF]"
                  }`}
                >
                  {type === "urgent" ? "Urgent" : "General"}
                </span>
              </div>

              <h3 className="text-2xl font-extrabold leading-tight mb-4">
                {title || "Announcement Title"}
              </h3>

              <p className="text-[15px] leading-relaxed text-slate-700">
                {message || "Announcement content will appear here."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
