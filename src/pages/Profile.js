import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/outline";

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-100 pt-6 pb-32">
      <div className="max-w-md mx-auto px-4 space-y-4">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Profile</h1>

          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded">
              Logout
            </button>
            <button className="px-3 py-1 text-xs font-semibold text-white bg-gray-500 rounded">
              Settings
            </button>
          </div>
        </div>

        {/* ================= USER CARD ================= */}
        <section className="bg-white rounded-md shadow-sm p-4 flex gap-4 items-center">
          {/* Avatar placeholder */}
          <div className="w-16 h-16 bg-gray-200 border rounded flex items-center justify-center">
            <span className="text-gray-400 text-sm">IMG</span>
          </div>

          <div className="flex-1">
            <p className="font-semibold text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">Novice</p>

            <button className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded">
              Edit Profile
            </button>
          </div>
        </section>

        {/* ================= UPCOMING SESSIONS ================= */}
        <section className="bg-white rounded-md shadow-sm">
          <h2 className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">
            Upcoming Sessions
          </h2>

          <div className="px-4 py-2 space-y-2 text-sm text-gray-700">
            <div className="bg-gray-100 px-3 py-2 rounded">
              Monday, Nov 24, 2025 · 10:00 AM · Cardio
            </div>
            <div className="bg-gray-100 px-3 py-2 rounded">
              Friday, Nov 28, 2025 · 3:00 PM · Upper body
            </div>
          </div>
        </section>

        {/* ================= PAST WORKOUTS ================= */}
        <section className="bg-white rounded-md shadow-sm">
          <h2 className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">
            Past Workouts
          </h2>

          <div className="px-4 py-2 space-y-2 text-sm text-gray-700">
            <div className="bg-gray-100 px-3 py-2 rounded">
              Oct 6, 2025 · Lower body
            </div>
            <div className="bg-gray-100 px-3 py-2 rounded">
              Oct 20, 2025 · Full body
            </div>
          </div>
        </section>

        {/* ================= MY BUDDIES ================= */}
        <section className="bg-white rounded-md shadow-sm">
          <h2 className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">
            My Buddies
          </h2>

          <div className="divide-y">
            {["Jane Smith", "Mike Johnson"].map((name) => (
              <div
                key={name}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 border rounded flex items-center justify-center text-xs text-gray-400">
                    IMG
                  </div>
                  <span className="text-sm text-gray-800">{name}</span>
                </div>

                <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-blue-500" />
              </div>
            ))}
          </div>
        </section>

        {/* ================= LIKED VIDEOS ================= */}
        <section className="bg-white rounded-md shadow-sm">
          <h2 className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">
            Liked Videos
          </h2>

          <div className="p-4 grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500"
              >
                🎬 Title
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
