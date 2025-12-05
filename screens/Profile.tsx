import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Settings, LogOut, ChevronRight, History, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Complaint {
  id: number;
  title: string;
  date: string;
  status: string;
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Initialize profile from local storage or defaults
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedStudent = localStorage.getItem('student');

    let name = 'Alex Doe';
    let id = '21BCE1234';
    let photo = 'https://picsum.photos/150/150?random=10';
    let roomNo = 'A-302';
    let messPlan = 'Veg - Full Plan';
    let contactNo = '+91 12345 67890';

    // Priority: savedStudent (from login) > savedProfile > defaults
    if (savedStudent) {
      try {
        const parsed = JSON.parse(savedStudent);
        name = parsed.name || name;
        id = parsed.studentId || id;
      } catch {
        // ignore
      }
    }

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        name = parsed.name || name;
        id = parsed.id || id;
        photo = parsed.photo || photo;
        roomNo = parsed.roomNo || roomNo;
        messPlan = parsed.messPlan || messPlan;
        contactNo = parsed.contactNo || contactNo;
      } catch {
        // ignore
      }
    }
//     setUserProfile({ name, photo });
//   setStudentId(id);
// }, []);

    return {
      name,
      id,
      photo,
      roomNo,
      messPlan,
      contactNo,
    };
  });

  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Header editing (Name/Photo)
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);

  // Details editing (Room/Mess)
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [detailsForm, setDetailsForm] = useState({
    roomNo: '',
    messPlan: '',
    contactNo: '',
  });

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Load complaints from localStorage
  useEffect(() => {
    const savedComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');

    if (savedComplaints.length === 0) {
      const defaults = [
        { id: 1, title: 'Leaky Faucet', date: '15 Aug, 2023', status: 'Resolved' },
        { id: 2, title: 'Wi-Fi Issue', date: '12 Aug, 2023', status: 'In Progress' },
      ];
      setComplaints(defaults);
      localStorage.setItem('complaints', JSON.stringify(defaults));
    } else {
      setComplaints(savedComplaints);
    }
  }, []);

  // Handler for Header Save (Name)
  const handleSave = () => {
    const updatedProfile = { ...profile, name: editName };
    setProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(profile.name);
    setIsEditing(false);
  };

  // Handler for Details Editing
  const startEditingDetails = () => {
    setDetailsForm({
      roomNo: profile.roomNo,
      messPlan: profile.messPlan,
      contactNo: profile.contactNo,
    });
    setIsEditingDetails(true);
  };

  const saveDetails = () => {
    const updatedProfile = {
      ...profile,
      roomNo: detailsForm.roomNo,
      messPlan: detailsForm.messPlan,
      contactNo: detailsForm.contactNo,
    };
    setProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setIsEditingDetails(false);
  };

  const cancelDetailsEdit = () => {
    setIsEditingDetails(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const updatedProfile = { ...profile, photo: result };
        setProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    // In a real app, clear auth tokens here
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24 transition-colors duration-300 relative">
      <div className="bg-white dark:bg-slate-900 px-6 pt-12 pb-6 mb-2 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Profile</h1>
          {isEditing ? (
            <div className="flex gap-4">
              <button onClick={handleCancel} className="text-red-500">
                <X size={24} />
              </button>
              <button onClick={handleSave} className="text-emerald-500">
                <Check size={24} />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)}>
              <Settings
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                size={24}
              />
            </button>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-4 group">
            <img
              src={profile.photo}
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-slate-50 dark:border-slate-800 object-cover shadow-sm"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              className="hidden"
              accept="image/*"
            />
            <button
              onClick={() => isEditing && fileInputRef.current?.click()}
              className={`absolute bottom-0 right-0 bg-teal-500 text-white p-2 rounded-full border-4 border-white dark:border-slate-900 transition-all ${
                isEditing ? 'cursor-pointer hover:bg-teal-600 hover:scale-110' : 'opacity-0'
              }`}
            >
              <Edit2 size={16} />
            </button>
          </div>

          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-xl font-bold text-slate-800 dark:text-white text-center bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 outline-none border border-teal-500 mb-1"
              autoFocus
            />
          ) : (
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{profile.name}</h2>
          )}

          {/* ✅ Student ID shown directly under name */}
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm mt-1">
            {profile.id}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Details Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm space-y-4 relative">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide opacity-70">
              Room & Mess Details
            </h3>
            {isEditingDetails ? (
              <div className="flex gap-2">
                <button
                  onClick={cancelDetailsEdit}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                >
                  <X size={18} />
                </button>
                <button
                  onClick={saveDetails}
                  className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full"
                >
                  <Check size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={startEditingDetails}
                className="p-1 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-full transition-colors"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Room No.</span>
            {isEditingDetails ? (
              <input
                value={detailsForm.roomNo}
                onChange={(e) => setDetailsForm({ ...detailsForm, roomNo: e.target.value })}
                className="text-right text-slate-800 dark:text-slate-200 font-bold bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5 outline-none w-24"
              />
            ) : (
              <span className="text-slate-800 dark:text-slate-200 font-bold">{profile.roomNo}</span>
            )}
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Mess Plan</span>
            {isEditingDetails ? (
              <input
                value={detailsForm.messPlan}
                onChange={(e) => setDetailsForm({ ...detailsForm, messPlan: e.target.value })}
                className="text-right text-slate-800 dark:text-slate-200 font-bold bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5 outline-none w-32"
              />
            ) : (
              <span className="text-slate-800 dark:text-slate-200 font-bold">{profile.messPlan}</span>
            )}
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Contact No.</span>
            {isEditingDetails ? (
              <input
                value={detailsForm.contactNo}
                onChange={(e) => setDetailsForm({ ...detailsForm, contactNo: e.target.value })}
                className="text-right text-slate-800 dark:text-slate-200 font-bold bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5 outline-none w-36"
              />
            ) : (
              <span className="text-slate-800 dark:text-slate-200 font-bold">{profile.contactNo}</span>
            )}
          </div>
        </div>

        {/* Achievements, Complaint history & Logout */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide opacity-70">
            Account
          </h3>
          
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Logout?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Are you sure you want to logout from your account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
