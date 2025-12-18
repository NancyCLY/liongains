import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
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
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

const HARDCODED_LIKED_VIDEOS = [
  { id: "D4vEmKD8u7s", title: "D4vEmKD8u7s" },
  { id: "vI48li4UKQg", title: "vI48li4UKQg" },
  { id: "hmTfcGvE-SY", title: "hmTfcGvE-SY" },
];

function youtubeThumb(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [preferences, setPreferences] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [level, setLevel] = useState("");

  const [displayName, setDisplayName] = useState("User");
  const [username, setUsername] = useState("User");

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

        if ("preferences" in userData) setPreferences(userData.preferences);
        if ("availability" in userData) setAvailability(userData.availability);

        setDisplayName(
          userData.displayName || currentUser.displayName || "User"
        );
        setUsername(userData.username || currentUser.username || "User");
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

    return entries.map(([date, hoursLike]) => {
      const hourList = Array.isArray(hoursLike)
        ? [...hoursLike]
        : hoursLike && typeof hoursLike === "object"
        ? Object.values(hoursLike)
        : [];

      hourList.sort((x, y) => Number(x) - Number(y));
      return [date, hourList];
    });
  }, [availability]);

  const hasPreferences = Array.isArray(preferences) && preferences.length > 0;

  const hasAvailability =
    sortedAvailabilityEntries.length > 0 &&
    sortedAvailabilityEntries.some(
      ([, hours]) => Array.isArray(hours) && hours.length > 0
    );

  const goToGymBuddy = () => navigate("/gymbuddy");

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
            <p className="font-semibold text-gray-900">{username}</p>
            <p className="text-sm text-gray-500">{level}</p>

            <button className="mt-2 px-4 py-1.5 text-sm font-medium bg-blue-500 text-white rounded-full">
              Edit Profile
            </button>
          </div>

          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
        </section>

        {/* PREFERENCES */}
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
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
              No preferences set yet.
            </div>
          )}
        </section>

        {/* AVAILABILITY */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Availability
            </h2>

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
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
              No availability set yet.
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            Liked Videos
          </h2>

          <div className="space-y-3">
            {HARDCODED_LIKED_VIDEOS.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <img
                  src={youtubeThumb(v.id)}
                  alt="thumbnail"
                  className="w-20 h-14 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {v.title}
                  </p>
                  <p className="text-xs text-gray-500">Liked video</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
