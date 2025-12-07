// src/screens/ComplaintDetail.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  RefreshCw,
  UserPlus,
  Send,
} from "lucide-react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

interface Complaint {
  id: string;
  room: string;
  studentId: string;
  category: string;
  description: string;
  status: string;
  date: string;
  photoUrl?: string | null;
}

interface ChatMessage {
  id: string;
  text: string;
  from: "staff" | "student";
  createdAt?: any;
}

export const ComplaintDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load complaint details
  useEffect(() => {
    const loadComplaint = async () => {
      if (!id) return;
      try {
        const ref = doc(db, "complaints", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          setComplaint({
            id: snap.id,
            room: data.room || "",
            studentId: data.studentId || "",
            category: data.category || "",
            description: data.description || "",
            status: data.status || "Pending",
            date: data.date || "",
            photoUrl: data.photoUrl || null,
          });
        }
      } catch (e) {
        console.error("Failed to load complaint:", e);
      } finally {
        setLoading(false);
      }
    };

    loadComplaint();
  }, [id]);

  // Load chat messages for this student (shared with Community)
  useEffect(() => {
    if (!complaint?.studentId) return;

    const q = query(
      collection(db, "maintenanceChats"),
      where("studentId", "==", complaint.studentId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            text: data.text || "",
            from: (data.from as "staff" | "student") || "staff",
            createdAt: data.createdAt,
          };
        });
        setChatMessages(msgs);
      },
      (err) => console.error("Chat listener error:", err)
    );

    return () => unsub();
  }, [complaint?.studentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Staff sends message
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !id || !complaint) return;

    try {
      await addDoc(collection(db, "maintenanceChats"), {
        complaintId: id,
        studentId: complaint.studentId,
        text: chatInput.trim(),
        from: "staff", // fixed staff account
        createdAt: serverTimestamp(),
      });

      setChatInput("");
    } catch (e) {
      console.error("Failed to send message:", e);
      alert("Failed to send message. Try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">
        <p>Loading complaint...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">
        <p>Complaint not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-[#0F172A] border-b border-white/5 sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Complaint Details</h1>
        </div>
        <button className="relative p-2 hover:bg-slate-800 rounded-full transition-colors">
          <Bell size={20} />
          <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-slate-800"></div>
        </button>
      </div>

      {/* Filters (dummy) */}
      <div className="px-6 py-4 flex gap-4">
        <div className="flex-1 bg-[#1E293B] px-4 py-2.5 rounded-xl flex justify-between items-center text-xs font-medium text-slate-300">
          Sort by: Latest <ChevronDown size={14} />
        </div>
        <div className="flex-1 bg-[#1E293B] px-4 py-2.5 rounded-xl flex justify-between items-center text-xs font-medium text-slate-300">
          Status: {complaint.status || "Pending"} <ChevronDown size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        {/* Complaint Detail Card */}
        <div className="bg-[#1E293B] rounded-3xl p-5 mb-6 border border-slate-700/50">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-bold text-slate-400">
              #{complaint.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-lg text-xs font-bold">
              {complaint.status || "Pending"}
            </span>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-xs font-bold">
              {complaint.category || "Maintenance"}
            </span>
          </div>

          <h2 className="text-xl font-bold mb-3">
            Room {complaint.room} - {complaint.category}
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            {complaint.description}
          </p>

          {/* Photo */}
          <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
            Submitted Photo
          </h3>
          {complaint.photoUrl ? (
            <div className="w-full max-w-xs bg-white rounded-xl overflow-hidden mb-6">
              <img
                src={complaint.photoUrl}
                alt="Complaint evidence"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <p className="text-xs text-slate-500 mb-6">
              No photo uploaded for this complaint.
            </p>
          )}

          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Student</span>
              <span className="font-semibold">
                {complaint.studentId || "Unknown"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Submitted on</span>
              <span className="font-semibold">
                {complaint.date || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons (optional) */}
        <div className="flex gap-4 mb-8">
          <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
            <RefreshCw size={16} /> Update Status
          </button>
          <button className="flex-1 bg-[#334155] hover:bg-slate-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
            <UserPlus size={16} /> Assign
          </button>
        </div>

        {/* Chat Title */}
        <h2 className="text-sm font-bold mb-3 text-slate-300">
          Student Chat
        </h2>

        {/* Chat Messages */}
        <div className="space-y-4 mb-6">
          {chatMessages.map((msg) => {
            const isStaff = msg.from === "staff";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  isStaff ? "justify-end" : ""
                }`}
              >
                {!isStaff && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0 mt-1" />
                )}

                <div
                  className={`flex flex-col ${
                    isStaff ? "items-end" : "items-start"
                  } max-w-[80%]`}
                >
                  <div
                    className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      isStaff
                        ? "bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-none"
                        : "bg-[#334155] text-slate-200 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {isStaff && (
                  <div className="w-8 h-8 rounded-full bg-blue-900 overflow-hidden shrink-0 mt-1 border border-blue-700" />
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A] p-4 border-t border-white/5 flex gap-3 max-w-md mx-auto">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message to student..."
          className="flex-1 bg-[#1E293B] text-white rounded-full px-5 py-3.5 outline-none placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-blue-600/50 transition-all"
        />
        <button
          onClick={handleSendMessage}
          disabled={!chatInput.trim()}
          className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
};
