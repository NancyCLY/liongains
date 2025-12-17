import {
  EllipsisHorizontalIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../context/AuthContext";
import {
  getDoc,
} from "firebase/firestore";


export default function Profile() {

  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likedVideos, setLikedVideos] = useState([]);
  const [availability, setAvailability] = useState({});
  const [preferences, setPreferences] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to see matches.");
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
          setLoading(false);
          return;
        }

        const userData = userSnap.data();

        setLikedVideos(userData.likedVideos || []);
        setAvailability(userData.availability || {});
        setPreferences(userData.preferences || []);
        // Load user profile data here if needed
      } catch (err) {
        setError("An error occurred while loading your profile.");
      } finally {
        setLoading(false);
      }
    } loadProfile();
  }, [currentUser]);

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
        {/* ================= HEADER ================= */}
        <header className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        </header>

        {/* ================= USER CARD ================= */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-sm text-gray-600">
            IMG
          </div>

          {/* User info */}
          <div className="flex-1">
            <p className="font-semibold text-gray-900">John Doe</p>
            <p className="text-sm text-gray-500">Novice</p>

            <button className="mt-2 px-4 py-1.5 text-sm font-medium bg-blue-500 text-white rounded-full">
              Edit Profile
            </button>
          </div>

          {/* Menu */}
          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
        </section>

        {/* ================= PAST WORKOUTS ================= */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            Past Workouts
          </h2>

          <div className="space-y-2">
            <div className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700">
              Oct 6, 2025 · Lower body
            </div>
            <div className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700">
              Oct 20, 2025 · Full body
            </div>
          </div>
        </section>

        {/* ================= UPCOMING WORKOUTS (same visual style) ================= */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            Past Workouts
          </h2>

          <div className="space-y-2">
            <div className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700">
              Oct 6, 2025 · Lower body
            </div>
            <div className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700">
              Oct 20, 2025 · Full body
            </div>
          </div>
        </section>

        {/* ================= LIKED VIDEOS ================= */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            Liked Videos
          </h2>

          <div className="h-40 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-500">
            <VideoCameraIcon className="w-6 h-6 mb-1" />
            <span className="text-sm">Title</span>
          </div>
        </section>
      </div>
    </div>
  );
}