import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EllipsisHorizontalIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../context/AuthContext";
import { db, storage } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

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

function formatDateLabel(dateString) {
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatHourLabel(hour24) {
  const safeHour = Number(hour24);
  if (Number.isNaN(safeHour)) return String(hour24);
  const d = new Date();
  d.setHours(safeHour, 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [preferences, setPreferences] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [likedVideos, setLikedVideos] = useState(null);
  const [level, setLevel] = useState("");

  // optional display fields
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to see your profile.");
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError("Your user profile could not be found.");
          return;
        }

        const userData = userSnap.data();

        // Keep null if missing; set to whatever is stored if present.
        if ("preferences" in userData) setPreferences(userData.preferences);
        if ("availability" in userData) setAvailability(userData.availability);
        if ("likedVideos" in userData) setLikedVideos(userData.likedVideos);

        setDisplayName(userData.displayName || currentUser.displayName || "User");
        setLevel(userData.experienceLevel || "");
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [currentUser]);

  const sortedAvailabilityEntries = useMemo(() => {
    if (!availability || typeof availability !== "object") return [];
    const entries = Object.entries(availability);
    entries.sort(([a], [b]) => a.localeCompare(b));
    return entries.map(([date, hours]) => {
      const hourList = Array.isArray(hours) ? [...hours] : [];
      hourList.sort((x, y) => Number(x) - Number(y));
      return [date, hourList];
    });
  }, [availability]);

  const hasPreferences = Array.isArray(preferences) && preferences.length > 0;

  const hasAvailability =
    sortedAvailabilityEntries.length > 0 &&
    sortedAvailabilityEntries.some(([, hours]) => Array.isArray(hours) && hours.length > 0);

  const showLikedVideos = Array.isArray(likedVideos) && likedVideos.length > 0;

  const goToGymBuddy = () => {
    // Change this route if your GymBuddy page path is different
    navigate("/gymbuddy");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-10">
        <div className="max-w-lg mx-auto px-4">
          <p className="text-sm text-red-500 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-md mx-auto px-4 space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        </header>

        {/* USER CARD */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            <img
              src={getProfileImageSrc(currentUser.uid)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-gray-900">{displayName}</p>
            <p className="text-sm text-gray-500">{level}</p>

            <button className="mt-2 px-4 py-1.5 text-sm font-medium bg-blue-500 text-white rounded-full">
              Edit Profile
            </button>
          </div>

          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
        </section>

        {/* PREFERENCES (always show card; CTA if empty/missing) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Preferences</h2>

            {!hasPreferences && (
              <button
                onClick={goToGymBuddy}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Set preferences
              </button>
            )}
          </div>

          {hasPreferences ? (
            <div className="flex flex-wrap gap-2">
              {preferences.map((pref) => (
                <span
                  key={pref}
                  className="px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700"
                >
                  {pref}
                </span>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 flex items-center justify-between gap-3">
              <span>No preferences set yet.</span>
            </div>
          )}
        </section>

        {/* AVAILABILITY (always show card; CTA if empty/missing) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Availability</h2>

            {!hasAvailability && (
              <button
                onClick={goToGymBuddy}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Set availability
              </button>
            )}
          </div>

          {hasAvailability ? (
            <div className="space-y-3">
              {sortedAvailabilityEntries
                .filter(([, hours]) => Array.isArray(hours) && hours.length > 0)
                .map(([date, hours]) => (
                  <div key={date} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-sm font-medium text-gray-800">
                      {formatDateLabel(date)}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {hours.map((hour) => (
                        <span
                          key={`${date}-${hour}`}
                          className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm text-gray-700"
                        >
                          {formatHourLabel(hour)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 flex items-center justify-between gap-3">
              <span>No availability set yet.</span>
            </div>
          )}
        </section>

        {/* LIKED VIDEOS (only show if exists + non-empty) */}
        {showLikedVideos && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Liked Videos
            </h2>

            <div className="space-y-2">
              {likedVideos.map((videoId) => (
                <div
                  key={videoId}
                  className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 flex items-center gap-3"
                >
                  <VideoCameraIcon className="w-5 h-5 text-gray-500" />
                  <span className="truncate">{videoId}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
