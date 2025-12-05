import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Plus, Check, Camera, Image as ImageIcon } from 'lucide-react';

interface MenuItem {
  name: string;
  image?: string;
}

interface MenuData {
  breakfast: MenuItem[];
  lunch: MenuItem[];
  dinner: MenuItem[];
}

export const EditMessMenu: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
  const [menu, setMenu] = useState<MenuData>({
    breakfast: [{ name: 'Oatmeal' }, { name: 'Scrambled Eggs' }],
    lunch: [{ name: 'Chicken Curry' }, { name: 'Steamed Rice' }, { name: 'Garden Salad' }],
    dinner: [{ name: 'Lentil Soup' }]
  });

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Load existing menu if available
    const savedMenu = localStorage.getItem('messMenuData');
    if (savedMenu) {
        try {
            const parsed = JSON.parse(savedMenu);
            // Helper to normalize data to always be MenuItem objects
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
            console.error("Failed to load menu", e);
        }
    }
  }, []);

  const handlePublish = () => {
    // Filter out empty items before saving
    const cleanMenu: MenuData = {
        breakfast: menu.breakfast.filter(i => i.name.trim() !== ''),
        lunch: menu.lunch.filter(i => i.name.trim() !== ''),
        dinner: menu.dinner.filter(i => i.name.trim() !== '')
    };

    // Save the full object structure to local storage
    localStorage.setItem('messMenuData', JSON.stringify(cleanMenu));

    setShowSuccess(true);
    setTimeout(() => {
        setShowSuccess(false);
        navigate('/staff-dashboard');
    }, 2000);
  };

  const addItem = (meal: keyof MenuData) => {
    setMenu(prev => ({
        ...prev,
        [meal]: [...prev[meal], { name: '' }]
    }));
  };

  const updateItemName = (meal: keyof MenuData, index: number, newName: string) => {
    const newItems = [...menu[meal]];
    newItems[index] = { ...newItems[index], name: newName };
    setMenu(prev => ({ ...prev, [meal]: newItems }));
  };

  const updateItemImage = (meal: keyof MenuData, index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newItems = [...menu[meal]];
      newItems[index] = { ...newItems[index], image: reader.result as string };
      setMenu(prev => ({ ...prev, [meal]: newItems }));
    };
    reader.readAsDataURL(file);
  };

  const removeItem = (meal: keyof MenuData, index: number) => {
    const newItems = [...menu[meal]];
    newItems.splice(index, 1);
    setMenu(prev => ({ ...prev, [meal]: newItems }));
  };

  const triggerFileInput = (meal: string, index: number) => {
    const key = `${meal}-${index}`;
    fileInputRef.current[key]?.click();
  };

  const renderMealSection = (title: string, meal: keyof MenuData) => (
    <div>
        <h2 className="font-bold text-lg mb-4 text-slate-200">{title}</h2>
        <div className="space-y-3">
            {menu[meal].map((item, idx) => (
                <div key={idx} className="bg-[#1E293B] p-3 rounded-xl flex gap-3 items-center group border border-slate-700/50 focus-within:border-blue-500/50 transition-colors">
                    
                    {/* Image Preview / Upload Button */}
                    <div className="shrink-0 relative">
                        <input 
                            type="file" 
                            className="hidden"
                            accept="image/*"
                            ref={(el) => { if(el) fileInputRef.current[`${meal}-${idx}`] = el; }}
                            onChange={(e) => e.target.files?.[0] && updateItemImage(meal, idx, e.target.files[0])}
                        />
                        <button 
                            onClick={() => triggerFileInput(meal, idx)}
                            className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 overflow-hidden hover:border-slate-500 transition-colors group/btn"
                        >
                            {item.image ? (
                                <img src={item.image} alt="Item" className="w-full h-full object-cover" />
                            ) : (
                                <Camera size={18} className="text-slate-500 group-hover/btn:text-slate-300" />
                            )}
                        </button>
                    </div>

                    {/* Text Input */}
                    <div className="flex-1 min-w-0">
                        <input 
                            value={item.name}
                            onChange={(e) => updateItemName(meal, idx, e.target.value)}
                            className="bg-transparent outline-none text-white font-medium w-full placeholder:text-slate-600 h-full py-2"
                            placeholder="Item name (e.g. Paneer Tikka)"
                            autoFocus={!item.name}
                        />
                    </div>

                    {/* Actions */}
                    <button onClick={() => removeItem(meal, idx)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            <button 
                onClick={() => addItem(meal)}
                className="w-full border-2 border-dashed border-slate-700 rounded-xl p-3 flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-800/50 hover:border-slate-600 transition-all active:scale-95"
            >
                <Plus size={18} /> Add Item
            </button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24 relative">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4 bg-[#0F172A] sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={24} />
        </button>
        <div>
            <h1 className="text-xl font-bold">Edit Mess Menu</h1>
        </div>
      </div>

      <div className="px-6 mb-8 mt-6">
        <label className="text-slate-400 text-sm block mb-2 font-medium">Select Date</label>
        <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="px-6 space-y-8">
        {renderMealSection('Breakfast', 'breakfast')}
        {renderMealSection('Lunch', 'lunch')}
        {renderMealSection('Dinner', 'dinner')}
      </div>

      {/* Action Footer */}
      <div className="p-6 mt-6 space-y-3 pb-safe">
        <button 
            onClick={handlePublish}
            className="w-full bg-[#22C55E] hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
            <Check size={20} /> Publish to Students
        </button>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
            <div className="bg-[#1E293B] w-full max-w-sm rounded-3xl p-8 relative z-10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
                    <Check size={48} strokeWidth={3} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Menu Live!</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[200px]">
                    The mess menu has been updated for all students.
                </p>
            </div>
        </div>
      )}
    </div>
  );
};