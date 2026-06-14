import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Search, User as UserIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { Avatar } from "../ui/Avatar";

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: unreadCount } = useUnreadCount();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(search.trim() ? `/tasks?search=${encodeURIComponent(search.trim())}` : "/tasks");
  }

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500"
          />
        </div>
      </form>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/notifications")}
          className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {!!unreadCount && unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100"
          >
            <Avatar name={user?.fullName || user?.username || "?"} size="sm" />
            <span className="hidden text-sm font-medium text-gray-700 sm:inline">
              {user?.fullName || user?.username}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-30">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <UserIcon className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  void logout();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
