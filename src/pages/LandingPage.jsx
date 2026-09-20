import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap,
  TrendingUp, Briefcase, BarChart2, CheckSquare, Layers,
  ChevronRight, Star, Users, Check, Menu, X, ArrowUpRight
} from "lucide-react";

const FEATURES = [
  {
    icon: CheckSquare,
    title: "Dynamic Sprint Kanban",
    desc: "Visual workflow boards with instant drag-and-drop, multi-board sprints, customized swimlanes, and granular priority tags.",
    color: "#4F46E5",
    bg: "#EEF2FF",
    badge: "Agile Ready"
  },
  {
    icon: Sparkles,
    title: "Gemini 2.5 Flash AI",
    desc: "Describe a project goal in plain English. Flowspace synthesizes complete checklists, priority levels, and subtasks in seconds.",
    color: "#9333EA",
    bg: "#FAF5FF",
    badge: "AI Powered"
  },
  {
    icon: BarChart2,
    title: "Live Velocity & Reports",
    desc: "Interactive completion donuts, sprint progress bars, and one-click CSV exports keeping stakeholders and teams in sync.",
    color: "#059669",
    bg: "#ECFDF5",
    badge: "Real-time"
  },
  {
    icon: Layers,
    title: "Multi-Team Workspaces",
    desc: "Segment initiatives across Product, Engineering, Design, and Marketing with isolated access controls and custom tags.",
    color: "#2563EB",
    bg: "#EFF6FF",
    badge: "Scalable"
  },
  {
    icon: Users,
    title: "Collaborative Task Hubs",
    desc: "Rich task panels featuring interactive checklists, real-time comment threads, due dates, and assignee avatars.",
    color: "#D97706",
    bg: "#FFFBEB",
    badge: "Collaborative"
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Reliability",
    desc: "JWT authenticated sessions, persistent cloud endpoints, and responsive design optimized for desktop and mobile.",
    color: "#DC2626",
    bg: "#FEF2F2",
    badge: "Secure"
  }
];

const WORKFLOW_TABS = [
  {
    id: "kanban",
    label: "Kanban Boards",
    title: "Effortless drag-and-drop sprint management",
    desc: "Organize work into custom columns with clear WIP visibility, priority color-coding, and inline task creation.",
    points: [
      "Custom board columns for every stage of your pipeline",
      "One-click task status updates and priority flags",
      "Integrated search and member filtering across boards"
    ]
  },
  {
    id: "ai",
    label: "Gemini Sprint AI",
    title: "Turn ideas into actionable sprint plans",
    desc: "Stop spending hours writing user stories. Our integrated Gemini AI engine transforms high-level ideas into execution-ready tasks.",
    points: [
      "Natural language sprint backlog generation",
      "Automatic priority estimation and task categorization",
      "Subtask checklist breakdown with zero prompt engineering"
    ]
  },
  {
    id: "reports",
    label: "Executive Analytics",
    title: "Real-time visibility into project velocity",
    desc: "Understand where sprints stand at a glance without scheduling status meetings or digging through email threads.",
    points: [
      "Interactive task completion distribution donuts",
      "Initiative progress metrics across all active workspaces",
      "Instant CSV report download for executive reviews"
    ]
  }
];

const TESTIMONIALS = [
  {
    quote: "Flowspace gives our engineering team the density and speed of Linear with the intuitive board flexibility we missed from Trello.",
    author: "Elena Rostova",
    role: "VP of Engineering at FinScale",
    avatar: "ER"
  },
  {
    quote: "The Gemini AI task synthesizer is a game changer for sprint planning. We plan entire bi-weekly cycles in under 20 minutes now.",
    author: "Marcus Chen",
    role: "Lead Product Manager at CloudWave",
    avatar: "MC"
  },
  {
    quote: "Finally, a project tool that doesn't feel bloated. The UI is ultra-clean, the card spacing is tight, and our whole team adopted it on day one.",
    author: "Sarah Jenkins",
    role: "Head of Operations at NovaTech",
    avatar: "SJ"
  }
];

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState("kanban");

  const currentTab = WORKFLOW_TABS.find(t => t.id === activeWorkflow) || WORKFLOW_TABS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background Glow Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-150px] left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-[-100px] right-1/4 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-[250px] left-1/3 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* ---------------- Navigation ---------------- */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/25 transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white block leading-none">
                Flowspace
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 block mt-1">
                Sprint Suite
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#workflows" className="hover:text-white transition">Workflows</a>
            <a href="#ai" className="hover:text-white transition flex items-center gap-1.5">
              <span>Gemini AI</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                New
              </span>
            </a>
            <a href="#testimonials" className="hover:text-white transition">Testimonials</a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/app"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition"
            >
              Sign in
            </Link>
            <Link
              to="/app"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
            >
              <span>Launch App</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 hover:text-white">Features</a>
              <a href="#workflows" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 hover:text-white">Workflows</a>
              <a href="#ai" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 hover:text-white">Gemini AI</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 hover:text-white">Testimonials</a>
            </nav>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/app"
                className="w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
              >
                Launch Workspace
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ---------------- Hero Section ---------------- */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/50 backdrop-blur-sm text-xs font-semibold text-indigo-300 mb-6 shadow-sm shadow-indigo-950/50 hover:border-indigo-400/50 transition">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Flowspace 2.0 Live</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 flex items-center gap-1">
            Gemini 2.5 Flash Integrated <ArrowRight size={12} />
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Work on big ideas <br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #818CF8 10%, #C084FC 90%)" }}>
            without the sprint chaos.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
          The all-in-one project workspace combining rapid Kanban boards, AI-generated backlogs, live initiative velocity, and high-density SaaS design.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-14">
          <Link
            to="/app"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
          >
            <span>Get Started — It&apos;s Free</span>
            <ArrowRight size={16} />
          </Link>
          <a
            href="#preview"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition flex items-center justify-center gap-2"
          >
            <span>Explore Demo</span>
            <ChevronRight size={15} />
          </a>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-slate-800/80">
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white">4.2x</p>
            <p className="text-xs text-slate-400 mt-0.5">Faster Sprint Velocity</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-400">12,000+</p>
            <p className="text-xs text-slate-400 mt-0.5">Active Projects</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-purple-400">&lt; 1.5s</p>
            <p className="text-xs text-slate-400 mt-0.5">Gemini Task Synthesis</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">99.9%</p>
            <p className="text-xs text-slate-400 mt-0.5">SLA Uptime</p>
          </div>
        </div>

        {/* ---------------- Hero Interactive Preview Simulation ---------------- */}
        <div id="preview" className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-slate-800/80 bg-slate-900/90 shadow-2xl shadow-indigo-950/40 overflow-hidden text-left">
          {/* Mock Browser Header */}
          <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] font-mono text-slate-500 ml-2">app.flowspace.io / workspace / sprint-14</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● Live Board
              </span>
            </div>
          </div>

          {/* Mock Kanban Board Canvas */}
          <div className="p-5 sm:p-6 bg-[#0B0F19] space-y-4">
            {/* Board Top Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Fintech Mobile Core · Sprint 14</h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Active Sprint
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">14 tasks · 8 completed · 4 in progress</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                  Sprint Velocity: 82%
                </span>
                <span className="text-xs font-semibold text-white px-3 py-1 rounded-lg bg-indigo-600 flex items-center gap-1">
                  <Sparkles size={13} /> AI Assistant
                </span>
              </div>
            </div>

            {/* Board Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Col 1: To Do */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    To Do
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">2</span>
                </div>

                <div className="rounded-lg bg-slate-850/80 border border-slate-800 p-3 space-y-2 hover:border-slate-700 transition">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                    Frontend
                  </span>
                  <p className="text-xs font-semibold text-slate-200">Refactor biometric login modal</p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>Due tomorrow</span>
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-[10px] font-bold flex items-center justify-center text-white">
                      AL
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-850/80 border border-slate-800 p-3 space-y-2 hover:border-slate-700 transition">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                    Gemini AI
                  </span>
                  <p className="text-xs font-semibold text-slate-200">Synthesize user retention stories</p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>Due in 2 days</span>
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-[10px] font-bold flex items-center justify-center text-white">
                      AI
                    </span>
                  </div>
                </div>
              </div>

              {/* Col 2: In Progress */}
              <div className="rounded-xl bg-slate-900/60 border border-indigo-900/30 p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    In Progress
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-[10px] text-indigo-300">1</span>
                </div>

                <div className="rounded-lg bg-slate-850 border border-indigo-500/40 p-3 space-y-2.5 shadow-md shadow-indigo-950/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60">
                      High Priority
                    </span>
                    <span className="text-[10px] font-bold text-indigo-400">65%</span>
                  </div>
                  <p className="text-xs font-semibold text-white">Payment gateway webhook reliability</p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: "65%" }} />
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>3 / 4 checklist</span>
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-[10px] font-bold flex items-center justify-center text-white">
                      DK
                    </span>
                  </div>
                </div>
              </div>

              {/* Col 3: Completed */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Completed
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">4</span>
                </div>

                <div className="rounded-lg bg-slate-850/80 border border-slate-800 p-3 space-y-2 opacity-80 hover:opacity-100 transition">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                    Security
                  </span>
                  <p className="text-xs font-semibold text-slate-200 line-through">OAuth2 refresh token rotation</p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-[10px] font-bold flex items-center justify-center text-white">
                      JW
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Feature Grid ---------------- */}
      <section id="features" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/70">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 block">
            Engineered for High-Velocity Teams
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Everything your team needs to plan, track, and ship.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
            Eliminate fragmented tools, spreadsheet chaos, and stale Jira tickets with an interface designed for speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/20 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${f.color}15`, color: f.color }}
                    >
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- Interactive Workflow Showcase ---------------- */}
      <section id="workflows" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/70">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2 block">
            Deep Workflow Integration
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How Flowspace accelerates development
          </h2>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 max-w-full overflow-x-auto">
            {WORKFLOW_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveWorkflow(tab.id)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  activeWorkflow === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-10">
          <div className="lg:col-span-6 space-y-5">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              {currentTab.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {currentTab.desc}
            </p>
            <ul className="space-y-3 pt-2">
              {currentTab.points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-400 hover:text-indigo-300 group"
              >
                <span>Try this workflow in your workspace</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-xs font-bold text-white">Flowspace Sprint Intelligence</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">v2.4 Active</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                <p className="text-xs text-slate-400 font-mono">User prompt:</p>
                <p className="text-sm font-semibold text-slate-200">
                  &ldquo;Implement multi-factor authentication with SMS fallback and audit logs&rdquo;
                </p>
              </div>
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                  <Sparkles size={14} /> Gemini Synthesized 3 Tasks:
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>MFA provider webhook integration (High priority)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>SMS fallback throttle &amp; rate limiting (Medium priority)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Security audit log telemetry schema (Medium priority)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Testimonials ---------------- */}
      <section id="testimonials" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/70">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
            Customer Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Loved by product and engineering teams
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-800/80">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{t.author}</p>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CTA Banner ---------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden border border-indigo-500/30 shadow-2xl shadow-indigo-950/50"
          style={{ background: "radial-gradient(ellipse at center, #1E1B4B 0%, #0F172A 100%)" }}
        >
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Zap size={13} /> Instant Workspace Access
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to ship your next big milestone?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Join thousands of engineers and product teams shipping faster with Flowspace. No credit card required.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/app"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
              >
                <span>Launch Your Workspace</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
            >
              <Sparkles size={14} />
            </div>
            <span className="font-bold text-slate-300 text-sm">Flowspace</span>
            <span>· Sprint Intelligence &amp; Project Management</span>
          </div>
          <p>© 2026 Flowspace, Inc. Built for thoughtful, high-velocity teams.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
