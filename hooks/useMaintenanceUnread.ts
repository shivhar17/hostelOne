// src/hooks/useMaintenanceUnread.ts
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface RawChat {
  createdAt?: { toMillis?: () => number; seconds?: number };
  from?: string;
}

export function useMaintenanceUnread() {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const rawStudent = localStorage.getItem("student");
    if (!rawStudent) return;

    let studentId: string | null = null;
    try {
      studentId = JSON.parse(rawStudent)?.studentId ?? null;
    } catch {
      return;
    }

    if (!studentId) return;

    const lastSeenRaw = localStorage.getItem("maintenanceLastSeen");
    const lastSeenMillis = lastSeenRaw ? Number(lastSeenRaw) : 0;

    const q = query(
      collection(db, "maintenanceChats"),
      where("studentId", "==", studentId),
      where("from", "==", "staff")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        let unread = false;

        snapshot.forEach((doc) => {
          const data = doc.data() as RawChat;
          const ts = data.createdAt;
          let millis = 0;
          if (ts) {
            if (typeof ts.toMillis === "function") millis = ts.toMillis();
            else if (typeof ts.seconds === "number") millis = ts.seconds * 1000;
          }

          if (millis > lastSeenMillis) {
            unread = true;
          }
        });

        setHasUnread(unread);
      },
      (err) => {
        console.error("useMaintenanceUnread error:", err);
      }
    );

    return () => unsub();
  }, []);

  return hasUnread;
}
