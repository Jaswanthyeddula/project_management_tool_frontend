import React from "react";
import { colorFor, initials } from "../../utils/helpers";

export function Avatar({ name = "", size = 8 }) {
  const c = colorFor(name);
  const sizeCls = {
    6: "w-6 h-6 text-[10px]",
    7: "w-7 h-7 text-xs",
    8: "w-8 h-8 text-xs",
    9: "w-9 h-9 text-xs",
    10: "w-10 h-10 text-sm",
    12: "w-12 h-12 text-base",
    14: "w-14 h-14 text-lg",
    16: "w-16 h-16 text-xl",
  }[size] || "w-8 h-8 text-xs";

  return (
    <div
      className={`${sizeCls} rounded-full flex items-center justify-center font-bold ring-2 ring-white dark:ring-slate-900 shrink-0 shadow-xs`}
      style={{ backgroundColor: c.bg, color: c.fg }}
      title={name}
    >
      {initials(name)}
    </div>
  );
}

export default Avatar;
