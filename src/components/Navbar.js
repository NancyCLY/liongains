import { NavLink } from "react-router-dom";

import {
  HomeIcon,
  MagnifyingGlassIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import {
  HomeIcon as HomeSolid,
  MagnifyingGlassIcon as MagnifyingGlassSolid,
  ChatBubbleOvalLeftEllipsisIcon as ChatSolid,
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
      to: "/chats",
      label: "Chats",
      icon: ChatBubbleOvalLeftEllipsisIcon,
      activeIcon: ChatSolid,
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
    <nav className="fixed bottom-0 left-0 w-full bg-blue-100 border-t shadow-md z-50">
      <div className="w-full h-16 flex items-center justify-around px-2">
        {navItems.map(({ to, label, icon: Icon, activeIcon: ActiveIcon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col sm:flex-row items-center sm:gap-1 flex-1 justify-center"
          >
            {({ isActive }) => (
              <>
                {/* Icon (always visible) */}
                {isActive ? (
                  <ActiveIcon className="h-6 w-6 text-blue-700" />
                ) : (
                  <Icon className="h-6 w-6 text-gray-600" />
                )}

                {/* Label (hidden on mobile, shown on larger screens) */}
                <span
                  className={`hidden sm:block text-sm ${
                    isActive ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
