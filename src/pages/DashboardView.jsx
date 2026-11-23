import React from "react";
import {
  Plus,
  Briefcase,
  Sparkles,
  CheckSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { KPICard } from "../components/layout/KPICard";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { Avatar } from "../components/common/Avatar";
import { EMPTY_COLUMNS, ACCENT, STATUS_STYLE } from "../utils/constants";

export function DashboardView({
  dark,
  openTask,
  projectsList = [],
  columns = EMPTY_COLUMNS,
  setPage,
  setActiveProjectId,
  currentUser,
  onOpenNewTask,
  onOpenCreateProject,
  onOpenAiModal,
}) {
  const totalProjects = projectsList.length;
  const allTasks = Object.values(columns || {}).flatMap(
    (c) => c.tasks || []
  );
  const totalTasks = allTasks.length;
  const completedTasks = (columns?.completed?.tasks || []).length;
  const inProgressTasks = (columns?.inprogress?.tasks || []).length;
  const overdueTasks =
    (columns?.inreview?.tasks || []).length +
    (columns?.todo?.tasks || []).length;

  const completionPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressPercent =
    totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  const notStartedPercent =
    totalTasks > 0
      ? Math.max(0, 100 - completionPercent - inProgressPercent)
      : 0;

  const dynamicDonut = [
    { name: "Completed", value: completionPercent, color: "#4F46E5" },
    { name: "In Progress", value: inProgressPercent, color: "#818CF8" },
    { name: "To Do", value: notStartedPercent, color: "#CBD5E1" },
  ];

  const dynamicBar = (projectsList || []).slice(0, 5).map((p) => ({
    name: p.name.length > 12 ? p.name.slice(0, 11) + "…" : p.name,
    progress: p.progress || 0,
  }));

  const todaysTasks = [
    ...(columns?.inprogress?.tasks || []),
    ...(columns?.inreview?.tasks || []),
    ...(columns?.todo?.tasks || []),
  ].slice(0, 3);

  const firstName = currentUser?.name?.trim().split(" ")[0] || "there";

  return (
    <div className="flowspace-dashboard flex flex-col gap-4 sm:gap-5 pb-8 max-w-[1380px] mx-auto w-full">
      {/* Top Header & Prominent Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1
              className={`text-2xl font-black tracking-tight ${
                dark ? "text-slate-50" : "text-slate-900"
              }`}
            >
              Welcome back, {firstName}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Workspace
            </span>
          </div>
          <p
            className={`text-xs ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {totalProjects} active{" "}
            {totalProjects === 1 ? "project" : "projects"} · {totalTasks} total{" "}
            {totalTasks === 1 ? "task" : "tasks"} tracked across your teams
          </p>
        </div>

        {/* Visually Dominant Primary Action Bar */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => onOpenNewTask?.("todo")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #4F46E5, #6366F1)",
            }}
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
        <KPICard
          label="Total Projects"
          value={String(totalProjects)}
          delta={`${totalProjects} active`}
          up
          dark={dark}
          icon={Briefcase}
          iconColor="#4F46E5"
          iconBg="#EEF2FF"
        />
        <KPICard
          label="Total Tasks"
          value={String(totalTasks)}
          delta={`${totalTasks} tracked`}
          up
          dark={dark}
          icon={CheckSquare}
          iconColor="#2563EB"
          iconBg="#EFF6FF"
        />
        <KPICard
          label="Completed Tasks"
          value={String(completedTasks)}
          delta={`${completionPercent}% done`}
          up
          dark={dark}
          icon={CheckCircle2}
          iconColor="#059669"
          iconBg="#ECFDF5"
        />
        <KPICard
          label="Pending Tasks"
          value={String(overdueTasks)}
          delta={overdueTasks > 0 ? "Action required" : "All caught up"}
          dark={dark}
          icon={AlertCircle}
          iconColor="#DC2626"
          iconBg="#FEF2F2"
        />
      </div>

      {/* Row 2: Charts with tighter spacing and clear visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Component 1: Task Completion Donut Chart */}
        <Card
          dark={dark}
          className="p-4 sm:p-5 lg:col-span-1 min-w-0 flex flex-col justify-between overflow-hidden"
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="min-w-0">
                <p
                  className={`text-sm font-bold ${
                    dark ? "text-slate-100" : "text-slate-900"
                  } leading-tight tracking-tight`}
                >
                  Task Completion
                </p>
                <p
                  className={`text-[11px] ${
                    dark ? "text-slate-400" : "text-slate-500"
                  } mt-0.5`}
                >
                  Status split across all projects
                </p>
              </div>
              <span
                className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  dark
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Overall
              </span>
            </div>
          </div>

          <div className="h-38 relative my-2 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicDonut}
                  dataKey="value"
                  innerRadius={44}
                  outerRadius={60}
                  paddingAngle={4}
                  startAngle={90}
                  endAngle={-270}
                >
                  {dynamicDonut.map((d, i) => (
                    <Cell key={i} fill={d.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                className={`text-xl font-extrabold tracking-tight ${
                  dark ? "text-slate-50" : "text-slate-900"
                }`}
              >
                {completionPercent}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Done
              </span>
            </div>
          </div>

          <div className="flex items-center justify-around pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
            {dynamicDonut.map((d) => (
              <div key={d.name} className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: d.color }}
                  />
                  <span>{d.name}</span>
                </div>
                <span
                  className={`text-xs font-bold mt-0.5 ${
                    dark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  {d.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Component 2: Project Progress Bar Chart */}
        <Card
          dark={dark}
          className="p-4 sm:p-5 lg:col-span-2 min-w-0 flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <p
                className={`text-sm font-bold ${
                  dark ? "text-slate-100" : "text-slate-900"
                } leading-tight tracking-tight`}
              >
                Project Progress
              </p>
              <p
                className={`text-[11px] mt-0.5 ${
                  dark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Completion percentage by active initiative
              </p>
            </div>
            <span
              className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                dark
                  ? "border-slate-800 text-slate-400"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              Active Sprint
            </span>
          </div>
          <div className="h-44 min-w-0 flex items-center justify-center">
            {dynamicBar.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dynamicBar}
                  barSize={22}
                  margin={{ top: 6, right: 12, left: -10, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 10,
                      fill: dark ? "#94A3B8" : "#64748B",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: dark ? "#94A3B8" : "#64748B",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={34}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    cursor={{
                      fill: dark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.03)",
                    }}
                    contentStyle={{
                      backgroundColor: dark ? "#1E293B" : "#FFFFFF",
                      borderColor: dark ? "#334155" : "#E2E8F0",
                      borderRadius: 12,
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                      fontSize: 11,
                      color: dark ? "#F8FAFC" : "#0F172A",
                    }}
                    formatter={(val) => [`${val}%`, "Progress"]}
                  />
                  <Bar
                    dataKey="progress"
                    radius={[5, 5, 0, 0]}
                    fill={ACCENT}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">
                No project progress data yet
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Row 3: Detail Lists with tighter, cleaner cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card dark={dark} className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p
                className={`text-sm font-bold tracking-tight ${
                  dark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Today&apos;s Tasks
              </p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {todaysTasks.length} queued
              </span>
            </div>
            <div className="space-y-2">
              {todaysTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => openTask(t)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                    dark
                      ? "hover:bg-slate-800/70 border border-transparent hover:border-slate-800"
                      : "hover:bg-slate-50 border border-transparent hover:border-slate-200"
                  }`}
                >
                  <CheckSquare
                    size={15}
                    className="text-indigo-500 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold truncate ${
                        dark ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
                      {t.title}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Due {t.due || t.due_date || "Soon"}
                    </p>
                  </div>
                  <Avatar name={t.assignee || "User"} size={6} />
                </div>
              ))}
              {todaysTasks.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No active tasks today
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setPage("kanban")}
            className={`w-full mt-3 pt-2 text-center text-xs font-semibold border-t ${
              dark
                ? "border-slate-800/80 text-indigo-400 hover:text-indigo-300"
                : "border-slate-100 text-indigo-600 hover:text-indigo-700"
            }`}
          >
            View all board tasks →
          </button>
        </Card>

        <Card dark={dark} className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p
                className={`text-sm font-bold tracking-tight ${
                  dark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Upcoming Deadlines
              </p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {projectsList.length} total
              </span>
            </div>
            <div className="space-y-2">
              {projectsList.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId?.(p.id);
                    setPage?.("kanban");
                  }}
                  className={`flex items-center justify-between gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                    dark
                      ? "hover:bg-slate-800/70 border border-transparent hover:border-slate-800"
                      : "hover:bg-slate-50 border border-transparent hover:border-slate-200"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold truncate ${
                        dark ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {p.due || "No due date"}
                    </p>
                  </div>
                  <Badge
                    label={p.status || "In Progress"}
                    style={
                      STATUS_STYLE[p.status] || STATUS_STYLE["In Progress"]
                    }
                  />
                </div>
              ))}
              {projectsList.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No projects created yet
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setPage("projects")}
            className={`w-full mt-3 pt-2 text-center text-xs font-semibold border-t ${
              dark
                ? "border-slate-800/80 text-indigo-400 hover:text-indigo-300"
                : "border-slate-100 text-indigo-600 hover:text-indigo-700"
            }`}
          >
            Explore all initiatives →
          </button>
        </Card>

        <Card dark={dark} className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p
                className={`text-sm font-bold tracking-tight ${
                  dark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Recent Activity
              </p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Feed
              </span>
            </div>
            <div className="space-y-2.5">
              {completedTasks > 0 ? (
                (columns?.completed?.tasks || []).slice(0, 3).map((t, i) => (
                  <div key={i} className="flex gap-2.5 items-start p-1.5">
                    <Avatar name={t.assignee || "User"} size={6} />
                    <p
                      className={`text-xs leading-relaxed ${
                        dark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          dark ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        {t.assignee || "User"}
                      </span>{" "}
                      completed &ldquo;{t.title}&rdquo;
                      <br />
                      <span className="text-[10px] text-slate-400">
                        Recently
                      </span>
                    </p>
                  </div>
                ))
              ) : totalTasks > 0 ? (
                allTasks.slice(0, 3).map((t, i) => (
                  <div key={i} className="flex gap-2.5 items-start p-1.5">
                    <Avatar name={t.assignee || "User"} size={6} />
                    <p
                      className={`text-xs leading-relaxed ${
                        dark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          dark ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        {t.assignee || "User"}
                      </span>{" "}
                      added &ldquo;{t.title}&rdquo;
                      <br />
                      <span className="text-[10px] text-slate-400">
                        Recently
                      </span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No recent activity recorded yet
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setPage("reports")}
            className={`w-full mt-3 pt-2 text-center text-xs font-semibold border-t ${
              dark
                ? "border-slate-800/80 text-indigo-400 hover:text-indigo-300"
                : "border-slate-100 text-indigo-600 hover:text-indigo-700"
            }`}
          >
            View executive report →
          </button>
        </Card>
      </div>
    </div>
  );
}

export default DashboardView;
