import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";

export const StaffEditAnnouncement: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "announcements", id!));
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title);
        setMessage(data.message);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleUpdate = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Fill all fields");
      return;
    }

    await updateDoc(doc(db, "announcements", id!), {
      title,
      message,
    });

    alert("Updated Successfully");
    navigate("/staff/announcements-list");
  };

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#050316] text-white p-6">

      <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10">
        <ArrowLeft size={22} />
      </button>

      <h1 className="text-xl font-bold mt-4">Edit Notice</h1>

      <textarea
        rows={2}
        className="w-full bg-black/20 p-3 rounded-xl mt-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        rows={6}
        className="w-full bg-black/20 p-3 rounded-xl mt-4"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={handleUpdate}
        className="w-full bg-purple-600 p-3 rounded-xl mt-6"
      >
        Save Changes
      </button>
    </div>
  );
};
