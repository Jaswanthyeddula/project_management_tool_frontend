import React from "react";
import { Sparkles, X, LogOut } from "lucide-react";
import { NAV_ITEMS } from "../../utils/constants";
import Avatar from "../common/Avatar";

export function Sidebar({ page, setPage, dark, isMobile = false, onClose, onLogout, currentUser }) {
  return (
    <aside className={`w-64 shrink-0 h-full flex flex-col border-r transition-all duration-200 z-20 ${
      dark
        ? "bg-[#0A0E17]/95 border-slate-800/80 shadow-[4px_0_24px_-8px_rgba(0,0,0,0.4)]"
        : "bg-white/95 border-slate-200/80 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.06)]"
    } backdrop-blur-md ${isMobile ? "w-full border-r-0 shadow-none" : ""}`}>
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/30 shrink-0"
            style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <span className={`font-bold text-[15px] tracking-tight block leading-tight ${dark ? "text-slate-100" : "text-slate-900"}`}>
              Flowspace
            </span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider block text-indigo-600 dark:text-indigo-400">
              Workspace
            </span>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-3.5 space-y-1 overflow-y-auto">
        <div className="px-2.5 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>
        {NAV_ITEMS.map(item => {
          const active = page === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => {
                setPage(item.key);
                if (isMobile && onClose) onClose();
              }}
              className={`w-full group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                active
                  ? dark
                    ? "bg-indigo-500/18 text-indigo-200 shadow-xs border border-indigo-500/30"
                    : "bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100/90"
                  : dark
                    ? "text-slate-400 hover:bg-slate-850/70 hover:text-slate-200 hover:translate-x-0.5"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-0.5"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400 shadow-xs shadow-indigo-500/50" />
              )}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  active
                    ? dark
                      ? "bg-indigo-500/25 text-indigo-300"
                      : "bg-indigo-100 text-indigo-600"
                    : dark
                      ? "text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800/50"
                      : "text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-200/60"
                }`}
              >
                <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
              </div>
              <span className={`flex-1 text-left truncate ${active ? "font-bold text-indigo-700 dark:text-indigo-200" : "font-medium"}`}>
                {item.label}
              </span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      <div className={`p-3 border-t ${dark ? "border-slate-800/80 bg-slate-950/20" : "border-slate-200/80 bg-slate-50/40"}`}>
        <div
          className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all duration-200 border ${
            dark
              ? "bg-slate-900/50 border-slate-800/70 hover:bg-slate-850 hover:border-slate-700 text-slate-200"
              : "bg-white border-slate-200/70 hover:bg-slate-50 hover:border-slate-300 text-slate-800 shadow-xs"
          }`}
          onClick={() => {
            setPage("profile");
            if (isMobile && onClose) onClose();
          }}
        >
          <div className="relative shrink-0">
            <Avatar name={currentUser?.name || "User"} size={8} />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-bold truncate leading-tight ${dark ? "text-slate-100" : "text-slate-900"}`}>
              {currentUser?.name || "User"}
            </p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {currentUser?.role || "Product Lead"}
            </p>
          </div>
          {onLogout && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
                if (isMobile && onClose) onClose();
              }}
              title="Sign out"
              className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition shrink-0`}
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
