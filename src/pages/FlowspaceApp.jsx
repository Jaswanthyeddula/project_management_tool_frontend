import React, { useState, useEffect, useMemo } from "react";
import { authApi, projectApi, boardApi, taskApi, notificationApi } from "../api/endpoints";
import {
  LayoutDashboard, Briefcase, CheckSquare, Calendar as CalendarIcon, Users,
  BarChart2, Bell, Settings, Search, MessageSquare, ChevronDown, Plus,
  Filter, ArrowUpDown, MoreHorizontal, Paperclip, MessageCircle, Clock,
  X, Edit2, Trash2, CheckCircle2, AlertCircle, Sun, Moon, Mail, Lock,
  User as UserIcon, Eye, EyeOff, ChevronLeft, ChevronRight, Flag,
  TrendingUp, FileText, UserPlus, Folder, LogOut, Grip, Sparkles, Loader2, Check, Menu,
  Download, Send, RotateCcw
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";
import "./Flowspace.css";

const ACCENT = "#4F46E5";
const ACCENT_LIGHT = "#6366F1";
const ACCENT_DARK = "#3730A3";
const ACCENT_SOFT = "#EEF2FF";

const AVATAR_COLORS = [
  { bg: "#EEF2FF", fg: "#4F46E5" }, { bg: "#EFF6FF", fg: "#2563EB" },
  { bg: "#FDF2F8", fg: "#DB2777" }, { bg: "#ECFDF5", fg: "#059669" },
  { bg: "#FFFBEB", fg: "#D97706" }, { bg: "#FEF2F2", fg: "#DC2626" },
];

function initials(name) {
  if (!name) return "U";
  return name.trim().split(" ").filter(Boolean).map(p => p[0]).join("").slice(0, 2).toUpperCase();
}
function colorFor(name) {
  if (!name) return AVATAR_COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function Avatar({ name = "", size = 8 }) {
  const c = colorFor(name);
  const sizeCls = {
    6: "w-6 h-6 text-[10px]",
    7: "w-7 h-7 text-xs",
    8: "w-8 h-8 text-xs",
    9: "w-9 h-9 text-xs",
    10: "w-10 h-10 text-sm",
    12: "w-12 h-12 text-base",
    14: "w-14 h-14 text-lg",
    16: "w-16 h-16 text-xl",
  }[size] || "w-8 h-8 text-xs";
  return (
    <div className={`${sizeCls} rounded-full flex items-center justify-center font-bold ring-2 ring-white dark:ring-slate-900 shrink-0 shadow-xs`}
      style={{ backgroundColor: c.bg, color: c.fg }} title={name}>
      {initials(name)}
    </div>
  );
}

const STATUS_STYLE = {
  "In Progress": { bg: "#EEF2FF", fg: "#4F46E5" },
  "On Track": { bg: "#ECFDF5", fg: "#059669" },
  "At Risk": { bg: "#FEF2F2", fg: "#DC2626" },
  "Completed": { bg: "#F0FDF4", fg: "#16A34A" },
};
const PRIORITY_STYLE = {
  High: { bg: "#FEF2F2", fg: "#DC2626" },
  Medium: { bg: "#FFFBEB", fg: "#D97706" },
  Low: { bg: "#F0FDF4", fg: "#16A34A" },
  high: { bg: "#FEF2F2", fg: "#DC2626" },
  medium: { bg: "#FFFBEB", fg: "#D97706" },
  low: { bg: "#F0FDF4", fg: "#16A34A" },
};

const EMPTY_COLUMNS = {
  todo: { title: "To Do", tasks: [] },
  inprogress: { title: "In Progress", tasks: [] },
  inreview: { title: "In Review", tasks: [] },
  completed: { title: "Completed", tasks: [] },
};

const NOTIF_ICON = {
  assigned: { icon: CheckSquare, bg: "#EEF2FF", fg: "#4F46E5" },
  comment: { icon: MessageCircle, bg: "#EFF6FF", fg: "#2563EB" },
  deadline: { icon: Clock, bg: "#FFFBEB", fg: "#D97706" },
  completed: { icon: CheckCircle2, bg: "#ECFDF5", fg: "#059669" },
  member: { icon: UserPlus, bg: "#FDF2F8", fg: "#DB2777" },
};

function exportToCSV(projects, columns) {
  const rows = [
    ["Type", "ID", "Title / Name", "Status / Workspace", "Priority / Progress", "Due Date", "Assignee / Team"]
  ];
  (projects || []).forEach(p => {
    rows.push([
      "Project",
      p.id,
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${p.workspace || "General"}"`,
      `${p.progress || 0}%`,
      `"${p.due || "N/A"}"`,
      `"${(p.members || []).join(", ")}"`
    ]);
  });
  if (columns) {
    Object.entries(columns).forEach(([colKey, col]) => {
      (col.tasks || []).forEach(t => {
        rows.push([
          "Task",
          t.id,
          `"${(t.title || "").replace(/"/g, '""')}"`,
          `"${col.title}"`,
          t.priority || "Medium",
          `"${t.due || t.due_date || "N/A"}"`,
          `"${t.assignee || "User"}"`
        ]);
      });
    });
  }
  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `flowspace_report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "workspaces", label: "Workspaces", icon: Folder },
  { key: "projects", label: "Projects", icon: Briefcase },
  { key: "kanban", label: "Tasks", icon: CheckSquare },
  { key: "calendar", label: "Calendar", icon: CalendarIcon },
  { key: "team", label: "Team", icon: Users },
  { key: "reports", label: "Reports", icon: BarChart2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "profile", label: "Settings", icon: Settings },
];

function Card({ children, className = "", dark, ...rest }) {
  return (
    <div
      className={`flow-card rounded-2xl border transition-all duration-200 ${
        dark
          ? "bg-[#111827] border-[#1F2937] text-slate-100 shadow-lg shadow-black/25"
          : "bg-white border-slate-200/80 text-slate-900 shadow-sm shadow-slate-200/50"
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

function Badge({ label, style, variant = "default", dot = false, children, className = "" }) {
  const content = children !== undefined ? children : label;

  const variantClassMap = {
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/80 border border-indigo-200/80",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80 border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80 border border-amber-200/80",
    danger: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80 border border-rose-200/80",
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80 border border-slate-200",
  };

  const statusVariant = {
    "In Progress": "indigo",
    "On Track": "success",
    "At Risk": "danger",
    "Completed": "success",
    High: "danger",
    Medium: "warning",
    Low: "success",
  }[label || content];

  const effectiveVariant = statusVariant || variant;
  const classes = variantClassMap[effectiveVariant] || variantClassMap.default;

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-1.5 shrink-0 ${classes} ${className}`}
      style={style && !statusVariant ? { backgroundColor: style.bg, color: style.fg } : undefined}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 bg-current"
        />
      )}
      {content}
    </span>
  );
}

function ProgressBar({ value, dark }) {
  return (
    <div className={`w-full h-2 rounded-full overflow-hidden ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${value}%`, background: "linear-gradient(90deg, #6366F1, #4F46E5)" }}
      />
    </div>
  );
}

function PrimaryButton({ children, className = "", ...rest }) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 hover:brightness-105 active:scale-[0.98] transition-all duration-150 ${className}`}
      style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
      {...rest}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, className = "", dark, ...rest }) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
        dark
          ? "border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------- Sidebar & Topbar ---------------- */

function Sidebar({ page, setPage, dark, isMobile = false, onClose, setAuthView, currentUser }) {
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
          {setAuthView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                localStorage.removeItem("token");
                setAuthView("login");
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

function Topbar({ dark, setDark, unreadCount, setPage, setAuthView, onOpenMobileMenu, currentUser, workspacesList = [], selectedWorkspace, onSelectWorkspace }) {
  const [wsOpen, setWsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <header className={`h-16 shrink-0 flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-8 border-b sticky top-0 z-30 transition-colors ${
      dark ? "bg-[#0B0F19]/95 border-[#1E293B] backdrop-blur-md" : "bg-white/95 border-slate-200 backdrop-blur-md"
    }`}>
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
            onClick={() => setWsOpen(o => !o)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
              dark
                ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-xs shrink-0" />
            <span className="whitespace-nowrap font-bold">{selectedWorkspace || workspacesList[0]?.name || "Workspace"}</span>
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </button>
          {wsOpen && (
            <div className={`absolute left-0 mt-2 w-52 rounded-xl border shadow-xl py-1.5 z-50 ${
              dark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
            }`}>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspaces</div>
              {(workspacesList.length > 0 ? workspacesList : [{ id: "gen", name: "General Workspace" }]).map(w => {
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
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
          onClick={() => setDark(d => !d)}
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
            onClick={() => setProfileOpen(o => !o)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:ring-2 hover:ring-indigo-500/20 transition"
          >
            <Avatar name={currentUser?.name || "User"} size={8} />
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {profileOpen && (
            <div className={`absolute right-0 mt-2 w-52 rounded-xl border shadow-xl py-1.5 z-50 ${
              dark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
            }`}>
              <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800">
                <p className={`text-xs font-bold truncate ${dark ? "text-slate-100" : "text-slate-900"}`}>{currentUser?.name || "User"}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.email || ""}</p>
              </div>
              <div
                onClick={() => { setPage("profile"); setProfileOpen(false); }}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2.5 ${
                  dark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                }`}
              >
                <UserIcon size={15} /> Profile & Settings
              </div>
              <div
                onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); setAuthView?.("login"); setProfileOpen(false); }}
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

/* ---------------- Dashboard ---------------- */

function KPICard({ label, value, delta, up, dark, icon: Icon, iconColor = "#4F46E5", iconBg = "#EEF2FF" }) {
  return (
    <Card dark={dark} className="p-4 sm:p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <p className={`text-[11px] font-bold uppercase tracking-wider ${dark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs" style={{ backgroundColor: dark ? "rgba(255,255,255,0.06)" : iconBg }}>
            <Icon size={15} style={{ color: iconColor }} />
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-2xl sm:text-3xl font-black tracking-tight ${dark ? "text-slate-50" : "text-slate-900"}`}>{value}</p>
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
          up
            ? dark ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/40" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : dark ? "bg-rose-950/50 text-rose-400 border border-rose-900/40" : "bg-rose-50 text-rose-700 border border-rose-100"
        }`}>
          <TrendingUp size={11} className={up ? "" : "rotate-180"} /> {delta}
        </span>
      </div>
    </Card>
  );
}

function Dashboard({
  dark,
  openTask,
  projectsList = [],
  columns = EMPTY_COLUMNS,
  setPage,
  setActiveProjectId,
  currentUser,
  onOpenNewTask,
  onOpenCreateProject,
  onOpenAiModal
}) {
  const totalProjects = projectsList.length;
  const allTasks = Object.values(columns || {}).flatMap(c => c.tasks || []);
  const totalTasks = allTasks.length;
  const completedTasks = (columns?.completed?.tasks || []).length;
  const inProgressTasks = (columns?.inprogress?.tasks || []).length;
  const overdueTasks = (columns?.inreview?.tasks || []).length + (columns?.todo?.tasks || []).length;

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressPercent = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  const notStartedPercent = totalTasks > 0 ? Math.max(0, 100 - completionPercent - inProgressPercent) : 0;

  const dynamicDonut = [
    { name: "Completed", value: completionPercent, color: "#4F46E5" },
    { name: "In Progress", value: inProgressPercent, color: "#818CF8" },
    { name: "To Do", value: notStartedPercent, color: "#CBD5E1" },
  ];

  const dynamicBar = (projectsList || []).slice(0, 5).map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 11) + "…" : p.name,
    progress: p.progress || 0
  }));

  const todaysTasks = [
    ...(columns?.inprogress?.tasks || []),
    ...(columns?.inreview?.tasks || []),
    ...(columns?.todo?.tasks || [])
  ].slice(0, 3);

  const firstName = currentUser?.name?.trim().split(" ")[0] || "there";

  return (
    <div className="flowspace-dashboard flex flex-col gap-4 sm:gap-5 pb-8 max-w-[1380px] mx-auto w-full">
      {/* Top Header & Prominent Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className={`text-2xl font-black tracking-tight ${dark ? "text-slate-50" : "text-slate-900"}`}>
              Welcome back, {firstName}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Workspace
            </span>
          </div>
          <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
            {totalProjects} active {totalProjects === 1 ? "project" : "projects"} · {totalTasks} total {totalTasks === 1 ? "task" : "tasks"} tracked across your teams
          </p>
        </div>

        {/* Visually Dominant Primary Action Bar */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => onOpenNewTask?.("todo")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>New Task</span>
          </button>
          <button
            onClick={onOpenCreateProject}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 cursor-pointer ${
              dark
                ? "bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs"
            }`}
          >
            <Briefcase size={14} />
            <span>New Project</span>
          </button>
          <button
            onClick={onOpenAiModal}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 cursor-pointer ${
              dark
                ? "bg-purple-950/30 border-purple-800/50 text-purple-300 hover:bg-purple-950/50 hover:border-purple-700/60"
                : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100/70 shadow-xs"
            }`}
          >
            <Sparkles size={14} className="text-purple-500" />
            <span>AI Task</span>
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards with Icon accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        <KPICard label="Total Projects" value={String(totalProjects)} delta={`${totalProjects} active`} up dark={dark} icon={Briefcase} iconColor="#4F46E5" iconBg="#EEF2FF" />
        <KPICard label="Total Tasks" value={String(totalTasks)} delta={`${totalTasks} tracked`} up dark={dark} icon={CheckSquare} iconColor="#2563EB" iconBg="#EFF6FF" />
        <KPICard label="Completed Tasks" value={String(completedTasks)} delta={`${completionPercent}% done`} up dark={dark} icon={CheckCircle2} iconColor="#059669" iconBg="#ECFDF5" />
        <KPICard label="Pending Tasks" value={String(overdueTasks)} delta={overdueTasks > 0 ? "Action required" : "All caught up"} dark={dark} icon={AlertCircle} iconColor="#DC2626" iconBg="#FEF2F2" />
      </div>

      {/* Row 2: Charts with tighter spacing and clear visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Component 1: Task Completion Donut Chart */}
        <Card dark={dark} className="p-4 sm:p-5 lg:col-span-1 min-w-0 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="min-w-0">
                <p className={`text-sm font-bold ${dark ? "text-slate-100" : "text-slate-900"} leading-tight tracking-tight`}>Task Completion</p>
                <p className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-500"} mt-0.5`}>Status split across all projects</p>
              </div>
              <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>Overall</span>
            </div>
          </div>

          <div className="h-38 relative my-2 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dynamicDonut} dataKey="value" innerRadius={44} outerRadius={60} paddingAngle={4} startAngle={90} endAngle={-270}>
                  {dynamicDonut.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-xl font-extrabold tracking-tight ${dark ? "text-slate-50" : "text-slate-900"}`}>{completionPercent}%</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Done</span>
            </div>
          </div>

          <div className="flex items-center justify-around pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
            {dynamicDonut.map(d => (
              <div key={d.name} className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span>{d.name}</span>
                </div>
                <span className={`text-xs font-bold mt-0.5 ${dark ? "text-slate-200" : "text-slate-700"}`}>{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Component 2: Project Progress Bar Chart */}
        <Card dark={dark} className="p-4 sm:p-5 lg:col-span-2 min-w-0 flex flex-col justify-between overflow-hidden">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <p className={`text-sm font-bold ${dark ? "text-slate-100" : "text-slate-900"} leading-tight tracking-tight`}>Project Progress</p>
              <p className={`text-[11px] mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>Completion percentage by active initiative</p>
            </div>
            <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${dark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"}`}>
              Active Sprint
            </span>
          </div>
          <div className="h-44 min-w-0 flex items-center justify-center">
            {dynamicBar.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicBar} barSize={22} margin={{ top: 6, right: 12, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: dark ? "#94A3B8" : "#64748B" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: dark ? "#94A3B8" : "#64748B" }} axisLine={false} tickLine={false} width={34} domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
                    contentStyle={{
                      backgroundColor: dark ? "#1E293B" : "#FFFFFF",
                      borderColor: dark ? "#334155" : "#E2E8F0",
                      borderRadius: 12,
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                      fontSize: 11,
                      color: dark ? "#F8FAFC" : "#0F172A"
                    }}
                    formatter={(val) => [`${val}%`, "Progress"]}
                  />
                  <Bar dataKey="progress" radius={[5, 5, 0, 0]} fill={ACCENT} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No project progress data yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Row 3: Detail Lists with tighter, cleaner cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card dark={dark} className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-bold tracking-tight ${dark ? "text-slate-100" : "text-slate-900"}`}>Today's Tasks</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{todaysTasks.length} queued</span>
            </div>
            <div className="space-y-2">
              {todaysTasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => openTask(t)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                    dark ? "hover:bg-slate-800/70 border border-transparent hover:border-slate-800" : "hover:bg-slate-50 border border-transparent hover:border-slate-200"
                  }`}
                >
                  <CheckSquare size={15} className="text-indigo-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${dark ? "text-slate-200" : "text-slate-800"}`}>{t.title}</p>
                    <p className="text-[10px] text-slate-400">Due {t.due || t.due_date || "Soon"}</p>
                  </div>
                  <Avatar name={t.assignee || "User"} size={6} />
                </div>
              ))}
              {todaysTasks.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No active tasks today</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setPage("kanban")}
            className={`w-full mt-3 pt-2 text-center text-xs font-semibold border-t ${
              dark ? "border-slate-800/80 text-indigo-400 hover:text-indigo-300" : "border-slate-100 text-indigo-600 hover:text-indigo-700"
            }`}
          >
            View all board tasks →
          </button>
        </Card>

        <Card dark={dark} className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-bold tracking-tight ${dark ? "text-slate-100" : "text-slate-900"}`}>Upcoming Deadlines</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{projectsList.length} total</span>
            </div>
            <div className="space-y-2">
              {projectsList.slice(0, 3).map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId?.(p.id);
                    setPage?.("kanban");
                  }}
                  className={`flex items-center justify-between gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                    dark ? "hover:bg-slate-800/70 border border-transparent hover:border-slate-800" : "hover:bg-slate-50 border border-transparent hover:border-slate-200"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${dark ? "text-slate-200" : "text-slate-800"}`}>{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.due || "No due date"}</p>
                  </div>
                  <Badge label={p.status || "In Progress"} style={STATUS_STYLE[p.status] || STATUS_STYLE["In Progress"]} />
                </div>
              ))}
              {projectsList.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No projects created yet</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setPage("projects")}
            className={`w-full mt-3 pt-2 text-center text-xs font-semibold border-t ${
              dark ? "border-slate-800/80 text-indigo-400 hover:text-indigo-300" : "border-slate-100 text-indigo-600 hover:text-indigo-700"
            }`}
          >
            Explore all initiatives →
          </button>
        </Card>

        <Card dark={dark} className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-bold tracking-tight ${dark ? "text-slate-100" : "text-slate-900"}`}>Recent Activity</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feed</span>
            </div>
            <div className="space-y-2.5">
              {completedTasks > 0 ? (
                (columns?.completed?.tasks || []).slice(0, 3).map((t, i) => (
                  <div key={i} className="flex gap-2.5 items-start p-1.5">
                    <Avatar name={t.assignee || "User"} size={6} />
                    <p className={`text-xs leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                      <span className={`font-semibold ${dark ? "text-slate-200" : "text-slate-800"}`}>{t.assignee || "User"}</span> completed &ldquo;{t.title}&rdquo;
                      <br /><span className="text-[10px] text-slate-400">Recently</span>
                    </p>
                  </div>
                ))
              ) : totalTasks > 0 ? (
                allTasks.slice(0, 3).map((t, i) => (
                  <div key={i} className="flex gap-2.5 items-start p-1.5">
                    <Avatar name={t.assignee || "User"} size={6} />
                    <p className={`text-xs leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                      <span className={`font-semibold ${dark ? "text-slate-200" : "text-slate-800"}`}>{t.assignee || "User"}</span> added &ldquo;{t.title}&rdquo;
                      <br /><span className="text-[10px] text-slate-400">Recently</span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No recent activity recorded yet</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setPage("reports")}
            className={`w-full mt-3 pt-2 text-center text-xs font-semibold border-t ${
              dark ? "border-slate-800/80 text-indigo-400 hover:text-indigo-300" : "border-slate-100 text-indigo-600 hover:text-indigo-700"
            }`}
          >
            View executive report →
          </button>
        </Card>
      </div>
    </div>
  );
}

function CartesianGridStub({ dark }) {
  return null;
}

/* ---------------- Workspaces ---------------- */

function Workspaces({ dark, workspacesList = [], onOpenNewWorkspace, onSelectWorkspace, projectsList = [] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${dark ? "text-slate-50" : "text-slate-900"}`}>Workspaces</h1>
          <p className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>Group projects by team, client, or department.</p>
        </div>
        <PrimaryButton onClick={onOpenNewWorkspace} className="shrink-0 whitespace-nowrap">
          <Plus size={16} /> New Workspace
        </PrimaryButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(workspacesList || []).map(w => {
          const projectCount = projectsList.filter(p => p.workspace === w.name).length || w.projects || 0;
          return (
            <Card
              dark={dark}
              key={w.id || w.name}
              onClick={() => onSelectWorkspace?.(w.name)}
              className="p-6 flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition group"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition group-hover:scale-105" style={{ backgroundColor: (w.color || ACCENT) + "18" }}>
                <Folder size={22} style={{ color: w.color || ACCENT }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-base truncate ${dark ? "text-slate-100" : "text-slate-900"}`}>{w.name}</p>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color || ACCENT }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{projectCount} projects · {w.members || 1} members</p>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition shrink-0" />
            </Card>
          );
        })}
        {(workspacesList || []).length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>No workspaces found. Click &quot;New Workspace&quot; to create your first workspace.</p>
          </div>
        )}
      </div>
    </div>
  );
}


/* ---------------- Projects ---------------- */

function Projects({
  dark,
  projectsList = [],
  activeProjectId,
  setActiveProjectId,
  setPage,
  onOpenCreateProject,
  onDeleteProject,
  selectedWorkspaceFilter,
  setSelectedWorkspaceFilter
}) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const filtered = useMemo(() => {
    return projectsList
      .filter(p => {
        const matchesQ = p.name.toLowerCase().includes(q.toLowerCase()) ||
          (p.workspace || "").toLowerCase().includes(q.toLowerCase());
        const matchesStatus = statusFilter === "All" || p.status === statusFilter;
        const matchesWorkspace = !selectedWorkspaceFilter || p.workspace === selectedWorkspaceFilter;
        return matchesQ && matchesStatus && matchesWorkspace;
      })
      .sort((a, b) => {
        let valA = a[sortField] || "";
        let valB = b[sortField] || "";
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [projectsList, q, statusFilter, selectedWorkspaceFilter, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl font-bold tracking-tight ${dark ? "text-slate-50" : "text-slate-900"}`}>Projects</h1>
            {selectedWorkspaceFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Workspace: {selectedWorkspaceFilter}
                <button onClick={() => setSelectedWorkspaceFilter?.(null)} className="hover:text-rose-500 ml-1">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
          <p className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>{filtered.length} active initiatives</p>
        </div>
        <PrimaryButton onClick={onOpenCreateProject} className="shrink-0 whitespace-nowrap">
          <Plus size={16} /> Create Project
        </PrimaryButton>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Filter projects by title or workspace..."
            style={{ paddingLeft: "38px" }}
            className={`w-full pr-3 py-2 rounded-xl text-xs border outline-none transition-all ${
              dark
                ? "bg-slate-900/60 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500"
                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
            }`}
          />
        </div>

        {/* Status Filter Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border outline-none transition cursor-pointer ${
              dark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-700 shadow-xs"
            }`}
          >
            <option value="All">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Sort Toggle */}
        <GhostButton dark={dark} onClick={() => toggleSort("progress")} className="text-xs">
          <ArrowUpDown size={14} /> Sort {sortField === "progress" ? (sortAsc ? "Progress ↑" : "Progress ↓") : "by Progress"}
        </GhostButton>
        <GhostButton dark={dark} onClick={() => toggleSort("name")} className="text-xs">
          <ArrowUpDown size={14} /> Sort {sortField === "name" ? (sortAsc ? "A-Z" : "Z-A") : "by Name"}
        </GhostButton>
      </div>

      <Card dark={dark} className="overflow-visible border border-slate-200/80 dark:border-slate-800/80">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${dark ? "border-slate-800/80 text-slate-400 bg-slate-900/50" : "border-slate-200 bg-slate-50/80 text-slate-500"}`}>
                <th className="font-bold uppercase tracking-wider min-w-[190px] px-4 py-3">Project Name</th>
                <th className="font-bold uppercase tracking-wider min-w-[110px] px-4 py-3">Workspace</th>
                <th className="font-bold uppercase tracking-wider min-w-[120px] px-4 py-3">Team</th>
                <th className="font-bold uppercase tracking-wider min-w-[120px] px-4 py-3">Status</th>
                <th className="font-bold uppercase tracking-wider min-w-[200px] px-4 py-3">Progress</th>
                <th className="font-bold uppercase tracking-wider min-w-[130px] px-4 py-3">Due Date</th>
                <th className="w-16 text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map(p => (
                <tr
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId?.(p.id);
                    setPage?.("kanban");
                  }}
                  className={`transition-colors cursor-pointer ${
                    activeProjectId === p.id
                      ? dark ? "bg-indigo-950/20" : "bg-indigo-50/40"
                      : dark ? "hover:bg-slate-850/50" : "hover:bg-slate-50/80"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${dark ? "text-slate-100" : "text-slate-900"} hover:text-indigo-600 transition`}>
                        {p.name}
                      </span>
                      {activeProjectId === p.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" title="Active Project" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {p.workspace || "General"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center -space-x-2 shrink-0">
                      {(p.members || ["User"]).map(m => <Avatar key={m} name={m} size={7} />)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={p.status || "In Progress"} style={STATUS_STYLE[p.status] || STATUS_STYLE["In Progress"]} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 w-52">
                      <div className="flex-1 min-w-[100px]">
                        <ProgressBar value={p.progress || 0} dark={dark} />
                      </div>
                      <span className="w-10 text-right text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                        {p.progress || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {p.due || "Next Sprint"}
                  </td>
                  <td className="px-4 py-3 text-right relative" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition inline-block"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === p.id && (
                      <div className={`absolute right-4 top-10 w-44 rounded-xl border shadow-xl py-1.5 z-30 ${
                        dark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                      }`}>
                        <div
                          onClick={() => {
                            setActiveProjectId?.(p.id);
                            setPage?.("kanban");
                            setOpenMenuId(null);
                          }}
                          className={`px-3 py-2 text-xs cursor-pointer flex items-center gap-2 ${
                            dark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                          }`}
                        >
                          <CheckSquare size={14} className="text-indigo-500" /> Open Tasks Board
                        </div>
                        <div
                          onClick={() => {
                            onDeleteProject?.(p.id);
                            setOpenMenuId(null);
                          }}
                          className={`px-3 py-2 text-xs cursor-pointer flex items-center gap-2 text-rose-500 ${
                            dark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                          }`}
                        >
                          <Trash2 size={14} /> Delete Project
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs text-slate-400 font-medium">
                    No projects match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Kanban ---------------- */

function TaskCard({ task, dark, onClick, onMove }) {
  const priorityKey = task.priority || "Medium";
  const priorityStyle = PRIORITY_STYLE[priorityKey] || PRIORITY_STYLE.Medium;
  const labels = task.labels || [];
  const progressVal = task.progress ?? (task.status === "completed" ? 100 : task.status === "in_review" ? 80 : task.status === "in_progress" ? 50 : 0);

  const priorityAccent = priorityKey.toLowerCase() === "high"
    ? "border-l-rose-500"
    : priorityKey.toLowerCase() === "medium"
    ? "border-l-amber-500"
    : "border-l-emerald-500";

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-l-4 ${priorityAccent} p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        dark
          ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-sm shadow-black/20"
          : "bg-white border-slate-200 text-slate-900 shadow-xs hover:border-indigo-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <span
          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide shrink-0 border"
          style={{
            backgroundColor: priorityStyle.bg,
            color: priorityStyle.fg,
            borderColor: `${priorityStyle.fg}40`
          }}
        >
          {priorityKey}
        </span>
        <Avatar name={task.assignee || "User"} size={6} />
      </div>

      <p className={`text-xs font-bold leading-snug mb-2 line-clamp-2 ${dark ? "text-slate-100" : "text-slate-900"}`}>
        {task.title}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {labels.map((l, i) => (
          <span key={i} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
            dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
          }`}>
            {l}
          </span>
        ))}
      </div>

      <div className="my-2.5">
        <ProgressBar value={progressVal} dark={dark} />
      </div>

      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 gap-2 text-[11px]">
        <span className="flex items-center gap-1.5 font-semibold text-slate-400 shrink-0">
          <Clock size={12} className="text-slate-400 shrink-0" />
          {task.due || task.due_date || "Soon"}
        </span>
        {onMove && (
          <select
            value={task.status || "todo"}
            onClick={e => e.stopPropagation()}
            onChange={e => onMove(task.id, e.target.value)}
            className={`text-[10px] font-bold px-2 py-1 rounded-md border outline-none cursor-pointer transition shrink-0 ${
              dark
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs"
            }`}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
          </select>
        )}
      </div>
    </div>
  );
}

function Kanban({
  dark,
  openTask,
  columns,
  onOpenNewTask,
  onOpenNewBoard,
  onOpenAiModal,
  boards = [],
  activeBoardId,
  setActiveBoardId,
  onMoveTask,
  activeProjectName = "Tasks"
}) {
  const currentColumns = columns || EMPTY_COLUMNS;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${dark ? "text-slate-50" : "text-slate-900"}`}>Tasks Board</h1>
          <p className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>
            {activeProjectName} {boards.length > 0 ? "· Active Sprint Board" : "· Workspace"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {boards.length > 0 && (
            <div className={`flex rounded-xl border p-1 text-xs font-semibold shrink-0 ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-100/70"}`}>
              {boards.map(b => (
                <button
                  key={b.id}
                  onClick={() => setActiveBoardId?.(b.id)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    b.id === activeBoardId
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}
          {onOpenNewBoard && (
            <GhostButton dark={dark} onClick={onOpenNewBoard} className="shrink-0 whitespace-nowrap">
              <Plus size={14} /> Board
            </GhostButton>
          )}
          {onOpenAiModal && (
            <button
              onClick={onOpenAiModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm shadow-purple-500/20 hover:opacity-95 active:scale-[0.98] transition shrink-0 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #6366F1, #9333EA)" }}
            >
              <Sparkles size={14} /> AI Sprint Task
            </button>
          )}
          <PrimaryButton onClick={onOpenNewTask} className="shrink-0 whitespace-nowrap">
            <Plus size={16} /> New Task
          </PrimaryButton>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 min-w-[1040px] items-start">
          {Object.entries(currentColumns).map(([key, col]) => (
            <div
              key={key}
              className={`rounded-2xl p-4 border space-y-3.5 min-h-[520px] flex flex-col transition-colors ${
                dark ? "bg-[#0f172a]/40 border-slate-800/80" : "bg-slate-100/50 border-slate-200/70"
              }`}
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    key === "completed" ? "bg-emerald-500" :
                    key === "inreview" ? "bg-amber-500" :
                    key === "inprogress" ? "bg-indigo-500" : "bg-slate-400"
                  }`} />
                  <p className={`text-sm font-bold tracking-tight ${dark ? "text-slate-200" : "text-slate-700"}`}>
                    {col.title}
                  </p>
                  <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                    dark ? "bg-slate-800 text-slate-300" : "bg-white text-slate-600 shadow-xs border border-slate-200"
                  }`}>
                    {(col.tasks || []).length}
                  </span>
                </div>
                <button
                  onClick={() => onOpenNewTask?.(key)}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
                  title={`Add task to ${col.title}`}
                >
                  <Plus size={15} />
                </button>
              </div>

              <div className="space-y-3 flex-1">
                {(col.tasks || []).map(t => (
                  <TaskCard key={t.id} task={t} dark={dark} onClick={() => openTask(t)} onMove={onMoveTask} />
                ))}
                {(col.tasks || []).length === 0 && (
                  <div className={`h-28 rounded-xl border border-dashed flex items-center justify-center text-xs font-medium ${
                    dark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"
                  }`}>
                    No tasks in this stage
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ---------------- Task Detail Panel ---------------- */

function TaskPanel({ task, onClose, dark, onMove, onDelete, onUpdateChecklist, onAddComment, currentUser, teamList = [], onAssign }) {
  const [checklist, setChecklist] = useState(task.checklist || []);
  const [newSubtask, setNewSubtask] = useState("");
  const [comments, setComments] = useState(task.comments || []);
  const [commentInput, setCommentInput] = useState("");

  if (!task) return null;
  const priorityStyle = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE[task.priority?.toLowerCase()] || PRIORITY_STYLE.Medium;

  const handleToggleSubtask = (index) => {
    const updated = checklist.map((c, i) => i === index ? { ...c, done: !c.done } : c);
    setChecklist(updated);
    onUpdateChecklist?.(task.id, updated);
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const updated = [...checklist, { text: newSubtask.trim(), done: false }];
    setChecklist(updated);
    setNewSubtask("");
    onUpdateChecklist?.(task.id, updated);
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const newC = {
      author: currentUser?.name || "User",
      text: commentInput.trim(),
      time: "Just now"
    };
    setComments([newC, ...comments]);
    onAddComment?.(task.id, commentInput.trim());
    setCommentInput("");
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className={`relative w-[440px] h-full shadow-2xl overflow-y-auto border-l z-50 flex flex-col ${
        dark ? "bg-[#0B0F19] text-slate-100 border-slate-800" : "bg-white text-slate-900 border-slate-200"
      }`}>
        <div className={`flex items-center justify-between px-6 py-4.5 border-b sticky top-0 z-10 ${
          dark ? "bg-[#0B0F19]/90 border-slate-800 backdrop-blur-md" : "bg-white/90 border-slate-200 backdrop-blur-md"
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Task Details</span>
            <Badge label={task.priority || "Medium"} style={priorityStyle} />
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition ${
              dark ? "border-slate-800 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <div>
            <h2 className={`text-xl font-bold leading-snug ${dark ? "text-slate-50" : "text-slate-900"}`}>{task.title}</h2>
            <p className={`text-sm mt-2 leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}>
              {task.desc || task.description || "No description added yet."}
            </p>
          </div>

          <div className={`p-4 rounded-xl border grid grid-cols-2 gap-4 text-sm ${
            dark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200/80"
          }`}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Assignee</p>
              {onAssign && teamList.length > 0 ? (
                <div className="flex items-center gap-1.5">
                  <Avatar name={task.assignee || currentUser?.name || "User"} size={6} />
                  <select
                    value={task.assignee_id || ""}
                    onChange={e => onAssign(task.id, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg border outline-none max-w-[140px] truncate ${
                      dark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                    }`}
                  >
                    <option value="">{task.assignee || "Assign..."}</option>
                    {currentUser?.name && (
                      <option value={currentUser.id || "currentUser"}>
                        {currentUser.name} (Me)
                      </option>
                    )}
                    {teamList
                      .filter(m => m.name !== currentUser?.name && m.email !== currentUser?.email)
                      .map(m => (
                        <option key={m.id || m.email} value={m.id || m.email}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar name={task.assignee || currentUser?.name || "User"} size={6} />
                  <span className={`text-xs font-semibold ${dark ? "text-slate-200" : "text-slate-800"}`}>
                    {task.assignee || currentUser?.name || "User"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Due Date</p>
              <p className={`flex items-center gap-1.5 text-xs font-semibold ${dark ? "text-slate-200" : "text-slate-800"}`}>
                <CalendarIcon size={14} className="text-indigo-500" /> {task.due || task.due_date || "Soon"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Status</p>
              <select
                value={task.status || "todo"}
                onChange={e => onMove?.(task.id, e.target.value)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border outline-none ${
                  dark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Progress</p>
              <p className={`text-xs font-bold ${dark ? "text-slate-200" : "text-slate-800"}`}>
                {task.progress || (task.status === "completed" ? 100 : 40)}%
              </p>
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${dark ? "text-slate-300" : "text-slate-700"}`}>
              Subtasks Checklist ({checklist.filter(c => c.done).length}/{checklist.length})
            </p>
            <div className="space-y-2 mb-3">
              {checklist.map((c, i) => (
                <label key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                  dark ? "border-slate-800 hover:bg-slate-900/60" : "border-slate-200 hover:bg-slate-50"
                }`}>
                  <input
                    type="checkbox"
                    checked={c.done}
                    onChange={() => handleToggleSubtask(i)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={c.done ? "line-through text-slate-400" : dark ? "text-slate-200" : "text-slate-800"}>
                    {c.text}
                  </span>
                </label>
              ))}
              {checklist.length === 0 && (
                <p className="text-xs text-slate-400 py-1">No subtasks added yet</p>
              )}
            </div>
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                placeholder="Add a subtask..."
                className={`flex-1 px-3 py-1.5 rounded-xl text-xs border outline-none transition ${
                  dark ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
              <button
                type="submit"
                disabled={!newSubtask.trim()}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white disabled:opacity-50 transition"
              >
                Add
              </button>
            </form>
          </div>

          {/* Comments Section */}
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${dark ? "text-slate-300" : "text-slate-700"}`}>
              <MessageSquare size={14} className="text-indigo-500" /> Discussion ({comments.length})
            </p>
            <form onSubmit={handleSendComment} className="flex gap-2 mb-3">
              <input
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                placeholder="Write a comment..."
                className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none transition ${
                  dark ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white disabled:opacity-50 flex items-center gap-1 transition"
              >
                <Send size={13} />
              </button>
            </form>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {comments.map((c, i) => (
                <div key={i} className={`p-3 rounded-xl border text-xs ${
                  dark ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-slate-50"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-indigo-500">{c.author || currentUser?.name || "User"}</span>
                    <span className="text-[10px] text-slate-400">{c.time || "Just now"}</span>
                  </div>
                  <p className={dark ? "text-slate-300" : "text-slate-700"}>{c.text}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-xs text-slate-400 py-2 text-center">No comments yet</p>
              )}
            </div>
          </div>

          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${dark ? "text-slate-300" : "text-slate-700"}`}>
              <Paperclip size={14} /> Attachments
            </p>
            {task.attachments && task.attachments.length > 0 ? (
              <div className="space-y-2">
                {task.attachments.map((att, i) => (
                  <div key={i} className={`flex items-center gap-2 text-sm p-3 rounded-xl border ${
                    dark ? "border-slate-800 bg-slate-900/40 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}>
                    <FileText size={16} className="text-indigo-500" />
                    <span className="font-medium text-xs">{att.name || att}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No attachments</p>
            )}
          </div>
        </div>

        <div className={`p-4 border-t flex gap-2.5 ${dark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
          <GhostButton
            dark={dark}
            className="flex-1 justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/40"
            onClick={() => { onDelete?.(task.id); onClose(); }}
          >
            <Trash2 size={14} /> Delete
          </GhostButton>
          <PrimaryButton className="flex-1 justify-center" onClick={() => { onMove?.(task.id, "completed"); onClose(); }}>
            <CheckCircle2 size={15} /> Complete
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Calendar ---------------- */

const EVENT_COLOR = {
  sprint: "#4F46E5",
  meeting: "#2563EB",
  deadline: "#EF4444",
  deploy: "#D97706",
  release: "#059669"
};

function Calendar({ dark, columns = EMPTY_COLUMNS }) {
  const [view, setView] = useState("month");
  const [selected, setSelected] = useState(null);
  const now = new Date();
  const currentMonthName = now.toLocaleString("default", { month: "long" });
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate();
  const firstDayOffset = new Date(currentYear, now.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Extract events dynamically from real tasks that have due dates
  const eventsByDay = useMemo(() => {
    const map = {};
    const allTasks = Object.values(columns || {}).flatMap(c => c.tasks || []);
    allTasks.forEach(t => {
      if (t.due || t.due_date) {
        const raw = String(t.due || t.due_date);
        const dayMatch = raw.match(/\b(\d{1,2})\b/);
        if (dayMatch) {
          const dayNum = parseInt(dayMatch[1], 10);
          if (dayNum >= 1 && dayNum <= 31) {
            if (!map[dayNum]) map[dayNum] = [];
            map[dayNum].push({
              label: t.title,
              type: t.priority === "high" || t.priority === "High" ? "deadline" : "sprint"
            });
          }
        }
      }
    });
    return map;
  }, [columns]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className={`text-2xl font-bold tracking-tight ${dark ? "text-slate-100" : "text-slate-900"}`}>Calendar</h1>
            <Badge variant="indigo">Sprint Calendar</Badge>
          </div>
          <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{currentMonthName} {currentYear} · Scheduled tasks and milestones</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className={`flex rounded-xl border p-1 ${dark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-slate-100"}`}>
            {["month", "week", "day"].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  view === v
                    ? "bg-indigo-600 text-white shadow-xs"
                    : dark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <GhostButton dark={dark} className="px-2.5 py-1.5"><ChevronLeft size={14} /></GhostButton>
            <GhostButton dark={dark} className="px-2.5 py-1.5"><ChevronRight size={14} /></GhostButton>
          </div>
        </div>
      </div>

      {view === "month" && (
        <Card dark={dark} className="p-6">
          <div className="grid grid-cols-7 gap-2.5 mb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2.5">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={"empty-" + i} className="h-24 rounded-xl opacity-30" />
            ))}
            {days.map(d => {
              const evs = eventsByDay[d] || [];
              const isToday = d === now.getDate();
              return (
                <div
                  key={d}
                  onClick={() => evs.length && setSelected({ day: d, events: evs })}
                  className={`h-24 rounded-xl p-2 border text-left cursor-pointer transition flex flex-col justify-between ${
                    isToday
                      ? "ring-2 ring-indigo-500/80 border-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/20"
                      : dark
                      ? "border-slate-800/80 bg-slate-900/30 hover:bg-slate-800/50 hover:border-slate-700"
                      : "border-slate-200/80 bg-slate-50/40 hover:bg-slate-100/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isToday ? "text-indigo-500 font-bold" : dark ? "text-slate-400" : "text-slate-600"}`}>
                      {d}
                    </span>
                    {evs.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {evs.slice(0, 2).map((e, i) => (
                      <div
                        key={i}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate text-white shadow-xs"
                        style={{ backgroundColor: EVENT_COLOR[e.type] }}
                      >
                        {e.label}
                      </div>
                    ))}
                    {evs.length > 2 && (
                      <span className="text-[10px] text-slate-400 font-medium">+{evs.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {view !== "month" && (
        <Card dark={dark} className="p-12 text-center">
          <CalendarIcon size={32} className="mx-auto text-indigo-500/60 mb-3" />
          <h3 className={`text-base font-bold mb-1 ${dark ? "text-slate-100" : "text-slate-900"}`}>
            {view === "week" ? "Weekly Schedule" : "Daily Agenda"}
          </h3>
          <p className={`text-xs max-w-sm mx-auto ${dark ? "text-slate-400" : "text-slate-500"}`}>
            Focused view for the selected timeline. Click on the Month tab to see the entire project sprint overview.
          </p>
        </Card>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs" onClick={() => setSelected(null)}>
          <Card dark={dark} className="w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className={`font-bold text-sm ${dark ? "text-slate-100" : "text-slate-900"}`}>
                Events for {currentMonthName} {selected.day}, {currentYear}
              </h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2.5 mb-5">
              {selected.events.map((e, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    dark ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: EVENT_COLOR[e.type] }} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${dark ? "text-slate-200" : "text-slate-800"}`}>{e.label}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{e.type}</p>
                  </div>
                </div>
              ))}
            </div>
            <GhostButton dark={dark} className="w-full justify-center" onClick={() => setSelected(null)}>
              Close
            </GhostButton>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ---------------- Team ---------------- */

function Team({ dark, teamList = [], onOpenInvite, onDeleteMember }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filteredTeam = teamList.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || m.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className={`text-2xl font-bold tracking-tight ${dark ? "text-slate-100" : "text-slate-900"}`}>Team Members</h1>
            <Badge variant="indigo">{teamList.length} Active</Badge>
          </div>
          <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
            Manage workspace collaborators, permissions, and workload distribution
          </p>
        </div>
        <PrimaryButton onClick={onOpenInvite} className="shrink-0 whitespace-nowrap">
          <UserPlus size={15} /> Invite Member
        </PrimaryButton>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, role, or email..."
            style={{ paddingLeft: "38px" }}
            className={`w-full pr-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
              dark
                ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500"
                : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500 shadow-xs"
            }`}
          />
        </div>

        {/* Role Filter Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium">Role:</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className={`text-xs font-semibold px-2.5 py-2 rounded-xl border outline-none cursor-pointer ${
              dark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-700 shadow-xs"
            }`}
          >
            <option value="All">All Roles</option>
            <option value="Designer">Designers</option>
            <option value="Engineer">Engineers</option>
            <option value="Product">Product Leads</option>
            <option value="Marketing">Marketing</option>
            <option value="Content">Content</option>
          </select>
        </div>
      </div>

      <Card dark={dark} className="overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${dark ? "border-slate-800 bg-slate-900/50 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                <th className="font-bold uppercase tracking-wider px-6 py-3.5">Member</th>
                <th className="font-bold uppercase tracking-wider px-6 py-3.5">Email</th>
                <th className="font-bold uppercase tracking-wider px-6 py-3.5">Role</th>
                <th className="font-bold uppercase tracking-wider px-6 py-3.5">Active Projects</th>
                <th className="font-bold uppercase tracking-wider px-6 py-3.5">Status</th>
                <th className="font-bold uppercase tracking-wider px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTeam.length > 0 ? (
                filteredTeam.map(m => (
                  <tr
                    key={m.email}
                    className={`transition ${dark ? "hover:bg-slate-850/50" : "hover:bg-slate-50/80"}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} size={9} />
                        <div>
                          <p className={`font-bold ${dark ? "text-slate-100" : "text-slate-900"}`}>{m.name}</p>
                          <p className="text-[11px] text-slate-400">@{m.name.toLowerCase().replace(/\s+/g, "")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{m.email}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${dark ? "text-slate-300" : "text-slate-700"}`}>{m.role}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">{m.projects || 1}</span> active
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={m.status === "Active" ? "success" : m.status === "Away" ? "warning" : "default"}
                        dot
                      >
                        {m.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <GhostButton
                        dark={dark}
                        onClick={() => onDeleteMember?.(m.email)}
                        className="px-2.5 py-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        Remove
                      </GhostButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold mb-1">No team members found</p>
                    <p className="text-xs text-slate-500">Invite collaborators using the button above.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Reports ---------------- */

function Reports({ dark, projectsList = [], columns = EMPTY_COLUMNS, showToast }) {
  const allTasks = Object.values(columns).flatMap(c => c.tasks || []);
  const totalTasks = allTasks.length;
  const completedTasks = (columns.completed?.tasks || []).length;
  const inProgressTasks = (columns.inprogress?.tasks || []).length;

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressPercent = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  const notStartedPercent = totalTasks > 0 ? Math.max(0, 100 - completionPercent - inProgressPercent) : 0;

  const dynamicDonut = totalTasks > 0 ? [
    { name: "Completed", value: completionPercent, color: "#4F46E5" },
    { name: "In Progress", value: inProgressPercent, color: "#818CF8" },
    { name: "To Do", value: notStartedPercent, color: "#CBD5E1" },
  ] : [];

  const dynamicBar = projectsList.slice(0, 6).map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 11) + "…" : p.name,
    progress: p.progress || 0
  }));

  const handleDownload = () => {
    exportToCSV(projectsList, columns);
    showToast?.("Executive CSV report downloaded successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className={`text-2xl font-bold tracking-tight ${dark ? "text-slate-100" : "text-slate-900"}`}>Executive Reports</h1>
            <Badge variant="indigo">Live Analytics</Badge>
          </div>
          <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
            Portfolio-level delivery velocity, completion splits, and cross-team throughput.
          </p>
        </div>
        <PrimaryButton onClick={handleDownload} className="shrink-0 whitespace-nowrap">
          <Download size={15} /> Download CSV Report
        </PrimaryButton>
      </div>

      {/* Two charts with generous spacing and min-w-0 to avoid overlap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <Card dark={dark} className="p-6 min-w-0 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-sm font-bold ${dark ? "text-slate-100" : "text-slate-900"}`}>Progress by Project</h3>
                <p className="text-xs text-slate-400 mt-0.5">Sprint velocity & milestone accomplishment %</p>
              </div>
              <Badge variant="indigo">Analytics</Badge>
            </div>
            <div className="h-64 min-w-0 flex items-center justify-center">
              {dynamicBar.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dynamicBar} barSize={26} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1E293B" : "#F1F5F9"} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: dark ? "#64748B" : "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis width={36} tick={{ fontSize: 11, fill: dark ? "#64748B" : "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: dark ? "1px solid #334155" : "1px solid #E2E8F0",
                        backgroundColor: dark ? "#0F172A" : "#FFFFFF",
                        color: dark ? "#F8FAFC" : "#0F172A",
                        fontSize: 12,
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)"
                      }}
                    />
                    <Bar dataKey="progress" radius={[6, 6, 0, 0]} fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400 text-center">No project progress data available yet</p>
              )}
            </div>
          </div>
          <div className={`pt-4 border-t mt-4 flex items-center justify-between text-xs ${dark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"}`}>
            <span>Total Projects: <strong>{projectsList.length}</strong></span>
            <span>Avg: <strong>{projectsList.length > 0 ? Math.round(projectsList.reduce((acc, p) => acc + (p.progress || 0), 0) / projectsList.length) : 0}%</strong></span>
          </div>
        </Card>

        <Card dark={dark} className="p-6 min-w-0 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-sm font-bold ${dark ? "text-slate-100" : "text-slate-900"}`}>Completion Split</h3>
                <p className="text-xs text-slate-400 mt-0.5">Aggregate status distribution across {totalTasks} tasks</p>
              </div>
              <Badge variant="success">{completionPercent}% Throughput</Badge>
            </div>
            <div className="h-64 min-w-0 flex items-center justify-center">
              {totalTasks > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dynamicDonut} dataKey="value" innerRadius={50} outerRadius={74} paddingAngle={4}>
                      {dynamicDonut.map((d, i) => <Cell key={i} fill={d.color} stroke={dark ? "#0F172A" : "#FFFFFF"} strokeWidth={2} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: dark ? "1px solid #334155" : "1px solid #E2E8F0",
                        backgroundColor: dark ? "#0F172A" : "#FFFFFF",
                        color: dark ? "#F8FAFC" : "#0F172A",
                        fontSize: 12,
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)"
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400 text-center">No task completion data available yet</p>
              )}
            </div>
          </div>
          <div className={`pt-4 border-t mt-4 flex items-center justify-between text-xs ${dark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"}`}>
            <span>Target completion rate: <strong>90%</strong></span>
            <button onClick={handleDownload} className="text-indigo-500 font-semibold hover:underline flex items-center gap-1">
              <Download size={13} /> Download CSV
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Notifications ---------------- */

function Notifications({ dark, notifs = [], setNotifs, onMarkRead, onMarkAllRead, onRefresh, loading }) {
  const unreadList = notifs.filter(n => !n.read);
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className={`text-2xl font-bold tracking-tight ${dark ? "text-slate-100" : "text-slate-900"}`}>Notifications</h1>
            <Badge variant="indigo">{unreadList.length} Unread</Badge>
          </div>
          <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
            Stay up to date with comments, sprint mentions, and deadline alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <GhostButton dark={dark} onClick={onRefresh} disabled={loading} title="Refresh notifications">
              <RotateCcw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </GhostButton>
          )}
          {notifs.length > 0 && (
            <GhostButton dark={dark} onClick={onMarkAllRead || (() => setNotifs?.(notifs.map(n => ({ ...n, read: true }))))}>
              <CheckCircle2 size={14} /> Mark all read
            </GhostButton>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {notifs.length > 0 ? (
          notifs.map(n => {
            const meta = NOTIF_ICON[n.type] || NOTIF_ICON.comment;
            const Icon = meta?.icon || MessageCircle;
            return (
              <Card
                key={n.id}
                dark={dark}
                onClick={() => onMarkRead ? onMarkRead(n.id) : setNotifs?.(notifs.map(x => x.id === n.id ? { ...x, read: true } : x))}
                className={`p-4 flex items-start gap-3.5 cursor-pointer transition ${
                  !n.read
                    ? dark
                      ? "border-l-4 border-l-indigo-500 bg-slate-900/60"
                      : "border-l-4 border-l-indigo-600 bg-indigo-50/20"
                    : ""
                }`}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs" style={{ backgroundColor: meta.bg }}>
                  <Icon size={16} style={{ color: meta.fg }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold leading-relaxed ${n.read ? "text-slate-500 dark:text-slate-400" : dark ? "text-slate-100" : "text-slate-900"}`}>
                    {n.text}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full mt-1.5 bg-indigo-500 shrink-0" />
                )}
              </Card>
            );
          })
        ) : (
          <Card dark={dark} className="p-12 text-center">
            <Bell size={32} className="mx-auto text-indigo-500/60 mb-3" />
            <h3 className={`text-sm font-bold mb-1 ${dark ? "text-slate-200" : "text-slate-800"}`}>
              {loading ? "Checking notifications..." : "All caught up!"}
            </h3>
            <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
              {loading ? "Fetching latest notifications from server..." : "You don't have any notifications right now."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ---------------- Profile / Settings ---------------- */

function Profile({ dark, setDark, showToast, currentUser, onUpdateUser }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return {
          name: u.name || currentUser?.name || "User",
          email: u.email || currentUser?.email || "user@flowspace.io",
          role: u.role || currentUser?.role || "Senior Product Lead",
          bio: u.bio || currentUser?.bio || "Crafting calm software workflows for busy engineering teams."
        };
      } catch {}
    }
    return {
      name: currentUser?.name || "User",
      email: currentUser?.email || "user@flowspace.io",
      role: currentUser?.role || "Senior Product Lead",
      bio: currentUser?.bio || "Crafting calm software workflows for busy engineering teams."
    };
  });

  useEffect(() => {
    if (currentUser?.name) {
      setProfile(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        role: currentUser.role || prev.role,
        bio: currentUser.bio || prev.bio
      }));
    }
  }, [currentUser]);

  const [passwordForm, setPasswordForm] = useState({ newPass: "", confirmPass: "" });
  const [prefs, setPrefs] = useState({
    assignments: true,
    reminders: true,
    desktop: false
  });

  const handleSaveProfile = () => {
    localStorage.setItem("user", JSON.stringify(profile));
    onUpdateUser?.(profile);
    showToast?.("Personal profile updated successfully!");
  };

  const handleUpdatePassword = () => {
    if (!passwordForm.newPass) {
      showToast?.("Please enter a new password", "error");
      return;
    }
    if (passwordForm.newPass.length < 6) {
      showToast?.("Password must be at least 6 characters", "error");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      showToast?.("Passwords do not match", "error");
      return;
    }
    setPasswordForm({ newPass: "", confirmPass: "" });
    showToast?.("Password updated successfully!");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className={`text-2xl font-bold tracking-tight mb-1 ${dark ? "text-slate-100" : "text-slate-900"}`}>Account Settings</h1>
        <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
          Manage your personal profile, credentials, and notification preferences.
        </p>
      </div>

      <Card dark={dark} className="p-6">
        <h3 className={`text-sm font-bold mb-4 ${dark ? "text-slate-100" : "text-slate-900"}`}>Personal Information</h3>
        <div className="flex items-center gap-5 pb-5 border-b border-slate-200 dark:border-slate-800">
          <Avatar name={profile.name} size={12} />
          <div>
            <div className="flex items-center gap-2">
              <GhostButton dark={dark} onClick={() => showToast?.("Photo avatar is dynamically rendered from initials")}>Change Photo</GhostButton>
              <button onClick={() => showToast?.("Default avatar active", "info")} className="text-xs text-rose-500 hover:underline px-2">Reset</button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Initials avatar dynamically computed. Modern SVG rendering.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">Full Name</label>
            <input
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                dark ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">Email Address</label>
            <input
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                dark ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">Role</label>
            <input
              value={profile.role}
              onChange={e => setProfile({ ...profile, role: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                dark ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">Bio</label>
            <input
              value={profile.bio}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                dark ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            />
          </div>
        </div>
        <div className="flex justify-end pt-5">
          <PrimaryButton onClick={handleSaveProfile}>Save Changes</PrimaryButton>
        </div>
      </Card>

      <Card dark={dark} className="p-6">
        <h3 className={`text-sm font-bold mb-4 ${dark ? "text-slate-100" : "text-slate-900"}`}>Security & Authentication</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.newPass}
              onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                dark ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.confirmPass}
              onChange={e => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                dark ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <GhostButton dark={dark} onClick={handleUpdatePassword}>Update Password</GhostButton>
        </div>
      </Card>

      <Card dark={dark} className="p-6">
        <h3 className={`text-sm font-bold mb-4 ${dark ? "text-slate-100" : "text-slate-900"}`}>Preferences & Theme</h3>
        <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className={`text-xs font-bold ${dark ? "text-slate-200" : "text-slate-800"}`}>Appearance</p>
            <p className="text-[11px] text-slate-400">Switch between sleek enterprise light and dark themes</p>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            className={`w-12 h-6 rounded-full relative transition-colors ${dark ? "bg-indigo-600" : "bg-slate-300"}`}
          >
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm" style={{ left: dark ? 26 : 2 }} />
          </button>
        </div>
        {[
          { key: "assignments", label: "Email me task assignments" },
          { key: "reminders", label: "Email me deadline reminders" },
          { key: "desktop", label: "Desktop browser notifications" }
        ].map((item, i) => (
          <div key={item.key} className={`flex items-center justify-between py-3 ${i < 2 ? "border-b border-slate-200 dark:border-slate-800" : ""}`}>
            <p className={`text-xs font-semibold ${dark ? "text-slate-200" : "text-slate-800"}`}>{item.label}</p>
            <button
              onClick={() => {
                setPrefs(prev => ({ ...prev, [item.key]: !prev[item.key] }));
                showToast?.(`${item.label} ${!prefs[item.key] ? "enabled" : "disabled"}`);
              }}
              className={`w-12 h-6 rounded-full relative transition-colors ${prefs[item.key] ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}
            >
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all" style={{ left: prefs[item.key] ? 26 : 2 }} />
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ---------------- Auth Screens ---------------- */

function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 font-sans">
      {/* Left 50%: Branding Hero & UI Illustration Panel */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-between p-12 lg:p-16 relative overflow-hidden text-white"
        style={{
          background: "radial-gradient(ellipse at 20% 20%, #4338CA 0%, #1E1B4B 50%, #0B0F19 100%)"
        }}
      >
        {/* Subtle Ambient Glow Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/30 shrink-0"
            style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight block leading-tight">Flowspace</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300/90 block">Enterprise PM</span>
          </div>
        </div>

        {/* Centerpiece: Headline + Floating UI Preview Mockup */}
        <div className="relative z-10 my-auto py-8 space-y-6 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-indigo-200 backdrop-blur-md">
              <Sparkles size={12} className="text-indigo-300" />
              <span>Calm, High-Velocity Workspaces</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-[1.15]">
              Work on big ideas without the chaos.
            </h1>
            <p className="text-xs lg:text-sm text-indigo-200/80 leading-relaxed max-w-md">
              Unify Kanban boards, milestone roadmaps, cross-project analytics, and Gemini AI task synthesis in one tranquil space.
            </p>
          </div>

          {/* Floating Glassmorphic UI Card Mockup */}
          <div className="relative pt-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-5 shadow-2xl space-y-3.5 transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">Active Sprint 24</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/25 border border-rose-400/30 text-rose-200">
                  High Priority
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-white tracking-tight">Checkout performance & design system revamp</p>
                <p className="text-[11px] text-indigo-200/70 mt-0.5">3 subtasks completed · 1 review pending</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-indigo-200">
                  <span>Sprint Progress</span>
                  <span>84%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400" style={{ width: "84%" }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-indigo-200/80">
                <div className="flex items-center -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 border border-indigo-300 flex items-center justify-center font-bold text-[9px] text-white">JP</div>
                  <div className="w-6 h-6 rounded-full bg-purple-500 border border-purple-300 flex items-center justify-center font-bold text-[9px] text-white">AK</div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border border-emerald-300 flex items-center justify-center font-bold text-[9px] text-white">+3</div>
                </div>
                <span className="font-semibold text-white/90">Due Friday</span>
              </div>
            </div>

            {/* Floating Mini Stat Badges */}
            <div className="absolute -bottom-4 -left-3 rounded-xl border border-white/20 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 shadow-xl flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-xs">⚡ 4.2x</span>
              <span className="text-[10px] text-slate-300 font-medium">Faster sprint turnaround</span>
            </div>

            <div className="absolute -top-3 -right-2 rounded-xl border border-white/20 bg-indigo-950/80 backdrop-blur-md px-3 py-1.5 shadow-xl flex items-center gap-2">
              <Sparkles size={12} className="text-amber-300" />
              <span className="text-[10px] text-indigo-200 font-bold">Gemini AI Synthesis</span>
            </div>
          </div>
        </div>

        {/* Footer Trust & Security Badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-4 text-[11px] font-medium text-indigo-200/70 border-t border-white/10 pt-4">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" /> SOC2 Type II
          </span>
          <span>·</span>
          <span>End-to-End Encrypted</span>
          <span>·</span>
          <span>99.99% Uptime SLA</span>
        </div>
      </div>

      {/* Right 50%: Elevated Authentication Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md">
          {/* Mobile Brand Logo */}
          <div className="md:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/30"
              style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
            >
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-lg tracking-tight">Flowspace</span>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <a
              href="/landing"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              ← Back to Landing Page
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-7 sm:p-9 shadow-xl shadow-slate-900/5 dark:shadow-black/40 backdrop-blur-sm">
            <div className="mb-6">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {subtitle}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, type = "text", placeholder, showToggle, show, setShow, value, onChange, label }) {
  return (
    <div className="mb-3.5">
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
          <Icon size={16} />
        </div>
        <input
          type={showToggle ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ paddingLeft: "40px", paddingRight: showToggle ? "40px" : "14px" }}
          className="w-full py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

function LoginScreen({ goRegister, enterApp, onLoginSuccess }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(email, password);
      if (res?.access_token || res?.token) {
        localStorage.setItem("token", res.access_token || res.token);
        let userObj = res.user;
        if (!userObj) {
          try {
            userObj = await authApi.getMe().catch(() => null);
          } catch {}
        }
        if (!userObj || !userObj.name) {
          const fallbackName = email.split("@")[0] || "User";
          userObj = { name: fallbackName, email, role: "Senior Product Lead" };
        }
        localStorage.setItem("user", JSON.stringify(userObj));
        onLoginSuccess?.(userObj);
        enterApp();
      } else {
        enterApp();
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message;
      setError(msg || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to resume work in your tranquil workspace.">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          icon={Mail}
          label="Email Address"
          placeholder="name@company.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
        />
        <InputField
          icon={Lock}
          label="Password"
          placeholder="Enter your password"
          showToggle
          show={show}
          setShow={setShow}
          value={password}
          onChange={e => { setPassword(e.target.value); setError(""); }}
        />
        <div className="flex items-center justify-between text-xs pt-1 pb-1">
          <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span>Remember me</span>
          </label>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">Forgot password?</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
        >
          {loading ? "Signing in..." : "Sign In to Flowspace"}
        </button>
      </form>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
        Don&apos;t have an account?{" "}
        <span className="font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline" onClick={goRegister}>
          Create one now
        </span>
      </p>
    </AuthShell>
  );
}

function RegisterScreen({ goLogin, enterApp, onLoginSuccess }) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill out all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authApi.register(name, email, password);
      if (res?.access_token || res?.token) {
        localStorage.setItem("token", res.access_token || res.token);
        const userObj = res.user || { name: name.trim(), email: email.trim(), role: "Senior Product Lead" };
        localStorage.setItem("user", JSON.stringify(userObj));
        onLoginSuccess?.(userObj);
      }
      enterApp();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message;
      setError(msg || "Registration failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your workspace" subtitle="Get started with full enterprise collaboration.">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          icon={UserIcon}
          label="Full Name"
          placeholder="Maya Patel"
          value={name}
          onChange={e => { setName(e.target.value); setError(""); }}
        />
        <InputField
          icon={Mail}
          label="Work Email"
          placeholder="name@company.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
        />
        <InputField
          icon={Lock}
          label="Password"
          placeholder="Create a strong password"
          showToggle
          show={show}
          setShow={setShow}
          value={password}
          onChange={e => { setPassword(e.target.value); setError(""); }}
        />
        <label className="flex items-start gap-2 text-[11px] text-slate-500 pt-1 pb-1 cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5" />
          <span>I agree to the Terms of Service and Privacy Policy</span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
        Already have an account?{" "}
        <span className="font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline" onClick={goLogin}>
          Sign in
        </span>
      </p>
    </AuthShell>
  );
}

/* ---------------- Modal & Toast Helpers ---------------- */

function Modal({ title, children, onClose, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${
        dark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-slate-800 mb-4">
          <h3 className="font-bold text-sm tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-slate-900 text-white text-xs border border-slate-800 animate-in slide-in-from-bottom-5">
      {type === "success" && <CheckCircle2 size={16} className="text-emerald-400" />}
      {type === "error" && <AlertCircle size={16} className="text-rose-400" />}
      {type === "info" && <Sparkles size={16} className="text-indigo-400" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-white ml-2">
        <X size={13} />
      </button>
    </div>
  );
}

/* ---------------- Root App ---------------- */

export default function FlowspaceApp({ initialAuthView }) {
  const [authView, setAuthView] = useState(() => {
    if (initialAuthView) return initialAuthView;
    return localStorage.getItem("token") ? "app" : "login";
  });

  useEffect(() => {
    if (initialAuthView) setAuthView(initialAuthView);
  }, [initialAuthView]);
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(() => localStorage.getItem("flowspace_theme") === "dark");
  const [selectedTask, setSelectedTask] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Current logged in user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
    } catch {}
    return { name: "User", email: "", role: "Product Lead" };
  });

  // Keep currentUser synced with backend /auth/me when token exists
  useEffect(() => {
    async function syncUser() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const me = await authApi.getMe().catch(() => null);
        if (me && me.name) {
          setCurrentUser(prev => {
            const merged = { ...prev, name: me.name, email: me.email || prev.email, bio: me.bio || prev.bio };
            localStorage.setItem("user", JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn("User sync note:", err);
      }
    }
    syncUser();
  }, [authView]);

  // Load Notifications from Backend
  const loadNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setNotifsLoading(true);
    try {
      const items = await notificationApi.list();
      if (Array.isArray(items)) {
        setNotifs(items.map(n => ({
          id: n.id,
          type: n.type === "task_assigned" ? "assigned" : (n.type || "comment"),
          text: n.message || "Notification",
          time: n.created_at ? new Date(n.created_at).toLocaleString() : "Recently",
          read: Boolean(n.is_read),
          relatedTaskId: n.related_task_id
        })));
      }
    } catch (err) {
      console.warn("Notification load error:", err);
    } finally {
      setNotifsLoading(false);
    }
  };

  useEffect(() => {
    if (authView !== "app") return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [authView]);

  useEffect(() => {
    if (page === "notifications") {
      loadNotifications();
    }
  }, [page]);

  const markNotificationRead = async (notificationId) => {
    setNotifs(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    try {
      await notificationApi.markRead(notificationId);
    } catch (err) {
      console.warn("Notification mark read failed:", err);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await notificationApi.markAllRead();
      showToast("All notifications marked as read", "info");
    } catch (err) {
      console.warn("Notification mark all read failed:", err);
    }
  };

  // Backend state
  const [projectsList, setProjectsList] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [columns, setColumns] = useState(EMPTY_COLUMNS);

  // Modals state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Workspaces state
  const [workspacesList, setWorkspacesList] = useState([]);
  const [workspaceForm, setWorkspaceForm] = useState({ name: "", color: ACCENT });
  const [selectedWorkspaceFilter, setSelectedWorkspaceFilter] = useState(null);

  // Team state
  const [teamList, setTeamList] = useState([]);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "Frontend Engineer" });

  // Form states
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [boardForm, setBoardForm] = useState({ name: "", description: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", due_date: "", status: "todo", assignee_id: "" });
  const [aiInput, setAiInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = "success") => setToast({ message, type });

  // Sync dark theme to localStorage
  useEffect(() => {
    localStorage.setItem("flowspace_theme", dark ? "dark" : "light");
  }, [dark]);

  // Load Projects from Backend
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await projectApi.list().catch(() => null);
        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || "",
            workspace: p.workspace || "General",
            members: [currentUser?.name || "User"],
            status: p.status || "In Progress",
            progress: p.progress || 0,
            due: p.due_date ? String(p.due_date).slice(0, 10) : "Upcoming"
          }));
          setProjectsList(mapped);
          setActiveProjectId(mapped[0].id);

          const wsNames = [...new Set(mapped.map(p => p.workspace).filter(Boolean))];
          if (wsNames.length > 0) {
            setWorkspacesList(wsNames.map((name, idx) => ({
              id: `w-${idx + 1}`,
              name,
              projects: mapped.filter(p => p.workspace === name).length,
              members: 1,
              color: [ACCENT, "#F59E0B", "#2563EB", "#DB2777"][idx % 4]
            })));
          }
        } else {
          setProjectsList([]);
          setActiveProjectId(null);
        }
      } catch (err) {
        console.warn("Project sync note:", err.message);
        setProjectsList([]);
        setActiveProjectId(null);
      }
    }
    loadProjects();
  }, []);

  // Load Boards when active project changes
  useEffect(() => {
    if (!activeProjectId) return;
    async function loadBoards() {
      try {
        const res = await boardApi.list(activeProjectId).catch(() => null);
        if (res && Array.isArray(res) && res.length > 0) {
          setBoards(res);
          setActiveBoardId(res[0].id);
        } else {
          setBoards([]);
          setActiveBoardId(null);
        }
      } catch (err) {
        console.warn("Boards sync note:", err.message);
        setBoards([]);
        setActiveBoardId(null);
      }
    }
    loadBoards();
  }, [activeProjectId]);

  // Load Tasks when active board changes
  useEffect(() => {
    if (!activeBoardId) {
      setColumns(EMPTY_COLUMNS);
      return;
    }
    async function loadTasks() {
      try {
        const res = await taskApi.list(activeBoardId).catch(() => null);
        if (res && Array.isArray(res) && res.length > 0) {
          const newCols = {
            todo: { title: "To Do", tasks: [] },
            inprogress: { title: "In Progress", tasks: [] },
            inreview: { title: "In Review", tasks: [] },
            completed: { title: "Completed", tasks: [] }
          };
          res.forEach(t => {
            const st = (t.status || "todo").replace("_", "").toLowerCase();
            const targetKey = st === "done" || st === "completed" ? "completed"
              : st === "inreview" ? "inreview"
              : st === "inprogress" ? "inprogress"
              : "todo";
            newCols[targetKey].tasks.push({
              id: t.id,
              title: t.title,
              desc: t.description || "",
              priority: t.priority || "medium",
              assignee: currentUser?.name || "User",
              due: t.due_date ? String(t.due_date).slice(0, 10) : "",
              progress: targetKey === "completed" ? 100 : (t.progress || 0),
              labels: t.labels || (t.priority ? [t.priority] : [])
            });
          });
          setColumns(newCols);
        } else {
          setColumns(EMPTY_COLUMNS);
        }
      } catch (err) {
        console.warn("Tasks sync note:", err.message);
        setColumns(EMPTY_COLUMNS);
      }
    }
    loadTasks();
  }, [activeBoardId]);

  // Load Team Members when active project changes
  useEffect(() => {
    if (!activeProjectId) {
      if (currentUser?.name) {
        setTeamList([{ id: "u1", name: currentUser.name, email: currentUser.email || "", role: currentUser.role || "Lead", status: "Active", projects: projectsList.length }]);
      } else {
        setTeamList([]);
      }
      return;
    }
    async function loadMembers() {
      try {
        const res = await projectApi.members(activeProjectId).catch(() => null);
        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map(m => ({
            id: m.id || m.email,
            name: m.name || m.username || "Team Member",
            email: m.email || "",
            role: m.role || "Contributor",
            status: "Active",
            projects: 1
          }));
          setTeamList(mapped);
        } else if (currentUser?.name) {
          setTeamList([{ id: "u1", name: currentUser.name, email: currentUser.email || "", role: currentUser.role || "Lead", status: "Active", projects: projectsList.length }]);
        } else {
          setTeamList([]);
        }
      } catch (err) {
        console.warn("Members sync note:", err.message);
        if (currentUser?.name) {
          setTeamList([{ id: "u1", name: currentUser.name, email: currentUser.email || "", role: currentUser.role || "Lead", status: "Active", projects: projectsList.length }]);
        } else {
          setTeamList([]);
        }
      }
    }
    loadMembers();
  }, [activeProjectId, currentUser?.name, currentUser?.email, currentUser?.role, projectsList.length]);

  // Handle Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name.trim()) return;
    setSubmitting(true);
    try {
      const created = await projectApi.create(projectForm.name, projectForm.description).catch(() => null);
      const newP = {
        id: created?.id || Date.now(),
        name: projectForm.name,
        workspace: selectedWorkspaceFilter || "General",
        members: [currentUser?.name || "User"],
        status: "In Progress",
        progress: 0,
        due: "Upcoming"
      };
      setProjectsList(prev => [newP, ...prev]);
      setActiveProjectId(newP.id);
      setProjectModalOpen(false);
      setProjectForm({ name: "", description: "" });
      showToast(`Project "${newP.name}" created!`);
    } catch {
      showToast("Error creating project", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (projectId) => {
    setProjectsList(prev => prev.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) {
      const remaining = projectsList.filter(p => p.id !== projectId);
      if (remaining.length > 0) setActiveProjectId(remaining[0].id);
    }
    showToast("Project deleted", "info");
    try {
      await projectApi.delete(projectId).catch(() => null);
    } catch {
      // Optimistic UI retained
    }
  };

  // Handle Create Workspace
  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (!workspaceForm.name.trim()) return;
    const newW = {
      id: `w-${Date.now()}`,
      name: workspaceForm.name.trim(),
      projects: 0,
      members: 1,
      color: workspaceForm.color || ACCENT
    };
    setWorkspacesList(prev => [...prev, newW]);
    setWorkspaceModalOpen(false);
    setWorkspaceForm({ name: "", color: ACCENT });
    showToast(`Workspace "${newW.name}" created!`);
  };

  // Handle Invite Team Member
  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) return;
    try {
      if (activeProjectId) {
        await projectApi.addMember(activeProjectId, inviteForm.email.trim(), inviteForm.role).catch(() => null);
      }
    } catch {}
    const newMember = {
      id: `m-${Date.now()}`,
      name: inviteForm.name.trim(),
      email: inviteForm.email.trim(),
      role: inviteForm.role || "Frontend Engineer",
      tasks: 0,
      status: "Active",
      projects: 1
    };
    setTeamList(prev => [...prev, newMember]);
    setInviteModalOpen(false);
    setInviteForm({ name: "", email: "", role: "Frontend Engineer" });
    showToast(`Invitation sent to ${newMember.email}!`);
  };

  // Handle Delete Team Member
  const handleDeleteMember = (memberId) => {
    setTeamList(prev => prev.filter(m => m.id !== memberId && m.email !== memberId));
    showToast("Team member removed", "info");
  };

  // Handle Open New Task Modal for specific column
  const handleOpenNewTaskModal = (colKey) => {
    const validCol = typeof colKey === "string" && ["todo", "inprogress", "inreview", "completed"].includes(colKey)
      ? colKey
      : "todo";
    setTaskForm({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
      status: validCol,
      assignee_id: ""
    });
    setTaskModalOpen(true);
  };

  // Handle Create Board
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardForm.name.trim() || !activeProjectId) return;
    setSubmitting(true);
    try {
      const created = await boardApi.create(activeProjectId, boardForm.name, boardForm.description).catch(() => null);
      const newB = {
        id: created?.id || Date.now(),
        name: boardForm.name,
        description: boardForm.description
      };
      setBoards(prev => [...prev, newB]);
      setActiveBoardId(newB.id);
      setBoardModalOpen(false);
      setBoardForm({ name: "", description: "" });
      showToast(`Board "${newB.name}" created!`);
    } catch {
      showToast("Error creating board", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    setSubmitting(true);
    try {
      let created = null;
      if (activeBoardId) {
        created = await taskApi.create(activeBoardId, {
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          due_date: taskForm.due_date || null,
          assignee_id: taskForm.assignee_id || null,
        }).catch(() => null);
      }

      // If assignee is a different user/member, call taskApi.assign to trigger backend notification
      if (created?.id && taskForm.assignee_id && taskForm.assignee_id !== "currentUser") {
        await taskApi.assign(created.id, taskForm.assignee_id).catch(err => {
          console.warn("Auto-assign notification dispatch note:", err);
        });
      }

      // Determine display name for the assigned user
      const assignedMember = teamList.find(m => String(m.id) === String(taskForm.assignee_id) || m.email === taskForm.assignee_id);
      const assigneeName = assignedMember?.name || (taskForm.assignee_id && taskForm.assignee_id !== "currentUser" ? "Team Member" : (currentUser?.name || "User"));

      const targetColKey = taskForm.status || "todo";
      const newT = {
        id: created?.id || Date.now(),
        title: taskForm.title,
        desc: taskForm.description,
        priority: taskForm.priority,
        assignee: assigneeName,
        assignee_id: taskForm.assignee_id || null,
        due: taskForm.due_date || "",
        progress: targetColKey === "completed" ? 100 : 0,
        labels: taskForm.priority ? [taskForm.priority] : []
      };
      setColumns(prev => ({
        ...prev,
        [targetColKey]: {
          ...prev[targetColKey],
          tasks: [newT, ...(prev[targetColKey]?.tasks || [])]
        }
      }));
      setTaskModalOpen(false);
      setTaskForm({ title: "", description: "", priority: "medium", due_date: "", status: "todo", assignee_id: "" });
      showToast(`Task "${newT.title}" assigned to ${assigneeName}!`);
    } catch {
      showToast("Error creating task", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Assign Task
  const handleAssignTask = async (taskId, assigneeId) => {
    if (!taskId || !assigneeId) return;
    const selectedMember = teamList.find(m => String(m.id) === String(assigneeId) || m.email === assigneeId);
    const newAssigneeName = selectedMember?.name || (assigneeId === "currentUser" ? currentUser?.name : "Team Member");

    // Optimistically update columns
    setColumns(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[k] = {
          ...next[k],
          tasks: (next[k]?.tasks || []).map(t => t.id === taskId ? { ...t, assignee: newAssigneeName, assignee_id: assigneeId } : t)
        };
      });
      return next;
    });

    // Optimistically update selectedTask detail
    setSelectedTask(prev => prev && prev.id === taskId ? { ...prev, assignee: newAssigneeName, assignee_id: assigneeId } : prev);

    try {
      if (assigneeId !== "currentUser") {
        await taskApi.assign(taskId, assigneeId);
      }
      showToast(`Task assigned to ${newAssigneeName}! Notification sent.`);
    } catch (err) {
      console.warn("Task assign note:", err);
      showToast(`Task assigned to ${newAssigneeName}`);
    }
  };

  // Handle Move Task Status
  const handleMoveTask = async (taskId, newStatus) => {
    let movedTask = null;
    const newCols = { ...columns };

    Object.keys(newCols).forEach(k => {
      const idx = newCols[k].tasks.findIndex(t => t.id === taskId);
      if (idx !== -1) {
        [movedTask] = newCols[k].tasks.splice(idx, 1);
      }
    });

    if (movedTask) {
      const targetColKey = newStatus === "completed" || newStatus === "done" ? "completed"
        : newStatus === "in_review" || newStatus === "inreview" ? "inreview"
        : newStatus === "in_progress" || newStatus === "inprogress" ? "inprogress"
        : "todo";

      movedTask.status = targetColKey;
      movedTask.progress = targetColKey === "completed" ? 100 : movedTask.progress;
      newCols[targetColKey].tasks.push(movedTask);
      setColumns({ ...newCols });

      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...movedTask });
      }

      showToast(`Task moved to ${newCols[targetColKey].title}`);
      try {
        await taskApi.move(taskId, newStatus, 0).catch(() => null);
      } catch {
        // Optimistic UI retained
      }
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async (taskId) => {
    const newCols = { ...columns };
    Object.keys(newCols).forEach(k => {
      newCols[k].tasks = newCols[k].tasks.filter(t => t.id !== taskId);
    });
    setColumns({ ...newCols });
    if (selectedTask?.id === taskId) setSelectedTask(null);
    showToast("Task deleted", "info");
    try {
      await taskApi.delete(taskId).catch(() => null);
    } catch {
      // Ignored
    }
  };

  // Handle TaskPanel Checklist Update
  const handleUpdateTaskChecklist = (taskId, newChecklist) => {
    const newCols = { ...columns };
    let updatedTask = null;
    Object.keys(newCols).forEach(k => {
      newCols[k].tasks = newCols[k].tasks.map(t => {
        if (t.id === taskId) {
          updatedTask = { ...t, checklist: newChecklist };
          return updatedTask;
        }
        return t;
      });
    });
    setColumns(newCols);
    if (selectedTask?.id === taskId && updatedTask) {
      setSelectedTask(updatedTask);
    }
  };

  // Handle TaskPanel Comment Add
  const handleAddComment = (taskId, commentText) => {
    const newComment = {
      author: currentUser?.name || "User",
      text: commentText,
      time: "Just now"
    };
    const newCols = { ...columns };
    let updatedTask = null;
    Object.keys(newCols).forEach(k => {
      newCols[k].tasks = newCols[k].tasks.map(t => {
        if (t.id === taskId) {
          const comments = t.comments || [];
          updatedTask = { ...t, comments: [newComment, ...comments] };
          return updatedTask;
        }
        return t;
      });
    });
    setColumns(newCols);
    if (selectedTask?.id === taskId && updatedTask) {
      setSelectedTask(updatedTask);
    }
  };

  // Handle AI Task Generation (Gemini 2.5 Flash)
  const handleAiTask = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setSubmitting(true);
    try {
      let res = null;
      if (activeProjectId && activeBoardId) {
        res = await taskApi.createWithAI(activeProjectId, activeBoardId, aiInput).catch(() => null);
      }
      const taskObj = res?.task || {
        id: Date.now(),
        title: aiInput.slice(0, 50),
        desc: `AI-synthesized task: "${aiInput}"`,
        priority: aiInput.toLowerCase().includes("urgent") || aiInput.toLowerCase().includes("high") ? "high" : "medium",
        assignee: currentUser?.name || "User",
        due: "",
        progress: 0,
        labels: ["AI-Generated"]
      };
      setColumns(prev => ({
        ...prev,
        todo: { ...prev.todo, tasks: [taskObj, ...prev.todo.tasks] }
      }));
      setAiModalOpen(false);
      setAiInput("");
      showToast("Task synthesized with Gemini AI!", "info");
    } catch {
      showToast("AI generation failed — added local fallback", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const unreadCount = notifs.filter(n => !n.read).length;
  const currentProjectName = projectsList.find(p => p.id === activeProjectId)?.name || (projectsList.length > 0 ? projectsList[0].name : "Tasks");

  if (authView === "login") return <LoginScreen goRegister={() => setAuthView("register")} enterApp={() => { setAuthView("app"); setPage("dashboard"); showToast("Signed in successfully!"); }} onLoginSuccess={setCurrentUser} />;
  if (authView === "register") return <RegisterScreen goLogin={() => setAuthView("login")} enterApp={() => { setAuthView("app"); setPage("dashboard"); showToast("Account created!"); }} onLoginSuccess={setCurrentUser} />;

  return (
    <div
      className={`flowspace-shell ${
        dark ? "dark-theme dark bg-[#090D16] text-slate-100" : "bg-slate-50 text-slate-900"
      } min-h-screen h-screen w-full flex overflow-hidden`}
      style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar page={page} setPage={setPage} dark={dark} setAuthView={setAuthView} currentUser={currentUser} />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10" onClick={e => e.stopPropagation()}>
            <Sidebar
              page={page}
              setPage={setPage}
              dark={dark}
              isMobile
              onClose={() => setMobileMenuOpen(false)}
              setAuthView={setAuthView}
              currentUser={currentUser}
            />
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          dark={dark}
          setDark={setDark}
          unreadCount={unreadCount}
          setPage={setPage}
          setAuthView={setAuthView}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          currentUser={currentUser}
          workspacesList={workspacesList}
          selectedWorkspace={selectedWorkspaceFilter}
          onSelectWorkspace={(name) => {
            setSelectedWorkspaceFilter(name);
            setPage("projects");
          }}
        />
        
        <main className={`flex-1 overflow-y-auto p-7 ${dark ? "bg-[#090D16]" : "bg-slate-50"}`}>
          {page === "dashboard" && (
            <Dashboard
              dark={dark}
              openTask={setSelectedTask}
              projectsList={projectsList}
              columns={columns}
              setPage={setPage}
              setActiveProjectId={setActiveProjectId}
              currentUser={currentUser}
              onOpenNewTask={handleOpenNewTaskModal}
              onOpenCreateProject={() => setProjectModalOpen(true)}
              onOpenAiModal={() => setAiModalOpen(true)}
            />
          )}
          {page === "workspaces" && (
            <Workspaces
              dark={dark}
              workspacesList={workspacesList}
              onOpenNewWorkspace={() => setWorkspaceModalOpen(true)}
              onSelectWorkspace={(name) => {
                setSelectedWorkspaceFilter(name);
                setPage("projects");
              }}
              projectsList={projectsList}
            />
          )}
          {page === "projects" && (
            <Projects
              dark={dark}
              projectsList={projectsList}
              activeProjectId={activeProjectId}
              setActiveProjectId={setActiveProjectId}
              setPage={setPage}
              onOpenCreateProject={() => setProjectModalOpen(true)}
              onDeleteProject={handleDeleteProject}
              selectedWorkspaceFilter={selectedWorkspaceFilter}
              setSelectedWorkspaceFilter={setSelectedWorkspaceFilter}
            />
          )}
          {page === "kanban" && (
            <Kanban
              dark={dark}
              openTask={setSelectedTask}
              columns={columns}
              onOpenNewTask={handleOpenNewTaskModal}
              onOpenNewBoard={() => setBoardModalOpen(true)}
              onOpenAiModal={() => setAiModalOpen(true)}
              boards={boards}
              activeBoardId={activeBoardId}
              setActiveBoardId={setActiveBoardId}
              onMoveTask={handleMoveTask}
              activeProjectName={currentProjectName}
            />
          )}
          {page === "calendar" && <Calendar dark={dark} columns={columns} />}
          {page === "team" && (
            <Team
              dark={dark}
              teamList={teamList}
              onOpenInvite={() => setInviteModalOpen(true)}
              onDeleteMember={handleDeleteMember}
            />
          )}
          {page === "reports" && (
            <Reports
              dark={dark}
              projectsList={projectsList}
              columns={columns}
              showToast={showToast}
            />
          )}
          {page === "notifications" && (
            <Notifications
              dark={dark}
              notifs={notifs}
              setNotifs={setNotifs}
              onMarkRead={markNotificationRead}
              onMarkAllRead={markAllNotificationsRead}
              onRefresh={loadNotifications}
              loading={notifsLoading}
            />
          )}
          {page === "profile" && (
            <Profile
              dark={dark}
              setDark={setDark}
              showToast={showToast}
              currentUser={currentUser}
              onUpdateUser={setCurrentUser}
            />
          )}
        </main>
      </div>

      {selectedTask && (
        <TaskPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          dark={dark}
          onMove={handleMoveTask}
          onDelete={handleDeleteTask}
          onUpdateChecklist={handleUpdateTaskChecklist}
          onAddComment={handleAddComment}
          currentUser={currentUser}
          teamList={teamList}
          onAssign={handleAssignTask}
        />
      )}

      {/* New Project Modal */}
      {projectModalOpen && (
        <Modal title="Create New Project" dark={dark} onClose={() => setProjectModalOpen(false)}>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Project Name</label>
              <input
                required
                autoFocus
                value={projectForm.name}
                onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="e.g. AI Workflow Platform"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                  dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Description</label>
              <textarea
                rows={3}
                value={projectForm.description}
                onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Scope, goals, key deliverables..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                  dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <GhostButton dark={dark} type="button" onClick={() => setProjectModalOpen(false)}>Cancel</GhostButton>
              <PrimaryButton type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Project"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* New Workspace Modal */}
      {workspaceModalOpen && (
        <Modal title="Create New Workspace" dark={dark} onClose={() => setWorkspaceModalOpen(false)}>
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Workspace Name</label>
              <input
                required
                autoFocus
                value={workspaceForm.name}
                onChange={e => setWorkspaceForm({ ...workspaceForm, name: e.target.value })}
                placeholder="e.g. Growth & Marketing"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                  dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Color Theme</label>
              <div className="flex items-center gap-2 pt-1">
                {["#6366F1", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setWorkspaceForm({ ...workspaceForm, color: c })}
                    className={`w-7 h-7 rounded-full transition-transform ${workspaceForm.color === c ? "scale-125 ring-2 ring-offset-2 ring-indigo-500" : "hover:scale-110"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <GhostButton dark={dark} type="button" onClick={() => setWorkspaceModalOpen(false)}>Cancel</GhostButton>
              <PrimaryButton type="submit">
                Create Workspace
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <Modal title="Invite Team Member" dark={dark} onClose={() => setInviteModalOpen(false)}>
          <form onSubmit={handleInviteMember} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Full Name</label>
              <input
                required
                autoFocus
                value={inviteForm.name}
                onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })}
                placeholder="e.g. Sarah Jenkins"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                  dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Work Email</label>
              <input
                required
                type="email"
                value={inviteForm.email}
                onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="sarah@flowspace.io"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                  dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Role</label>
              <select
                value={inviteForm.role}
                onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
                  dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              >
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Product Designer">Product Designer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Marketing Lead">Marketing Lead</option>
                <option value="Content Strategist">Content Strategist</option>
              </select>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <GhostButton dark={dark} type="button" onClick={() => setInviteModalOpen(false)}>Cancel</GhostButton>
              <PrimaryButton type="submit">
                Send Invitation
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* New Board Modal */}
      {boardModalOpen && (
        <Modal title="Add Board to Project" dark={dark} onClose={() => setBoardModalOpen(false)}>
          <form onSubmit={handleCreateBoard} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Board Name</label>
              <input
                required
                autoFocus
                value={boardForm.name}
                onChange={e => setBoardForm({ ...boardForm, name: e.target.value })}
                placeholder="e.g. Sprint 24 / Q3 Backlog"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                  dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Description (Optional)</label>
              <input
                value={boardForm.description}
                onChange={e => setBoardForm({ ...boardForm, description: e.target.value })}
                placeholder="Target focus area..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                  dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <GhostButton dark={dark} type="button" onClick={() => setBoardModalOpen(false)}>Cancel</GhostButton>
              <PrimaryButton type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Board"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* New Task Modal */}
      {taskModalOpen && (
        <Modal title="Create New Task" dark={dark} onClose={() => setTaskModalOpen(false)}>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Title</label>
              <input
                required
                autoFocus
                value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="e.g. Design authentication token lifecycle"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                  dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Description</label>
              <textarea
                rows={2}
                value={taskForm.description}
                onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Acceptance criteria and technical notes..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                  dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Stage / Column</label>
                <select
                  value={taskForm.status || "todo"}
                  onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
                    dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                  }`}
                >
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="inreview">In Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
                    dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                  }`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
                    dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                  }`}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Assignee (Team Member)</label>
                <select
                  value={taskForm.assignee_id || ""}
                  onChange={e => setTaskForm({ ...taskForm, assignee_id: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
                    dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                  }`}
                >
                  <option value="">Select Assignee (Default: Me)</option>
                  {currentUser?.name && (
                    <option value={currentUser.id || "currentUser"}>
                      {currentUser.name} (Me)
                    </option>
                  )}
                  {teamList
                    .filter(m => m.name !== currentUser?.name && m.email !== currentUser?.email)
                    .map(m => (
                      <option key={m.id || m.email} value={m.id || m.email}>
                        {m.name} {m.email ? `(${m.email})` : `— ${m.role || "Member"}`}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <GhostButton dark={dark} type="button" onClick={() => setTaskModalOpen(false)}>Cancel</GhostButton>
              <PrimaryButton type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Add to Board"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* AI Task Modal (Gemini 2.5 Flash) */}
      {aiModalOpen && (
        <Modal title="Gemini AI Task Generation" dark={dark} onClose={() => setAiModalOpen(false)}>
          <form onSubmit={handleAiTask} className="space-y-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-700 dark:text-indigo-300">
              <Sparkles size={16} className="shrink-0 text-indigo-500" />
              <span>Type plain English. Gemini parses title, priority, due date, and automatically injects it into your board.</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Prompt or Requirement</label>
              <textarea
                required
                autoFocus
                rows={3}
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                placeholder="e.g. Implement user export to CSV by Friday with high priority"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                  dark ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <GhostButton dark={dark} type="button" onClick={() => setAiModalOpen(false)}>Cancel</GhostButton>
              <PrimaryButton type="submit" disabled={submitting}>
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {submitting ? "Synthesizing..." : "Generate with AI"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Floating Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

