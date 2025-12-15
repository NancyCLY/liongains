import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { setDoc, getDoc, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const DAY_LABELS = ["Sa", "Su", "M", "Tu", "W", "Th", "F"];

function timeToMilitaryHour(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):\d{2}\s*(AM|PM)$/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const period = match[2].toUpperCase();

  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour !== 12) hour += 12;

  return hour;
}

function toLocalISODate(d) {
  return d.toISOString().split("T")[0];
}

function getNext7DaysFromTomorrow() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return {
      id: toLocalISODate(d),
      label: DAY_LABELS[d.getDay()],
      displayDate: d.toLocaleString("default", {
        month: "short",
        day: "numeric",
      }),
    };
  });
}

export default function GymBuddy() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const DAYS = getNext7DaysFromTomorrow();
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

  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [selectedPrefs, setSelectedPrefs] = useState(new Set());

  function toggleSlot(dayId, time) {
    const key = `${dayId}|${time}`;
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function togglePreference(pref) {
    setSelectedPrefs((prev) => {
      const next = new Set(prev);
      next.has(pref) ? next.delete(pref) : next.add(pref);
      return next;
    });
  }

  async function handleMatch() {
    if (!selectedSlots.size) {
      alert("Please select at least one time slot.");
      return;
    }

    const availability = {};

    selectedSlots.forEach((key) => {
      const [date, time] = key.split("|");
      const hour = timeToMilitaryHour(time);
      if (hour === null) return;

      if (!availability[date]) availability[date] = [];
      availability[date].push(hour);
    });

    Object.keys(availability).forEach((d) =>
      availability[d].sort((a, b) => a - b)
    );

    const userRef = doc(db, "users", currentUser.uid);
    const snap = await getDoc(userRef);

    const payload = {
      availability,
      preferences: Array.from(selectedPrefs),
      updatedAt: new Date(),
      email: currentUser.email,
    };

    snap.exists()
      ? await updateDoc(userRef, payload)
      : await setDoc(userRef, { uid: currentUser.uid, ...payload });

    navigate("/foundbuddies");
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] pt-6 pb-32">
      <div className="max-w-md mx-auto px-4 space-y-6">
        {/* HEADER */}
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Find a Gym Buddy
          </h1>
          <p className="text-sm text-gray-500">
            Select your weekly availability to get matched.
          </p>
        </header>

        {/* AVAILABILITY */}
        <section className="bg-white rounded-2xl border shadow-sm">
          <div className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold">Your Availability</h2>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[420px]">
              {/* Days */}
              <div className="grid grid-cols-8 text-xs text-center border-b bg-gray-50">
                <div />
                {DAYS.map((d) => (
                  <div key={d.id} className="py-2">
                    <p className="font-semibold">{d.label}</p>
                    <p className="text-[10px] text-gray-500">{d.displayDate}</p>
                  </div>
                ))}
              </div>

              {/* Time grid */}
              <div className="max-h-64 overflow-y-auto">
                {TIMES.map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b">
                    <div className="px-2 py-1 text-xs bg-gray-50 border-r">
                      {time}
                    </div>
                    {DAYS.map((d) => {
                      const key = `${d.id}|${time}`;
                      const active = selectedSlots.has(key);
                      return (
                        <button
                          key={key}
                          onClick={() => toggleSlot(d.id, time)}
                          className={`h-7 border-r ${
                            active ? "bg-blue-500" : "bg-white hover:bg-blue-50"
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PREFERENCES */}
        <section className="bg-white rounded-2xl border shadow-sm">
          <div className="px-4 py-3 border-b flex justify-between">
            <h2 className="text-sm font-semibold">Preferences</h2>
            <span className="text-xs text-blue-600">Edit</span>
          </div>

          <div className="px-4 py-3 flex flex-wrap gap-2">
            {LEVEL_PREFERENCES.map((pref) => {
              const selected = selectedPrefs.has(pref);
              return (
                <button
                  key={pref}
                  onClick={() => togglePreference(pref)}
                  className={`px-4 py-1.5 rounded-full text-xs border ${
                    selected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  {pref}
                </button>
              );
            })}
          </div>
        </section>

        {/* MATCH BUTTON */}
        <button
          onClick={handleMatch}
          className="w-full py-3 rounded-full bg-blue-600 text-white font-semibold shadow-md"
        >
          MATCH ME!
        </button>

        {/* MEET BUDDIES */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-sm">Meet buddies</p>
            <span className="text-xs text-blue-600">View all</span>
          </div>

          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600"
              >
                U{i}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
