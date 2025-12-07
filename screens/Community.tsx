// src/screens/Community.tsx
import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { ChevronLeft, Send, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

interface Message {
  id: string;
  text: string;
  from: "staff" | "student";
  time: string;
  isMe: boolean;
  createdAtMillis: number;
}

export const Community: React.FC = () => {
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load student + avatar from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.photo) setUserPhoto(parsed.photo);
      } catch {
        // ignore
      }
    }

    const savedStudent = localStorage.getItem("student");
    if (savedStudent) {
      try {
        const parsed = JSON.parse(savedStudent);
        if (parsed.studentId) setStudentId(parsed.studentId);
      } catch {
        // ignore
      }
    }
  }, []);

  const getMillis = (ts: any): number => {
    if (!ts) return 0;
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts.seconds === "number") return ts.seconds * 1000;
    return 0;
  };

  // Real-time chat for this student (Maintenance Support)
  useEffect(() => {
    if (!studentId) return;

    const q = query(
      collection(db, "maintenanceChats"),
      where("studentId", "==", studentId)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          const fromStaff = data.from === "staff";

          const createdAt = data.createdAt;
          const millis = getMillis(createdAt);

          const dateObj =
            createdAt && typeof createdAt.toDate === "function"
              ? createdAt.toDate()
              : null;

          const time = dateObj
            ? dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return {
            id: d.id,
            text: data.text || "",
            from: fromStaff ? "staff" : "student",
            time,
            isMe: !fromStaff,
            createdAtMillis: millis,
          };
        });

        msgs.sort((a, b) => a.createdAtMillis - b.createdAtMillis);
        setMessages(msgs);
      },
      (err) => console.error("maintenance chat error", err)
    );

    return () => unsub();
  }, [studentId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !studentId) return;

    try {
      await addDoc(collection(db, "maintenanceChats"), {
        complaintId: null,
        studentId,
        text: inputText.trim(),
        from: "student",
        createdAt: serverTimestamp(),
      });

      setInputText("");
    } catch (e) {
      console.error("Failed to send support message:", e);
      alert("Failed to send message. Try again.");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  return (
    <div className="h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-white">
      <div className="h-full relative">
        {/* 🔝 Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-10 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#020617]/90 backdrop-blur">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft
              size={24}
              className="text-slate-700 dark:text-slate-200"
            />
          </button>
          <div className="flex flex-col items-center">
            <p className="text-sm font-bold">Maintenance Support</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Chat with hostel maintenance staff
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="User"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-600 dark:text-slate-300">
                You
              </div>
            )}
          </div>
        </div>

        {/* 💬 Scrollable messages area (between header & input+nav) */}
        <div
          className="
            h-full overflow-y-auto px-4 space-y-3 
            bg-slate-50 dark:bg-[#020617] 
            pt-[88px] 
            pb-[120px]  /* space for input bar + bottom nav */
          "
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-10 text-xs text-slate-500 dark:text-slate-400">
              <MessageCircle
                size={28}
                className="mb-2 text-slate-400 dark:text-slate-600"
              />
              <p>No messages yet.</p>
              <p>Start by asking about your maintenance complaint.</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  msg.isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-200 text-slate-900 rounded-bl-none dark:bg-slate-800 dark:text-slate-100"
                }`}
              >
                <p>{msg.text}</p>
                {msg.time && (
                  <p className="text-[9px] text-slate-500 dark:text-slate-300/70 mt-1 text-right">
                    {msg.time}
                  </p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 🔻 Fixed input bar ABOVE bottom nav */}
        {/* bottom-16 = 64px; adjust if your nav taller/shorter */}
        <div className="fixed left-0 right-0 bottom-16 z-20 px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617] flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900">
            <MessageCircle
              size={18}
              className="text-slate-500 dark:text-slate-400"
            />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message to maintenance staff..."
            className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full px-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/60"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || !studentId}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

