import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import {
  Search,
  MessageCircle,
  Send,
  MoreVertical,
  Phone,
  Video,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: "Support" | "Group" | "Direct";
}

interface Message {
  id: number | string;
  text: string;
  sender: string;
  time: string;
  isMe: boolean;
}

export const Community: React.FC = () => {
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const [chats, setChats] = useState<Chat[]>([
    {
      id: "support",
      name: "Maintenance Support",
      lastMessage: "Need help with your room?",
      time: "Now",
      unread: 0,
      type: "Support",
    },
    {
      id: "general",
      name: "Hostel General",
      lastMessage: "Welcome to the hostel community!",
      time: "Today",
      unread: 0,
      type: "Group",
    },
  ]);

  const [activeChat, setActiveChat] = useState<Chat | null>(chats[0]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    general: [
      {
        id: 1,
        text: "Welcome to HostelOne community chat 👋",
        sender: "Admin",
        time: "09:00 AM",
        isMe: false,
      },
    ],
  });

  // 🔹 Messages synced with Firestore for Maintenance Support
  const [maintenanceMessages, setMaintenanceMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load student + avatar from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      if (parsed.photo) setUserPhoto(parsed.photo);
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

  // 🔥 Real-time Maintenance Support chat for this student
  useEffect(() => {
    if (!studentId) return;

    const q = query(
      collection(db, "maintenanceChats"),
      where("studentId", "==", studentId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          const fromStaff = data.from === "staff";

          const createdAt = data.createdAt?.toDate
            ? data.createdAt.toDate()
            : null;
          const time = createdAt
            ? createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return {
            id: d.id,
            text: data.text || "",
            sender: fromStaff ? "Staff" : "You",
            time,
            isMe: !fromStaff,
          };
        });

        setMaintenanceMessages(msgs);

        // Update "lastMessage" preview in chats list
        if (msgs.length > 0) {
          const last = msgs[msgs.length - 1];
          setChats((prev) =>
            prev.map((c) =>
              c.id === "support"
                ? {
                    ...c,
                    lastMessage:
                      (last.isMe ? "You: " : "Staff: ") + last.text,
                    time: last.time || "Now",
                  }
                : c
            )
          );
        }
      },
      (err) => console.error("maintenance chat error", err)
    );

    return () => unsub();
  }, [studentId]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [maintenanceMessages, messages, activeChat]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChat) return;

    // 🔹 For Maintenance Support, send to Firestore
    if (activeChat.id === "support") {
      if (!studentId) {
        alert("Missing student ID. Please log in again.");
        return;
      }

      try {
        await addDoc(collection(db, "maintenanceChats"), {
          complaintId: null, // generic support; specific complaint chat is from staff side
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

      return;
    }

    // 🔹 For other chats: local-only mock messages
    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: "You",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
    };

    setMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage],
    }));

    const updatedChats = chats.map((c) =>
      c.id === activeChat.id
        ? { ...c, lastMessage: `You: ${inputText}`, time: "Just now" }
        : c
    );
    setChats(updatedChats);

    setInputText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    // optional future filter; currently not used to filter list
    void e;
  };

  // Decide which messages to show for current chat
  let currentMessages: Message[] = [];
  if (activeChat) {
    if (activeChat.id === "support") {
      currentMessages = maintenanceMessages;
    } else {
      currentMessages = messages[activeChat.id] || [];
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft size={24} className="text-slate-200" />
        </button>
        <h1 className="text-lg font-bold">Community</h1>
        <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
          {userPhoto ? (
            <img
              src={userPhoto}
              alt="User"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-300">
              You
            </div>
          )}
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="px-4 pb-3 space-y-3">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search chats or groups"
            onChange={handleSearchChange}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-full py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/60"
          />
        </div>
      </div>

      {/* Layout: Chats list + Active Chat */}
      <div className="flex-1 flex flex-col md:flex-row border-t border-slate-800">
        {/* Chat List */}
        <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-slate-800 overflow-y-auto">
          <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-400">
            <span>Chats</span>
            <button className="text-[10px] px-2 py-1 rounded-full border border-slate-700 hover:bg-slate-800">
              New
            </button>
          </div>

          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-900/80 transition-colors ${
                activeChat?.id === chat.id ? "bg-slate-900" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-sm font-bold">
                {chat.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1 text-left">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold">{chat.name}</span>
                  <span className="text-[10px] text-slate-500">
                    {chat.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 truncate max-w-[150px]">
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <span className="min-w-[18px] h-[18px] rounded-full bg-blue-600 text-[10px] flex items-center justify-center ml-2">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Active Chat Window */}
        <div className="md:flex-1 flex flex-col bg-[#020617]">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-xs font-bold">
                    {activeChat.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold">
                        {activeChat.name}
                      </p>
                      {activeChat.id === "support" && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/40">
                          Staff
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {activeChat.id === "support"
                        ? "Chat with hostel staff about your complaints"
                        : "Group chat"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-full hover:bg-slate-900">
                    <Phone size={18} className="text-slate-400" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-slate-900">
                    <Video size={18} className="text-slate-400" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-slate-900">
                    <MoreVertical size={18} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {currentMessages.length === 0 && (
                  <div className="text-center text-xs text-slate-500 mt-8">
                    {activeChat.id === "support"
                      ? "No messages yet. Ask hostel staff about your maintenance complaint."
                      : "No messages yet. Say hi!"}
                  </div>
                )}

                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        msg.isMe
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-slate-800 text-slate-100 rounded-bl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.time && (
                        <p className="text-[9px] text-slate-300/70 mt-1 text-right">
                          {msg.time}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-slate-800 flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-slate-900">
                  <MessageCircle size={18} className="text-slate-400" />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    activeChat.id === "support"
                      ? "Type a message to hostel staff..."
                      : "Type a message..."
                  }
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/60"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send size={18} className="text-white" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
              <MessageCircle size={32} className="mb-2 text-slate-600" />
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
