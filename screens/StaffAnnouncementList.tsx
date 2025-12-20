import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export const StaffAnnouncementList: React.FC = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setAnnouncements(list);
    });

    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this notice?")) return;
    await deleteDoc(doc(db, "announcements", id));
    alert("Notice Deleted");
  };

  return (
    <div className="min-h-screen bg-[#050316] text-white p-5">

      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-semibold">Uploaded Notices</h1>
      </div>

      {announcements.length === 0 && (
        <p className="text-center text-slate-400 mt-10">No notices uploaded yet</p>
      )}

      <div className="space-y-4">
        {announcements.map((n) => (
          <div key={n.id} className="bg-[#11101A] p-4 rounded-2xl border border-white/10">

            <h2 className="text-lg font-bold">{n.title}</h2>
            <p className="text-sm text-gray-300">{n.message}</p>

            {n.image && (
              <img src={n.image} className="mt-3 rounded-xl" alt="notice" />
            )}

            <div className="flex gap-4 mt-3">

              <button
                onClick={() => navigate(`/staff/edit-notice/${n.id}`)}
                className="flex items-center gap-1 text-yellow-400"
              >
                <Pencil size={16} /> Edit
              </button>

              <button
                onClick={() => handleDelete(n.id)}
                className="flex items-center gap-1 text-red-400"
              >
                <Trash2 size={16} /> Delete
              </button>

            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
