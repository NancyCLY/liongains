// src/pages/MeetOtherGymBuddies.js
// Similar styling to your other LionGains pages (Tailwind + rounded cards)
// - Loads users from Firestore
// - Filters out blocked buddies (both directions)
// - Shows up to 5
// - Back button navigates to "Find a Gym Buddy" page

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

function getInitials(nameOrEmail = "") {
  if (!nameOrEmail) return "?";
  const base = nameOrEmail.split("@")[0];
  const parts = base.split(/[.\s_]/).filter(Boolean);
  if (parts.length === 0) return base[0]?.toUpperCase() ?? "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const profileImages = require.context(
  "../assets/profile",
  false,
  /\.(png|jpe?g|svg)$/
);

function getProfileImageSrc(userId) {
  try {
    return profileImages(`./${userId}.jpg`);
  } catch {
    return null;
  }
}

export default function MeetOtherGymBuddies() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [buddies, setBuddies] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to view buddies.");
      setLoading(false);
      return;
    }

    async function loadBuddies() {
      try {
        setLoading(true);
        setError("");

        // 1) Load me
        const meRef = doc(db, "users", currentUser.uid);
        const meSnap = await getDoc(meRef);

        if (!meSnap.exists()) {
          setError("Your user profile could not be found.");
          return;
        }

        const meData = meSnap.data();

        // Your existing structure
        const myBlocked = new Set(meData.blockedBuddies || []);

        // Also exclude people you already interacted with (optional but usually desired)
        // If you want ONLY blocked filtering, you can remove these.
        const outgoingMap = meData.outgoingRequests || {};
        const incomingMap = meData.incomingRequests || {};
        const myMatchesMap = meData.buddyMatches || {};

        const alreadyTouched = new Set([
          ...Object.keys(outgoingMap),
          ...Object.keys(incomingMap),
          ...Object.keys(myMatchesMap),
        ]);

        // 2) Load all users
        const usersSnap = await getDocs(collection(db, "users"));

        const list = [];
        usersSnap.forEach((uDoc) => {
          const id = uDoc.id;
          if (id === currentUser.uid) return;

          const data = uDoc.data();

          // Filter: I blocked them
          if (myBlocked.has(id)) return;

          // Filter: they blocked me (mutual exclusion)
          const theirBlocked = data.blockedBuddies || [];
          if (Array.isArray(theirBlocked) && theirBlocked.includes(currentUser.uid))
            return;

          // Optional: don’t show if already requested/matched/etc.
          if (alreadyTouched.has(id)) return;

          list.push({
            id,
            name: data.username || data.email || "Gym Buddy",
            email: data.email || "",
            preferences: Array.isArray(data.preferences) ? data.preferences : [],
          });
        });

        // 3) Show only 5 (demo)
        setBuddies(list.slice(0, 5));
      } catch (err) {
        console.error("Error loading buddies:", err);
        setError("Failed to load buddies.");
      } finally {
        setLoading(false);
      }
    }

    loadBuddies();
  }, [currentUser]);

  const empty = useMemo(() => !loading && !error && buddies.length === 0, [
    loading,
    error,
    buddies,
  ]);

  function handleChat(buddy) {
    // TODO: Replace with real chat navigation
    alert(`Start chat with ${buddy.name}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-lg mx-auto px-4">
        {/* Header with back */}
        <div className="relative flex items-center justify-center h-12">
          <button
            type="button"
            onClick={() => navigate("/gymbuddy")} // <-- adjust route to your "Find a Gym Buddy" page
            className="absolute left-0 p-2 rounded-full hover:bg-slate-100 text-slate-600"
            aria-label="Back"
            title="Back"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <h1 className="text-2xl font-semibold text-slate-900 text-center leading-tight">
            Meet Other
            <br />
            Gym Buddies
          </h1>
        </div>

        <p className="text-slate-500 text-sm text-center mt-2">
          Reach out to schedule your first work session!
        </p>

        {/* Content */}
        <div className="mt-6 space-y-4">
          {loading && (
            <p className="text-sm text-slate-500 text-center">Loading…</p>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {!loading &&
            !error &&
            buddies.map((buddy) => {
              const initials = getInitials(buddy.name || buddy.email);

              return (
                <article
                  key={buddy.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center gap-4"
                >
                  {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                        <img
                          src={getProfileImageSrc(buddy.id)}
                          alt={buddy.name}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-slate-900 truncate">
                      {buddy.name}
                    </h2>

                    {buddy.preferences?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {buddy.preferences.slice(0, 3).map((pref) => (
                          <span
                            key={pref}
                            className="px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-700"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chat icon */}
                  <button
                    type="button"
                    onClick={() => handleChat(buddy)}
                    className="flex-shrink-0 p-3 rounded-xl bg-blue-600 text-white hover:bg-slate-800 transition"
                    aria-label="Start chat"
                    title="Start chat"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  </button>
                </article>
              );
            })}

          {empty && (
            <p className="text-sm text-slate-500 text-center">
              No new buddies to show right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
