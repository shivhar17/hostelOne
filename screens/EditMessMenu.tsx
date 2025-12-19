import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Camera,
  Check,
} from "lucide-react";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";
import { db } from "../firebase";

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
    breakfast: [],
    lunch: [],
    dinner: [],
  });

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // 🔥 Load existing menu from Firestore (shared across all devices)
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const ref = doc(db, "messMenu", date);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as any;

          const normalize = (items: any[] = []) =>
            items.map((i) =>
              typeof i === "string" ? { name: i } : i
            );

          setMenu({
            breakfast: normalize(data.breakfast || []),
            lunch: normalize(data.lunch || []),
            dinner: normalize(data.dinner || []),
          });
        } else {
          setMenu({ breakfast: [], lunch: [], dinner: [] });
        }
      } catch (err) {
        console.error("Error loading mess menu:", err);
      }
    };

    loadMenu();
  }, [date]);

  // 🔥 Save menu for this date to Firestore (correct field names)
  const handlePublish = async () => {
    const cleanMenu: MenuData = {
      breakfast: menu.breakfast.filter((i) => i.name.trim() !== ""),
      lunch: menu.lunch.filter((i) => i.name.trim() !== ""),
      dinner: menu.dinner.filter((i) => i.name.trim() !== ""),
    };

    try {
      await setDoc(doc(db, "messMenu", date), {
        breakfast: cleanMenu.breakfast,
        lunch: cleanMenu.lunch,
        dinner: cleanMenu.dinner,
        lastUpdated: new Date().toLocaleDateString("en-GB"),
        updatedAt: serverTimestamp(),
      });

      // Add announcement
      await addDoc(collection(db, "announcements"), {
        title: "Mess Menu Updated",
        message: "Today's mess menu has been updated.",
        createdAt: serverTimestamp(),
        type: "mess",
        readBy: [],
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/staff-dashboard");
      }, 1500);
    } catch (e) {
      alert("Failed to publish menu.");
      console.error(e);
    }
  };

  // Helpers
  const addItem = (meal: keyof MenuData) => {
    setMenu((prev) => ({
      ...prev,
      [meal]: [...prev[meal], { name: "" }],
    }));
  };

  const updateItem = (meal: keyof MenuData, index: number, value: string) => {
    const updated = [...menu[meal]];
    updated[index].name = value;
    setMenu({ ...menu, [meal]: updated });
  };

  const updateImage = (meal: keyof MenuData, index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...menu[meal]];
      updated[index].image = reader.result as string;
      setMenu({ ...menu, [meal]: updated });
    };
    reader.readAsDataURL(file);
  };

  const removeItem = (meal: keyof MenuData, index: number) => {
    const updated = [...menu[meal]];
    updated.splice(index, 1);
    setMenu({ ...menu, [meal]: updated });
  };

  const renderSection = (title: string, meal: keyof MenuData) => (
    <div>
      <h3 className="font-semibold text-lg text-slate-200 mb-2">{title}</h3>

      {menu[meal].map((item, idx) => (
        <div
          key={idx}
          className="bg-slate-800 p-3 rounded-xl flex gap-3 items-center mb-2"
        >
          {/* Image upload */}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            ref={(el) => {
              if (el) fileInputRef.current[`${meal}-${idx}`] = el;
            }}
            onChange={(e) =>
              e.target.files?.[0] &&
              updateImage(meal, idx, e.target.files[0])
            }
          />

          <button
            className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden"
            onClick={() => fileInputRef.current[`${meal}-${idx}`]?.click()}
          >
            {item.image ? (
              <img
                src={item.image}
                alt="Food"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="text-slate-400" size={18} />
            )}
          </button>

          {/* Name input */}
          <input
            value={item.name}
            onChange={(e) => updateItem(meal, idx, e.target.value)}
            placeholder="Item name"
            className="flex-1 bg-transparent outline-none text-white"
          />

          <Trash2
            className="text-red-500"
            size={20}
            onClick={() => removeItem(meal, idx)}
          />
        </div>
      ))}

      <button
        className="mt-2 w-full border border-slate-600 rounded-xl py-2 flex items-center justify-center gap-2 text-slate-300"
        onClick={() => addItem(meal)}
      >
        <Plus size={18} /> Add Item
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="flex items-center gap-4 p-5 bg-slate-900 sticky top-0 border-b border-slate-700">
        <ArrowLeft size={24} onClick={() => navigate(-1)} />
        <h1 className="text-xl font-bold">Edit Mess Menu</h1>
      </div>

      {/* Date Picker */}
      <div className="p-5">
        <label className="text-slate-400 text-sm">Select Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mt-2 text-white"
        />
      </div>

      <div className="p-5 space-y-6">
        {renderSection("Breakfast", "breakfast")}
        {renderSection("Lunch", "lunch")}
        {renderSection("Dinner", "dinner")}
      </div>

      {/* Publish */}
      <div className="p-5">
        <button
          onClick={handlePublish}
          className="w-full bg-green-500 py-4 rounded-xl text-lg font-bold"
        >
          Publish to Students
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded-xl text-center">
            <Check size={48} className="mx-auto text-green-500" />
            <p className="mt-3 text-white text-lg">Menu Updated!</p>
          </div>
        </div>
      )}
    </div>
  );
};

