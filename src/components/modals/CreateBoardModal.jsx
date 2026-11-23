import React from "react";
import { Modal } from "../common/Modal";
import { GhostButton, PrimaryButton } from "../common/Buttons";

export function CreateBoardModal({
  isOpen,
  onClose,
  dark,
  boardForm,
  setBoardForm,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <Modal title="Add Board to Project" dark={dark} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Board Name
          </label>
          <input
            required
            autoFocus
            value={boardForm.name}
            onChange={(e) =>
              setBoardForm({ ...boardForm, name: e.target.value })
            }
            placeholder="e.g. Sprint 24 / Q3 Backlog"
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
              dark
                ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500"
                : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Description (Optional)
          </label>
          <input
            value={boardForm.description}
            onChange={(e) =>
              setBoardForm({ ...boardForm, description: e.target.value })
            }
            placeholder="Target focus area..."
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
              dark
                ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500"
                : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
            }`}
          />
        </div>
        <div className="flex justify-end gap-2.5 pt-2">
          <GhostButton dark={dark} type="button" onClick={onClose}>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Board"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

export default CreateBoardModal;
