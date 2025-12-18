import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../services/firebase";

const DAY_LABELS = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];
const MAX_BUDDIES_TOTAL = 5;

// ---------- Helpers ----------

// currentAvailability & buddyAvailability are maps: { [isoDate]: number[] }

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

  // sort by date then hour
  overlaps.sort((a, b) => {
    if (a.date === b.date) return a.hour - b.hour;
    return a.date < b.date ? -1 : 1;
  });

  return overlaps;
}

function formatSessionLabel(dateStr, hour24) {
  const d = new Date(`${dateStr}T00:00:00`);
  const dow = DAY_LABELS[d.getDay()];

  const startHour = hour24;
  const endHour = Math.min(hour24 + 2, 24); // simple 2-hour block like "8-10"

  const startLabel = formatHour12(startHour);
  const endLabel = formatHour12(endHour);

  // Example: "M 8-10"
  return `${dow} ${startLabel}-${endLabel}`;
}

function formatHour12(hour24) {
  const h = (hour24 % 12) || 12;
  return `${h}`;
}

export default function FoundBuddies() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [buddies, setBuddies] = useState([]);
  const [showAllSessions, setShowAllSessions] = useState({}); 
  const [selectedSessionByBuddy, setSelectedSessionByBuddy] = useState({});

  const [existingReachedOutIds, setExistingReachedOutIds] = useState(new Set());
  const [newReachedOutIds, setNewReachedOutIds] = useState(new Set());

  const [openMenuBuddyId, setOpenMenuBuddyId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to see matches.");
      setLoading(false);
      return;
    }

    async function loadMatches() {
      try {
        setLoading(true);
        setError("");

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError("Your user profile could not be found.");
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        console.log(userData.availability);
        const currentAvailability = userData.availability || {};

        const outgoingMap = userData.outgoingRequests || {};
        const incomingMap = userData.incomingRequests || {};
        const matchesMap = userData.buddyMatches || {};

        const reachedOutSet = new Set(Object.keys(outgoingMap));
        setExistingReachedOutIds(reachedOutSet);

        const blockedList = userData.blockedBuddies || [];

        const excludeSet = new Set([
          ...blockedList,
          ...Object.keys(outgoingMap),
          ...Object.keys(incomingMap),
          ...Object.keys(matchesMap),
        ]);

        // Fetch all users
        const usersSnap = await getDocs(collection(db, "users"));
        const allMatches = [];

        usersSnap.forEach((buddyDoc) => {
          const buddyId = buddyDoc.id;

          if (buddyId === currentUser.uid) return;
          if (excludeSet.has(buddyId)) return;

          const data = buddyDoc.data();

          const theyBlockedMe =
            (data.blockedBuddies || []).includes(currentUser.uid);
          if (theyBlockedMe) return;

          const buddyAvailability = data.availability || {};
          const overlaps = computeAllOverlappingSessions(
            currentAvailability,
            buddyAvailability
          );

          if (overlaps.length === 0) return;

          allMatches.push({
            id: buddyId,
            name: data.username || data.email || "Gym Buddy",
            preferences: data.preferences || [],
            overlappingSessions: overlaps,
            overlapCount: overlaps.length,
          });
        });

        // Sort buddies by number of overlapping sessions (most → least)
        allMatches.sort((a, b) => b.overlapCount - a.overlapCount);

        // Show only top 5
        setBuddies(allMatches.slice(0, 5));
      } catch (err) {
        console.error("Error loading matches:", err);
        setError("Failed to load buddies.");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [currentUser]);

  const totalReachedOut = existingReachedOutIds.size + newReachedOutIds.size;

  function toggleShowAllSessions(buddyId) {
    setShowAllSessions((prev) => ({
      ...prev,
      [buddyId]: !prev[buddyId],
    }));
  }

  function handleSelectSession(buddyId, sessionId) {
    setSelectedSessionByBuddy((prev) => ({
      ...prev,
      [buddyId]: prev[buddyId] === sessionId ? null : sessionId,
    }));
  }

  async function handleReachOut(buddy) {
    if (!currentUser) return;

    const buddyId = buddy.id;
    const sessionId = selectedSessionByBuddy[buddyId];
    if (!sessionId) return;

    const alreadyReached =
      existingReachedOutIds.has(buddyId) || newReachedOutIds.has(buddyId);

    if (!alreadyReached && totalReachedOut >= MAX_BUDDIES_TOTAL) return;

    const chosenSession = buddy.overlappingSessions.find(
      (s) => s.id === sessionId
    );
    if (!chosenSession) return;

    const payload = {
      session: {
        id: chosenSession.id,
        date: chosenSession.date,
        hour: chosenSession.hour,
        label: chosenSession.label,
      },
    };

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const buddyRef = doc(db, "users", buddyId);

      await updateDoc(userRef, {
        [`outgoingRequests.${buddyId}`]: payload,
      });

      await updateDoc(buddyRef, {
        [`incomingRequests.${currentUser.uid}`]: payload,
      });

      setNewReachedOutIds((prev) => {
        const next = new Set(prev);
        next.add(buddyId);
        return next;
      });

      alert(
        `You reached out to ${buddy.name} for session: ${chosenSession.label}`
      );

    } catch (err) {
      console.error("Error reaching out:", err);
      alert("There was an error sending your request.");
    }
  }

  async function handleBlock(buddyId) {
    if (!currentUser) {
      setBuddies((prev) => prev.filter((b) => b.id !== buddyId));
      return;
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        blockedBuddies: arrayUnion(buddyId),
      });
    } catch (err) {
      console.warn("Failed to persist block, but removing locally:", err);
    }

    setBuddies((prev) => prev.filter((b) => b.id !== buddyId));
    setSelectedSessionByBuddy((prev) => {
      const next = { ...prev };
      delete next[buddyId];
      return next;
    });
    setNewReachedOutIds((prev) => {
      const next = new Set(prev);
      next.delete(buddyId);
      return next;
    });
    setOpenMenuBuddyId(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-10">
        <div className="max-w-lg mx-auto px-4">
          <p className="text-sm text-slate-500 text-center">
            Loading your buddies…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 pb-10">
        <div className="max-w-lg mx-auto px-4">
          <p className="text-sm text-red-500 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-lg mx-auto px-4">

      <div className="relative mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Back
        </button>

        <h1 className="text-3xl font-semibold text-center text-slate-900">
          Found buddies
        </h1>
      </div>

      <p className="text-slate-500 text-sm text-center mt-1">
        Based on your latest availability.
      </p>

        <div className="mt-6 space-y-4">
          {buddies.map((buddy) => {
            const showAll = !!showAllSessions[buddy.id];
            const sessionsToShow = showAll
              ? buddy.overlappingSessions
              : buddy.overlappingSessions.slice(0, 2);
            const remainingCount =
              buddy.overlappingSessions.length - sessionsToShow.length;

            const selectedSessionId = selectedSessionByBuddy[buddy.id] || null;
            const hasSelectedSession = !!selectedSessionId;

            const alreadyReached =
              existingReachedOutIds.has(buddy.id) ||
              newReachedOutIds.has(buddy.id);

            const disableReachOut =
              !hasSelectedSession ||
              (!alreadyReached && totalReachedOut >= MAX_BUDDIES_TOTAL);

            let helperText = "";
            if (totalReachedOut >= MAX_BUDDIES_TOTAL && !alreadyReached) {
              helperText = `Limit of ${MAX_BUDDIES_TOTAL} buddies reached.`;
            }

            return (
              <article
                key={buddy.id}
                className="bg-white rounded-full shadow-sm border border-slate-100 px-6 py-5 flex gap-8"
              >
                <div className="flex-shrink-0 flex items-center justify-center">
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

                <div className="flex-1 flex items-stretch">
                  <div className="flex flex-col justify-center flex-1 max-w-[240px]">
                    <h2 className="text-sm font-semibold text-slate-900 mb-1 truncate">
                      {buddy.name}
                    </h2>

                    {buddy.preferences?.length > 0 && (
                      <div className="mt-1 mb-2 flex flex-wrap gap-1.5">
                        {buddy.preferences.map((pref) => (
                          <span
                            key={pref}
                            className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate-700"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-[11px] font-medium text-slate-600 mb-1">
                      Select a session:
                    </p>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      {sessionsToShow.map((session) => {
                        const isSelected = selectedSessionId === session.id;
                        return (
                          <button
                            key={session.id}
                            type="button"
                            onClick={() =>
                              handleSelectSession(buddy.id, session.id)
                            }
                            className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                : "bg-blue-50/60 border-blue-100 text-blue-700 hover:bg-blue-100"
                            }`}
                          >
                            {session.label}
                          </button>
                        );
                      })}

                      {remainingCount > 0 && !showAll && (
                        <button
                          type="button"
                          onClick={() => toggleShowAllSessions(buddy.id)}
                          className="text-[11px] text-blue-600 underline ml-1"
                        >
                          +{remainingCount} more
                        </button>
                      )}
                      {showAll && buddy.overlappingSessions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => toggleShowAllSessions(buddy.id)}
                          className="text-[11px] text-blue-600 underline ml-1"
                        >
                          show less
                        </button>
                      )}
                    </div>

                    {helperText && (
                      <p className="mt-2 text-[11px] text-slate-500">
                        {helperText}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col justify-between items-end ml-4 mr-6">
                    <div className="relative">
                      <button
                        type="button"
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                        onClick={() =>
                          setOpenMenuBuddyId((prev) =>
                            prev === buddy.id ? null : buddy.id
                          )
                        }
                      >
                        •••
                      </button>
                      {openMenuBuddyId === buddy.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-md shadow-lg text-xs z-10">
                          <button
                            type="button"
                            onClick={() => handleBlock(buddy.id)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 text-red-600"
                          >
                            Block user
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReachOut(buddy)}
                      disabled={disableReachOut}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition shadow-sm ${
                        alreadyReached
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                          : disableReachOut
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {alreadyReached ? "Reached out" : "Reach out"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {buddies.length === 0 && (
          <p className="mt-6 text-sm text-center text-slate-500">
            No buddies found with overlapping availability. Try adjusting your
            schedule.
          </p>
        )}
      </div>
    </div>
  );
}
