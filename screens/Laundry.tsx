import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, WashingMachine, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  runTransaction,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

type FirestoreSlot = {
  start: string;       // "07:00"
  end: string;         // "08:00"
  capacity: number;
  bookedCount: number;
};

type LaundrySlotView = FirestoreSlot & {
  id: string;
  isUserSlot: boolean;
  isFull: boolean;
  isAvailable: boolean;
  ratio: number;
};

type DateInfo = {
  label: string;
  date: Date;
  key: string; // "YYYY-MM-DD"
};

type NextBooking = {
  dayLabel: string;
  timeRange: string;
};

export const Laundry: React.FC = () => {
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState<string | null>(null);

  // dates: today + next 6 days
  const dates: DateInfo[] = useMemo(() => {
    const result: DateInfo[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD

      let label: string;
      if (i === 0) label = "Today";
      else if (i === 1) label = "Tomorrow";
      else label = d.toLocaleDateString(undefined, { weekday: "short" });

      result.push({ label, date: d, key });
    }
    return result;
  }, []);

  const [selectedDateKey, setSelectedDateKey] = useState<string>(
    () => dates[0]?.key
  );

  const [slots, setSlots] = useState<LaundrySlotView[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(true);
  const [selectedDayBookingSlotId, setSelectedDayBookingSlotId] = useState<
    string | null
  >(null);

  const [nextBooking, setNextBooking] = useState<NextBooking | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load studentId from localStorage
  useEffect(() => {
    const savedStudent = localStorage.getItem("student");
    if (savedStudent) {
      try {
        const parsed = JSON.parse(savedStudent);
        setStudentId(parsed.studentId || null);
      } catch {
        setStudentId(null);
      }
    }
  }, []);

  // Listen for slots + today's booking when date changes
  useEffect(() => {
    if (!selectedDateKey) return;
    if (!studentId) return;

    setLoadingSlots(true);
    setError(null);

    const slotsRef = collection(db, "laundryDays", selectedDateKey, "slots");
    const unsubSlots = onSnapshot(
      slotsRef,
      (snap) => {
        const slotList: FirestoreSlot[] = [];
        const ids: string[] = [];

        snap.forEach((docSnap) => {
          const data = docSnap.data() as FirestoreSlot;
          slotList.push(data);
          ids.push(docSnap.id);
        });

        // merge with current booking info
        setSlots((prev) => {
          return slotList.map((slot, index) => {
            const id = ids[index];
            const isUserSlot = selectedDayBookingSlotId === id;
            const bookedCount = slot.bookedCount ?? 0;
            const capacity = slot.capacity || 1;
            const ratio = bookedCount / capacity;
            const isFull = bookedCount >= capacity && !isUserSlot;
            const isAvailable = !isFull && !isUserSlot;
            return {
              ...slot,
              id,
              isUserSlot,
              isFull,
              isAvailable,
              ratio,
            };
          });
        });
        setLoadingSlots(false);
      },
      (err) => {
        console.error("Laundry slots listener error", err);
        setError("Failed to load slots.");
        setLoadingSlots(false);
      }
    );

    // Load student's booking for this day
    const bookingDocRef = doc(
      db,
      "laundryBookings",
      `${selectedDateKey}_${studentId}`
    );
    getDoc(bookingDocRef)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as any;
          setSelectedDayBookingSlotId(data.slotId || null);
        } else {
          setSelectedDayBookingSlotId(null);
        }
      })
      .catch((err) => {
        console.error("Error loading booking doc", err);
        setSelectedDayBookingSlotId(null);
      });

    return () => {
      unsubSlots();
    };
  }, [selectedDateKey, studentId]);

  // When slots or selectedDayBookingSlotId changes, recompute view slots
  useEffect(() => {
    setSlots((prev) =>
      prev.map((slot) => {
        const isUserSlot = selectedDayBookingSlotId === slot.id;
        const bookedCount = slot.bookedCount ?? 0;
        const capacity = slot.capacity || 1;
        const ratio = bookedCount / capacity;
        const isFull = bookedCount >= capacity && !isUserSlot;
        const isAvailable = !isFull && !isUserSlot;
        return {
          ...slot,
          isUserSlot,
          isFull,
          isAvailable,
          ratio,
        };
      })
    );
  }, [selectedDayBookingSlotId]);

  // Listen for ALL future bookings of this student to show "next booking" card
  useEffect(() => {
    if (!studentId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookingsRef = collection(db, "laundryBookings");
    const qBookings = query(
      bookingsRef,
      where("studentId", "==", studentId),
      orderBy("forDate", "asc"),
      limit(15)
    );

    const unsub = onSnapshot(
      qBookings,
      (snap) => {
        let best: NextBooking | null = null;

        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          const forDate: Date = data.forDate?.toDate
            ? data.forDate.toDate()
            : null;
          if (!forDate) return;
          const forMidnight = new Date(forDate);
          forMidnight.setHours(0, 0, 0, 0);
          if (forMidnight < today) return; // skip past bookings

          const timeRange = formatTimeRange(data.start || data.slotStart, data.end || data.slotEnd);

          let dayLabel: string;
          const todayKey = today.toISOString().slice(0, 10);
          const docDateKey = data.dateKey;

          if (docDateKey === todayKey) dayLabel = "Today";
          else {
            dayLabel = forDate.toLocaleDateString(undefined, {
              weekday: "long",
            });
          }

          if (!best) {
            best = { dayLabel, timeRange };
          } else {
            // first in ascending order is enough, but keep just in case
          }
        });

        setNextBooking(best);
      },
      (err) => {
        console.error("Error listening to laundryBookings", err);
        setNextBooking(null);
      }
    );

    return () => unsub();
  }, [studentId]);

  const handleBook = async (slotId: string, slot: FirestoreSlot) => {
    if (!studentId) {
      setError("Student not found. Please log in again.");
      return;
    }
    if (!selectedDateKey) return;

    setActionLoading(true);
    setError(null);

    try {
      const slotDocRef = doc(
        collection(db, "laundryDays", selectedDateKey, "slots"),
        slotId
      );
      const bookingDocRef = doc(
        db,
        "laundryBookings",
        `${selectedDateKey}_${studentId}`
      );

      await runTransaction(db, async (tx) => {
        const bookingSnap = await tx.get(bookingDocRef);
        if (bookingSnap.exists()) {
          throw new Error("You already booked a slot for this day.");
        }

        const slotSnap = await tx.get(slotDocRef);
        if (!slotSnap.exists()) {
          throw new Error("Slot no longer exists.");
        }

        const slotData = slotSnap.data() as FirestoreSlot;
        const capacity = slotData.capacity || 1;
        const bookedCount = slotData.bookedCount ?? 0;

        if (bookedCount >= capacity) {
          throw new Error("Slot is full.");
        }

        const forDate = new Date(selectedDateKey);
        tx.set(bookingDocRef, {
          studentId,
          dateKey: selectedDateKey,
          slotId,
          start: slotData.start,
          end: slotData.end,
          forDate: Timestamp.fromDate(forDate),
          createdAt: Timestamp.now(),
        });

        tx.update(slotDocRef, {
          bookedCount: bookedCount + 1,
        });
      });

      setSelectedDayBookingSlotId(slotId);
    } catch (err: any) {
      console.error("Error booking slot", err);
      setError(err.message || "Failed to book slot.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!studentId || !selectedDateKey || !selectedDayBookingSlotId) return;

    setActionLoading(true);
    setError(null);

    try {
      const slotDocRef = doc(
        collection(db, "laundryDays", selectedDateKey, "slots"),
        selectedDayBookingSlotId
      );
      const bookingDocRef = doc(
        db,
        "laundryBookings",
        `${selectedDateKey}_${studentId}`
      );

      await runTransaction(db, async (tx) => {
        const bookingSnap = await tx.get(bookingDocRef);
        if (!bookingSnap.exists()) {
          throw new Error("Booking not found.");
        }

        const slotSnap = await tx.get(slotDocRef);
        if (!slotSnap.exists()) {
          throw new Error("Slot not found.");
        }

        const slotData = slotSnap.data() as FirestoreSlot;
        const bookedCount = slotData.bookedCount ?? 0;

        tx.delete(bookingDocRef);
        tx.update(slotDocRef, {
          bookedCount: bookedCount > 0 ? bookedCount - 1 : 0,
        });
      });

      setSelectedDayBookingSlotId(null);
    } catch (err: any) {
      console.error("Error cancelling booking", err);
      setError(err.message || "Failed to cancel.");
    } finally {
      setActionLoading(false);
    }
  };

  const slotsView: LaundrySlotView[] = slots.map((s) => {
    const isUserSlot = selectedDayBookingSlotId === s.id;
    const bookedCount = s.bookedCount ?? 0;
    const capacity = s.capacity || 1;
    const ratio = bookedCount / capacity;
    const isFull = bookedCount >= capacity && !isUserSlot;
    const isAvailable = !isFull && !isUserSlot;
    return {
      ...s,
      isUserSlot,
      isFull,
      isAvailable,
      ratio,
    };
  });

  const selectedDateInfo = dates.find((d) => d.key === selectedDateKey);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-white flex flex-col pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 pt-12 pb-4 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC]/90 dark:bg-[#020617]/90 backdrop-blur">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={22} className="text-slate-700 dark:text-slate-200" />
        </button>
        <div className="flex flex-col items-center">
          <p className="text-sm font-bold">Laundry Booking</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Reserve a washing slot for your clothes
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
          <WashingMachine size={20} className="text-sky-500" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-3 space-y-5">
        {/* Next booking card */}
        {nextBooking && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-sky-100 dark:border-sky-900/40 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center mt-0.5">
              <Clock size={18} className="text-sky-500" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-300 uppercase tracking-wide mb-1">
                Your Next Laundry Slot
              </p>
              <p className="text-sm font-semibold mb-0.5">
                {nextBooking.dayLabel}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {nextBooking.timeRange}
              </p>
              <p className="text-[11px] text-slate-400">
                Please arrive on time. Don&apos;t forget your detergent!
              </p>
            </div>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 text-[11px] rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {/* Date selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Calendar size={14} /> Select Day
            </p>
            {selectedDateInfo && (
              <p className="text-[11px] text-slate-400">
                {selectedDateInfo.date.toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </p>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {dates.map((d) => {
              const isActive = d.key === selectedDateKey;

              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDateKey(d.key)}
                  className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl min-w-[70px] border text-xs ${
                    isActive
                      ? "bg-sky-600 text-white border-sky-600"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span className="font-semibold">
                    {d.label}
                  </span>
                  <span
                    className={`text-[10px] ${
                      isActive
                        ? "text-sky-100"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {d.date.getDate()}{" "}
                    {d.date.toLocaleDateString(undefined, { month: "short" })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slots list */}
        <div className="space-y-4 pb-4">
          {loadingSlots && (
            <p className="text-xs text-slate-400">Loading slots…</p>
          )}

          {!loadingSlots && slotsView.length === 0 && (
            <p className="text-xs text-slate-400">
              No slots configured for this day yet.
            </p>
          )}

          {!loadingSlots &&
            slotsView.map((slot) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800"
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Clock size={15} className="text-sky-500" />
                    {formatTimeRange(slot.start, slot.end)}
                  </p>
                  <StatusBadge slot={slot} />
                </div>

                {/* Capacity info */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {slot.bookedCount ?? 0} of {slot.capacity} spots booked
                </p>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{
                      width: `${Math.min(slot.ratio * 100, 100)}%`,
                    }}
                  />
                </div>

                {/* Button row */}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    Max 1 slot per day.
                  </p>

                  {slot.isUserSlot ? (
                    <button
                      disabled={actionLoading}
                      onClick={handleCancel}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Cancel Booking
                    </button>
                  ) : slot.isFull ? (
                    <button
                      disabled
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    >
                      Full
                    </button>
                  ) : selectedDayBookingSlotId ? (
                    <button
                      disabled
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    >
                      You already booked
                    </button>
                  ) : (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleBook(slot.id, slot)}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-sky-600 text-white hover:bg-sky-500 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Book Slot
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Badge component for slot status
const StatusBadge: React.FC<{ slot: LaundrySlotView }> = ({ slot }) => {
  let label = "";
  let classes =
    "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ";

  if (slot.isUserSlot) {
    label = "Your Slot";
    classes +=
      "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200";
  } else if (slot.isFull) {
    label = "Full";
    classes += "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300";
  } else if (slot.ratio >= 0.7) {
    label = "Almost Full";
    classes +=
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  } else {
    label = "Available";
    classes +=
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  }

  return <span className={classes}>{label}</span>;
};

// Helpers
function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}
function formatTime(time: string): string {
  const [hStr, mStr] = time.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr;
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h = h - 12;
  return `${h}:${m} ${ampm}`;
}
