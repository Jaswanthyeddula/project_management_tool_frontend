import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

export function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 font-sans">
      {/* Left 50%: Branding Hero & UI Illustration Panel */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-between p-12 lg:p-16 relative overflow-hidden text-white"
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, #4338CA 0%, #1E1B4B 50%, #0B0F19 100%)",
        }}
      >
        {/* Subtle Ambient Glow Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/30 shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366F1, #4F46E5)",
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight block leading-tight">
              Flowspace
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300/90 block">
              Enterprise PM
            </span>
          </div>
        </div>

        {/* Centerpiece: Headline + Floating UI Preview Mockup */}
        <div className="relative z-10 my-auto py-8 space-y-6 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-indigo-200 backdrop-blur-md">
              <Sparkles size={12} className="text-indigo-300" />
              <span>Calm, High-Velocity Workspaces</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-[1.15]">
              Work on big ideas without the chaos.
            </h1>
            <p className="text-xs lg:text-sm text-indigo-200/80 leading-relaxed max-w-md">
              Unify Kanban boards, milestone roadmaps, cross-project analytics,
              and Gemini AI task synthesis in one tranquil space.
            </p>
          </div>

          {/* Floating Glassmorphic UI Card Mockup */}
          <div className="relative pt-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-5 shadow-2xl space-y-3.5 transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
                    Active Sprint 24
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/25 border border-rose-400/30 text-rose-200">
                  High Priority
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-white tracking-tight">
                  Checkout performance & design system revamp
                </p>
                <p className="text-[11px] text-indigo-200/70 mt-0.5">
                  3 subtasks completed · 1 review pending
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-indigo-200">
                  <span>Sprint Progress</span>
                  <span>84%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400"
                    style={{ width: "84%" }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-indigo-200/80">
                <div className="flex items-center -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 border border-indigo-300 flex items-center justify-center font-bold text-[9px] text-white">
                    JP
                  </div>
                  <div className="w-6 h-6 rounded-full bg-purple-500 border border-purple-300 flex items-center justify-center font-bold text-[9px] text-white">
                    AK
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border border-emerald-300 flex items-center justify-center font-bold text-[9px] text-white">
                    +3
                  </div>
                </div>
                <span className="font-semibold text-white/90">Due Friday</span>
              </div>
            </div>

            {/* Floating Mini Stat Badges */}
            <div className="absolute -bottom-4 -left-3 rounded-xl border border-white/20 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 shadow-xl flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-xs">⚡ 4.2x</span>
              <span className="text-[10px] text-slate-300 font-medium">
                Faster sprint turnaround
              </span>
            </div>

            <div className="absolute -top-3 -right-2 rounded-xl border border-white/20 bg-indigo-950/80 backdrop-blur-md px-3 py-1.5 shadow-xl flex items-center gap-2">
              <Sparkles size={12} className="text-amber-300" />
              <span className="text-[10px] text-indigo-200 font-bold">
                Gemini AI Synthesis
              </span>
            </div>
          </div>
        </div>

        {/* Footer Trust & Security Badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-4 text-[11px] font-medium text-indigo-200/70 border-t border-white/10 pt-4">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" /> SOC2 Type II
          </span>
          <span>·</span>
          <span>End-to-End Encrypted</span>
          <span>·</span>
          <span>99.99% Uptime SLA</span>
        </div>
      </div>

      {/* Right 50%: Elevated Authentication Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md">
          {/* Mobile Brand Logo */}
          <div className="md:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/30"
              style={{
                background: "linear-gradient(135deg, #6366F1, #4F46E5)",
              }}
            >
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-lg tracking-tight">Flowspace</span>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <a
              href="/landing"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              ← Back to Landing Page
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-7 sm:p-9 shadow-xl shadow-slate-900/5 dark:shadow-black/40 backdrop-blur-sm">
            <div className="mb-6">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {subtitle}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthShell;
