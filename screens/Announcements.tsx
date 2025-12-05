import React from 'react';
import { ArrowLeft, Utensils, PartyPopper, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const notices = [
  {
    id: 1,
    title: "New Mess Timings",
    time: "2 hours ago",
    type: "Mess",
    icon: Utensils,
    color: "bg-yellow-100",
    darkColor: "dark:bg-yellow-900/20",
    textColor: "text-yellow-700",
    darkTextColor: "dark:text-yellow-400",
    read: false
  },
  {
    id: 2,
    title: "Diwali Holiday Schedule",
    time: "Yesterday",
    type: "Holiday",
    icon: PartyPopper,
    color: "bg-emerald-100",
    darkColor: "dark:bg-emerald-900/20",
    textColor: "text-emerald-700",
    darkTextColor: "dark:text-emerald-400",
    read: true
  },
  {
    id: 3,
    title: "Annual Sports Day Reminder",
    time: "2 days ago",
    type: "Sports",
    icon: AlertCircle,
    color: "bg-red-100",
    darkColor: "dark:bg-red-900/20",
    textColor: "text-red-700",
    darkTextColor: "dark:text-red-400",
    read: true,
    highlight: true
  }
];

export const Announcements: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col transition-colors duration-300">
       <div className="bg-white dark:bg-slate-900 px-6 pt-12 pb-6 shadow-sm flex items-center gap-4 sticky top-0 z-20 transition-colors duration-300">
         <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full">
            <ArrowLeft className="text-slate-800 dark:text-white" size={24} />
         </button>
         <h1 className="text-xl font-bold text-slate-800 dark:text-white">Announcements</h1>
      </div>

      <div className="p-6 space-y-4">
        {notices.map((notice) => (
          <div key={notice.id} className={`bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm flex items-center gap-4 transition-all active:scale-98 ${!notice.read ? 'border-l-4 border-teal-500' : ''}`}>
             <div className={`w-12 h-12 rounded-full flex items-center justify-center ${notice.color} ${notice.darkColor} ${notice.textColor} ${notice.darkTextColor}`}>
                <notice.icon size={20} />
             </div>
             <div className="flex-1">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">{notice.title}</h3>
                <p className="text-xs text-slate-400">Posted {notice.time}</p>
             </div>
             <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${notice.color} ${notice.darkColor} ${notice.textColor} ${notice.darkTextColor}`}>
                {notice.type}
             </div>
             {!notice.read && <div className="w-2 h-2 bg-teal-500 rounded-full"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};