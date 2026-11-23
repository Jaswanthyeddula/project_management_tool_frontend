import React from "react";
import { Eye, EyeOff } from "lucide-react";

export function InputField({ icon: Icon, type = "text", placeholder, showToggle, show, setShow, value, onChange, label }) {
  return (
    <div className="mb-3.5">
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
          <Icon size={16} />
        </div>
        <input
          type={showToggle ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ paddingLeft: "40px", paddingRight: showToggle ? "40px" : "14px" }}
          className="w-full py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default InputField;
