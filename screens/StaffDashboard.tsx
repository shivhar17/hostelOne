import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, UtensilsCrossed, Megaphone, Plus, LogOut, Users } from "lucide-react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

import { db } from "../firebase";

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("New");
  const [complaints, setComplaints] = useState<any[]>([]);

  
// ✅ UPDATE COMPLAINT STATUS (Pending → In Progress → Resolved)
const updateStatus = async (id: string, currentStatus: string) => {
  let nextStatus = "Resolved";

  if (currentStatus === "Pending") nextStatus = "In Progress";
  else if (currentStatus === "In Progress") nextStatus = "Resolved";

  const ref = doc(db, "complaints", id);
  await updateDoc(ref, {
    status: nextStatus,
  });
};



  // ✅ FETCH COMPLAINTS FROM FIRESTORE (REAL-TIME)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "complaints"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComplaints(data);
    });

    return () => unsub();
  }, []);

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case "High":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      case "Low":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-500";
    }
  };

  const getUrgencyDot = (urgency: string) => {
    switch (urgency) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-emerald-500";
      default:
        return "bg-slate-500";
    }
  };

  const filteredComplaints = complaints.filter((c) => {
  if (activeTab === "New") return c.status === "Pending";
  if (activeTab === "In Progress") return c.status === "In Progress";
  if (activeTab === "Resolved") return c.status === "Resolved";
  return true;
});



  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24 relative">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex justify-between items-center bg-[#0F172A] sticky top-0 z-20 shadow-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-100 overflow-hidden border-2 border-slate-700">
            <img
              src="https://ui-avatars.com/api/?name=Staff+Member&background=FEF08A&color=854D0E"
              alt="Avatar"
            />
          </div>
          <button
            onClick={() => navigate("/login")}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <LogOut size={12} /> Logout
          </button>
        </div>
        <h1 className="text-xl font-bold">Staff Panel</h1>
        <button className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors relative">
          <Bell size={20} />
          <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-slate-800"></div>
        </button>
      </div>

      <div className="p-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate("/staff/edit-menu")}
            className="bg-[#1E293B] hover:bg-[#263345] p-4 rounded-2xl flex items-center justify-center gap-3 transition-colors group"
          >
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <UtensilsCrossed size={20} />
            </div>
            <span className="font-semibold text-sm">Upload Menu</span>
          </button>

          <button
            onClick={() => navigate("/staff/students")}
            className="bg-[#1E293B] hover:bg-[#263345] p-4 rounded-2xl flex items-center justify-center gap-3 transition-colors group"
          >
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Users size={20} />
            </div>
            <span className="font-semibold text-sm">Directory</span>
          </button>

          <button className="bg-[#1E293B] hover:bg-[#263345] p-4 rounded-2xl flex items-center justify-center gap-3 transition-colors group col-span-2">
            <div className="p-2 rounded-full bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Megaphone size={20} />
            </div>
            <span className="font-semibold text-sm">Post Announcement</span>
          </button>
        </div>

        {/* Complaints Section */}
        <h2 className="text-lg font-bold mb-4">Maintenance Complaints</h2>

        {/* Tabs */}
        <div className="bg-[#1E293B] p-1 rounded-xl flex mb-6">
          {["New", "In Progress", "Resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Complaint List */}
        <div className="space-y-4">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-slate-400 text-xs font-semibold">
                    {complaint.room} -{complaint.studentId}

                  </span>

                  <div
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getUrgencyStyles(
                      complaint.urgency
                    )}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${getUrgencyDot(
                        "Medium"
                      )}`}
                    />
                    {complaint.category} Urgency
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-4 leading-tight">
                  {complaint.description}

                </h3>

                <div className="flex justify-between items-center gap-2">
  <span className="text-slate-500 text-xs">
    Submitted: {complaint.date}

  </span>

  <div className="flex gap-2">
    {/* ✅ STATUS UPDATE BUTTON */}
    {complaint.status !== "Resolved" && (
      <button
        onClick={() => updateStatus(complaint.id, complaint.status)}
        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
      >
        {complaint.status === "New" ? "Start" : "Resolve"}
      </button>
    )}

    {/* ✅ VIEW DETAILS BUTTON (ALREADY EXISTING) */}
    <button
      onClick={() =>
        navigate(`/staff/complaint/${complaint.id}`)
      }
      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
    >
      View Details
    </button>
  </div>
</div>

              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-500">
              <p>No complaints in this category.</p>
            </div>
          )}
        </div>
      </div>

      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all">
        <Plus size={28} />
      </button>
    </div>
  );
};
