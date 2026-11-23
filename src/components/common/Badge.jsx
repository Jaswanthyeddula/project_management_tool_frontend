import React from "react";

export function Badge({ label, style, variant = "default", dot = false, children, className = "" }) {
  const content = children !== undefined ? children : label;

  const variantClassMap = {
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/80 border border-indigo-200/80",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80 border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80 border border-amber-200/80",
    danger: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80 border border-rose-200/80",
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80 border border-slate-200",
  };

  const statusVariant = {
    "In Progress": "indigo",
    "On Track": "success",
    "At Risk": "danger",
    "Completed": "success",
    High: "danger",
    Medium: "warning",
    Low: "success",
    high: "danger",
    medium: "warning",
    low: "success",
  }[label || content];

  const effectiveVariant = statusVariant || variant;
  const classes = variantClassMap[effectiveVariant] || variantClassMap.default;

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-1.5 shrink-0 ${classes} ${className}`}
      style={style && !statusVariant ? { backgroundColor: style.bg, color: style.fg } : undefined}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current" />
      )}
      {content}
    </span>
  );
}

export default Badge;
