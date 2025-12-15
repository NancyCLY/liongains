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
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

/* ---------- Helpers ---------- */

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

/* ---------- Page ---------- */

export default function Chats() {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [matches, setMatches] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to view your chats.");
      setLoading(false);
      return;
    }

    async function loadChats() {
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

          const isOutgoing = outgoingSet.has(id);
          const isIncoming = incomingSet.has(id);

          const baseInfo = {
            id,
            name,
            email,
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
        console.error("Error loading chats:", err);
        setError("Failed to load chats.");
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, [currentUser]);

  function handleStartChat(buddy) {
    alert(`Start chat with ${buddy.name}`);
  }

  /* ---------- Rendering ---------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] pt-20 pb-32 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading chats…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] pt-20 pb-32 flex items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const nothingToShow =
    matches.length === 0 &&
    incomingRequests.length === 0 &&
    outgoingRequests.length === 0;

  return (
    <div className="min-h-screen bg-[#F5F6F8] pt-6 pb-32">
      <div className="max-w-md mx-auto px-4 space-y-6">
        {/* ================= HEADER ================= */}
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">My Chats</h1>
          <p className="text-sm text-gray-500">
            See your matches and requests.
          </p>
        </header>

        {nothingToShow && (
          <p className="text-center text-sm text-gray-500 mt-6">
            You don’t have any chats yet.
          </p>
        )}

        {/* ================= MATCHES ================= */}
        {matches.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase">
              Matches
            </h2>

            {matches.map((buddy) => {
              const matchedSession =
                buddy.outgoingSession || buddy.incomingSession || null;

              return (
                <div
                  key={buddy.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {getInitials(buddy.name || buddy.email)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {buddy.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {buddy.email}
                    </p>
                    {matchedSession && (
                      <p className="text-xs text-gray-400 mt-1">
                        Matched: ({formatShortDate(matchedSession.date)}){" "}
                        {matchedSession.label}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartChat(buddy)}
                      className="px-4 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded-full"
                    >
                      Start chat
                    </button>
                    <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* ================= WAITING ON THEM ================= */}
        {outgoingRequests.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase">
              Waiting on them
            </h2>

            {outgoingRequests.map((buddy) => (
              <div
                key={buddy.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {getInitials(buddy.name || buddy.email)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {buddy.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {buddy.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Requested: ({formatShortDate(buddy.outgoingSession?.date)}){" "}
                    {buddy.outgoingSession?.label}
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
