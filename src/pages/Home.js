import React from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="pt-16 pb-24">
      {/* Top Banner FOR HOME ONLY */}
      <div className="flex items-center justify-between bg-blue-200 px-4 py-3 shadow">
        <h1 className="text-2xl font-bold text-blue-800 tracking-tight">
          LionGains
        </h1>
        <button onClick={() => navigate("/settings")}>
          <Cog6ToothIcon className="h-7 w-7 text-blue-800 hover:text-blue-600 transition" />
        </button>
      </div>

      <h2 className="text-lg font-semibold px-4 mt-4 mb-2 text-gray-700">
        My Feed
      </h2>

      <div className="px-4 text-gray-500 italic">
        <p>Feed loading logic to be implemented by teammate…</p>
      </div>
    </div>
  );
}
