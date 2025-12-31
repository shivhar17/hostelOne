// src/screens/StaffLaundry.tsx
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: string;
  studentId: string;
  dateKey: string;
  start: string;
  end: string;
  notified?: boolean;
}

interface Student {
  name: string;
  phone?: string;
}

export default function StaffLaundry() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<
    (Booking & { student?: Student })[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // LOAD BOOKINGS + STUDENT DETAILS
  useEffect(() => {
    const loadBookings = async () => {
      const snap = await getDocs(collection(db, "laundryBookings"));
      const list: any[] = [];

      for (const d of snap.docs) {
        const booking = d.data() as Booking;

        // 🔥 Correct student fetch using studentId as docId
        const studentRef = doc(db, "students", booking.studentId);
        const studentSnap = await getDoc(studentRef);

        list.push({
          id: d.id,
          ...booking,
          student: studentSnap.exists()
            ? {
                name: studentSnap.data().name || "Unknown",
                phone: studentSnap.data().phone || "N/A",
              }
            : {
                name: "Unknown",
                phone: "N/A",
              },
        });
      }

      setBookings(list);
    };

    loadBookings();
  }, []);

  // NOTIFY STUDENT
  const notifyStudent = async (booking: Booking) => {
    await addDoc(collection(db, "notifications"), {
      studentId: booking.studentId,
      title: "Laundry Reminder",
      message: `Your laundry slot is ${booking.start} – ${booking.end}. Please collect your clothes.`,
      createdAt: serverTimestamp(),
      read: false,
    });

    await updateDoc(doc(db, "laundryBookings", booking.id), {
      notified: true,
    });

    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id ? { ...b, notified: true } : b
      )
    );

    alert("✅ Notification sent to student");
  };

  // FILTER BY DATE
  const filteredBookings = selectedDate
    ? bookings.filter((b) => b.dateKey === selectedDate)
    : bookings;

  return (
    <div className="p-4 space-y-5">

      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold">Laundry Bookings</h2>
      </div>

      {/* DATE FILTER */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Filter by Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate("")}
            className="text-sm text-blue-600 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* BOOKINGS */}
      {filteredBookings.map((b) => (
        <div
          key={b.id}
          className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 space-y-3"
        >
          {/* TOP ROW */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {b.student?.name}
              </h3>
              <p className="text-sm text-gray-600 font-mono">
                Student ID: {b.studentId}
              </p>
            </div>

            {/* STATUS BADGE */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                b.notified
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {b.notified ? "Notified" : "Booked"}
            </span>
          </div>

          {/* DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              📅 Date: <strong>{b.dateKey}</strong>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              ⏰ Slot: <strong>{b.start} – {b.end}</strong>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              📞 Phone: <strong>{b.student?.phone}</strong>
            </div>
          </div>

          {/* ACTION */}
          {!b.notified && (
            <button
              onClick={() => notifyStudent(b)}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold active:scale-95 transition"
            >
              Notify Student
            </button>
          )}
        </div>
      ))}

      {filteredBookings.length === 0 && (
        <p className="text-gray-500 text-center mt-10">
          No bookings found for selected date.
        </p>
      )}
    </div>
  );
}
