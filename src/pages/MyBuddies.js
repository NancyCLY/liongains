import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteField,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../services/firebase";

function formatShortDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getInitials(nameOrEmail = "") {
  if (!nameOrEmail) return "?";
  const base = nameOrEmail.split("@")[0];
  const parts = base.split(/[.\s_]/).filter(Boolean);
  if (parts.length === 0) return base[0]?.toUpperCase() ?? "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function MyBuddies() {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [matches, setMatches] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  const [openMenuBuddyId, setOpenMenuBuddyId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to view your buddies.");
      setLoading(false);
      return;
    }

    async function loadBuddies() {
      try {
        setLoading(true);
        setError("");

        const meRef = doc(db, "users", currentUser.uid);
        const meSnap = await getDoc(meRef);

        if (!meSnap.exists()) {
          setError("Your user profile could not be found.");
          setLoading(false);
          return;
        }

        const meData = meSnap.data();

        const outgoingMap = meData.outgoingRequests || {};
        const incomingMap = meData.incomingRequests || {};
        const blockedList = meData.blockedBuddies || [];

        const outgoingSet = new Set(Object.keys(outgoingMap));
        const incomingSet = new Set(Object.keys(incomingMap));
        const blockedSet = new Set(blockedList);

        const usersSnap = await getDocs(collection(db, "users"));

        const matchesArr = [];
        const incomingArr = [];
        const outgoingArr = [];

        usersSnap.forEach((uDoc) => {
          const id = uDoc.id;
          if (id === currentUser.uid) return;
          if (blockedSet.has(id)) return;

          const data = uDoc.data();
          const name = data.username || data.email || "GymBuddy user";
          const email = data.email || "";
          const preferences = data.preferences || [];

          const isOutgoing = outgoingSet.has(id);
          const isIncoming = incomingSet.has(id);

          const baseInfo = {
            id,
            name,
            email,
            preferences,
            incomingSession: incomingMap[id]?.session ?? null,
            outgoingSession: outgoingMap[id]?.session ?? null,
          };

          if (isOutgoing && isIncoming) {
            matchesArr.push(baseInfo);
          } else if (isIncoming) {
            incomingArr.push(baseInfo);
          } else if (isOutgoing) {
            outgoingArr.push(baseInfo);
          }
        });

        setMatches(matchesArr);
        setIncomingRequests(incomingArr);
        setOutgoingRequests(outgoingArr);
      } catch (err) {
        console.error("Error loading buddies:", err);
        setError("Failed to load buddies.");
      } finally {
        setLoading(false);
      }
    }

    loadBuddies();
  }, [currentUser]);

  // ---------- Firestore actions ----------

  async function handleRemoveMatch(buddy) {
    if (!currentUser) return;

    const ok = window.confirm(
      `Remove match with ${buddy.name}? This will also block them.`
    );
    if (!ok) return;

    try {
      const meRef = doc(db, "users", currentUser.uid);
      const buddyRef = doc(db, "users", buddy.id);

      await updateDoc(meRef, {
        [`buddyMatches.${buddy.id}`]: deleteField(),
        blockedBuddies: arrayUnion(buddy.id),
        [`incomingRequests.${buddy.id}`]: deleteField(),
        [`outgoingRequests.${buddy.id}`]: deleteField(),
      });

      await updateDoc(buddyRef, {
        [`buddyMatches.${currentUser.uid}`]: deleteField(),
        blockedBuddies: arrayUnion(currentUser.uid),
        [`incomingRequests.${currentUser.uid}`]: deleteField(),
        [`outgoingRequests.${currentUser.uid}`]: deleteField(),
      });

      setMatches((prev) => prev.filter((b) => b.id !== buddy.id));
      setOpenMenuBuddyId(null);
    } catch (err) {
      console.error("Error removing match:", err);
      alert("Failed to remove match.");
    }
  }

  async function handleAcceptRequest(buddy) {
    if (!currentUser) return;

    try {
      const meRef = doc(db, "users", currentUser.uid);
      const buddyRef = doc(db, "users", buddy.id);

      const sessionToUse = buddy.incomingSession;
      if (!sessionToUse) {
        alert("No session found for this request.");
        return;
      }

      const meUpdate = updateDoc(meRef, {
        [`outgoingRequests.${buddy.id}`]: { session: sessionToUse },
        [`buddyMatches.${buddy.id}`]: { session: sessionToUse },
      });

      const buddyUpdate = updateDoc(buddyRef, {
        [`buddyMatches.${currentUser.uid}`]: { session: sessionToUse },
      });

      await Promise.all([meUpdate, buddyUpdate]);

      setIncomingRequests((prev) => prev.filter((b) => b.id !== buddy.id));
      setMatches((prev) => [{ ...buddy, outgoingSession: sessionToUse }, ...prev]);
      setOpenMenuBuddyId(null);
    } catch (err) {
      console.error("Error accepting request:", err);
      alert("Failed to accept request.");
    }
  }

  async function handleDeclineRequest(buddy) {
    if (!currentUser) return;

    try {
      const meRef = doc(db, "users", currentUser.uid);
      const buddyRef = doc(db, "users", buddy.id);

      await updateDoc(meRef, {
        [`incomingRequests.${buddy.id}`]: deleteField(),
      });

      await updateDoc(buddyRef, {
        [`outgoingRequests.${currentUser.uid}`]: deleteField(),
      });

      setIncomingRequests((prev) => prev.filter((b) => b.id !== buddy.id));
      setOpenMenuBuddyId(null);
    } catch (err) {
      console.error("Error declining request:", err);
      alert("Failed to decline request.");
    }
  }

  async function handleCancelRequest(buddy) {
    if (!currentUser) return;

    try {
      const meRef = doc(db, "users", currentUser.uid);
      const buddyRef = doc(db, "users", buddy.id);

      await updateDoc(meRef, {
        [`outgoingRequests.${buddy.id}`]: deleteField(),
      });

      await updateDoc(buddyRef, {
        [`incomingRequests.${currentUser.uid}`]: deleteField(),
      });

      setOutgoingRequests((prev) => prev.filter((b) => b.id !== buddy.id));
      setOpenMenuBuddyId(null);
    } catch (err) {
      console.error("Error cancelling request:", err);
      alert("Failed to cancel request.");
    }
  }

  async function handleBlockUser(buddy) {
    if (!currentUser) return;

    const ok = window.confirm(`Block ${buddy.name}?`);
    if (!ok) return;

    try {
      const meRef = doc(db, "users", currentUser.uid);
      const buddyRef = doc(db, "users", buddy.id);

      await updateDoc(meRef, {
        blockedBuddies: arrayUnion(buddy.id),
        [`incomingRequests.${buddy.id}`]: deleteField(),
        [`outgoingRequests.${buddy.id}`]: deleteField(),
        [`buddyMatches.${buddy.id}`]: deleteField(),
      });

      await updateDoc(buddyRef, {
        blockedBuddies: arrayUnion(currentUser.uid),
        [`incomingRequests.${currentUser.uid}`]: deleteField(),
        [`outgoingRequests.${currentUser.uid}`]: deleteField(),
        [`buddyMatches.${currentUser.uid}`]: deleteField(),
      });

      setMatches((prev) => prev.filter((b) => b.id !== buddy.id));
      setIncomingRequests((prev) => prev.filter((b) => b.id !== buddy.id));
      setOutgoingRequests((prev) => prev.filter((b) => b.id !== buddy.id));
      setOpenMenuBuddyId(null);
    } catch (err) {
      console.error("Error blocking user:", err);
      alert("Failed to block user.");
    }
  }

  function handleStartChat(buddy) {
    alert(`Start chat with ${buddy.name}`);
  }

  // ---------- UI components ----------

  function BuddyCard({ buddy, label, topRight, bottomRight }) {
    const initials = getInitials(buddy.name || buddy.email);

    return (
      <article className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-4 flex gap-5">
        {/* Avatar */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
            {initials}
          </div>
        </div>

        {/* Content + right side */}
        <div className="flex-1 flex items-stretch">
          {/* Left / middle content */}
          <div className="flex flex-col justify-center flex-1 max-w-[260px]">
            <h2 className="text-sm font-semibold text-slate-900 truncate">
              {buddy.name}
            </h2>

            {buddy.email && (
              <p className="text-xs text-slate-500 truncate">{buddy.email}</p>
            )}

            {label && (
              <p className="mt-2 text-[11px] text-slate-500">{label}</p>
            )}
          </div>

          {/* Right column: menu at top-right + button at bottom-right */}
          <div className="flex flex-col items-end ml-4 min-w-[96px]">
            <div className="w-full flex justify-end">{topRight}</div>
            <div className="mt-auto">{bottomRight}</div>
          </div>
        </div>
      </article>
    );
  }

  function ThreeDotMenu({ buddy, items = [] }) {
    return (
      <div className="relative">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
          onClick={() =>
            setOpenMenuBuddyId((prev) => (prev === buddy.id ? null : buddy.id))
          }
          aria-label="Open menu"
          title="More"
        >
          •••
        </button>

        {openMenuBuddyId === buddy.id && (
          <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-md shadow-lg text-xs z-10 overflow-hidden">
            {items.map((it) => (
              <button
                key={it.label}
                type="button"
                onClick={it.onClick}
                className={`w-full text-left px-3 py-2 hover:bg-slate-50 ${
                  it.danger ? "text-red-600" : "text-slate-700"
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------- Rendering ----------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-10">
        <div className="max-w-lg mx-auto px-4">
          <p className="text-center text-sm text-slate-500">
            Loading your buddies…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-10">
        <div className="max-w-lg mx-auto px-4">
          <p className="text-center text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const nothingToShow =
    matches.length === 0 &&
    incomingRequests.length === 0 &&
    outgoingRequests.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-semibold text-center text-slate-900">
          My buddies
        </h1>
        <p className="text-slate-500 text-sm text-center mt-1">
          See your matches and requests.
        </p>

        {nothingToShow && (
          <p className="mt-8 text-center text-sm text-slate-500">
            You don't have any buddies yet. Try matching from the{" "}
            <span className="font-medium">Found buddies</span> page.
          </p>
        )}

        {/* Matches */}
        {matches.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Matches
            </h2>
            <div className="space-y-3">
              {matches.map((buddy) => (
                <BuddyCard
                  key={buddy.id}
                  buddy={buddy}
                  label="You both reached out. Ready to train together!"
                  topRight={
                    <ThreeDotMenu
                      buddy={buddy}
                      items={[
                        {
                          label: "Remove match",
                          danger: true,
                          onClick: () => handleRemoveMatch(buddy),
                        },
                      ]}
                    />
                  }
                  bottomRight={
                    <button
                      type="button"
                      onClick={() => handleStartChat(buddy)}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold transition shadow-sm bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Start chat
                    </button>
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Incoming requests */}
        {incomingRequests.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Requests to you
            </h2>
            <div className="space-y-3">
              {incomingRequests.map((buddy) => (
                <BuddyCard
                  key={buddy.id}
                  buddy={buddy}
                  label={`Requested: (${formatShortDate(
                    buddy.incomingSession?.date
                  )}) ${buddy.incomingSession?.label ?? "session"}`}
                  topRight={
                    <ThreeDotMenu
                      buddy={buddy}
                      items={[
                        {
                          label: "Block user",
                          danger: true,
                          onClick: () => handleBlockUser(buddy),
                        },
                      ]}
                    />
                  }
                  bottomRight={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(buddy)}
                        className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm hover:bg-emerald-600"
                        title="Accept"
                        aria-label="Accept"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineRequest(buddy)}
                        className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shadow-sm hover:bg-slate-300"
                        title="Decline"
                        aria-label="Decline"
                      >
                        ✕
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Outgoing requests */}
        {outgoingRequests.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Waiting on them
            </h2>
            <div className="space-y-3">
              {outgoingRequests.map((buddy) => (
                <BuddyCard
                  key={buddy.id}
                  buddy={buddy}
                  label={`Requested: (${formatShortDate(
                    buddy.outgoingSession?.date
                  )}) ${buddy.outgoingSession?.label ?? "session"}`}
                  topRight={
                    <ThreeDotMenu
                      buddy={buddy}
                      items={[
                        {
                          label: "Cancel request",
                          danger: true,
                          onClick: () => handleCancelRequest(buddy),
                        },
                        {
                          label: "Block user",
                          danger: true,
                          onClick: () => handleBlockUser(buddy),
                        },
                      ]}
                    />
                  }
                  // bottomRight={
                  //   <button
                  //     type="button"
                  //     onClick={() => handleCancelRequest(buddy)}
                  //     className="px-4 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                  //   >
                  //     Cancel
                  //   </button>
                  // }
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
