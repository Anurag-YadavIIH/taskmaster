import { NavLink } from "react-router-dom";
import { Bell, ClipboardList, LayoutGrid, Users } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { to: "/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/teams", label: "Teams", icon: Users },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-gray-200 bg-white px-3 py-4 sm:flex">
      <div className="mb-6 flex items-center gap-2 px-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <LayoutGrid className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold text-gray-900">TaskMaster</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
