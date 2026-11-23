import React, { useState } from "react";
import {
  X,
  Calendar as CalendarIcon,
  MessageSquare,
  Send,
  Paperclip,
  FileText,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Avatar } from "../common/Avatar";
import { Badge } from "../common/Badge";
import { GhostButton, PrimaryButton } from "../common/Buttons";
import { PRIORITY_STYLE } from "../../utils/constants";

export function TaskPanel({
  task,
  onClose,
  dark,
  onMove,
  onDelete,
  onUpdateChecklist,
  onAddComment,
  currentUser,
  teamList = [],
  onAssign,
}) {
  const [checklist, setChecklist] = useState(task?.checklist || []);
  const [newSubtask, setNewSubtask] = useState("");
  const [comments, setComments] = useState(task?.comments || []);
  const [commentInput, setCommentInput] = useState("");

  if (!task) return null;
  const priorityStyle =
    PRIORITY_STYLE[task.priority] ||
    PRIORITY_STYLE[task.priority?.toLowerCase()] ||
    PRIORITY_STYLE.Medium;

  const handleToggleSubtask = (index) => {
    const updated = checklist.map((c, i) =>
      i === index ? { ...c, done: !c.done } : c
    );
    setChecklist(updated);
    onUpdateChecklist?.(task.id, updated);
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const updated = [...checklist, { text: newSubtask.trim(), done: false }];
    setChecklist(updated);
    setNewSubtask("");
    onUpdateChecklist?.(task.id, updated);
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const newC = {
      author: currentUser?.name || "User",
      text: commentInput.trim(),
      time: "Just now",
    };
    setComments([newC, ...comments]);
    onAddComment?.(task.id, commentInput.trim());
    setCommentInput("");
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />
      <div
        className={`relative w-[440px] h-full shadow-2xl overflow-y-auto border-l z-50 flex flex-col ${
          dark
            ? "bg-[#0B0F19] text-slate-100 border-slate-800"
            : "bg-white text-slate-900 border-slate-200"
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4.5 border-b sticky top-0 z-10 ${
            dark
              ? "bg-[#0B0F19]/90 border-slate-800 backdrop-blur-md"
              : "bg-white/90 border-slate-200 backdrop-blur-md"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Task Details
            </span>
            <Badge label={task.priority || "Medium"} style={priorityStyle} />
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition ${
              dark
                ? "border-slate-800 text-slate-400 hover:bg-slate-800"
                : "border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <div>
            <h2
              className={`text-xl font-bold leading-snug ${
                dark ? "text-slate-50" : "text-slate-900"
              }`}
            >
              {task.title}
            </h2>
            <p
              className={`text-sm mt-2 leading-relaxed ${
                dark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {task.desc || task.description || "No description added yet."}
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border grid grid-cols-2 gap-4 text-sm ${
              dark
                ? "bg-slate-900/50 border-slate-800"
                : "bg-slate-50 border-slate-200/80"
            }`}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Assignee
              </p>
              {onAssign && teamList.length > 0 ? (
                <div className="flex items-center gap-1.5">
                  <Avatar
                    name={task.assignee || currentUser?.name || "User"}
                    size={6}
                  />
                  <select
                    value={task.assignee_id || ""}
                    onChange={(e) => onAssign(task.id, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg border outline-none max-w-[140px] truncate ${
                      dark
                        ? "bg-slate-800 border-slate-700 text-slate-200"
                        : "bg-white border-slate-300 text-slate-800"
                    }`}
                  >
                    <option value="">{task.assignee || "Assign..."}</option>
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
                          {m.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar
                    name={task.assignee || currentUser?.name || "User"}
                    size={6}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      dark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    {task.assignee || currentUser?.name || "User"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Due Date
              </p>
              <p
                className={`flex items-center gap-1.5 text-xs font-semibold ${
                  dark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                <CalendarIcon size={14} className="text-indigo-500" />{" "}
                {task.due || task.due_date || "Soon"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Status
              </p>
              <select
                value={task.status || "todo"}
                onChange={(e) => onMove?.(task.id, e.target.value)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border outline-none ${
                  dark
                    ? "bg-slate-800 border-slate-700 text-slate-200"
                    : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Progress
              </p>
              <p
                className={`text-xs font-bold ${
                  dark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                {task.progress || (task.status === "completed" ? 100 : 40)}%
              </p>
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${
                dark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Subtasks Checklist (
              {checklist.filter((c) => c.done).length}/{checklist.length})
            </p>
            <div className="space-y-2 mb-3">
              {checklist.map((c, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    dark
                      ? "border-slate-800 hover:bg-slate-900/60"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={c.done}
                    onChange={() => handleToggleSubtask(i)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span
                    className={
                      c.done
                        ? "line-through text-slate-400"
                        : dark
                        ? "text-slate-200"
                        : "text-slate-800"
                    }
                  >
                    {c.text}
                  </span>
                </label>
              ))}
              {checklist.length === 0 && (
                <p className="text-xs text-slate-400 py-1">
                  No subtasks added yet
                </p>
              )}
            </div>
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask..."
                className={`flex-1 px-3 py-1.5 rounded-xl text-xs border outline-none transition ${
                  dark
                    ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500"
                    : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
              <button
                type="submit"
                disabled={!newSubtask.trim()}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white disabled:opacity-50 transition"
              >
                Add
              </button>
            </form>
          </div>

          {/* Comments Section */}
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${
                dark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              <MessageSquare size={14} className="text-indigo-500" /> Discussion (
              {comments.length})
            </p>
            <form onSubmit={handleSendComment} className="flex gap-2 mb-3">
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a comment..."
                className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none transition ${
                  dark
                    ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500"
                    : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
                }`}
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white disabled:opacity-50 flex items-center gap-1 transition"
              >
                <Send size={13} />
              </button>
            </form>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {comments.map((c, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs ${
                    dark
                      ? "border-slate-800 bg-slate-900/40"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-indigo-500">
                      {c.author || currentUser?.name || "User"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {c.time || "Just now"}
                    </span>
                  </div>
                  <p className={dark ? "text-slate-300" : "text-slate-700"}>
                    {c.text}
                  </p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-xs text-slate-400 py-2 text-center">
                  No comments yet
                </p>
              )}
            </div>
          </div>

          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                dark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              <Paperclip size={14} /> Attachments
            </p>
            {task.attachments && task.attachments.length > 0 ? (
              <div className="space-y-2">
                {task.attachments.map((att, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-sm p-3 rounded-xl border ${
                      dark
                        ? "border-slate-800 bg-slate-900/40 text-slate-300"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <FileText size={16} className="text-indigo-500" />
                    <span className="font-medium text-xs">
                      {att.name || att}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No attachments</p>
            )}
          </div>
        </div>

        <div
          className={`p-4 border-t flex gap-2.5 ${
            dark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-50"
          }`}
        >
          <GhostButton
            dark={dark}
            className="flex-1 justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/40"
            onClick={() => {
              onDelete?.(task.id);
              onClose();
            }}
          >
            <Trash2 size={14} /> Delete
          </GhostButton>
          <PrimaryButton
            className="flex-1 justify-center"
            onClick={() => {
              onMove?.(task.id, "completed");
              onClose();
            }}
          >
            <CheckCircle2 size={15} /> Complete
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default TaskPanel;
