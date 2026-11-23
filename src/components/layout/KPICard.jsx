import React from "react";
import { TrendingUp } from "lucide-react";
import Card from "../common/Card";

export function KPICard({ label, value, delta, up, dark, icon: Icon, iconColor = "#4F46E5", iconBg = "#EEF2FF" }) {
  return (
    <Card dark={dark} className="p-4 sm:p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <p className={`text-[11px] font-bold uppercase tracking-wider ${dark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs" style={{ backgroundColor: dark ? "rgba(255,255,255,0.06)" : iconBg }}>
            <Icon size={15} style={{ color: iconColor }} />
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-2xl sm:text-3xl font-black tracking-tight ${dark ? "text-slate-50" : "text-slate-900"}`}>{value}</p>
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
          up
            ? dark ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/40" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : dark ? "bg-rose-950/50 text-rose-400 border border-rose-900/40" : "bg-rose-50 text-rose-700 border border-rose-100"
        }`}>
          <TrendingUp size={11} className={up ? "" : "rotate-180"} /> {delta}
        </span>
      </div>
    </Card>
  );
}

export default KPICard;
