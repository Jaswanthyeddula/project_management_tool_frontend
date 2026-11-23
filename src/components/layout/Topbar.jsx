import React, { useState } from "react";
import {
  Menu,
  ChevronDown,
  Folder,
  Search,
  Sun,
  Moon,
  Bell,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { Avatar } from "../common/Avatar";

export function Topbar({
  dark,
  setDark,
  unreadCount = 0,
  setPage,
  setAuthView,
  onOpenMobileMenu,
  currentUser,
  workspacesList = [],
  selectedWorkspace,
  onSelectWorkspace,
  onLogout,
}) {
  const [wsOpen, setWsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Clean up cached flowspace keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("flowspace_")) {
          localStorage.removeItem(key);
        }
      });
      setAuthView?.("login");
    }
    setProfileOpen(false);
  };

  return (
    <header
      className={`h-16 shrink-0 flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-8 border-b sticky top-0 z-30 transition-colors ${
        dark
          ? "bg-[#0B0F19]/95 border-[#1E293B] backdrop-blur-md"
          : "bg-white/95 border-slate-200 backdrop-blur-md"
      }`}
    >
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl border transition-all text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          title="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="relative shrink-0">
          <button
            onClick={() => setWsOpen((o) => !o)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
              dark
                ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-xs shrink-0" />
            <span className="whitespace-nowrap font-bold">
              {selectedWorkspace || workspacesList[0]?.name || "Workspace"}
            </span>
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </button>
          {wsOpen && (
            <div
              className={`absolute left-0 mt-2 w-52 rounded-xl border shadow-xl py-1.5 z-50 ${
                dark
                  ? "bg-slate-900 border-slate-800 text-slate-200"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Workspaces
              </div>
              {(workspacesList.length > 0
                ? workspacesList
                : [{ id: "gen", name: "General Workspace" }]
              ).map((w) => {
                const wsName = typeof w === "string" ? w : w.name;
                return (
                  <div
                    key={wsName}
                    onClick={() => {
                      onSelectWorkspace?.(wsName);
                      setWsOpen(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors ${
                      dark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                    }`}
                  >
                    <Folder size={14} className="text-indigo-500 shrink-0" />
                    <span>{wsName}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative w-64 sm:w-72 max-w-sm shrink min-w-0">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            placeholder="Search projects, tasks, team..."
            style={{ paddingLeft: "38px", paddingRight: "40px" }}
            className={`w-full py-2 rounded-xl text-xs border outline-none transition-all ${
              dark
                ? "bg-slate-900/60 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500"
                : "bg-slate-100/80 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
            }`}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded pointer-events-none">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setDark((d) => !d)}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          className={`p-2 rounded-xl border transition-all ${
            dark
              ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs"
          }`}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={() => setPage("notifications")}
          className={`p-2 rounded-xl border relative transition-all ${
            dark
              ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs"
          }`}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
          )}
        </button>

        <div className="relative ml-1">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:ring-2 hover:ring-indigo-500/20 transition"
          >
            <Avatar name={currentUser?.name || "User"} size={8} />
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {profileOpen && (
            <div
              className={`absolute right-0 mt-2 w-52 rounded-xl border shadow-xl py-1.5 z-50 ${
                dark
                  ? "bg-slate-900 border-slate-800 text-slate-200"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800">
                <p
                  className={`text-xs font-bold truncate ${
                    dark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  {currentUser?.name || "User"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentUser?.email || ""}
                </p>
              </div>
              <div
                onClick={() => {
                  setPage("profile");
                  setProfileOpen(false);
                }}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2.5 ${
                  dark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                }`}
              >
                <UserIcon size={15} /> Profile & Settings
              </div>
              <div
                onClick={handleLogout}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2.5 text-rose-500 ${
                  dark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                }`}
              >
                <LogOut size={15} /> Sign out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
