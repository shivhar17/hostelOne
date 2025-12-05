import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Maintenance() {
  const navigate = useNavigate();

  const [room, setRoom] = useState("");
  const [studentId, setStudentId] = useState("");
  const [category, setCategory] = useState("Electricity");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ SUBMIT COMPLAINT TO FIREBASE
  const submitComplaint = async () => {
    if (!room || !studentId || !description) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB"); // DD/MM/YYYY

    try {
      await addDoc(collection(db, "complaints"), {
        room: room,
        studentId: studentId,
        category: category,
        description: description,
        status: "Pending",
        date: formattedDate,
      });

      alert("✅ Complaint submitted successfully!");
      setRoom("");
      setStudentId("");
      setDescription("");
      setCategory("Electricity");

      navigate("/");
    } catch (error) {
      alert("❌ Error submitting complaint");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-black dark:text-white">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl hover:opacity-70 transition-opacity"
        >
          ⬅
        </button>
        <h1 className="text-2xl font-bold">Maintenance Complaint</h1>
      </div>

      {/* Form Container */}
      <div className="flex items-center justify-center px-4 py-8">
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl w-full max-w-md shadow-lg dark:shadow-xl border border-slate-200 dark:border-slate-700">
          {/* Student ID */}
          <div className="mb-4">
            <label className="text-sm text-slate-600 dark:text-slate-400">Student ID</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter Student ID"
              className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 outline-none"
            />
          </div>

          {/* Room */}
          <div className="mb-4">
            <label className="text-sm text-slate-600 dark:text-slate-400">Room</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter Room (e.g. B-009)"
              className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 outline-none"
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="text-sm text-slate-600 dark:text-slate-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 outline-none"
            >
              <option>Electricity</option>
              <option>Plumbing</option>
              <option>Furniture</option>
              <option>Water</option>
              <option>Cleaning</option>
              <option>Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="text-sm text-slate-600 dark:text-slate-400">Problem Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your problem..."
              className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 outline-none"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            onClick={submitComplaint}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-bold py-2 rounded-lg transition-all"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>

          {/* View My Complaints Button */}
          <button
            onClick={() => navigate("/my-complaints")}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg"
          >
            📋 View My Complaints
          </button>
        </div>
      </div>
    </div>
  );
}

