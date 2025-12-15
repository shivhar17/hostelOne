import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Volume2,
  Users,
  ArrowRight,
  Moon,
  Sun,
  Loader2,
  BedDouble,
  WashingMachine,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

interface MenuData {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  const [userProfile, setUserProfile] = useState({
    name: "Student",
    photo: "https://picsum.photos/100/100?random=10",
  });

  const [studentId, setStudentId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // realtime mess menu
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // pull-to-refresh
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const startY = useRef(0);

  // announcement notification helpers
  const announcementsInitializedRef = useRef(false);
  const previousUnreadCountRef = useRef(0);

  // theme toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // load user from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    const savedStudent = localStorage.getItem("student");

    let name = "Student";
    let photo = "https://picsum.photos/100/100?random=10";
    let id: string | null = null;

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        name = parsed.name || name;
        photo = parsed.photo || photo;
        id = parsed.id || null;
      } catch {
        /* ignore */
      }
    } else if (savedStudent) {
      try {
        const parsed = JSON.parse(savedStudent);
        name = parsed.name || name;
        id = parsed.studentId || null;
      } catch {
        /* ignore */
      }
    }

    setUserProfile({ name, photo });
    setStudentId(id);
  }, []);

  // realtime mess menu listener (big card)
  useEffect(() => {
    const ref = doc(db, "messMenu", "today");

    const unsub = onSnapshot(
      ref,
      (snap) => {
        setMenuLoading(false);

        if (!snap.exists()) {
          setMenu(null);
          setLastUpdated(null);
          return;
        }

        const data = snap.data() as any;
        const breakfast = (data.breakFast || []) as string[];
        const lunch = (data.Lunch || []) as string[];
        const dinner = (data.dinner || []) as string[];

        setMenu({ breakfast, lunch, dinner });
        setLastUpdated(data.lastUpdated || null);
      },
      (error) => {
        console.error("Menu listener error:", error);
        setMenuLoading(false);
        setMenu(null);
        setLastUpdated(null);
      }
    );

    return () => unsub();
  }, [refreshKey]);

  // 🔔 unread announcements + small browser notification
  useEffect(() => {
    if (!studentId) return;

    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        let count = 0;
        let latestTitle: string | null = null;
        let latestMessage: string | null = null;

        // ✅ FIX: use snapshot.docs.forEach to get index
        snapshot.docs.forEach((docSnap, index) => {
          const data = docSnap.data() as any;
          const readBy: string[] = data.readBy || [];

          if (!readBy.includes(studentId)) count += 1;

          if (index === 0) {
            latestTitle = data.title || "New announcement";
            latestMessage = data.message || "";
          }
        });

        setUnreadCount(count);

        // show notification only after first load
        if (announcementsInitializedRef.current) {
          const previous = previousUnreadCountRef.current;

          if (
            count > previous &&
            typeof window !== "undefined" &&
            "Notification" in window
          ) {
            if (Notification.permission === "granted") {
              try {
                new Notification(latestTitle || "New announcement", {
                  body: latestMessage || "",
                  icon: "/icons/icon-192.png",
                });
              } catch (err) {
                console.error("Notification error:", err);
              }
            } else if (Notification.permission === "default") {
              Notification.requestPermission().catch(() => {});
            }
          }
        } else {
          announcementsInitializedRef.current = true;
        }

        previousUnreadCountRef.current = count;
      },
      (err) => {
        console.error("announcement badge/notification error", err);
      }
    );

    return () => unsub();
  }, [studentId]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const getFirstName = (fullName: string) => fullName.split(" ")[0];

  // pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollParent = (e.currentTarget as HTMLElement).closest(
      ".overflow-y-auto"
    );
    const scrollTop = scrollParent ? scrollParent.scrollTop : 0;

    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      setPullY(Math.min(diff * 0.4, 80));
    }
  };

  const handleTouchEnd = () => {
    if (startY.current === 0) return;

    if (pullY > 50) {
      setIsRefreshing(true);
      setPullY(50);
      performRefresh();
    } else {
      setPullY(0);
    }
    startY.current = 0;
  };

  const performRefresh = () => {
    setTimeout(() => {
      setIsRefreshing(false);
      setPullY(0);
      setRefreshKey((prev) => prev + 1);
    }, 1500);
  };

  const breakfastText =
    menu && menu.breakfast.length > 0
      ? menu.breakfast.join(", ")
      : "Menu not published yet";

  const lunchText =
    menu && menu.lunch.length > 0
      ? menu.lunch.join(", ")
      : "Menu not published yet";

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24 transition-colors duration-300"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* pull-to-refresh indicator */}
      <div
        style={{ height: `${pullY}px` }}
        className="overflow-hidden flex items-center justify-center transition-all duration-200 ease-out"
      >
        <div
          className={`transition-transform duration-300 ${
            isRefreshing ? "animate-spin" : ""
          }`}
          style={{ transform: `rotate(${pullY * 2}deg)` }}
        >
          {isRefreshing ? (
            <Loader2 size={24} className="text-teal-500" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-700">
              <ArrowRight size={16} className="text-teal-500 rotate-90" />
            </div>
          )}
        </div>
      </div>

      <div className="pt-12 px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500 p-2 rounded-xl text-white shadow-md shadow-cyan-200 dark:shadow-none relative">
              <BedDouble size={22} strokeWidth={2.5} />
              <div className="absolute -top-1.5 -right-1.5 bg-white text-cyan-500 text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full border-2 border-cyan-500">
                1
              </div>
            </div>
            <span className="text-2xl font-bold text-orange-500 tracking-tight">
              HostelOne
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="relative bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-amber-400" />
              ) : (
                <Moon size={20} className="text-slate-600 dark:text-slate-300" />
              )}
            </button>

            <div
              onClick={() => navigate("/profile")}
              className="bg-orange-100 dark:bg-orange-900/40 p-1 rounded-full transition-colors cursor-pointer active:scale-95"
            >
              <img
                src={userProfile.photo}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800"
              />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 transition-colors">
          Hi, {getFirstName(userProfile.name)}!
        </h1>

        {/* BIG Today’s Menu card (kept) */}
        <motion.div
          key={refreshKey}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => navigate("/mess")}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm mb-8 relative overflow-hidden group cursor-pointer transition-colors duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-slate-700/50 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                Today&apos;s Menu
              </div>
              {lastUpdated && (
                <span className="text-[11px] text-slate-400">
                  Updated: {lastUpdated}
                </span>
              )}
            </div>

            {/* Breakfast */}
            <div className="mb-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
                Breakfast
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-100">
                {menuLoading ? "Loading..." : breakfastText}
              </p>
            </div>

            {/* Lunch */}
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
                Lunch
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-100">
                {menuLoading ? "Loading..." : lunchText}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* SMALL Laundry card */}
          <MenuButton
            icon={WashingMachine}
            label="Laundry"
            subLabel="Book your slot"
            color="bg-cyan-50 dark:bg-cyan-900/20"
            iconColor="text-cyan-600 dark:text-cyan-400"
            onClick={() => navigate("/laundry")}
          />

          <MenuButton
            icon={Volume2}
            label="Announcements"
            subLabel="Latest updates"
            color="bg-blue-50 dark:bg-blue-900/20"
            iconColor="text-blue-600 dark:text-blue-400"
            onClick={() => navigate("/announcements")}
            badgeCount={unreadCount}
          />

          <MenuButton
            icon={Wrench}
            label="Maintenance"
            subLabel="Request a repair"
            color="bg-purple-50 dark:bg-purple-900/20"
            iconColor="text-purple-600 dark:text-purple-400"
            onClick={() => navigate("/maintenance")}
          />

          <MenuButton
            icon={Users}
            label="Community"
            subLabel="Chat & Support"
            color="bg-orange-50 dark:bg-orange-900/20"
            iconColor="text-orange-600 dark:text-orange-400"
            onClick={() => navigate("/community")}
          />
        </div>
      </div>
    </div>
  );
};

interface MenuButtonProps {
  icon: React.ElementType;
  label: string;
  subLabel: string;
  color: string;
  iconColor: string;
  onClick: () => void;
  badgeCount?: number;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  icon: Icon,
  label,
  subLabel,
  color,
  iconColor,
  onClick,
  badgeCount = 0,
}) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`${color} relative p-5 rounded-[1.5rem] flex flex-col items-start text-left h-40 justify-between transition-all hover:shadow-md border border-transparent dark:border-white/5`}
  >
    {badgeCount > 0 && (
      <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        {badgeCount}
      </div>
    )}

    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-sm transition-colors">
      <Icon className={iconColor} size={24} />
    </div>
    <div>
      <h3 className="text-slate-800 dark:text-slate-100 font-bold text-lg leading-tight mb-1">
        {label}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
        {subLabel}
      </p>
    </div>
  </motion.button>
);
