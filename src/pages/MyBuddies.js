import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

function getInitials(nameOrEmail = "") {
  if (!nameOrEmail) return "?";

  // If there's an @, it's probably an email – use the part before @
  const base = nameOrEmail.split("@")[0];

  const parts = base.split(/[.\s_]/).filter(Boolean);
  if (parts.length === 0) return base[0].toUpperCase();
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

        // 1. Load current user doc
        const meRef = doc(db, "users", currentUser.uid);
        const meSnap = await getDoc(meRef);

        if (!meSnap.exists()) {
          setError("Your user profile could not be found.");
          setLoading(false);
          return;
        }

        const meData = meSnap.data();
        const reachedOutList = meData.reachedOutBuddies || [];
        const buddyRequestsList = meData.buddyRequests || [];
        const blockedList = meData.blockedBuddies || [];

        const reachedOutSet = new Set(reachedOutList);
        const requestsSet = new Set(buddyRequestsList);
        const blockedSet = new Set(blockedList);

        // 2. Load all users and classify relationships
        const usersSnap = await getDocs(collection(db, "users"));

        const matchesArr = [];
        const incomingArr = [];
        const outgoingArr = [];

        usersSnap.forEach((uDoc) => {
          const id = uDoc.id;
          if (id === currentUser.uid) return; // skip self
          if (blockedSet.has(id)) return; // skip blocked

          const data = uDoc.data();
          const name = data.name || data.email || "GymBuddy user";
          const email = data.email || "";
          const preferences = data.preferences || [];

          const reachedOut = reachedOutSet.has(id);
          const requestedMe = requestsSet.has(id);

          const baseInfo = {
            id,
            name,
            email,
            preferences,
          };

          if (reachedOut && requestedMe) {
            // mutual -> real match
            matchesArr.push(baseInfo);
          } else if (requestedMe) {
            // they reached out to me, I haven't yet
            incomingArr.push(baseInfo);
          } else if (reachedOut) {
            // I reached out to them, waiting
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

  function handleStartChat(buddy) {
    // TODO: Replace with real navigation to chat screen
    alert(`Start chat with ${buddy.name}`);
  }

  // ---------- UI components ----------

  function BuddyCard({ buddy, label, buttonText, buttonDisabled }) {
    const initials = getInitials(buddy.name || buddy.email);

    return (
      <article className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-4 flex gap-5">
        {/* Avatar */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
            {initials}
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 flex items-stretch">
          <div className="flex flex-col justify-center flex-1 max-w-[260px]">
            <h2 className="text-sm font-semibold text-slate-900 truncate">
              {buddy.name}
            </h2>
            {buddy.email && (
              <p className="text-xs text-slate-500 truncate">
                {buddy.email}
              </p>
            )}

            {buddy.preferences?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
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

            {label && (
              <p className="mt-2 text-[11px] text-slate-500">{label}</p>
            )}
          </div>

          {/* Button aligned right */}
          <div className="flex flex-col justify-center items-end ml-4">
            <button
              type="button"
              disabled={buttonDisabled}
              onClick={() => handleStartChat(buddy)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition shadow-sm ${
                buttonDisabled
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </article>
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
                  buttonText="Start chat"
                  buttonDisabled={false}
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
                  label="This buddy reached out to you."
                  buttonText="Start chat"
                  buttonDisabled={true} // for now; you can later add Accept/Match
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
                  label="You've reached out. Waiting for them to respond."
                  buttonText="Pending"
                  buttonDisabled={true}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
