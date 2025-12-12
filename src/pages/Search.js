import React, { useState, useMemo } from "react";

/*
  SEARCH PAGE — React version of Search.html (converted from mockup)
  Citation for original HTML structure and interactions:
  :contentReference[oaicite:2]{index=2}

  The visual structure / interaction design is based on:
  :contentReference[oaicite:3]{index=3}
*/

export default function Search() {
  /* --------------------------------------------------------------------------
     STATE
  -------------------------------------------------------------------------- */
  const [query, setQuery] = useState("");
  const [activeMuscle, setActiveMuscle] = useState("Upper body");
  const [activeLocation, setActiveLocation] = useState("2nd floor");
  const [alphabetical, setAlphabetical] = useState(true);

  /* Sample data (“Recently Searched”) */
  const machines = [
    { name: "Chest Press", group: "Upper body", location: "2nd floor" },
    { name: "Leg Press", group: "Lower body", location: "1st floor" },
    { name: "Treadmill", group: "Cardio", location: "3rd floor" },
    { name: "Lat Pulldown", group: "Upper body", location: "2nd floor" },
    { name: "Shoulder Press", group: "Upper body", location: "2nd floor" },
  ];

  /* --------------------------------------------------------------------------
     FILTERED MACHINE LIST
  -------------------------------------------------------------------------- */
  const filteredMachines = useMemo(() => {
    let list = machines;

    // text search
    if (query.trim()) {
      list = list.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    // muscle group filter
    if (activeMuscle) {
      list = list.filter((m) => m.group === activeMuscle);
    }

    // location filter
    if (activeLocation) {
      list = list.filter((m) => m.location === activeLocation);
    }

    // alphabetical
    if (alphabetical) {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [query, activeMuscle, activeLocation, alphabetical]);

  /* --------------------------------------------------------------------------
     PILL COMPONENT
  -------------------------------------------------------------------------- */
  const Pill = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-xs ${
        active
          ? "border-blue-500 bg-blue-100 text-blue-700"
          : "border-gray-300 bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </button>
  );

  /* --------------------------------------------------------------------------
     RENDER
  -------------------------------------------------------------------------- */
  return (
    <div className="pt-16 pb-24">
      {/* Inner container for “phone width” feel */}
      <div className="max-w-[360px] mx-auto pb-20">
        {/* ---------------------------------------------------------------
            SEARCH BAR
        ---------------------------------------------------------------- */}
        <section className="pt-5 pb-3">
          <div className="flex items-center gap-4">
            {/* Search input */}
            <div className="relative flex-1 max-w-[240px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search machines"
                className="w-full h-10 pl-8 pr-3 rounded-full border border-gray-300 text-sm"
              />
            </div>

            {/* Map button */}
            <button className="h-10 px-4 rounded-full border border-gray-300 bg-white text-sm hover:bg-gray-100">
              Map
            </button>
          </div>
        </section>

        {/* ---------------------------------------------------------------
            FILTERS
        ---------------------------------------------------------------- */}
        <section>
          <h2 className="text-[14px] font-semibold text-gray-600 mb-2">
            Sorting Options:
          </h2>

          <div className="border rounded-2xl p-4 bg-white shadow-sm">
            {/* Muscle Group */}
            <div className="mb-4">
              <p className="text-xs font-semibold mb-1 text-gray-600">
                Muscle group
              </p>
              <div className="flex flex-wrap gap-2">
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
            <div className="mb-4">
              <p className="text-xs font-semibold mb-1 text-gray-600">
                Location
              </p>
              <div className="flex flex-wrap gap-2">
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
              <p className="text-xs font-semibold mb-1 text-gray-600">
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

        {/* ---------------------------------------------------------------
            RECENTLY SEARCHED MACHINE LIST
        ---------------------------------------------------------------- */}
        <section className="mt-4">
          <h2 className="text-[14px] font-semibold text-gray-600 mb-2">
            Recently Searched:
          </h2>

          <div className="flex flex-col gap-3">
            {filteredMachines.length === 0 ? (
              <p className="text-gray-600 text-sm italic">No machines found.</p>
            ) : (
              filteredMachines.map((m, i) => (
                <article
                  key={i}
                  className="flex items-center gap-3 p-3 border rounded-2xl bg-white shadow-sm"
                >
                  {/* Thumbnail placeholder */}
                  <div className="w-[52px] h-[52px] rounded-lg bg-gray-200" />

                  {/* Info */}
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-gray-600">{m.group}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
