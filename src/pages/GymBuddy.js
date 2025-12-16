/*
  GYMBUDDY PAGE

  TODO:
  1. Build weekly availability UI grid.
  2. Save user availability to Firestore ("availability" collection).
  3. Implement "Match Me" logic for pairing users.
  4. Create “Buddies List” preview section.

  Note:
  Navbar already implemented globally.
*/

import { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../services/firebase";
import { collection, getDocs,setDoc, getDoc, updateDoc, doc } from 'firebase/firestore';
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { getSuggestedQuery } from '@testing-library/dom';




const DAY_LABELS = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];

function timeToMilitaryHour(timeStr) {
  // Examples: "1:00PM", "11:00AM", "12:00PM", "12:00AM"
  const match = timeStr.match(/^(\d{1,2}):\d{2}\s*(AM|PM)$/i);
  if (!match) return null; // fallback for unexpected formats

  let hour = parseInt(match[1], 10);
  const period = match[2].toUpperCase();

  if (period === "AM") {
    if (hour === 12) hour = 0; // midnight edge-case
  } else {
    // PM case
    if (hour !== 12) hour += 12;
  }

  return hour; // return as string ("13")
}

function toLocalISODate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getNext7DaysFromTomorrow() {
  
  const today = new Date();
  const days = [];

  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dow = d.getDay(); // 0–6
    const label = DAY_LABELS[dow]; // "M", "Tu", etc.
    const isoDate = toLocalISODate(d); // "YYYY-MM-DD"

    // Simple date label like "Dec 12"
    const month = d.toLocaleString("default", { month: "short" }); // "Dec"
    const dayNum = d.getDate(); // 12
    const displayDate = `${month} ${dayNum}`;

    days.push({
      id: isoDate,      // internal ID + what we store
      label,           // "M", "Tu"
      displayDate,     // "Dec 12"
    });
  }

  return days;
}

export default function GymBuddy() {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const DAYS = getNext7DaysFromTomorrow();

  const [suggestedBuddies, setSuggestedBuddies] = useState(new Set());

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to see matches.");
      setLoading(false);
      return;
    }

    async function loadSuggestedBuddies() {

      try {
        setLoading(true);
        setError("");

        const usersSnap = await getDocs(collection(db, "users"));

        const suggestedBuddies = [];
        usersSnap.forEach((buddyDoc) => {
          const buddyId = buddyDoc.id;          
          const buddyData = buddyDoc.data();

          if (buddyId !== currentUser.uid) {
            suggestedBuddies.push({
              id: buddyId,
              name: buddyData.username || buddyData.email || "Gym Buddy",
            });
          }
        });

        setSuggestedBuddies(suggestedBuddies.slice(0, 5));


      } catch (err) {
        console.error("Error loading matches:", err);
        setError("There was an error loading your matches.");
      } finally {
        setLoading(false);
      }
    }

    loadSuggestedBuddies();
  }, [currentUser]);

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


  const TIMES = [
    "6AM",
    "7AM",
    "8AM",
    "9AM",
    "10AM",
    "11AM",
    "12PM",
    "1PM",
    "2PM",
    "3PM",
    "4PM",
    "5PM",
    "6PM",
    "7PM",
    "8PM",
    "9PM",
    "10PM",
    "11PM",
  ];

  const LEVEL_PREFERENCES = ["Beginner", "Intermediate", "Advanced", "Cardio"];
  const INTEREST_PREFERENCES = [
    "Upper body",
    "Lower body",
    "Full body",
    "Strength",
    "Weightlifting",
  ];

  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [selectedPrefs, setSelectedPrefs] = useState(new Set());
  const [showAllPrefs, setShowAllPrefs] = useState(false);

  const allPrefs = showAllPrefs
    ? [...LEVEL_PREFERENCES, ...INTEREST_PREFERENCES]
    : LEVEL_PREFERENCES;

  function toggleSlot(dayId, time) {
    const key = `${dayId}|${time}`;
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function togglePreference(pref) {
    setSelectedPrefs((prev) => {
      const next = new Set(prev);
      if (next.has(pref)) next.delete(pref);
      else next.add(pref);
      return next;
    });
  }

  async function saveUserPreferences(currentUser, preferences) {
    if (!currentUser) {
      throw new Error("No authenticated user");
    }

    if (!Array.isArray(preferences)) {
      throw new Error("preferences must be an array of strings");
    }

    const userRef = doc(db, "users", currentUser.uid);

    await setDoc(
      userRef,
      {
        uid: currentUser.uid,
        email: currentUser.email ?? null,
        preferences: preferences, // e.g. ["legs-day", "mornings", "cardio"]
        updatedAt: new Date(),
      },
      { merge: true } // 👈 creates the doc if it doesn't exist, updates if it does
    );
  }

  async function handleMatch() {
    // Build a quick lookup map from isoDate → { label, displayDate }
    const dayMap = Object.fromEntries(
      getNext7DaysFromTomorrow().map((d) => [d.id, d])
    );

    const slotsForSaving = Array.from(selectedSlots).map((key) => {
      const [isoDate, time] = key.split("|");
      const dayInfo = dayMap[isoDate];

      return {
        isoDate,                 // "2025-12-12"
        time,                    // "6:00PM"
        dayLabel: dayInfo?.label,       // "F"
        dateLabel: dayInfo?.displayDate // "Dec 12"
      };
    });

    // Example: if you later send this via email or Firestore
    // await someApiCall({ slots: slotsForSaving });

    if (!slotsForSaving.length) {
      alert("Please select at least one time slot.");
      return;
    }

    const newAvailability = {};

    for (const slot of slotsForSaving) {
      const date = slot.isoDate;
      const hour = timeToMilitaryHour(slot.time); // number

      if (hour === null) continue; // skip malformed times

      if (!newAvailability[date]) {
        newAvailability[date] = [];
      }
      newAvailability[date].push(hour);
    }

    // Optional: sort hours numerically
    for (const date in newAvailability) {
      newAvailability[date].sort((a, b) => a - b);
    }

    saveUserPreferences(currentUser, Array.from(selectedPrefs));

    // 3. Overwrite the user's availability in Firestore
    if (!currentUser) {
      alert("You must be logged in to save availability.");
      return;
    }

    const userRef = doc(db, "users", currentUser.uid); 
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
    // User already exists → update only the relevant fields
      try {
        await updateDoc(userRef, {
          availability: newAvailability, // map<string, number[]>
        });

        alert("Your availability has been updated!");

        navigate("/foundbuddies");
      } catch (err) {
        console.error("Error updating availability:", err);
        alert("There was an error saving your availability.");
      }
    } else {
      await setDoc(userRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        availability: newAvailability,
      });
      navigate("/foundbuddies");

    }
  }

  
  return (
    <div className="px-4 pb-6 max-w-md mx-auto px-5">

      {/* Title */}
      <h1 className="text-2xl font-semibold text-center">Find a Gym Buddy</h1>
      <p className="text-gray-600 text-sm text-center mt-1">
        Select your weekly availability to get matched.
      </p>

      {/* Availability card */}
      <section className="mt-4 bg-white rounded-xl shadow-sm border">
        {/* <div className="px-3 py-2 border-b">
          <h2 className="font-semibold text-sm">Your Availability</h2>
        </div> */}

        {/* Whole grid can scroll horizontally, time rows scroll vertically */}
        <div className="overflow-x-auto">
          <div className="min-w-[350px]">
            {/* Header row: day-of-week + date */}
            <div className="grid grid-cols-8 text-xs text-center font-medium bg-white border-b">
              <div className="py-2" />
              {DAYS.map((day) => (
                <div key={day.id} className="py-1 flex flex-col items-center justify-center">
                  <span className="font-semibold">{day.label}</span>
                  <span className="text-[10px] text-gray-500">
                    {day.displayDate}
                  </span>
                </div>
              ))}
            </div>

            {/* Scrollable body – THIS is what makes it shorter on mobile */}
            <div className="max-h-64 overflow-y-auto">
              {TIMES.map((time) => (
                <div
                  key={time}
                  className="grid grid-cols-8 text-xs border-b last:border-b"
                >
                  {/* Time label */}
                  <div className="py-1.5 pl-2 pr-1 bg-white text-gray-700 border-r">
                    {time}
                  </div>

                  {/* Slots */}
                  {DAYS.map((day) => {
                    const dayId = day.id; // "YYYY-MM-DD"
                    const key = `${dayId}|${time}`;
                    const isSelected = selectedSlots.has(key);

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleSlot(dayId, time)}
                        className={`h-7 border-r text-transparent ${
                          isSelected
                            ? "bg-blue-500"
                            : "bg-white hover:bg-blue-50"
                        }`}
                        aria-label={`${day.label} ${day.displayDate} ${time}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="mt-4 bg-white rounded-xl shadow-sm border">
        <div className="px-3 py-2 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm">Preferences</h2>
          <button
            type="button"
            onClick={() => setShowAllPrefs((v) => !v)}
            className="text-xs text-blue-600 hover:underline"
          >
            {showAllPrefs ? "Show fewer" : "Edit"}
          </button>
        </div>

        <div className="px-3 py-3 flex flex-wrap gap-2 text-xs">
          {allPrefs.map((pref) => {
            const isSelected = selectedPrefs.has(pref);
            return (
              <button
                key={pref}
                type="button"
                onClick={() => togglePreference(pref)}
                className={`px-3 py-1 rounded-full border transition ${
                  isSelected
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50"
                }`}
              >
                {pref}
              </button>
            );
          })}
        </div>
      </section>

      {/* Match Me button */}
      <div className="mt-5">
        <button
          type="button"
          onClick={handleMatch}
          className="w-full py-3 rounded-full bg-blue-600 text-white font-semibold text-sm shadow-md active:scale-[0.99] transition"
        >
          MATCH ME!
        </button>
      </div>

      {/* Meet buddies preview */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <button type="button" className="text-sm font-semibold text-gray-800">
            Meet buddies
          </button>
          {/* <button type="button" className="text-xs text-blue-600 hover:underline">
            View all
          </button> */}

          <button
            type="button"
            onClick={() => navigate("/explorebuddies")} // or whatever route you want
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            More
            <ArrowUpRightIcon className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-gray-500">Loading suggestions…</p>
        ) : suggestedBuddies.length === 0 ? (
          <p className="text-xs text-gray-500">
            No suggestions yet — try selecting more availability.
          </p>
        ) : (
          <div className="flex items-center gap-3">
            {suggestedBuddies.map((b) => (
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-xs text-gray-700"
                title={`${b.name}`}
                aria-label={`Suggested buddy ${b.name}`}
              >
              <img
                src={getProfileImageSrc(b.id)}
                alt={b.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              </button>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
