import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  ArrowUpDown,
  X,
  MoreHorizontal,
  CheckSquare,
  Trash2,
} from "lucide-react";
import { Card } from "../components/common/Card";
import { Avatar } from "../components/common/Avatar";
import { Badge } from "../components/common/Badge";
import { ProgressBar } from "../components/common/ProgressBar";
import { GhostButton, PrimaryButton } from "../components/common/Buttons";
import { STATUS_STYLE } from "../utils/constants";

export function ProjectsView({
  dark,
  projectsList = [],
  activeProjectId,
  setActiveProjectId,
  setPage,
  onOpenCreateProject,
  onDeleteProject,
  selectedWorkspaceFilter,
  setSelectedWorkspaceFilter,
}) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const filtered = useMemo(() => {
    return projectsList
      .filter((p) => {
        const matchesQ =
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          (p.workspace || "").toLowerCase().includes(q.toLowerCase());
        const matchesStatus =
          statusFilter === "All" || p.status === statusFilter;
        const matchesWorkspace =
          !selectedWorkspaceFilter || p.workspace === selectedWorkspaceFilter;
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
  }, [
    projectsList,
    q,
    statusFilter,
    selectedWorkspaceFilter,
    sortField,
    sortAsc,
  ]);

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
            <h1
              className={`text-2xl font-bold tracking-tight ${
                dark ? "text-slate-50" : "text-slate-900"
              }`}
            >
              Projects
            </h1>
            {selectedWorkspaceFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Workspace: {selectedWorkspaceFilter}
                <button
                  onClick={() => setSelectedWorkspaceFilter?.(null)}
                  className="hover:text-rose-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
          <p
            className={`text-sm mt-1 ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {filtered.length} active initiatives
          </p>
        </div>
        <PrimaryButton
          onClick={onOpenCreateProject}
          className="shrink-0 whitespace-nowrap"
        >
          <Plus size={16} /> Create Project
        </PrimaryButton>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
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
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border outline-none transition cursor-pointer ${
              dark
                ? "bg-slate-900 border-slate-800 text-slate-200"
                : "bg-white border-slate-200 text-slate-700 shadow-xs"
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
        <GhostButton
          dark={dark}
          onClick={() => toggleSort("progress")}
          className="text-xs"
        >
          <ArrowUpDown size={14} /> Sort{" "}
          {sortField === "progress"
            ? sortAsc
              ? "Progress ↑"
              : "Progress ↓"
            : "by Progress"}
        </GhostButton>
        <GhostButton
          dark={dark}
          onClick={() => toggleSort("name")}
          className="text-xs"
        >
          <ArrowUpDown size={14} /> Sort{" "}
          {sortField === "name" ? (sortAsc ? "A-Z" : "Z-A") : "by Name"}
        </GhostButton>
      </div>

      <Card
        dark={dark}
        className="overflow-visible border border-slate-200/80 dark:border-slate-800/80"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b ${
                  dark
                    ? "border-slate-800/80 text-slate-400 bg-slate-900/50"
                    : "border-slate-200 bg-slate-50/80 text-slate-500"
                }`}
              >
                <th className="font-bold uppercase tracking-wider min-w-[190px] px-4 py-3">
                  Project Name
                </th>
                <th className="font-bold uppercase tracking-wider min-w-[110px] px-4 py-3">
                  Workspace
                </th>
                <th className="font-bold uppercase tracking-wider min-w-[120px] px-4 py-3">
                  Team
                </th>
                <th className="font-bold uppercase tracking-wider min-w-[120px] px-4 py-3">
                  Status
                </th>
                <th className="font-bold uppercase tracking-wider min-w-[200px] px-4 py-3">
                  Progress
                </th>
                <th className="font-bold uppercase tracking-wider min-w-[130px] px-4 py-3">
                  Due Date
                </th>
                <th className="w-16 text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId?.(p.id);
                    setPage?.("kanban");
                  }}
                  className={`transition-colors cursor-pointer ${
                    activeProjectId === p.id
                      ? dark
                        ? "bg-indigo-950/20"
                        : "bg-indigo-50/40"
                      : dark
                      ? "hover:bg-slate-850/50"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-sm ${
                          dark ? "text-slate-100" : "text-slate-900"
                        } hover:text-indigo-600 transition`}
                      >
                        {p.name}
                      </span>
                      {activeProjectId === p.id && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"
                          title="Active Project"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {p.workspace || "General"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center -space-x-2 shrink-0">
                      {(p.members || ["User"]).map((m) => (
                        <Avatar key={m} name={m} size={7} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={p.status || "In Progress"}
                      style={
                        STATUS_STYLE[p.status] || STATUS_STYLE["In Progress"]
                      }
                    />
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
                  <td
                    className="px-4 py-3 text-right relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === p.id ? null : p.id)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition inline-block"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === p.id && (
                      <div
                        className={`absolute right-4 top-10 w-44 rounded-xl border shadow-xl py-1.5 z-30 ${
                          dark
                            ? "bg-slate-900 border-slate-800 text-slate-200"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
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
                          <CheckSquare
                            size={14}
                            className="text-indigo-500"
                          />{" "}
                          Open Tasks Board
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
                  <td
                    colSpan={7}
                    className="text-center py-10 text-xs text-slate-400 font-medium"
                  >
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

export default ProjectsView;
