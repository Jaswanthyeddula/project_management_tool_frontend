import React from "react";
import { Download } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Badge } from "../components/common/Badge";
import { Card } from "../components/common/Card";
import { PrimaryButton } from "../components/common/Buttons";
import { EMPTY_COLUMNS } from "../utils/constants";
import { exportToCSV } from "../utils/exportCsv";

export function ReportsView({
  dark,
  projectsList = [],
  columns = EMPTY_COLUMNS,
  showToast,
}) {
  const allTasks = Object.values(columns).flatMap((c) => c.tasks || []);
  const totalTasks = allTasks.length;
  const completedTasks = (columns.completed?.tasks || []).length;
  const inProgressTasks = (columns.inprogress?.tasks || []).length;

  const completionPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressPercent =
    totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  const notStartedPercent =
    totalTasks > 0
      ? Math.max(0, 100 - completionPercent - inProgressPercent)
      : 0;

  const dynamicDonut =
    totalTasks > 0
      ? [
          { name: "Completed", value: completionPercent, color: "#4F46E5" },
          { name: "In Progress", value: inProgressPercent, color: "#818CF8" },
          { name: "To Do", value: notStartedPercent, color: "#CBD5E1" },
        ]
      : [];

  const dynamicBar = projectsList.slice(0, 6).map((p) => ({
    name: p.name.length > 12 ? p.name.slice(0, 11) + "…" : p.name,
    progress: p.progress || 0,
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
            <h1
              className={`text-2xl font-bold tracking-tight ${
                dark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Executive Reports
            </h1>
            <Badge variant="indigo">Live Analytics</Badge>
          </div>
          <p
            className={`text-xs ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Portfolio-level delivery velocity, completion splits, and cross-team
            throughput.
          </p>
        </div>
        <PrimaryButton
          onClick={handleDownload}
          className="shrink-0 whitespace-nowrap"
        >
          <Download size={15} /> Download CSV Report
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <Card
          dark={dark}
          className="p-6 min-w-0 overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  className={`text-sm font-bold ${
                    dark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  Progress by Project
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sprint velocity & milestone accomplishment %
                </p>
              </div>
              <Badge variant="indigo">Analytics</Badge>
            </div>
            <div className="h-64 min-w-0 flex items-center justify-center">
              {dynamicBar.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dynamicBar}
                    barSize={26}
                    margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={dark ? "#1E293B" : "#F1F5F9"}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 11,
                        fill: dark ? "#64748B" : "#94A3B8",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      width={36}
                      tick={{
                        fontSize: 11,
                        fill: dark ? "#64748B" : "#94A3B8",
                      }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: dark
                          ? "1px solid #334155"
                          : "1px solid #E2E8F0",
                        backgroundColor: dark ? "#0F172A" : "#FFFFFF",
                        color: dark ? "#F8FAFC" : "#0F172A",
                        fontSize: 12,
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                      }}
                    />
                    <Bar
                      dataKey="progress"
                      radius={[6, 6, 0, 0]}
                      fill="#4F46E5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400 text-center">
                  No project progress data available yet
                </p>
              )}
            </div>
          </div>
          <div
            className={`pt-4 border-t mt-4 flex items-center justify-between text-xs ${
              dark
                ? "border-slate-800 text-slate-400"
                : "border-slate-100 text-slate-500"
            }`}
          >
            <span>
              Total Projects: <strong>{projectsList.length}</strong>
            </span>
            <span>
              Avg:{" "}
              <strong>
                {projectsList.length > 0
                  ? Math.round(
                      projectsList.reduce(
                        (acc, p) => acc + (p.progress || 0),
                        0
                      ) / projectsList.length
                    )
                  : 0}
                %
              </strong>
            </span>
          </div>
        </Card>

        <Card
          dark={dark}
          className="p-6 min-w-0 overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  className={`text-sm font-bold ${
                    dark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  Completion Split
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aggregate status distribution across {totalTasks} tasks
                </p>
              </div>
              <Badge variant="success">
                {completionPercent}% Throughput
              </Badge>
            </div>
            <div className="h-64 min-w-0 flex items-center justify-center">
              {totalTasks > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicDonut}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={74}
                      paddingAngle={4}
                    >
                      {dynamicDonut.map((d, i) => (
                        <Cell
                          key={i}
                          fill={d.color}
                          stroke={dark ? "#0F172A" : "#FFFFFF"}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: dark
                          ? "1px solid #334155"
                          : "1px solid #E2E8F0",
                        backgroundColor: dark ? "#0F172A" : "#FFFFFF",
                        color: dark ? "#F8FAFC" : "#0F172A",
                        fontSize: 12,
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400 text-center">
                  No task completion data available yet
                </p>
              )}
            </div>
          </div>
          <div
            className={`pt-4 border-t mt-4 flex items-center justify-between text-xs ${
              dark
                ? "border-slate-800 text-slate-400"
                : "border-slate-100 text-slate-500"
            }`}
          >
            <span>
              Target completion rate: <strong>90%</strong>
            </span>
            <button
              onClick={handleDownload}
              className="text-indigo-500 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download size={13} /> Download CSV
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ReportsView;
