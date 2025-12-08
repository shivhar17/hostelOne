import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ChevronLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  text: string;
  from: "student" | "staff";
  studentId?: string;
  createdAt?: { seconds: number; nanoseconds: number };
}

export default function Community() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const student = JSON.parse(localStorage.getItem("student") || "{}");
  const studentId = student?.studentId;

  // Auto scroll on update
  const scrollToBottom = () => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 100);
  };

  // 🔥 Real-time message listener
  useEffect(() => {
    const q = query(collection(db, "maintenanceChats"), orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as ChatMessage)
      );

      setMessages(list);
      scrollToBottom();
    });

    return () => unsub();
  }, []);

  // ✉ Send message
  const sendMessage = async () => {
    if (!input.trim()) return;

    await addDoc(collection(db, "maintenanceChats"), {
      text: input,
      from: "student",
      studentId,
      createdAt: serverTimestamp(),
    });

    setInput("");
    scrollToBottom();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#020617] pb-24">

      {/* 🧰 Sticky top header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 pt-10 pb-4
          border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#020617]/90 backdrop-blur">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronLeft size={24} className="text-slate-700 dark:text-slate-200" />
        </button>

        <div className="flex flex-col items-center">
          <p className="text-base font-bold">Maintenance Support</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Chat with hostel staff</p>
        </div>

        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <img src="/support.png" alt="support" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* 💬 Messages container scrollable */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50 dark:bg-[#020617]"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === "student" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-3 py-2 text-sm rounded-2xl shadow
                ${m.from === "student"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-slate-300 dark:bg-slate-700 text-black dark:text-white rounded-bl-none"
                }`}
            >
              <p>{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ✍ Input and send button fixed above bottom navigation */}
      <div className="fixed bottom-16 left-0 w-full px-4 py-3 flex items-center gap-3
            bg-white dark:bg-[#020617] border-t border-slate-200 dark:border-slate-700">
        <input
          className="flex-1 px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700
          bg-slate-100 dark:bg-slate-800 outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="p-3 rounded-full bg-blue-600 text-white"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

