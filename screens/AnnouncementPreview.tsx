import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { ArrowLeft, Trash2, Pencil } from "lucide-react";

export const AnnouncementPreview: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("staff") || "null");

  const isStaff = Boolean(user); // staff only

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, "announcements", id));
      if (snap.exists()) setAnnouncement(snap.data());
      setLoading(false);
    };
    fetchAnnouncement();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this notice permanently?")) return;
    await deleteDoc(doc(db, "announcements", id!));
    alert("Notice deleted.");
    navigate("/announcements");
  };

  if (loading) return <p className="p-6 text-center text-white">Loading...</p>;
  if (!announcement) return <p className="p-6 text-center text-white">Not found.</p>;

  return (
    <div className="min-h-screen bg-[#050316] text-white p-5">

      <button onClick={() => navigate(-1)} className="mb-5">
        <ArrowLeft size={24} />
      </button>

      {/* STAFF BUTTONS */}
      {isStaff && (
        <div className="flex gap-3 mb-5">
          <button
            className="px-4 py-2 bg-yellow-500 text-black rounded-xl flex items-center gap-2"
            onClick={() => navigate(`/edit-announcement/${id}`)}
          >
            <Pencil size={18} /> Edit
          </button>

          <button
            className="px-4 py-2 bg-red-500 text-white rounded-xl flex items-center gap-2"
            onClick={handleDelete}
          >
            <Trash2 size={18} /> Delete
          </button>
        </div>
      )}

      <div className="bg-white text-black rounded-3xl p-5">
        <h2 className="text-2xl font-bold mb-3">{announcement.title}</h2>
        <p className="text-gray-800 mb-4">{announcement.message}</p>

        {announcement.image && (
          <img src={announcement.image} className="rounded-xl mt-3" />
        )}
      </div>
    </div>
  );
};
