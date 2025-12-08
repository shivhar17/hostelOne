// src/hooks/useAnnouncementsUnread.ts
import { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface RawAnnouncement {
  createdAt?: { toMillis?: () => number; seconds?: number };
}

export function useAnnouncementsUnread() {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const lastSeenRaw = localStorage.getItem("announcementLastSeen");
    const lastSeenMillis = lastSeenRaw ? Number(lastSeenRaw) : 0;

    const q = query(collection(db, "announcements"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        let unread = false;

        snapshot.forEach((doc) => {
          const data = doc.data() as RawAnnouncement;
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
        console.error("useAnnouncementsUnread error:", err);
      }
    );

    return () => unsub();
  }, []);

  return hasUnread;
}
