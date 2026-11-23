import {
  LayoutDashboard, Briefcase, CheckSquare, Calendar as CalendarIcon, Users,
  BarChart2, Bell, Settings, Folder, MessageCircle, Clock, CheckCircle2, UserPlus
} from "lucide-react";

export const ACCENT = "#4F46E5";
export const ACCENT_LIGHT = "#6366F1";
export const ACCENT_DARK = "#3730A3";
export const ACCENT_SOFT = "#EEF2FF";

export const AVATAR_COLORS = [
  { bg: "#EEF2FF", fg: "#4F46E5" }, { bg: "#EFF6FF", fg: "#2563EB" },
  { bg: "#FDF2F8", fg: "#DB2777" }, { bg: "#ECFDF5", fg: "#059669" },
  { bg: "#FFFBEB", fg: "#D97706" }, { bg: "#FEF2F2", fg: "#DC2626" },
];

export const STATUS_STYLE = {
  "In Progress": { bg: "#EEF2FF", fg: "#4F46E5" },
  "On Track": { bg: "#ECFDF5", fg: "#059669" },
  "At Risk": { bg: "#FEF2F2", fg: "#DC2626" },
  "Completed": { bg: "#F0FDF4", fg: "#16A34A" },
};

export const PRIORITY_STYLE = {
  High: { bg: "#FEF2F2", fg: "#DC2626" },
  Medium: { bg: "#FFFBEB", fg: "#D97706" },
  Low: { bg: "#F0FDF4", fg: "#16A34A" },
  high: { bg: "#FEF2F2", fg: "#DC2626" },
  medium: { bg: "#FFFBEB", fg: "#D97706" },
  low: { bg: "#F0FDF4", fg: "#16A34A" },
};

export const EMPTY_COLUMNS = {
  todo: { title: "To Do", tasks: [] },
  inprogress: { title: "In Progress", tasks: [] },
  inreview: { title: "In Review", tasks: [] },
  completed: { title: "Completed", tasks: [] },
};

export const NOTIF_ICON = {
  assigned: { icon: CheckSquare, bg: "#EEF2FF", fg: "#4F46E5" },
  comment: { icon: MessageCircle, bg: "#EFF6FF", fg: "#2563EB" },
  deadline: { icon: Clock, bg: "#FFFBEB", fg: "#D97706" },
  completed: { icon: CheckCircle2, bg: "#ECFDF5", fg: "#059669" },
  member: { icon: UserPlus, bg: "#FDF2F8", fg: "#DB2777" },
};

export const NAV_ITEMS = [
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
