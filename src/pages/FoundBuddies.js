import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

const DAY_LABELS = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];
const MAX_BUDDIES_TOTAL = 5;

/* ================= HELPERS ================= */

function computeAllOverlappingSessions(
  currentAvailability = {},
  buddyAvailability = {}
) {
  const overlaps = [];

  for (const date of Object.keys(currentAvailability)) {
    if (!buddyAvailability[date]) continue;

    const currentHours = new Set(currentAvailability[date]);
    for (const hour of buddyAvailability[date]) {
      if (currentHours.has(hour)) {
        overlaps.push({
          id: `${date}-${hour}`,
          date,
          hour,
          label: formatSessionLabel(date, hour),
        });
      }
    }
  }

  overlaps.sort((a, b) => {
    if (a.date === b.date) return a.hour - b.hour;
    return a.date < b.date ? -1 : 1;
  });

  return overlaps;
}

function formatSessionLabel(dateStr, hour24) {
  const d = new Date(`${dateStr}T00:00:00`);
  const dow = DAY_LABELS[d.getDay()];
  const start = formatHour12(hour24);
  const end = formatHour12(Math.min(hour24 + 2, 24));
  return `${dow} ${start}-${end}`;
}

function formatHour12(h) {
  const v = h % 12 || 12;
  return `${v}`;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ================= PAGE ================= */

export default function FoundBuddies() {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buddies, setBuddies] = useState([]);

  const [selectedSessionByBuddy, setSelectedSessionByBuddy] = useState({});
  const [existingReachedOutIds, setExistingReachedOutIds] = useState(new Set());
  const [newReachedOutIds, setNewReachedOutIds] = useState(new Set());
  const [openMenuBuddyId, setOpenMenuBuddyId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    async function loadMatches() {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const data = userSnap.data();
        const currentAvailability = data.availability || {};
        const outgoingMap = data.outgoingRequests || {};
        const incomingMap = data.incomingRequests || {};
        const matchesMap = data.buddyMatches || {};
        const blocked = new Set(data.blockedBuddies || []);

        setExistingReachedOutIds(new Set(Object.keys(outgoingMap)));

        const exclude = new Set([
          ...Object.keys(outgoingMap),
          ...Object.keys(incomingMap),
          ...Object.keys(matchesMap),
          ...blocked,
        ]);

        const snap = await getDocs(collection(db, "users"));
        const found = [];

        snap.forEach((docu) => {
          if (docu.id === currentUser.uid) return;
          if (exclude.has(docu.id)) return;

          const d = docu.data();
          if ((d.blockedBuddies || []).includes(currentUser.uid)) return;

          const overlaps = computeAllOverlappingSessions(
            currentAvailability,
            d.availability || {}
          );

          if (overlaps.length === 0) return;

          found.push({
            id: docu.id,
            name: d.username || d.email || "Gym Buddy",
            overlappingSessions: overlaps,
          });
        });

        setBuddies(found.slice(0, 5));
      } catch (e) {
        console.error(e);
        setError("Failed to load buddies.");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [currentUser]);

  const totalReached = existingReachedOutIds.size + newReachedOutIds.size;

  async function handleReachOut(buddy) {
    const sessionId = selectedSessionByBuddy[buddy.id];
    if (!sessionId) return;

    const session = buddy.overlappingSessions.find((s) => s.id === sessionId);
    if (!session) return;

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        [`outgoingRequests.${buddy.id}`]: { session },
      });
      await updateDoc(doc(db, "users", buddy.id), {
        [`incomingRequests.${currentUser.uid}`]: { session },
      });

      setNewReachedOutIds((p) => new Set(p).add(buddy.id));
    } catch (e) {
      alert("Failed to reach out.");
    }
  }

  async function handleBlock(buddyId) {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        blockedBuddies: arrayUnion(buddyId),
      });
    } catch {}
    setBuddies((prev) => prev.filter((b) => b.id !== buddyId));
    setOpenMenuBuddyId(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] pt-20 pb-32 text-center text-sm text-gray-500">
        Loading buddies…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] pt-20 pb-32 text-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] pt-6 pb-32">
      <div className="max-w-md mx-auto px-4 space-y-6">
        {/* HEADER */}
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Found Buddies
          </h1>
          <p className="text-sm text-gray-500">
            Based on your latest availability.
          </p>
        </header>

        {/* LIST */}
        <div className="space-y-4">
          {buddies.map((buddy) => {
            const selected = selectedSessionByBuddy[buddy.id];
            const alreadyReached =
              existingReachedOutIds.has(buddy.id) ||
              newReachedOutIds.has(buddy.id);

            return (
              <div
                key={buddy.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                  {getInitials(buddy.name)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm text-gray-900">
                      {buddy.name}
                    </p>
                    <button
                      onClick={() =>
                        setOpenMenuBuddyId(
                          openMenuBuddyId === buddy.id ? null : buddy.id
                        )
                      }
                    >
                      <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Select a session:
                  </p>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    {buddy.overlappingSessions.slice(0, 2).map((s) => (
                      <button
                        key={s.id}
                        onClick={() =>
                          setSelectedSessionByBuddy((p) => ({
                            ...p,
                            [buddy.id]: s.id,
                          }))
                        }
                        className={`px-3 py-1 rounded-full text-xs border ${
                          selected === s.id
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <button
                      disabled={!selected || alreadyReached}
                      onClick={() => handleReachOut(buddy)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                        alreadyReached
                          ? "bg-emerald-100 text-emerald-700"
                          : selected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {alreadyReached ? "Reached out" : "Reach out"}
                    </button>
                  </div>
                </div>

                {/* Menu */}
                {openMenuBuddyId === buddy.id && (
                  <div className="absolute right-6 mt-10 bg-white border rounded shadow text-xs">
                    <button
                      onClick={() => handleBlock(buddy.id)}
                      className="px-3 py-2 text-red-600 hover:bg-gray-50"
                    >
                      Block user
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {buddies.length === 0 && (
          <p className="text-center text-sm text-gray-500">No buddies found.</p>
        )}
      </div>
    </div>
  );
}
