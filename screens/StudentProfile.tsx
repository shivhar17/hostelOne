import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Download, ChevronDown } from "lucide-react";

export const StudentProfile: React.FC = () => {
  // ✅ Logged-in student from localStorage
  const loggedStudent = JSON.parse(localStorage.getItem("student") || "{}");

  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Main Profile State (from Firestore)
  const [profile, setProfile] = useState<any>({
    name: loggedStudent?.name || "Loading...",
    id: loggedStudent?.studentId || "",
    photo: "",
    gender: "Male",
    dob: "01 Jan 2000",
    room: "",
    roomType: "Double AC",
    block: "Block B",
    roommate: "None",
    checkIn: "20 July 2023",
    phone: "+91 98765 43210",
    emergency: "+91 91234 56789",
    parent: "Parent Name",
    parentPhone: "+91 91234 56789",
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

  // ✅ FETCH STUDENT FROM FIRESTORE USING studentId
  useEffect(() => {
    if (!loggedStudent?.studentId) return;

    const fetchStudent = async () => {
      const ref = doc(db, "students", loggedStudent.studentId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setProfile((prev: any) => ({ ...prev, ...data }));

        setEditForm({
          room: data.room || "",
          phone: data.phone || "",
          messPreference: data.messPreference || "Veg",
          status: data.status || "Paid",
        });
      }
    };

    fetchStudent();
  }, [loggedStudent?.studentId]);

  // ✅ SAVE EDITED PROFILE TO FIRESTORE
  const handleSave = async () => {
    if (!loggedStudent?.studentId) return;

    const updatedProfile = {
      ...profile,
      room: editForm.room,
      phone: editForm.phone,
      messPreference: editForm.messPreference,
      status: editForm.status,
    };

    setProfile(updatedProfile);

    const ref = doc(db, "students", loggedStudent.studentId);
    await updateDoc(ref, {
      room: editForm.room,
      phone: editForm.phone,
      messPreference: editForm.messPreference,
      status: editForm.status,
    });

    alert("Student updated successfully ✅");
    setIsEditing(false);
  };

  // ✅ EDIT MODE
  if (isEditing) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col pb-10">
        <div className="px-6 pt-8 pb-4 flex items-center gap-4">
          <button onClick={() => setIsEditing(false)}>
            <ArrowLeft />
          </button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
        </div>

        <div className="px-6 space-y-5">
          <input
            value={editForm.room}
            onChange={(e) =>
              setEditForm({ ...editForm, room: e.target.value })
            }
            placeholder="Room"
            className="w-full p-3 rounded text-black"
          />

          <input
            value={editForm.phone}
            onChange={(e) =>
              setEditForm({ ...editForm, phone: e.target.value })
            }
            placeholder="Phone"
            className="w-full p-3 rounded text-black"
          />

          <select
            value={editForm.messPreference}
            onChange={(e) =>
              setEditForm({ ...editForm, messPreference: e.target.value })
            }
            className="w-full p-3 rounded text-black"
          >
            <option>Veg</option>
            <option>Non-Veg</option>
            <option>Jain</option>
          </select>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-600 py-3 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-slate-600 py-3 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ VIEW MODE
  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-10">
      <div className="px-6 pt-8 pb-4 flex justify-between items-center">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <button onClick={() => setIsEditing(true)}>
          <Edit2 />
        </button>
      </div>

      <div className="px-6 text-center">
        <img
          src={profile.photo || "https://ui-avatars.com/api/?name=Student"}
          className="w-28 h-28 rounded-full mx-auto mb-4"
        />

        <h2 className="text-2xl font-bold">{profile.name}</h2>
        <p className="text-slate-400">Student ID: {profile.id}</p>
        <p className="text-slate-400">Email: {loggedStudent.email}</p>

        <div className="mt-6 space-y-2 text-left">
          <p>🏠 Room: {profile.room}</p>
          <p>🍽 Mess: {profile.messPreference}</p>
          <p>📱 Phone: {profile.phone}</p>
          <p>
            💰 Fee Status:{" "}
            <span
              className={
                profile.status === "Paid" ? "text-green-500" : "text-red-500"
              }
            >
              {profile.status}
            </span>
          </p>
        </div>

        <button className="mt-6 bg-slate-700 px-4 py-2 rounded flex items-center gap-2 mx-auto">
          <Download size={14} /> Fee Receipt
        </button>
      </div>
    </div>
  );
};
