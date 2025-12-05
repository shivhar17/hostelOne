import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, ThumbsUp, ThumbsDown, Meh, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNutritionalInfo } from '../services/geminiService';

const TabButton = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
      active ? 'bg-teal-400 text-white shadow-lg shadow-teal-200' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    {label}
  </button>
);

type MealType = 'breakfast' | 'lunch' | 'dinner';
type ReactionType = 'like' | 'meh' | 'dislike';

interface RatingState {
  like: number;
  meh: number;
  dislike: number;
  userSelection: ReactionType | null;
}

interface MenuItem {
    name: string;
    image?: string;
}

interface MenuData {
    breakfast: MenuItem[];
    lunch: MenuItem[];
    dinner: MenuItem[];
}

const initialRatings: Record<MealType, RatingState> = {
  breakfast: { like: 12, meh: 5, dislike: 2, userSelection: 'like' },
  lunch: { like: 45, meh: 12, dislike: 4, userSelection: null },
  dinner: { like: 0, meh: 0, dislike: 0, userSelection: null }
};

export const MessMenu: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Today');
  const [nutrition, setNutrition] = useState<string | null>(null);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  
  // Menu Data State
  const [menu, setMenu] = useState<MenuData>({
    breakfast: [{ name: 'Aloo Paratha' }, { name: 'Curd' }, { name: 'Pickle' }, { name: 'Tea' }],
    lunch: [{ name: 'Rajma' }, { name: 'Rice' }, { name: 'Roti' }, { name: 'Salad' }],
    dinner: [{ name: 'Paneer Butter Masala' }, { name: 'Roti' }, { name: 'Rice' }, { name: 'Sweet' }]
  });

  // Load ratings
  const [ratings, setRatings] = useState<Record<MealType, RatingState>>(() => {
    const saved = localStorage.getItem('messRatings');
    return saved ? JSON.parse(saved) : initialRatings;
  });

  useEffect(() => {
    const savedMenu = localStorage.getItem('messMenuData');
    if (savedMenu) {
        try {
            const parsed = JSON.parse(savedMenu);
            // Check if it matches expected structure and normalize
            const normalize = (items: any[]): MenuItem[] => 
                items.map(i => (typeof i === 'string' ? { name: i } : i));

            if (parsed.breakfast || parsed.lunch || parsed.dinner) {
                setMenu({
                    breakfast: normalize(parsed.breakfast || []),
                    lunch: normalize(parsed.lunch || []),
                    dinner: normalize(parsed.dinner || [])
                });
            }
        } catch (e) {
            console.error("Failed to parse menu data", e);
        }
    }
  }, []);

  const fetchNutrition = async () => {
    setLoadingNutrition(true);
    // Use dynamic lunch items
    const items = menu.lunch.map(i => i.name);
    const info = await getNutritionalInfo(items);
    setNutrition(info);
    setLoadingNutrition(false);
  };

  const handleRate = (meal: MealType, type: ReactionType) => {
    setRatings(prev => {
      const currentMealRatings = { ...prev[meal] };
      const currentSelection = currentMealRatings.userSelection;

      if (currentSelection === type) {
        currentMealRatings[type] = Math.max(0, currentMealRatings[type] - 1);
        currentMealRatings.userSelection = null;
      } else {
        if (currentSelection) {
          currentMealRatings[currentSelection] = Math.max(0, currentMealRatings[currentSelection] - 1);
        }
        currentMealRatings[type] += 1;
        currentMealRatings.userSelection = type;
      }

      const newRatings = { ...prev, [meal]: currentMealRatings };
      localStorage.setItem('messRatings', JSON.stringify(newRatings));
      return newRatings;
    });
  };

  const renderMealSection = (title: string, type: MealType, colorClass: string, icon: string, time: string, hasNutrition = false) => {
      const items = menu[type];
      const featuredImage = items.find(i => i.image)?.image || `https://picsum.photos/600/400?random=${type}`;
      const itemList = items.map(i => i.name).join(', ');

      return (
        <div className={`bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm transition-colors duration-300 ${hasNutrition ? 'border-2 border-teal-500/10 dark:border-teal-500/20' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
             <span className={colorClass}>{icon}</span>
             <h3 className="font-bold text-lg text-slate-800 dark:text-white">{title}</h3>
             <span className="text-xs font-medium text-slate-400 ml-auto">{time}</span>
          </div>
          
          <div className="mb-4">
             {items.some(i => i.image) ? (
                 <div className="grid grid-cols-4 gap-2 mb-3">
                     {items.map((item, idx) => (
                         <div key={idx} className="flex flex-col items-center text-center">
                             {item.image ? (
                                <img src={item.image} className="w-14 h-14 rounded-xl object-cover shadow-sm mb-1" alt={item.name} />
                             ) : (
                                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1">
                                    <span className="text-xs text-slate-400 font-bold">{item.name.charAt(0)}</span>
                                </div>
                             )}
                             <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight line-clamp-2">{item.name}</span>
                         </div>
                     ))}
                 </div>
             ) : (
                 <>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">{itemList}</p>
                    <div className="h-48 rounded-2xl overflow-hidden mb-4 relative group">
                        <img src={featuredImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                 </>
             )}
          </div>

          {hasNutrition && (
            <>
                <button 
                    onClick={fetchNutrition}
                    disabled={loadingNutrition}
                    className="text-xs text-teal-600 dark:text-teal-400 font-semibold mb-4 hover:underline"
                >
                    {loadingNutrition ? 'Asking Chef Bot...' : '✨ View Nutrition Info'}
                </button>
                {nutrition && (
                    <div className="bg-teal-50 dark:bg-teal-900/30 p-3 rounded-xl mb-4 text-xs text-teal-800 dark:text-teal-200 leading-relaxed animate-in fade-in duration-300">
                    {nutrition}
                    </div>
                )}
            </>
          )}

          <div className="flex justify-between items-center">
             <div className="flex gap-2">
                <RatingButton 
                  icon={ThumbsUp} 
                  count={ratings[type].like} 
                  active={ratings[type].userSelection === 'like'} 
                  onClick={() => handleRate(type, 'like')}
                />
                <RatingButton 
                  icon={Meh} 
                  count={ratings[type].meh} 
                  active={ratings[type].userSelection === 'meh'} 
                  onClick={() => handleRate(type, 'meh')}
                />
                <RatingButton 
                  icon={ThumbsDown} 
                  count={ratings[type].dislike} 
                  active={ratings[type].userSelection === 'dislike'} 
                  onClick={() => handleRate(type, 'dislike')}
                />
             </div>
             {hasNutrition && (
                <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Hygiene Rating</div>
                    <div className="text-lg font-bold text-slate-800 dark:text-white">4.5<span className="text-slate-400 text-sm">/5</span></div>
                </div>
             )}
          </div>
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-6 pt-12 pb-6 shadow-sm sticky top-0 z-20 transition-colors duration-300">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="text-slate-800 dark:text-white" size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Mess Menu</h1>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full transition-colors">
          <TabButton active={activeTab === 'Yesterday'} label="Yesterday" onClick={() => setActiveTab('Yesterday')} />
          <TabButton active={activeTab === 'Today'} label="Today" onClick={() => setActiveTab('Today')} />
          <TabButton active={activeTab === 'Tomorrow'} label="Tomorrow" onClick={() => setActiveTab('Tomorrow')} />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {renderMealSection('Breakfast', 'breakfast', 'text-amber-500', '🥞', '7:30 AM - 9:00 AM')}
        {renderMealSection('Lunch', 'lunch', 'text-green-500', '🥗', '12:30 PM - 2:00 PM', true)}
        {renderMealSection('Dinner', 'dinner', 'text-blue-500', '🍛', '7:30 PM - 9:00 PM')}
      </div>
    </div>
  );
};

const RatingButton = ({ icon: Icon, count, active, onClick }: { icon: any; count: number; active?: boolean; onClick: () => void }) => (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
    active 
      ? 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 ring-2 ring-teal-500/20' 
      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
  }`}>
    <Icon size={14} className={active ? "fill-current" : ""} /> 
    <span key={count} className="animate-in fade-in zoom-in duration-300">{count}</span>
  </button>
);