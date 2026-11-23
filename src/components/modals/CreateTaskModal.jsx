import React from "react";
import { Modal } from "../common/Modal";
import { GhostButton, PrimaryButton } from "../common/Buttons";

export function CreateTaskModal({
  isOpen,
  onClose,
  dark,
  taskForm,
  setTaskForm,
  currentUser,
  teamList = [],
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <Modal title="Create New Task" dark={dark} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Title
          </label>
          <input
            required
            autoFocus
            value={taskForm.title}
            onChange={(e) =>
              setTaskForm({ ...taskForm, title: e.target.value })
            }
            placeholder="e.g. Design authentication token lifecycle"
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
              dark
                ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500"
                : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Description
          </label>
          <textarea
            rows={2}
            value={taskForm.description}
            onChange={(e) =>
              setTaskForm({ ...taskForm, description: e.target.value })
            }
            placeholder="Acceptance criteria and technical notes..."
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
              dark
                ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500"
                : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
            }`}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Stage / Column
            </label>
            <select
              value={taskForm.status || "todo"}
              onChange={(e) =>
                setTaskForm({ ...taskForm, status: e.target.value })
              }
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
                dark
                  ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            >
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="inreview">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Priority
            </label>
            <select
              value={taskForm.priority}
              onChange={(e) =>
                setTaskForm({ ...taskForm, priority: e.target.value })
              }
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
                dark
                  ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Due Date
            </label>
            <input
              type="date"
              value={taskForm.due_date}
              onChange={(e) =>
                setTaskForm({ ...taskForm, due_date: e.target.value })
              }
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
                dark
                  ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Assignee (Team Member)
            </label>
            <select
              value={taskForm.assignee_id || ""}
              onChange={(e) =>
                setTaskForm({ ...taskForm, assignee_id: e.target.value })
              }
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
                dark
                  ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            >
              <option value="">Select Assignee (Default: Me)</option>
              {currentUser?.name && (
                <option value={currentUser.id || "currentUser"}>
                  {currentUser.name} (Me)
                </option>
              )}
              {teamList
                .filter(
                  (m) =>
                    m.name !== currentUser?.name &&
                    m.email !== currentUser?.email
                )
                .map((m) => (
                  <option key={m.id || m.email} value={m.id || m.email}>
                    {m.name} {m.email ? `(${m.email})` : `— ${m.role || "Member"}`}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2.5 pt-2">
          <GhostButton dark={dark} type="button" onClick={onClose}>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Add to Board"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

export default CreateTaskModal;
