import React from "react";
import { Plus, Sparkles } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { GhostButton, PrimaryButton } from "../common/Buttons";
import { EMPTY_COLUMNS } from "../../utils/constants";

export function KanbanView({
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
  activeProjectName = "Tasks",
}) {
  const currentColumns = columns || EMPTY_COLUMNS;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className={`text-2xl font-bold tracking-tight ${
              dark ? "text-slate-50" : "text-slate-900"
            }`}
          >
            Tasks Board
          </h1>
          <p
            className={`text-sm mt-1 ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {activeProjectName}{" "}
            {boards.length > 0 ? "· Active Sprint Board" : "· Workspace"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {boards.length > 0 && (
            <div
              className={`flex rounded-xl border p-1 text-xs font-semibold shrink-0 ${
                dark
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-slate-100/70"
              }`}
            >
              {boards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setActiveBoardId?.(b.id)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    b.id === activeBoardId
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : dark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}
          {onOpenNewBoard && (
            <GhostButton
              dark={dark}
              onClick={onOpenNewBoard}
              className="shrink-0 whitespace-nowrap"
            >
              <Plus size={14} /> Board
            </GhostButton>
          )}
          {onOpenAiModal && (
            <button
              onClick={onOpenAiModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm shadow-purple-500/20 hover:opacity-95 active:scale-[0.98] transition shrink-0 whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #6366F1, #9333EA)",
              }}
            >
              <Sparkles size={14} /> AI Sprint Task
            </button>
          )}
          <PrimaryButton
            onClick={() => onOpenNewTask?.()}
            className="shrink-0 whitespace-nowrap"
          >
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
                dark
                  ? "bg-[#0f172a]/40 border-slate-800/80"
                  : "bg-slate-100/50 border-slate-200/70"
              }`}
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      key === "completed"
                        ? "bg-emerald-500"
                        : key === "inreview"
                        ? "bg-amber-500"
                        : key === "inprogress"
                        ? "bg-indigo-500"
                        : "bg-slate-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-bold tracking-tight ${
                      dark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    {col.title}
                  </p>
                  <span
                    className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                      dark
                        ? "bg-slate-800 text-slate-300"
                        : "bg-white text-slate-600 shadow-xs border border-slate-200"
                    }`}
                  >
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
                {(col.tasks || []).map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    dark={dark}
                    onClick={() => openTask(t)}
                    onMove={onMoveTask}
                  />
                ))}
                {(col.tasks || []).length === 0 && (
                  <div
                    className={`h-28 rounded-xl border border-dashed flex items-center justify-center text-xs font-medium ${
                      dark
                        ? "border-slate-800 text-slate-500"
                        : "border-slate-200 text-slate-400"
                    }`}
                  >
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

export default KanbanView;
