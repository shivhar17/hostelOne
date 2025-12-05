import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Briefcase,
  ArrowLeftRight,
} from "lucide-react";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase"; // ✅ REQUIRED

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isStaffLogin, setIsStaffLogin] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  // ✅ FIXED FORM STATE (ADDED NAME)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    code: "",
  });

  // ✅ STUDENT ID GENERATOR (FIXED)
  const generateStudentId = () => {
    return "STD" + Math.floor(100000 + Math.random() * 900000);
  };

  // ✅ FINAL WORKING LOGIN HANDLER
  const handleLogin = async () => {
    if (!isStaffLogin && (!formData.name || !formData.email)) {
      alert("Please enter name and email");
      return;
    }

    // ✅ STAFF LOGIN (NO DATABASE)
    if (isStaffLogin) {
      navigate("/staff-dashboard");
      return;
    }

    try {
      // ✅ 1. CHECK IF STUDENT EXISTS BY EMAIL
      const q = query(
        collection(db, "students"),
        where("email", "==", formData.email)
      );

      const snapshot = await getDocs(q);

      let studentData: any;

      if (!snapshot.empty) {
        // ✅ EXISTING STUDENT
        const docSnap = snapshot.docs[0];
        studentData = {
          studentId: docSnap.data().studentId,
          name: docSnap.data().name,
          email: docSnap.data().email,
        };
      } else {
        // ✅ NEW STUDENT
        const studentId = generateStudentId();

        const newStudent = {
          studentId,
          name: formData.name,
          email: formData.email,
          createdAt: new Date(),
        };

        await addDoc(collection(db, "students"), newStudent);

        studentData = newStudent;
      }

      // ✅ SAVE SESSION (ALL PAGES CAN ACCESS)
      localStorage.setItem("student", JSON.stringify(studentData));

      alert(`✅ Login Successful!\nYour Student ID: ${studentData.studentId}`);

      navigate("/"); // student dashboard
    } catch (err) {
      console.error(err);
      alert("❌ Login failed");
    }
  };

  const handleSwitchToStaff = () => {
    setIsStaffLogin(true);
    setShowSwitchModal(false);
    setFormData({ ...formData, email: "" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-6 py-8 flex flex-col relative">
      <div className="mb-6">
        <button onClick={() => navigate("/onboarding")}>
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="space-y-5 flex-1">
        {!isStaffLogin && (
          <input
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full p-3 border rounded-xl"
          />
        )}

        <input
          type="text"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="w-full p-3 border rounded-xl"
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="w-full p-3 border rounded-xl"
        />
      </div>

      <div className="mt-auto mb-4 space-y-4">
        <button
          onClick={handleLogin}
          className="w-full bg-teal-500 text-white py-3 rounded-xl"
        >
          Login
        </button>
      </div>
    </div>
  );
};
