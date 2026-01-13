import React, { useEffect, useState } from 'react';
import { WashingMachine, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface LaundrySlot {
  id: string;
  start: string;
  end: string;
  capacity: number;
  bookedCount: number;
}

const LaundrySlotsPreview: React.FC = () => {
  const [slots, setSlots] = useState<LaundrySlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const slotsRef = collection(db, 'laundryDays', today, 'slots');
        const q = query(slotsRef);
        const querySnapshot = await getDocs(q);
        
        const slotsData: LaundrySlot[] = [];
        querySnapshot.forEach((doc) => {
          slotsData.push({
            id: doc.id,
            ...doc.data()
          } as LaundrySlot);
        });
        
        const availableSlots = slotsData
          .filter(slot => slot.bookedCount < slot.capacity)
          .sort((a, b) => a.start.localeCompare(b.start))
          .slice(0, 3);
          
        setSlots(availableSlots);
      } catch (error) {
        console.error('Error fetching laundry slots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-4">
        <WashingMachine className="mx-auto mb-2 text-blue-400" size={32} />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No available slots right now
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {slots.map((slot) => (
        <div 
          key={slot.id}
          className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">
              {slot.start} - {slot.end}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {slot.capacity - slot.bookedCount} slot{slot.capacity - slot.bookedCount !== 1 ? 's' : ''} left
            </p>
          </div>
          <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500"
              style={{ width: `${(slot.bookedCount / slot.capacity) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LaundrySlotsPreview;
