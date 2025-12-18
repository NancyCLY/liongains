import React, { useEffect, useMemo, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon, MapIcon } from "@heroicons/react/24/outline";
import { fetchVideosForSearch } from "../services/videoService";
import gymMap from "../assets/gym-map.png";

export default function Search() {
  const [query, setQuery] = useState("");
  const [activeMuscle, setActiveMuscle] = useState(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [alphabetical, setAlphabetical] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);


  useEffect(() => {
    async function load() {
      const data = await fetchVideosForSearch();
      setVideos(data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredVideos = useMemo(() => {
    let list = videos;

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((v) => v.title?.toLowerCase().includes(q));
    }

    if (activeMuscle) {
      list = list.filter((v) => v.tags?.includes(activeMuscle));
    }

    if (activeLocation) {
      list = list.filter((v) => v.tags?.includes(activeLocation));
    }

    if (alphabetical) {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [videos, query, activeMuscle, activeLocation, alphabetical]);


  function Pill({ label, active, onClick }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition
          ${
            active
              ? "bg-blue-100 text-blue-700 border-blue-300"
              : "bg-gray-100 text-gray-600 border-gray-200"
          }`}
      >
        {label}
      </button>
    );
  }


  return (
    <div className="pb-28">
      <div className="max-w-md mx-auto px-5 relative">
        <div className="relative flex items-center justify-center">
          <h1 className="text-2xl font-semibold text-center text-gray-900">
          Search
          </h1>

          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition"
            aria-label="Open map"
            title="Map"
          >
            <MapIcon className="h-6 w-6 text-blue-400 text-blue-400" />
          </button>
          </div>
          <p className="text-sm text-center text-gray-500 mt-1">
          Search your machine.
        </p>

        {/* Search bar */}
         <div className="pt-8 flex items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search machines"
              className="w-full h-11 pl-11 pr-4 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* SORTING OPTIONS */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Sorting Options:
          </h2>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
            {/* Muscle */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">
                Muscle group
              </p>
              <div className="flex gap-2">
                {["Upper body", "Lower body", "Cardio"].map((m) => (
                  <Pill
                    key={m}
                    label={m}
                    active={activeMuscle === m}
                    onClick={() =>
                      setActiveMuscle(activeMuscle === m ? null : m)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Location</p>
              <div className="flex gap-2">
                {["1st floor", "2nd floor", "3rd floor"].map((l) => (
                  <Pill
                    key={l}
                    label={l}
                    active={activeLocation === l}
                    onClick={() =>
                      setActiveLocation(activeLocation === l ? null : l)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Alphabetical */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">
                Alphabetical Order
              </p>
              <Pill
                label="A–Z"
                active={alphabetical}
                onClick={() => setAlphabetical((v) => !v)}
              />
            </div>
          </div>
        </section>

        {/* RESULTS */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Results:</h2>

          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : filteredVideos.length === 0 ? (
            <p className="text-sm italic text-gray-500">No videos found.</p>
          ) : (
            <div className="space-y-3">
              {filteredVideos.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl"
                >
                  <img
                    src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                    alt={v.title}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {v.title}
                    </p>
                    <div className="text-xs text-gray-500 space-x-2">
                      {v.tags?.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* MAP MODAL */}
      {showMap && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
          onClick={() => setShowMap(false)}
        >
          <div
            className="relative bg-white rounded-2xl p-4 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMap(false)}
              className="absolute top-3 right-3"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>

            <img src={gymMap} alt="Gym map" className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
