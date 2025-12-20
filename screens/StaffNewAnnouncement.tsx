import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Star } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

type AudienceOption =
  | "All Students"
  | "All Girls"
  | "All Boys"
  | "First Year"
  | "Final Year"
  | "Block A"
  | "Block B";

type AnnouncementType = "general" | "urgent";

export const StaffNewAnnouncement: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<AudienceOption>("All Students");
  const [type, setType] = useState<AnnouncementType>("general");
  const [pinned, setPinned] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Please enter title and message.");
      return;
    }

    try {
      setSending(true);

      let imageUrl = null;
      if (imageFile) {
        const imgRef = ref(storage, `announcements/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imgRef, imageFile);
        imageUrl = await getDownloadURL(imgRef);
      }

      await addDoc(collection(db, "announcements"), {
        title: title.trim(),
        message: message.trim(),
        audience,
        type,
        pinned,
        image: imageUrl,
        createdAt: serverTimestamp(),
        readBy: [],
      });

      setSending(false);
      navigate("/announcements");
    } catch (err) {
      console.error(err);
      alert("Failed to send");
      setSending(false);
    }
  };

  const audienceOptions: AudienceOption[] = [
    "All Students",
    "All Girls",
    "All Boys",
    "First Year",
    "Final Year",
    "Block A",
    "Block B",
  ];

  return (
    <div className="min-h-screen bg-[#050316] text-white flex flex-col">

      {/* Header */}
      <div className="px-5 pt-12 pb-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-semibold">New Notice</h1>
      </div>

      {/* View Notice List Button */}
      <button
        onClick={() => navigate("/staff/announcements-list")}
        className="w-[90%] mx-auto bg-purple-600 py-3 rounded-xl mb-4"
      >
        View Uploaded Notices
      </button>

      {/* FORM */}
      <div className="flex-1 px-5 space-y-6 pb-10 overflow-y-auto">

        {/* Title */}
        <div>
          <label className="text-sm">Title</label>
          <textarea
            rows={2}
            className="w-full bg-[#11101A] p-3 rounded-2xl mt-1 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Water Supply Alert"
          />
        </div>

        {/* Message */}
        <div>
          <label className="text-sm">Message</label>
          <textarea
            rows={5}
            className="w-full bg-[#11101A] p-3 rounded-2xl mt-1 outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write full notice details here..."
          />
        </div>

        {/* Priority */}
        <div>
          <label className="text-sm">Priority</label>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setType("general")}
              className={`px-4 py-2 rounded-full ${
                type === "general" ? "bg-purple-600" : "bg-[#11101A]"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setType("urgent")}
              className={`px-4 py-2 rounded-full ${
                type === "urgent" ? "bg-red-500" : "bg-[#11101A]"
              }`}
            >
              Urgent
            </button>
          </div>
        </div>

        {/* Pin Notice */}
        <div>
          <label className="text-sm">Pin Notice</label>
          <button
            onClick={() => setPinned(!pinned)}
            className={`px-4 py-2 rounded-full flex items-center gap-2 mt-2 ${
              pinned ? "bg-yellow-400 text-black" : "bg-[#11101A]"
            }`}
          >
            <Star size={16} fill={pinned ? "black" : "none"} />
            {pinned ? "Pinned" : "Tap to Pin"}
          </button>
        </div>

        {/* Image Upload */}
        <div>
          <label className="text-sm">Attach Image (optional)</label>

          <label className="flex items-center gap-2 bg-[#11101A] p-3 rounded-2xl mt-2 cursor-pointer">
            <Upload size={18} />
            <span>{imageFile ? imageFile.name : "Upload Image"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
            />
          </label>
        </div>

        {/* Audience */}
        <div>
          <label className="text-sm">Audience</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {audienceOptions.map((a) => (
              <button
                key={a}
                onClick={() => setAudience(a)}
                className={`px-4 py-2 rounded-full text-xs ${
                  audience === a ? "bg-purple-600" : "bg-[#11101A]"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Buttons */}
      <div className="p-5 flex gap-4">
        <button className="flex-1 py-3 rounded-full border border-purple-600 text-purple-600">
          Preview
        </button>
        <button
          onClick={handleSend}
          className="flex-1 py-3 rounded-full bg-purple-600"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};
