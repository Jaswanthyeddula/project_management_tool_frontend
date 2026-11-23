import React from "react";

export function PrimaryButton({ children, className = "", ...rest }) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 hover:brightness-105 active:scale-[0.98] transition-all duration-150 ${className}`}
      style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", dark, ...rest }) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
        dark
          ? "border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
