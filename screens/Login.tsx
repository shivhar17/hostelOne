import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowLeftRight,
} from "lucide-react";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isStaffLogin, setIsStaffLogin] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Generate random student id
  const generateStudentId = () => {
    return "STD" + Math.floor(100000 + Math.random() * 900000);
  };

  const handleLogin = async () => {
    // Validation
    if (!formData.email) {
      alert("Please enter your email");
      return;
    }

    // STAFF LOGIN
    if (isStaffLogin) {
      navigate("/staff-dashboard");
      return;
    }

    // STUDENT LOGIN
    if (!formData.name) {
      alert("Please enter your name");
      return;
    }

    try {
      // 1. Look for existing student by email
      const q = query(
        collection(db, "students"),
        where("email", "==", formData.email)
      );

      const snapshot = await getDocs(q);

      let studentData: any;

      if (!snapshot.empty) {
        // Existing student
        const docSnap = snapshot.docs[0];
        studentData = {
          studentId: docSnap.data().studentId,
          name: docSnap.data().name,
          email: docSnap.data().email,
        };
      } else {
        // New student
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

      // ✅ Save session for student (for other pages)
      localStorage.setItem("student", JSON.stringify(studentData));

      // ✅ ALSO save a userProfile used by Dashboard + Profile
      const defaultPhoto = "https://picsum.photos/100/100?random=10";

      const userProfile = {
        name: studentData.name,
        id: studentData.studentId,
        photo: defaultPhoto,
        // sensible defaults – user can edit later in Profile
        roomNo: "A-101",
        messPlan: "Veg - Full Plan",
        contactNo: "+91 00000 00000",
      };

      localStorage.setItem("userProfile", JSON.stringify(userProfile));

      alert(`✅ Login Successful!\nYour Student ID: ${studentData.studentId}`);

      navigate("/"); // student dashboard
    } catch (err) {
      console.error(err);
      alert("❌ Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-6 py-8 flex flex-col">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/onboarding")}
          className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Header + mode indicator */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {isStaffLogin ? "Staff Login" : "Student Login"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isStaffLogin
            ? "Sign in to access the staff dashboard."
            : "Enter your details to continue as a student."}
        </p>
      </div>

      {/* Mode switch button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setIsStaffLogin(!isStaffLogin)}
          className="w-full border border-slate-300 dark:border-slate-700 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          <ArrowLeftRight size={18} />
          {isStaffLogin ? "Switch to Student Login" : "Switch to Staff Login"}
        </button>
      </div>

      {/* Form */}
      <div className="space-y-4 flex-1">
        {/* Name only for student */}
        {!isStaffLogin && (
          <input
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-transparent text-slate-900 dark:text-slate-100 text-sm outline-none"
          />
        )}

        <input
          type="email"
          placeholder={isStaffLogin ? "Staff email" : "Student email"}
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-transparent text-slate-900 dark:text-slate-100 text-sm outline-none"
        />
      </div>

      {/* Login button */}
      <div className="mt-8 mb-4">
        <button
          onClick={handleLogin}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
        >
          {isStaffLogin ? "Login as Staff" : "Login as Student"}
        </button>
      </div>
    </div>
  );
};
