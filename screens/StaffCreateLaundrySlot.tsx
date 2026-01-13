// src/screens/StaffCreateLaundrySlot.tsx
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function StaffCreateLaundrySlot() {
  const navigate = useNavigate();

  const [dateKey, setDateKey] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [capacity, setCapacity] = useState(5);

  const createSlot = async () => {
    if (!dateKey || !start || !end) {
      alert("Fill all fields");
      return;
    }

    const slotId = `slot-${start}-${end}`;

    await setDoc(
      doc(db, "laundryDays", dateKey, "slots", slotId),
      {
        start,
        end,
        capacity,
        bookedCount: 0,
      }
    );

    alert("✅ Slot created");
    navigate(-1);
  };

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Create Laundry Slot</h2>

      <input
        type="date"
        value={dateKey}
        onChange={(e) => setDateKey(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="time"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="time"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="number"
        min={1}
        value={capacity}
        onChange={(e) => setCapacity(Number(e.target.value))}
        className="w-full border px-3 py-2 rounded"
        placeholder="Capacity"
      />

      <button
        onClick={createSlot}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold"
      >
        Create Slot
      </button>
    </div>
  );
}
