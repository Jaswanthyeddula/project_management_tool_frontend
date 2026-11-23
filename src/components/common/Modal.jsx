import React from "react";
import { X } from "lucide-react";

export function Modal({ title, children, onClose, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${
        dark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-slate-800 mb-4">
          <h3 className="font-bold text-sm tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
