import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { Badge } from "../components/common/Badge";
import { Card } from "../components/common/Card";
import { GhostButton } from "../components/common/Buttons";
import { EMPTY_COLUMNS } from "../utils/constants";

const EVENT_COLOR = {
  sprint: "#4F46E5",
  meeting: "#2563EB",
  deadline: "#EF4444",
  deploy: "#D97706",
  release: "#059669",
};

export function CalendarView({ dark, columns = EMPTY_COLUMNS }) {
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
    const allTasks = Object.values(columns || {}).flatMap(
      (c) => c.tasks || []
    );
    allTasks.forEach((t) => {
      if (t.due || t.due_date) {
        const raw = String(t.due || t.due_date);
        const dayMatch = raw.match(/\b(\d{1,2})\b/);
        if (dayMatch) {
          const dayNum = parseInt(dayMatch[1], 10);
          if (dayNum >= 1 && dayNum <= 31) {
            if (!map[dayNum]) map[dayNum] = [];
            map[dayNum].push({
              label: t.title,
              type:
                t.priority === "high" || t.priority === "High"
                  ? "deadline"
                  : "sprint",
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
            <h1
              className={`text-2xl font-bold tracking-tight ${
                dark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Calendar
            </h1>
            <Badge variant="indigo">Sprint Calendar</Badge>
          </div>
          <p
            className={`text-xs ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {currentMonthName} {currentYear} · Scheduled tasks and milestones
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div
            className={`flex rounded-xl border p-1 ${
              dark
                ? "border-slate-800 bg-slate-900/60"
                : "border-slate-200 bg-slate-100"
            }`}
          >
            {["month", "week", "day"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  view === v
                    ? "bg-indigo-600 text-white shadow-xs"
                    : dark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <GhostButton dark={dark} className="px-2.5 py-1.5">
              <ChevronLeft size={14} />
            </GhostButton>
            <GhostButton dark={dark} className="px-2.5 py-1.5">
              <ChevronRight size={14} />
            </GhostButton>
          </div>
        </div>
      </div>

      {view === "month" && (
        <Card dark={dark} className="p-6">
          <div className="grid grid-cols-7 gap-2.5 mb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 py-1"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2.5">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={"empty-" + i} className="h-24 rounded-xl opacity-30" />
            ))}
            {days.map((d) => {
              const evs = eventsByDay[d] || [];
              const isToday = d === now.getDate();
              return (
                <div
                  key={d}
                  onClick={() =>
                    evs.length && setSelected({ day: d, events: evs })
                  }
                  className={`h-24 rounded-xl p-2 border text-left cursor-pointer transition flex flex-col justify-between ${
                    isToday
                      ? "ring-2 ring-indigo-500/80 border-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/20"
                      : dark
                      ? "border-slate-800/80 bg-slate-900/30 hover:bg-slate-800/50 hover:border-slate-700"
                      : "border-slate-200/80 bg-slate-50/40 hover:bg-slate-100/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? "text-indigo-500 font-bold"
                          : dark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
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
                      <span className="text-[10px] text-slate-400 font-medium">
                        +{evs.length - 2} more
                      </span>
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
          <CalendarIcon
            size={32}
            className="mx-auto text-indigo-500/60 mb-3"
          />
          <h3
            className={`text-base font-bold mb-1 ${
              dark ? "text-slate-100" : "text-slate-900"
            }`}
          >
            {view === "week" ? "Weekly Schedule" : "Daily Agenda"}
          </h3>
          <p
            className={`text-xs max-w-sm mx-auto ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Focused view for the selected timeline. Click on the Month tab to
            see the entire project sprint overview.
          </p>
        </Card>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setSelected(null)}
        >
          <Card
            dark={dark}
            className="w-full max-w-sm p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3
                className={`font-bold text-sm ${
                  dark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Events for {currentMonthName} {selected.day}, {currentYear}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2.5 mb-5">
              {selected.events.map((e, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    dark
                      ? "border-slate-800 bg-slate-900/40"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: EVENT_COLOR[e.type] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold ${
                        dark ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
                      {e.label}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {e.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <GhostButton
              dark={dark}
              className="w-full justify-center"
              onClick={() => setSelected(null)}
            >
              Close
            </GhostButton>
          </Card>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
