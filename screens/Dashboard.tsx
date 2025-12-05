import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Wrench, Volume2, Users, ArrowRight, Moon, Sun, Loader2, BedDouble } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  // ✅ Will be filled from localStorage (userProfile OR student)
  const [userProfile, setUserProfile] = useState({
    name: 'Student',
    photo: 'https://picsum.photos/100/100?random=10',
  });

  // Pull to refresh state
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const startY = useRef(0);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // ✅ Load name/photo from localStorage so greeting uses entered name
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedStudent = localStorage.getItem('student');

    let name = 'Student';
    let photo = 'https://picsum.photos/100/100?random=10';

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        name = parsed.name || name;
        photo = parsed.photo || photo;
      } catch {
        // ignore parse errors
      }
    } else if (savedStudent) {
      try {
        const parsed = JSON.parse(savedStudent);
        name = parsed.name || name;
      } catch {
        // ignore
      }
    }

    setUserProfile({ name, photo });
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const getFirstName = (fullName: string) => fullName.split(' ')[0];

  // Pull to refresh handlers (unchanged)
  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollParent = (e.currentTarget as HTMLElement).closest('.overflow-y-auto');
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

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24 transition-colors duration-300"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Refresh Indicator */}
      <div
        style={{ height: `${pullY}px` }}
        className="overflow-hidden flex items-center justify-center transition-all duration-200 ease-out"
      >
        <div
          className={`transition-transform duration-300 ${
            isRefreshing ? 'animate-spin' : ''
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
          {/* Logo Section */}
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
              onClick={() => navigate('/profile')}
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

        {/* ✅ Greeting with entered name */}
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 transition-colors">
          Good Morning, {getFirstName(userProfile.name)}!
        </h1>

        {/* rest of your original Dashboard (unchanged) */}
        {/* Menu Card */}
        <motion.div
          key={refreshKey}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => navigate('/mess')}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm mb-8 relative overflow-hidden group cursor-pointer transition-colors duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-slate-700/50 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                Today's Menu
              </div>
              <img
                src={`https://picsum.photos/150/150?random=food${refreshKey}`}
                className="w-20 h-20 object-cover rounded-full shadow-md border-4 border-white dark:border-slate-700"
                alt="Food"
              />
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase block mb-1">
                  Breakfast
                </span>
                <p className="text-slate-700 dark:text-slate-200 font-medium">
                  Poha, Tea, Toast
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase block mb-1">
                  Lunch
                </span>
                <p className="text-slate-700 dark:text-slate-200 font-medium">
                  Roti, Dal Fry, Jeera Rice, Salad
                </p>
              </div>
            </div>

            <div className="mt-5 text-teal-500 dark:text-teal-400 font-semibold text-sm flex items-center gap-1">
              View full menu <ArrowRight size={16} />
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4">
          <MenuButton
            icon={Utensils}
            label="Mess Menu"
            subLabel="Rate today's meal"
            color="bg-emerald-50 dark:bg-emerald-900/20"
            iconColor="text-emerald-600 dark:text-emerald-400"
            onClick={() => navigate('/mess')}
          />
          <MenuButton
            icon={Volume2}
            label="Announcements"
            subLabel="Latest updates"
            color="bg-blue-50 dark:bg-blue-900/20"
            iconColor="text-blue-600 dark:text-blue-400"
            onClick={() => navigate('/announcements')}
          />
          <MenuButton
            icon={Wrench}
            label="Maintenance"
            subLabel="Request a repair"
            color="bg-purple-50 dark:bg-purple-900/20"
            iconColor="text-purple-600 dark:text-purple-400"
            onClick={() => navigate('/maintenance')}
          />
          <MenuButton
            icon={Users}
            label="Community"
            subLabel="Events & Groups"
            color="bg-orange-50 dark:bg-orange-900/20"
            iconColor="text-orange-600 dark:text-orange-400"
            onClick={() => navigate('/community')}
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
}

const MenuButton: React.FC<MenuButtonProps> = ({
  icon: Icon,
  label,
  subLabel,
  color,
  iconColor,
  onClick,
}) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`${color} p-5 rounded-[1.5rem] flex flex-col items-start text-left h-40 justify-between transition-all hover:shadow-md border border-transparent dark:border-white/5`}
  >
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
