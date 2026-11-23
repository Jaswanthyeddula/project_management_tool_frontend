import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Sparkles, X } from "lucide-react";

export function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-slate-900 text-white text-xs border border-slate-800 animate-in slide-in-from-bottom-5">
      {type === "success" && <CheckCircle2 size={16} className="text-emerald-400" />}
      {type === "error" && <AlertCircle size={16} className="text-rose-400" />}
      {type === "info" && <Sparkles size={16} className="text-indigo-400" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-white ml-2">
        <X size={13} />
      </button>
    </div>
  );
}

export default Toast;
