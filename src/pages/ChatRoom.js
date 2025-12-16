import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

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

export default function ChatRoom() {
  const { currentUser } = useAuth();
  const { buddyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [draftMessage, setDraftMessage] = useState("");


  // Try to use buddy passed from Chats page; fallback to fetch if user refreshes
  const buddyFromState = location.state?.buddy;

  const [buddy, setBuddy] = useState(buddyFromState || null);
  const [loading, setLoading] = useState(!buddyFromState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (buddyFromState) return;

    async function loadBuddy() {
      try {
        setLoading(true);
        setError("");

        const ref = doc(db, "users", buddyId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("Buddy not found.");
          return;
        }

        const data = snap.data();
        setBuddy({
          id: buddyId,
          name: data.username || data.email || "GymBuddy user",
          email: data.email || "",
        });
      } catch (e) {
        console.error(e);
        setError("Failed to load chat.");
      } finally {
        setLoading(false);
      }
    }

    if (buddyId) loadBuddy();
  }, [buddyId, buddyFromState]);


  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-10 px-5">
        <p className="text-center text-sm text-red-500">
          You must be logged in to view chats.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-10 px-5">
        <p className="text-center text-sm text-slate-500">Loading chat…</p>
      </div>
    );
  }

  if (error || !buddy) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-10 px-5">
        <p className="text-center text-sm text-red-500">{error || "Chat error"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="max-w-lg mx-auto px-5 pt-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
            aria-label="Back"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
            {getProfileImageSrc(buddy.id) ? (
              <img
                src={getProfileImageSrc(buddy.id)}
                alt={buddy.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {buddy.name}
            </div>
            {buddy.email ? (
              <div className="text-xs text-slate-500 truncate">{buddy.email}</div>
            ) : (
              <div className="text-xs text-slate-500">Active now</div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="mt-4 space-y-2">
          <div className="mt-16 flex flex-col items-center justify-center text-center px-6">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              💬
            </div>

            <h2 className="text-sm font-semibold text-slate-800">
              No messages yet
            </h2>

            <p className="mt-1 text-xs text-slate-500 max-w-xs">
              You and {buddy.name} haven’t started chatting yet.
              Send the first message when chat is enabled.
            </p>
          </div>
        </div>
      </div>

      {/* Input (non-functional but typeable) */}
      <div className="fixed bottom-16 left-0 right-0 bg-slate-50 border-t border-slate-200">
        <div className="max-w-lg mx-auto px-5 py-3 flex items-center gap-2">
          <input
            type="text"
            value={draftMessage}
            onChange={(e) => setDraftMessage(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={() => {
              /* intentionally empty */
            }}
            className="px-5 py-3 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.98]"
            aria-label="Send message"
            title="Send"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
}
