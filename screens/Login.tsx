import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
  increment,
} from "firebase/firestore";

import { db } from "../firebase";

export const Login: React.FC = () => {
  const navigate = useNavigate();

  // role: student | staff | admin
  const [role, setRole] = useState<"student" | "staff" | "admin">("student");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const generateStudentId = () => {
    return "STD" + Math.floor(100000 + Math.random() * 900000);
  };

  const handleLogin = async () => {
    if (!formData.email) {
      alert("Please enter your email");
      return;
    }

    /* ===================== ADMIN LOGIN ===================== */
    if (role === "admin") {
      if (formData.email.trim().toLowerCase() !== "admin@ro") {
        alert("❌ Invalid Admin Email");
        return;
      }

      const admin = {
        id: "admin",
        name: "Hostel Admin",
        email: "admin@ro",
        role: "admin",
        hostelId: "HOSTEL_001",
      };

      localStorage.setItem("student", JSON.stringify(admin));
      localStorage.setItem("userProfile", JSON.stringify(admin));

      navigate("/admin/dashboard");
      return;
    }

    /* ===================== STAFF LOGIN ===================== */
    if (role === "staff") {
      if (formData.email.trim().toLowerCase() !== "staff17@ro") {
        alert("❌ Invalid Staff Email");
        return;
      }

      const staff = {
        id: "staff",
        name: "Hostel Staff",
        email: "staff17@ro",
        role: "staff",
        hostelId: "HOSTEL_001",
      };

      localStorage.setItem("student", JSON.stringify(staff));
      localStorage.setItem("userProfile", JSON.stringify(staff));

      navigate("/staff-dashboard");
      return;
    }

    /* ===================== STUDENT LOGIN ===================== */
    if (!formData.name) {
      alert("Please enter your name");
      return;
    }

    try {
      setSubmitting(true);

      const studentsCol = collection(db, "students");
      const q = query(studentsCol, where("email", "==", formData.email));
      const snapshot = await getDocs(q);

      let studentData: any;

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const ref = doc(db, "students", docSnap.id);

        await updateDoc(ref, {
          name: formData.name,
          lastLogin: serverTimestamp(),
          loginCount: increment(1),
        });

        const data = docSnap.data();
        studentData = {
          studentId: data.studentId,
          name: formData.name,
          email: data.email,
          role: "student",
          hostelId: "HOSTEL_001",
        };
      } else {
        const studentId = generateStudentId();

        const newStudent = {
          studentId,
          name: formData.name,
          email: formData.email,
          role: "student",
          hostelId: "HOSTEL_001",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          loginCount: 1,
        };

        await addDoc(studentsCol, newStudent);
        studentData = newStudent;
      }

      localStorage.setItem("student", JSON.stringify(studentData));

      const userProfile = {
        id: studentData.studentId,
        name: studentData.name,
        photo: "https://picsum.photos/100",
        roomNo: "A-101",
        contactNo: "+91 00000 00000",
      };

      localStorage.setItem("userProfile", JSON.stringify(userProfile));

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("❌ Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-6 py-8 flex flex-col">
      {/* Back */}
      <button
        onClick={() => navigate("/onboarding")}
        className="flex items-center gap-2 text-sm mb-4"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Header */}
      <h1 className="text-2xl font-bold mb-1 capitalize">
        {role} Login
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Select role and continue
      </p>

      {/* Role Switch */}
      <div className="mb-6">
        <button
          onClick={() =>
            setRole(
              role === "student"
                ? "staff"
                : role === "staff"
                ? "admin"
                : "student"
            )
          }
          className="w-full border py-2.5 rounded-xl flex items-center justify-center gap-2"
        >
          <ArrowLeftRight size={18} />
          Switch Role
        </button>
      </div>

      {/* Form */}
      <div className="space-y-4 flex-1">
        {role === "student" && (
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
          type="email"
          placeholder={`${role} email`}
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="w-full p-3 border rounded-xl"
        />
      </div>

      {/* Login Button */}
      <button
        onClick={handleLogin}
        disabled={submitting}
        className="w-full py-3 mt-8 rounded-xl bg-teal-500 text-white font-semibold"
      >
        {submitting ? "Logging in..." : `Login as ${role}`}
      </button>
    </div>
  );
};
