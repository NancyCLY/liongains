import React, { useState } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

/*
  UPLOAD PAGE — YouTube-based version

  This page lets users register a YouTube link as a "video" in Firestore.
  Actual video hosting is handled by YouTube (unlisted videos recommended).
*/

export default function Upload() {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tags, setTags] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const extractYouTubeId = (url) => {
    try {
      // Automatically add protocol if missing
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      const parsed = new URL(url);
      const hostname = parsed.hostname;

      // Case 1: Standard YouTube URLs → ?v=VIDEOID
      if (parsed.searchParams.get("v")) {
        return parsed.searchParams.get("v");
      }

      // Case 2: youtu.be/VIDEOID
      if (hostname.includes("youtu.be")) {
        return parsed.pathname.replace("/", "");
      }

      // Case 3: Shorts → /shorts/VIDEOID
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2];
      }

      // Case 4: Embed → /embed/VIDEOID
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2];
      }

      return null;
    } catch (err) {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentUser) {
      setErrorMsg("You must be logged in to upload.");
      return;
    }

    if (!title.trim() || !youtubeUrl.trim()) {
      setErrorMsg("Please provide both title and YouTube URL.");
      return;
    }

    const youtubeId = extractYouTubeId(youtubeUrl.trim());
    if (!youtubeId) {
      setErrorMsg("Please provide a valid YouTube link.");
      return;
    }

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      setLoading(true);

      console.log(currentUser);

      await addDoc(collection(db, "videos"), {
        title: title.trim(),
        youtubeUrl: youtubeUrl.trim(),
        youtubeId,
        tags: tagsArray,
        posterId: currentUser.uid,
        posterName: currentUser.username || "Unknown",
        createdAt: serverTimestamp(),
      });

      setSuccessMsg("Video registered successfully!");
      setTitle("");
      setYoutubeUrl("");
      setTags("");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 px-4 pb-24 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-4">Add YouTube Video</h1>

      <p className="text-sm text-gray-600 mb-4">
        Upload your tutorial to <strong>YouTube (Unlisted)</strong>, then paste
        the link here.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
          placeholder="Video title (e.g. Leg Press Setup)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="url"
          className="border rounded px-3 py-2 w-full"
          placeholder="YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />

        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
          placeholder="Tags (comma separated, e.g. Legs, Machine, Beginner)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
        {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Video"}
        </button>
      </form>
    </div>
  );
}
