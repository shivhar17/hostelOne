import React, { useState, FormEvent, ChangeEvent } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface Student {
  studentId: string;
}

type ComplaintCategory =
  | "Electricity"
  | "Plumbing"
  | "Furniture"
  | "Water"
  | "Cleaning"
  | "Other";

interface ComplaintData {
  room: string;
  studentId: string;
  category: ComplaintCategory;
  description: string;
  status: "Pending" | "In Progress" | "Resolved" | "Rejected";
  date: string;
  photoUrl: string | null;
}

const Maintenance: React.FC = () => {
  const navigate = useNavigate();
  const student: Student | null = JSON.parse(
    localStorage.getItem("student") || "null"
  );

  const [formData, setFormData] = useState({
    room: "",
    studentId: student?.studentId || "",
    category: "Electricity" as ComplaintCategory,
    description: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("Image size should be less than 5MB");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (
      !formData.room.trim() ||
      !formData.studentId.trim() ||
      !formData.description.trim()
    ) {
      setError("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (error) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const today = new Date();
      const formattedDate = today.toLocaleDateString("en-GB");
      let photoUrl = "";

      // upload photo if selected
      if (photoFile) {
        const storageRef = ref(
          storage,
          `maintenance/${formData.studentId}_${Date.now()}_${photoFile.name}`
        );
        await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(storageRef);
      }

      const complaintData: ComplaintData = {
        ...formData,
        status: "Pending",
        date: formattedDate,
        photoUrl: photoUrl || null,
      };

      await addDoc(collection(db, "complaints"), complaintData);

      // reset form
      setFormData({
        room: "",
        studentId: student?.studentId || "",
        category: "Electricity",
        description: "",
      });
      setPhotoFile(null);
      setPhotoPreview(null);

      navigate("/?success=complaint_submitted");
    } catch (err) {
      console.error("Error submitting complaint:", err);
      setError("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-black dark:text-white">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl hover:opacity-70 transition-opacity"
          aria-label="Go back"
        >
          ⬅
        </button>
        <h1 className="text-2xl font-bold">Maintenance Complaint</h1>
      </div>

      {/* Form Container */}
      <div className="flex items-center justify-center px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl w-full max-w-md shadow-lg dark:shadow-xl border border-slate-200 dark:border-slate-700"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Student ID */}
          <div className="mb-4">
            <label className="text-sm text-slate-600 dark:text-slate-400">
              Student ID
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              placeholder="Enter Student ID"
              className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 outline-none"
              required
              disabled={!!student?.studentId}
            />
          </div>

          {/* Room */}
          <div className="mb-4">
            <label className="text-sm text-slate-600 dark:text-slate-400">
              Room <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleInputChange}
              placeholder="Enter Room (e.g. B-009)"
              className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 outline-none"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="text-sm text-slate-600 dark:text-slate-400">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 outline-none"
            >
              <option value="Electricity">Electricity</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Furniture">Furniture</option>
              <option value="Water">Water</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Photo Upload */}
          <div className="mb-4">
            <label className="text-sm text-slate-600 dark:text-slate-400">
              Attach Photo (optional, max 5MB)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full mt-1 text-sm text-slate-700 dark:text-slate-200"
            />
            {photoPreview && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-1">Preview:</p>
                <img
                  src={photoPreview}
                  alt="Issue preview"
                  className="w-full max-h-48 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="text-sm text-slate-600 dark:text-slate-400">
              Problem Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your problem..."
              className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 outline-none"
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-bold py-2 rounded-lg transition-all"
          >
            {isSubmitting ? "Submitting..." : "Submit Complaint"}
          </button>

          {/* View My Complaints Button */}
          <button
            type="button"
            onClick={() => navigate("/my-complaints")}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg"
          >
            📋 View My Complaints
          </button>
        </form>
      </div>
    </div>
  );
};

export default Maintenance;
