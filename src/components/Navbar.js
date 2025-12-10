import { NavLink } from "react-router-dom";

import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import {
  HomeIcon as HomeSolid,
  MagnifyingGlassIcon as MagnifyingGlassSolid,
  PlusCircleIcon as PlusSolid,
  UserGroupIcon as UserGroupSolid,
  UserIcon as UserSolid,
} from "@heroicons/react/24/solid";

export default function Navbar() {
  const navItems = [
    { to: "/", label: "Home", icon: HomeIcon, activeIcon: HomeSolid },
    {
      to: "/search",
      label: "Search",
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassSolid,
    },
    {
      to: "/upload",
      label: "Add",
      icon: PlusCircleIcon,
      activeIcon: PlusSolid,
    },
    {
      to: "/gymbuddy",
      label: "Buddies",
      icon: UserGroupIcon,
      activeIcon: UserGroupSolid,
    },
    {
      to: "/profile",
      label: "Profile",
      icon: UserIcon,
      activeIcon: UserSolid,
    },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-blue-100 border-b shadow-sm z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-blue-800">LionGains</span>
        </div>

        {/* Nav items */}
        <nav className="flex items-center gap-6 text-sm">
          {navItems.map(({ to, label, icon: Icon, activeIcon: ActiveIcon }) => (
            <NavLink key={to} to={to} className="flex items-center gap-1">
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <ActiveIcon className="h-5 w-5 text-blue-700" />
                  ) : (
                    <Icon className="h-5 w-5 text-gray-600" />
                  )}
                  <span
                    className={isActive ? "text-blue-700" : "text-gray-700"}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
