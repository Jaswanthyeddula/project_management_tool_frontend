import React, { useState } from "react";
import { UserPlus, Search } from "lucide-react";
import { Badge } from "../components/common/Badge";
import { Avatar } from "../components/common/Avatar";
import { Card } from "../components/common/Card";
import { GhostButton, PrimaryButton } from "../components/common/Buttons";

export function TeamView({
  dark,
  teamList = [],
  onOpenInvite,
  onDeleteMember,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filteredTeam = teamList.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "All" ||
      m.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

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
              Team Members
            </h1>
            <Badge variant="indigo">{teamList.length} Active</Badge>
          </div>
          <p
            className={`text-xs ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Manage workspace collaborators, permissions, and workload
            distribution
          </p>
        </div>
        <PrimaryButton
          onClick={onOpenInvite}
          className="shrink-0 whitespace-nowrap"
        >
          <UserPlus size={15} /> Invite Member
        </PrimaryButton>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, role, or email..."
            style={{ paddingLeft: "38px" }}
            className={`w-full pr-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
              dark
                ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500"
                : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500 shadow-xs"
            }`}
          />
        </div>

        {/* Role Filter Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`text-xs font-semibold px-2.5 py-2 rounded-xl border outline-none cursor-pointer ${
              dark
                ? "bg-slate-900 border-slate-800 text-slate-200"
                : "bg-white border-slate-200 text-slate-700 shadow-xs"
            }`}
          >
            <option value="All">All Roles</option>
            <option value="Designer">Designers</option>
            <option value="Engineer">Engineers</option>
            <option value="Product">Product Leads</option>
            <option value="Marketing">Marketing</option>
            <option value="Content">Content</option>
          </select>
        </div>
      </div>

      <Card
        dark={dark}
        className="overflow-hidden border border-slate-200/80 dark:border-slate-800/80"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className={`border-b ${
                  dark
                    ? "border-slate-800 bg-slate-900/50 text-slate-400"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <th className="font-bold uppercase tracking-wider px-6 py-3.5">
                  Member
                </th>
                <th className="font-bold uppercase tracking-wider px-6 py-3.5">
                  Email
                </th>
                <th className="font-bold uppercase tracking-wider px-6 py-3.5">
                  Role
                </th>
                <th className="font-bold uppercase tracking-wider px-6 py-3.5">
                  Active Projects
                </th>
                <th className="font-bold uppercase tracking-wider px-6 py-3.5">
                  Status
                </th>
                <th className="font-bold uppercase tracking-wider px-6 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTeam.length > 0 ? (
                filteredTeam.map((m) => (
                  <tr
                    key={m.email}
                    className={`transition ${
                      dark ? "hover:bg-slate-850/50" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} size={9} />
                        <div>
                          <p
                            className={`font-bold ${
                              dark ? "text-slate-100" : "text-slate-900"
                            }`}
                          >
                            {m.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            @{m.name.toLowerCase().replace(/\s+/g, "")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {m.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${
                          dark ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">{m.projects || 1}</span>{" "}
                      active
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          m.status === "Active"
                            ? "success"
                            : m.status === "Away"
                            ? "warning"
                            : "default"
                        }
                        dot
                      >
                        {m.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <GhostButton
                        dark={dark}
                        onClick={() => onDeleteMember?.(m.email)}
                        className="px-2.5 py-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        Remove
                      </GhostButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <p className="text-sm font-semibold mb-1">
                      No team members found
                    </p>
                    <p className="text-xs text-slate-500">
                      Invite collaborators using the button above.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default TeamView;
