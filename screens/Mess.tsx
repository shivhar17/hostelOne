import React, { useState, useEffect } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNutritionalInfo } from '../services/geminiService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

type MealType = 'breakfast' | 'lunch' | 'dinner';
type ReactionType = 'like' | 'meh' | 'dislike';

interface MenuItem {
  name: string;
  image?: string; // optional
}

interface MenuData {
  breakfast: MenuItem[];
  lunch: MenuItem[];
  dinner: MenuItem[];
}

export const MessMenu: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Today');

  const [menu, setMenu] = useState<MenuData>({
    breakfast: [],
    lunch: [],
    dinner: []
  });

  const [nutrition, setNutrition] = useState<string | null>(null);
  const [loadingNutrition, setLoadingNutrition] = useState(false);

  // Load Mess Menu from Firestore ONLY
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const d = new Date();
        if (activeTab === "Yesterday") d.setDate(d.getDate() - 1);
        if (activeTab === "Tomorrow") d.setDate(d.getDate() + 1);

        const dateKey = d.toISOString().split("T")[0];
        const ref = doc(db, "messMenu", dateKey);

        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as any;

          const clean = (items: any[]): MenuItem[] =>
            items.map(i => (typeof i === "string" ? { name: i } : i));

          setMenu({
            breakfast: clean(data.breakfast || []),
            lunch: clean(data.lunch || []),
            dinner: clean(data.dinner || [])
          });

        } else {
          // If no menu for this day → empty, NOT fallback
          setMenu({
            breakfast: [],
            lunch: [],
            dinner: []
          });
        }
      } catch (e) {
        console.log("Error loading menu:", e);
      }
    };

    loadMenu();
  }, [activeTab]);

  const fetchNutrition = async () => {
    setLoadingNutrition(true);
    const items = menu.lunch.map(i => i.name);
    const info = await getNutritionalInfo(items);
    setNutrition(info);
    setLoadingNutrition(false);
  };

  const renderMealCard = (
    title: string,
    key: keyof MenuData,
    time: string
  ) => {
    const items = menu[key];

    return (
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm">
        <div className="flex items-center mb-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <span className="ml-auto text-xs text-slate-500">{time}</span>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {items.map((item, idx) => (
              <div key={idx} className="text-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover shadow"
                  />
                ) : (
                  <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                    <span className="text-xs text-slate-500 dark:text-slate-300">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                )}
                <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 dark:text-slate-500 italic">No items added.</p>
        )}

        {key === "lunch" && (
          <>
            <button
              onClick={fetchNutrition}
              className="text-xs text-teal-600 dark:text-teal-400 font-semibold"
            >
              {loadingNutrition ? "Loading..." : "✨ View Nutrition Info"}
            </button>

            {nutrition && (
              <div className="bg-teal-50 dark:bg-teal-900/30 mt-3 p-3 rounded-xl text-xs text-teal-800 dark:text-teal-200">
                {nutrition}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20">
      <div className="p-5 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} className="text-slate-900 dark:text-white" />
        </button>
        <h1 className="text-xl font-bold mt-3 text-slate-900 dark:text-white">Mess Menu</h1>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 mt-4 rounded-full">
          {["Yesterday", "Today", "Tomorrow"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold ${
                activeTab === tab
                  ? "bg-teal-500 text-white"
                  : "text-slate-500 dark:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {renderMealCard("Breakfast", "breakfast", "7:30 AM - 9:00 AM")}
        {renderMealCard("Lunch", "lunch", "12:30 PM - 2:00 PM")}
        {renderMealCard("Dinner", "dinner", "7:30 PM - 9:00 PM")}
      </div>
    </div>
  );
};
