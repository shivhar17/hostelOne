import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit2, Download, ChevronDown } from "lucide-react";

export const StudentProfile: React.FC = () => {
  // ✅ Logged-in student from localStorage (Login Data)
  const loggedStudent = JSON.parse(localStorage.getItem("student") || "{}");

  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Firestore Student Profile State
  const [profile, setProfile] = useState<any>({
    name: loggedStudent?.name || "Loading...",
    id: loggedStudent?.studentId || id,
    email: loggedStudent?.email || "",
    photo: "",
    gender: "Male",
    dob: "01 Jan 2000",
    room: "",
    roomType: "Double AC",
    block: "Block B",
    roommate: "None",
    checkIn: "20 July 2023",
    phone: "",
    emergency: "",
    parent: "",
    parentPhone: "",
    status: "Paid",
    messPreference: "Veg",
  });

  // ✅ Edit Form State
  const [editForm, setEditForm] = useState({
    room: "",
    phone: "",
    messPreference: "Veg",
    status: "Paid",
  });

  // ✅ Fetch Student From Firestore
  useEffect(() => {
    if (!profile.id) return;

    const fetchStudent = async () => {
      const ref = doc(db, "students", profile.id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setProfile({ ...profile, ...data });

        setEditForm({
          room: data.room || "",
          phone: data.phone || "",
          messPreference: data.messPreference || "Veg",
          status: data.status || "Paid",
        });
      }
    };

    fetchStudent();
  }, [profile.id]);

  // ✅ Save Updated Profile
  const handleSave = async () => {
    if (!profile.id) return;

    const updatedProfile = {
      ...profile,
      room: editForm.room,
      phone: editForm.phone,
      messPreference: editForm.messPreference,
      status: editForm.status,
    };

    setProfile(updatedProfile);

    const ref = doc(db, "students", profile.id);
    await updateDoc(ref, {
      room: editForm.room,
      phone: editForm.phone,
      messPreference: editForm.messPreference,
      status: editForm.status,
    });

    alert("Profile updated ✅");
    setIsEditing(false);
  };

  // ✅ EDIT MODE UI
  if (isEditing) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white p-6">
        <button onClick={() => setIsEditing(false)} className="mb-4">
          ⬅ Back
        </button>

        <h2 className="text-xl font-bold mb-6">Edit Profile</h2>

        <input
          value={editForm.room}
          onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
          placeholder="Room"
          className="w-full mb-3 p-2 rounded text-black"
        />

        <input
          value={editForm.phone}
          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          placeholder="Phone"
          className="w-full mb-3 p-2 rounded text-black"
        />

        <select
          value={editForm.messPreference}
          onChange={(e) =>
            setEditForm({ ...editForm, messPreference: e.target.value })
          }
          className="w-full mb-3 p-2 rounded text-black"
        >
          <option>Veg</option>
          <option>Non-Veg</option>
          <option>Jain</option>
        </select>

        <button
          onClick={handleSave}
          className="bg-green-500 px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    );
  }

  // ✅ VIEW MODE UI
  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)}>⬅ Back</button>
        <button onClick={() => setIsEditing(true)}>✏ Edit</button>
      </div>

      <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
      <p className="text-gray-400 mb-1">
        Student ID: {loggedStudent.studentId}
      </p>
      <p className="text-gray-400 mb-4">Email: {loggedStudent.email}</p>

      <div className="space-y-2">
        <p>🏠 Room: {profile.room}</p>
        <p>🍽 Mess Preference: {profile.messPreference}</p>
        <p>📱 Phone: {profile.phone}</p>
        <p>💰 Fee Status: {profile.status}</p>
      </div>

      <button className="mt-6 bg-slate-700 px-4 py-2 rounded flex items-center gap-2">
        <Download size={16} /> Download Fee Receipt
      </button>
    </div>
  );
};

