import React from "react";
import { Plus, Folder, ChevronRight } from "lucide-react";
import { Card } from "../components/common/Card";
import { PrimaryButton } from "../components/common/Buttons";
import { ACCENT } from "../utils/constants";

export function WorkspacesView({
  dark,
  workspacesList = [],
  onOpenNewWorkspace,
  onSelectWorkspace,
  projectsList = [],
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className={`text-2xl font-bold tracking-tight ${
              dark ? "text-slate-50" : "text-slate-900"
            }`}
          >
            Workspaces
          </h1>
          <p
            className={`text-sm mt-1 ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Group projects by team, client, or department.
          </p>
        </div>
        <PrimaryButton
          onClick={onOpenNewWorkspace}
          className="shrink-0 whitespace-nowrap"
        >
          <Plus size={16} /> New Workspace
        </PrimaryButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(workspacesList || []).map((w) => {
          const projectCount =
            projectsList.filter((p) => p.workspace === w.name).length ||
            w.projects ||
            0;
          return (
            <Card
              dark={dark}
              key={w.id || w.name}
              onClick={() => onSelectWorkspace?.(w.name)}
              className="p-6 flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition group"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition group-hover:scale-105"
                style={{ backgroundColor: (w.color || ACCENT) + "18" }}
              >
                <Folder size={22} style={{ color: w.color || ACCENT }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`font-bold text-base truncate ${
                      dark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    {w.name}
                  </p>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: w.color || ACCENT }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {projectCount} projects · {w.members || 1} members
                </p>
              </div>
              <ChevronRight
                size={18}
                className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition shrink-0"
              />
            </Card>
          );
        })}
        {(workspacesList || []).length === 0 && (
          <div className="col-span-full text-center py-12">
            <p
              className={`text-sm ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              No workspaces found. Click &quot;New Workspace&quot; to create
              your first workspace.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspacesView;
