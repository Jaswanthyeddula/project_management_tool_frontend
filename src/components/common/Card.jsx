import React from "react";

export function Card({ children, className = "", dark, ...rest }) {
  return (
    <div
      className={`flow-card rounded-2xl border transition-all duration-200 ${
        dark
          ? "bg-[#111827] border-[#1F2937] text-slate-100 shadow-lg shadow-black/25"
          : "bg-white border-slate-200/80 text-slate-900 shadow-sm shadow-slate-200/50"
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
