import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Download, ChevronDown } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);

  // Default structure
  const [student, setStudent] = useState<any>({
     name: "Loading...",
     id: id,
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
     complaints: []
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
      room: '',
      phone: '',
      messPreference: 'Veg',
      status: 'Paid',
      complaintStatus: 'Resolved'
  });

  useEffect(() => {
  const fetchStudent = async () => {
    if (!id) return;

    const ref = doc(db, "students", id);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();

      const merged = { ...student, ...data, id };
      setStudent(merged);

      setEditForm({
        room: merged.room,
        phone: merged.phone || "+91 98765 43210",
        messPreference: merged.messPreference || "Veg",
        status: merged.status || "Paid",
        complaintStatus: "Resolved",
      });
    } else {
      setStudent({ ...student, name: "Student Not Found" });
    }
  };

  fetchStudent();
}, [id]);


  const handleSave = async () => {
  if (!id) return;

  const updatedStudent = {
    ...student,
    room: editForm.room,
    phone: editForm.phone,
    messPreference: editForm.messPreference,
    status: editForm.status,
  };

  setStudent(updatedStudent);

  const ref = doc(db, "students", id);
  await updateDoc(ref, {
    room: editForm.room,
    phone: editForm.phone,
    messPreference: editForm.messPreference,
    status: editForm.status,
  });

  alert("Student updated successfully ✅");
  setIsEditing(false);
};


  if (isEditing) {
      return (
        <div className="min-h-screen bg-[#0F172A] text-white flex flex-col pb-10">
            {/* Edit Header */}
            <div className="px-6 pt-8 pb-4 bg-[#0F172A] flex items-center gap-4">
                <button onClick={() => setIsEditing(false)} className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Edit Profile</h1>
            </div>

            <div className="flex-1 px-6 overflow-y-auto no-scrollbar">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-8 mt-4">
                    <div className="relative">
                        <img src={student.photo} className="w-28 h-28 rounded-full object-cover border-4 border-slate-700" alt="Profile" />
                        <div className="absolute bottom-0 right-0 bg-[#22C55E] p-2 rounded-full border-4 border-[#0F172A]">
                            <Edit2 size={16} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold mt-4">{student.name}</h2>
                    <p className="text-slate-400 text-sm">Student ID: {student.id}</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-white mb-2 block">Room Number</label>
                        <input 
                            type="text" 
                            value={editForm.room}
                            onChange={(e) => setEditForm({...editForm, room: e.target.value})}
                            className="w-full bg-[#1E293B] border border-transparent focus:border-[#22C55E] rounded-xl px-4 py-3.5 text-white outline-none font-medium transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-white mb-2 block">Phone Number</label>
                        <input 
                            type="text" 
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="w-full bg-[#1E293B] border border-transparent focus:border-[#22C55E] rounded-xl px-4 py-3.5 text-white outline-none font-medium transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-400 mb-2 block">Mess Preference</label>
                        <div className="bg-[#1E293B] p-1 rounded-xl flex">
                            {['Veg', 'Non-Veg', 'Jain'].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setEditForm({...editForm, messPreference: opt})}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                        editForm.messPreference === opt 
                                        ? 'bg-[#334155] text-white shadow-md' 
                                        : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-white mb-2 block">Fee Status</label>
                        <div className="bg-[#1E293B] p-1 rounded-xl flex w-full">
                            <button
                                onClick={() => setEditForm({...editForm, status: 'Due'})}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                    editForm.status === 'Due' 
                                    ? 'bg-[#334155] text-red-400 shadow-md' 
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                Due
                            </button>
                            <button
                                onClick={() => setEditForm({...editForm, status: 'Paid'})}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                    editForm.status === 'Paid' 
                                    ? 'bg-[#22C55E] text-white shadow-md' 
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                Paid
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-white mb-2 block">Complaint Status</label>
                        <div className="relative">
                            <select 
                                value={editForm.complaintStatus}
                                onChange={(e) => setEditForm({...editForm, complaintStatus: e.target.value})}
                                className="w-full bg-[#1E293B] appearance-none rounded-xl px-4 py-3.5 text-white outline-none font-medium"
                            >
                                <option>Resolved</option>
                                <option>In Progress</option>
                                <option>Pending</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 space-y-4 pb-8">
                    <button 
                        onClick={handleSave}
                        className="w-full bg-[#22C55E] hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transition-all active:scale-95"
                    >
                        Save Changes
                    </button>
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="w-full text-[#22C55E] font-bold py-2 text-sm hover:text-green-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // VIEW MODE
  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col pb-10">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-[#0F172A] sticky top-0 z-20 flex justify-between items-center border-b border-white/5">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors">
               <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold">Student Profile</h1>
         </div>
         <button 
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
         >
            <Edit2 size={20} />
         </button>
      </div>

      <div className="px-6 py-6 overflow-y-auto no-scrollbar">
         {/* Profile Card */}
         <div className="bg-[#1E293B] rounded-[2rem] p-6 mb-6 flex flex-col items-center text-center border border-slate-700/50">
            <div className="w-28 h-28 rounded-full p-1 border-2 border-slate-600 mb-4">
               <img src={student.photo} className="w-full h-full rounded-full object-cover" alt={student.name} />
            </div>
            <h2 className="text-2xl font-bold mb-1">{student.name}</h2>
            <p className="text-slate-400 text-sm mb-6">Student ID: {student.id}</p>

            <div className="flex w-full border-t border-slate-700 pt-4">
               <div className="flex-1 border-r border-slate-700">
                  <span className="text-xs text-slate-500 font-medium block mb-1">Gender</span>
                  <span className="font-semibold text-sm">{student.gender}</span>
               </div>
               <div className="flex-1">
                  <span className="text-xs text-slate-500 font-medium block mb-1">Date of Birth</span>
                  <span className="font-semibold text-sm">{student.dob}</span>
               </div>
            </div>
         </div>

         {/* Info Sections */}
         <div className="space-y-6">
            
            {/* Hostel Info */}
            <div>
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 pl-2">Hostel Info</h3>
               <div className="bg-[#1E293B] rounded-2xl p-5 space-y-4 border border-slate-700/50">
                  <InfoRow label="Room Number" value={student.room} />
                  <InfoRow label="Room Type" value={student.roomType} />
                  <InfoRow label="Block / Wing" value={student.block} />
                  <InfoRow label="Roommate(s)" value={student.roommate} valueColor="text-blue-400" />
                  <InfoRow label="Check-in Date" value={student.checkIn} />
               </div>
            </div>

            {/* Contact Info */}
            <div>
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 pl-2">Contact Info</h3>
               <div className="bg-[#1E293B] rounded-2xl p-5 space-y-4 border border-slate-700/50">
                  <InfoRow label="Phone Number" value={student.phone} />
                  <InfoRow label="Emergency Contact" value={student.emergency} />
                  <InfoRow label="Parent Name" value={student.parent} />
                  <InfoRow label="Parent Phone" value={student.parentPhone} />
               </div>
            </div>

            {/* Fee Details */}
            <div>
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 pl-2">Fee Details</h3>
               <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-700/50">
                  <InfoRow label="Total Hostel Fee" value="₹85,000" />
                  <div className="my-4 h-px bg-slate-700/50" />
                  <div className="flex justify-between items-center mb-4">
                     <div>
                        <span className="text-xs text-slate-500 font-medium block mb-1">Status</span>
                        <span className={`font-bold text-sm ${student.status === 'Paid' ? 'text-emerald-500' : 'text-red-500'}`}>{student.status}</span>
                     </div>
                     <button className="bg-[#334155] hover:bg-slate-600 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                        <Download size={14} /> Fee Receipt
                     </button>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, valueColor = "text-white" }: { label: string, value: string, valueColor?: string }) => (
   <div className="flex justify-between items-center">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <span className={`text-sm font-semibold ${valueColor}`}>{value}</span>
   </div>
);
