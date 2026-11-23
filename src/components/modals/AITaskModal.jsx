import React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Modal } from "../common/Modal";
import { GhostButton, PrimaryButton } from "../common/Buttons";

export function AITaskModal({
  isOpen,
  onClose,
  dark,
  aiInput,
  setAiInput,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <Modal title="Gemini AI Task Generation" dark={dark} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-700 dark:text-indigo-300">
          <Sparkles size={16} className="shrink-0 text-indigo-500" />
          <span>
            Type plain English. Gemini parses title, priority, due date, and automatically injects it into your board.
          </span>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Prompt or Requirement
          </label>
          <textarea
            required
            autoFocus
            rows={3}
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="e.g. Implement user export to CSV by Friday with high priority"
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
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            {submitting ? "Synthesizing..." : "Generate with AI"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

export default AITaskModal;
