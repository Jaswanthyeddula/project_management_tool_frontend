import React from "react";
import { Modal } from "../common/Modal";
import { GhostButton, PrimaryButton } from "../common/Buttons";

export function InviteMemberModal({
  isOpen,
  onClose,
  dark,
  inviteForm,
  setInviteForm,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <Modal title="Invite Team Member" dark={dark} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Full Name
          </label>
          <input
            required
            autoFocus
            value={inviteForm.name}
            onChange={(e) =>
              setInviteForm({ ...inviteForm, name: e.target.value })
            }
            placeholder="e.g. Sarah Jenkins"
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
              dark
                ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500"
                : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Work Email
          </label>
          <input
            required
            type="email"
            value={inviteForm.email}
            onChange={(e) =>
              setInviteForm({ ...inviteForm, email: e.target.value })
            }
            placeholder="sarah@flowspace.io"
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
              dark
                ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500"
                : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Role
          </label>
          <select
            value={inviteForm.role}
            onChange={(e) =>
              setInviteForm({ ...inviteForm, role: e.target.value })
            }
            className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
              dark
                ? "bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500"
                : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
            }`}
          >
            <option value="Frontend Engineer">Frontend Engineer</option>
            <option value="Backend Engineer">Backend Engineer</option>
            <option value="Product Designer">Product Designer</option>
            <option value="Product Manager">Product Manager</option>
            <option value="Marketing Lead">Marketing Lead</option>
            <option value="Content Strategist">Content Strategist</option>
          </select>
        </div>
        <div className="flex justify-end gap-2.5 pt-2">
          <GhostButton dark={dark} type="button" onClick={onClose}>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit">Send Invitation</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

export default InviteMemberModal;
