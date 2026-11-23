import React from "react";

export function ProgressBar({ value, dark }) {
  return (
    <div className={`w-full h-2 rounded-full overflow-hidden ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${value}%`, background: "linear-gradient(90deg, #6366F1, #4F46E5)" }}
      />
    </div>
  );
}

export default ProgressBar;
