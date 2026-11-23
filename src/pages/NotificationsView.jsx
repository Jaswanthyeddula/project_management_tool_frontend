import React from "react";
import { RotateCcw, CheckCircle2, MessageCircle, Bell } from "lucide-react";
import { Badge } from "../components/common/Badge";
import { Card } from "../components/common/Card";
import { GhostButton } from "../components/common/Buttons";
import { NOTIF_ICON } from "../utils/constants";

export function NotificationsView({
  dark,
  notifs = [],
  setNotifs,
  onMarkRead,
  onMarkAllRead,
  onRefresh,
  loading,
}) {
  const unreadList = notifs.filter((n) => !n.read);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1
              className={`text-2xl font-bold tracking-tight ${
                dark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Notifications
            </h1>
            <Badge variant="indigo">{unreadList.length} Unread</Badge>
          </div>
          <p
            className={`text-xs ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Stay up to date with comments, sprint mentions, and deadline
            alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <GhostButton
              dark={dark}
              onClick={onRefresh}
              disabled={loading}
              title="Refresh notifications"
            >
              <RotateCcw
                size={14}
                className={loading ? "animate-spin" : ""}
              />{" "}
              Refresh
            </GhostButton>
          )}
          {notifs.length > 0 && (
            <GhostButton
              dark={dark}
              onClick={
                onMarkAllRead ||
                (() =>
                  setNotifs?.(notifs.map((n) => ({ ...n, read: true }))))
              }
            >
              <CheckCircle2 size={14} /> Mark all read
            </GhostButton>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {notifs.length > 0 ? (
          notifs.map((n) => {
            const meta = NOTIF_ICON[n.type] || NOTIF_ICON.comment;
            const Icon = meta?.icon || MessageCircle;
            return (
              <Card
                key={n.id}
                dark={dark}
                onClick={() =>
                  onMarkRead
                    ? onMarkRead(n.id)
                    : setNotifs?.(
                        notifs.map((x) =>
                          x.id === n.id ? { ...x, read: true } : x
                        )
                      )
                }
                className={`p-4 flex items-start gap-3.5 cursor-pointer transition ${
                  !n.read
                    ? dark
                      ? "border-l-4 border-l-indigo-500 bg-slate-900/60"
                      : "border-l-4 border-l-indigo-600 bg-indigo-50/20"
                    : ""
                }`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: meta.bg }}
                >
                  <Icon size={16} style={{ color: meta.fg }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold leading-relaxed ${
                      n.read
                        ? "text-slate-500 dark:text-slate-400"
                        : dark
                        ? "text-slate-100"
                        : "text-slate-900"
                    }`}
                  >
                    {n.text}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full mt-1.5 bg-indigo-500 shrink-0" />
                )}
              </Card>
            );
          })
        ) : (
          <Card dark={dark} className="p-12 text-center">
            <Bell size={32} className="mx-auto text-indigo-500/60 mb-3" />
            <h3
              className={`text-sm font-bold mb-1 ${
                dark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {loading ? "Checking notifications..." : "All caught up!"}
            </h3>
            <p
              className={`text-xs ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {loading
                ? "Fetching latest notifications from server..."
                : "You don't have any notifications right now."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default NotificationsView;
