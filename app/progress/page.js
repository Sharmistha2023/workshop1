"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar,
} from "recharts";

const STATUS_COLOR = {
  Completed:   { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", dot: "#10b981" },
  "In Progress": { bg: "bg-blue-500/20",    text: "text-blue-400",    border: "border-blue-500/30",    dot: "#3b82f6" },
  Pending:     { bg: "bg-slate-500/20",   text: "text-slate-400",   border: "border-slate-500/30",   dot: "#64748b" },
};

const PHASE_COLORS = ["#a855f7", "#3b82f6", "#f59e0b"];
const PIE_COLORS  = { Completed: "#10b981", "In Progress": "#3b82f6", Pending: "#64748b" };

function Badge({ status }) {
  const c = STATUS_COLOR[status] || STATUS_COLOR.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function TaskCard({ task, index }) {
  const [open, setOpen] = useState(false);
  const hasLog   = task.logs && task.logs !== "None" && task.logs.trim();
  const hasError = task.error_log && task.error_log !== "None" && task.error_log.trim();

  return (
    <div
      className="rounded-2xl border border-white/10 overflow-hidden transition-all"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      {/* Header row */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition"
      >
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white/30 border border-white/10 flex-shrink-0">
          {index}
        </span>
        <span className="flex-1 text-white text-sm font-medium">{task.task_name}</span>
        {hasError && <span className="text-red-400 text-xs">⚠ Error</span>}
        <Badge status={task.task_progress} />
        <span className="text-white/30 text-xs ml-1">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">

          {/* Dependency */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1 font-semibold">Dependency</p>
            <p className="text-purple-300 text-sm">{task.dependency || "None"}</p>
          </div>

          {/* Logs */}
          {hasLog && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1 font-semibold">Logs</p>
              <div className="rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 leading-relaxed"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                {task.logs}
              </div>
            </div>
          )}

          {/* Error */}
          {hasError && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1 font-semibold">Error</p>
              <div className="rounded-xl px-3 py-2 text-xs font-mono text-red-300 leading-relaxed"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {task.error_log}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PhaseSection({ phase, tasks, color }) {
  const done    = tasks.filter(t => t.task_progress === "Completed").length;
  const inprog  = tasks.filter(t => t.task_progress === "In Progress").length;
  const pct     = Math.round((done / tasks.length) * 100);

  return (
    <div className="rounded-3xl border border-white/10 overflow-hidden"
      style={{ background: "rgba(255,255,255,0.04)" }}>
      {/* Phase header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm"
          style={{ background: color }}>
          P{phase}
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-base">Phase {phase}</p>
          <p className="text-white/40 text-xs">{done}/{tasks.length} completed · {inprog} in progress</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black" style={{ color }}>{pct}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>

      {/* Tasks */}
      <div className="p-4 space-y-2">
        {tasks.map((t, i) => <TaskCard key={t.id} task={t} index={i + 1} />)}
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then(r => r.json())
      .then(data => { setTasks(data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
        <p className="text-white/40 animate-pulse text-sm">Loading from database…</p>
      </main>
    );
  }

  const phases   = [1, 2, 3];
  const byPhase  = (p) => tasks.filter(t => t.phase_number === p);

  const totalDone   = tasks.filter(t => t.task_progress === "Completed").length;
  const totalInProg = tasks.filter(t => t.task_progress === "In Progress").length;
  const totalPend   = tasks.filter(t => t.task_progress === "Pending").length;
  const totalPct    = Math.round((totalDone / tasks.length) * 100);

  // Chart data
  const pieData = [
    { name: "Completed",   value: totalDone },
    { name: "In Progress", value: totalInProg },
    { name: "Pending",     value: totalPend },
  ].filter(d => d.value > 0);

  const barData = phases.map(p => {
    const t = byPhase(p);
    return {
      name: `Phase ${p}`,
      Completed:    t.filter(x => x.task_progress === "Completed").length,
      "In Progress":t.filter(x => x.task_progress === "In Progress").length,
      Pending:      t.filter(x => x.task_progress === "Pending").length,
    };
  });

  const radialData = phases.map((p, i) => {
    const t = byPhase(p);
    const done = t.filter(x => x.task_progress === "Completed").length;
    return { name: `Phase ${p}`, value: Math.round((done / t.length) * 100), fill: PHASE_COLORS[i] };
  });

  return (
    <main className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>

      {/* Blobs */}
      <div className="fixed top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #ff6ec7, #7873f5)" }} />
      <div className="fixed bottom-[-60px] right-[-60px] w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #43e97b, #38f9d7)" }} />

      <div className="relative max-w-5xl mx-auto px-4 py-12 z-10">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-2xl"
            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-4xl font-black text-white">Development Progress</h1>
          <p className="text-purple-300 mt-2 text-sm">Live from database · {tasks.length} total tasks</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Overall",     value: `${totalPct}%`,    color: "#a855f7" },
            { label: "Completed",   value: totalDone,          color: "#10b981" },
            { label: "In Progress", value: totalInProg,        color: "#3b82f6" },
            { label: "Pending",     value: totalPend,          color: "#64748b" },
          ].map(k => (
            <div key={k.label} className="rounded-2xl border border-white/10 px-5 py-4 text-center"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <p className="text-3xl font-black" style={{ color: k.color }}>{k.value}</p>
              <p className="text-white/40 text-xs mt-1 font-semibold uppercase tracking-widest">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          {/* Donut — status breakdown */}
          <div className="rounded-3xl border border-white/10 p-5"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-white font-bold mb-4 text-sm">Status Breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }}
                  itemStyle={{ color: "#fff" }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar — tasks per phase */}
          <div className="rounded-3xl border border-white/10 p-5"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-white font-bold mb-4 text-sm">Tasks per Phase</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }}
                  itemStyle={{ color: "#fff" }} />
                <Bar dataKey="Completed"    fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="In Progress"  fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="Pending"      fill="#64748b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radial — phase completion % */}
          <div className="rounded-3xl border border-white/10 p-5"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-white font-bold mb-4 text-sm">Phase Completion %</p>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius={30} outerRadius={85}
                data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "rgba(255,255,255,0.05)" }} />
                <Tooltip
                  formatter={(v) => `${v}%`}
                  contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }}
                  itemStyle={{ color: "#fff" }} />
                <Legend
                  iconSize={10}
                  formatter={(value) => <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{value}</span>} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phase sections */}
        <div className="space-y-6">
          {phases.map((p, i) => (
            <PhaseSection key={p} phase={p} tasks={byPhase(p)} color={PHASE_COLORS[i]} />
          ))}
        </div>

        <p className="text-center text-white/20 text-xs mt-10">
          All data live from Neon PostgreSQL · development_process table
        </p>
      </div>
    </main>
  );
}
