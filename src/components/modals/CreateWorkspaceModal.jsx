import React from "react";
import { Modal } from "../common/Modal";
import { GhostButton, PrimaryButton } from "../common/Buttons";

export function CreateWorkspaceModal({
  isOpen,
  onClose,
  dark,
  workspaceForm,
  setWorkspaceForm,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <Modal title="Create New Workspace" dark={dark} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Workspace Name
          </label>
          <input
            required
            autoFocus
            value={workspaceForm.name}
            onChange={(e) =>
              setWorkspaceForm({ ...workspaceForm, name: e.target.value })
            }
            placeholder="e.g. Growth & Marketing"
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
              dark
                ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500"
                : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Color Theme
          </label>
          <div className="flex items-center gap-2 pt-1">
            {["#6366F1", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setWorkspaceForm({ ...workspaceForm, color: c })}
                className={`w-7 h-7 rounded-full transition-transform ${
                  workspaceForm.color === c
                    ? "scale-125 ring-2 ring-offset-2 ring-indigo-500"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2.5 pt-2">
          <GhostButton dark={dark} type="button" onClick={onClose}>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit">Create Workspace</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

export default CreateWorkspaceModal;
