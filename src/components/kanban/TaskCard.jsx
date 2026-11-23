import React from "react";
import { Clock } from "lucide-react";
import { Avatar } from "../common/Avatar";
import { ProgressBar } from "../common/ProgressBar";
import { PRIORITY_STYLE } from "../../utils/constants";

export function TaskCard({ task, dark, onClick, onMove }) {
  const priorityKey = task.priority || "Medium";
  const priorityStyle =
    PRIORITY_STYLE[priorityKey] || PRIORITY_STYLE.Medium;
  const labels = task.labels || [];
  const progressVal =
    task.progress ??
    (task.status === "completed"
      ? 100
      : task.status === "in_review"
      ? 80
      : task.status === "in_progress"
      ? 50
      : 0);

  const priorityAccent =
    priorityKey.toLowerCase() === "high"
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
            borderColor: `${priorityStyle.fg}40`,
          }}
        >
          {priorityKey}
        </span>
        <Avatar name={task.assignee || "User"} size={6} />
      </div>

      <p
        className={`text-xs font-bold leading-snug mb-2 line-clamp-2 ${
          dark ? "text-slate-100" : "text-slate-900"
        }`}
      >
        {task.title}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {labels.map((l, i) => (
          <span
            key={i}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
              dark
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-100 text-slate-600"
            }`}
          >
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
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onMove(task.id, e.target.value)}
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

export default TaskCard;
