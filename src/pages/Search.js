import React, { useState, useMemo } from "react";
import { MagnifyingGlassIcon, MapIcon } from "@heroicons/react/24/outline";

export default function Search() {
  /* --------------------------------------------------------------------------
     STATE
  -------------------------------------------------------------------------- */
  const [query, setQuery] = useState("");
  const [activeMuscle, setActiveMuscle] = useState("Upper body");
  const [activeLocation, setActiveLocation] = useState("1st floor");
  const [alphabetical, setAlphabetical] = useState(true);

  /* Sample data (“Recently Searched”) */
  const machines = [
    { name: "Chest Press", group: "Upper body", location: "2nd floor" },
    { name: "Leg Press", group: "Lower body", location: "1st floor" },
    { name: "Treadmill", group: "Cardio", location: "3rd floor" },
  ];

  /* --------------------------------------------------------------------------
     FILTERED LIST
  -------------------------------------------------------------------------- */
  const filteredMachines = useMemo(() => {
    let list = machines;

    if (query.trim()) {
      list = list.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (activeMuscle) {
      list = list.filter((m) => m.group === activeMuscle);
    }

    if (activeLocation) {
      list = list.filter((m) => m.location === activeLocation);
    }

    if (alphabetical) {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [query, activeMuscle, activeLocation, alphabetical]);

  /* --------------------------------------------------------------------------
     PILL COMPONENT
  -------------------------------------------------------------------------- */
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

  /* --------------------------------------------------------------------------
     RENDER
  -------------------------------------------------------------------------- */
  return (
    
    <div className="pb-28">
      <div className="max-w-md mx-auto px-5 relative">
        <div className="relative flex items-center justify-center">
          <h1 className="text-2xl font-semibold text-center text-gray-900">
          Search
          </h1>

          <button
            type="button"
            onClick={() => console.log("Open map")}
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

        {/* Sorting options */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Sorting Options:
          </h2>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
            {/* Muscle group */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">
                Muscle group
              </p>
              <div className="flex gap-2">
                <Pill
                  label="Upper body"
                  active={activeMuscle === "Upper body"}
                  onClick={() => setActiveMuscle("Upper body")}
                />
                <Pill
                  label="Lower body"
                  active={activeMuscle === "Lower body"}
                  onClick={() => setActiveMuscle("Lower body")}
                />
                <Pill
                  label="Cardio"
                  active={activeMuscle === "Cardio"}
                  onClick={() => setActiveMuscle("Cardio")}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Location</p>
              <div className="flex gap-2">
                <Pill
                  label="1st floor"
                  active={activeLocation === "1st floor"}
                  onClick={() => setActiveLocation("1st floor")}
                />
                <Pill
                  label="2nd floor"
                  active={activeLocation === "2nd floor"}
                  onClick={() => setActiveLocation("2nd floor")}
                />
                <Pill
                  label="3rd floor"
                  active={activeLocation === "3rd floor"}
                  onClick={() => setActiveLocation("3rd floor")}
                />
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
                onClick={() => setAlphabetical(true)}
              />
            </div>
          </div>
        </section>

        {/* Recently searched */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Recently Searched:
          </h2>

          {filteredMachines.length === 0 ? (
            <p className="text-sm italic text-gray-500">No machines found.</p>
          ) : (
            <div className="space-y-3">
              {filteredMachines.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-200" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {m.name}
                    </p>
                    <p className="text-xs text-gray-500">{m.group}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
