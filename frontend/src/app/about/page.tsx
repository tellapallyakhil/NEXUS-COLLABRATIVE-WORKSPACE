"use client";

import React from "react";
import { 
  Code, Database, Zap, GitBranch, Shield, Layers, 
  ArrowRight, Terminal, Cpu, Globe, Users 
} from "lucide-react";

const techStack = [
  { name: "Spring Boot 4", desc: "Enterprise-grade Java backend with WebSocket support", icon: Cpu, color: "text-emerald-400" },
  { name: "Next.js 16", desc: "React framework with SSR and Turbopack", icon: Globe, color: "text-sky-400" },
  { name: "Spring Data JPA", desc: "High-level ORM for structured entity persistence", icon: Database, color: "text-violet-400" },
  { name: "Raw JDBC", desc: "Low-level SQL for high-speed keystroke logging", icon: Terminal, color: "text-amber-400" },
  { name: "WebSockets (STOMP)", desc: "Real-time bidirectional messaging protocol", icon: Zap, color: "text-cyan-400" },
  { name: "Monaco Editor", desc: "VS Code's editing engine embedded in the browser", icon: Code, color: "text-rose-400" },
];

const features = [
  {
    title: "Operational Transformation Engine",
    desc: "A custom Java algorithm that resolves concurrent edit conflicts when multiple developers type at the same position simultaneously. Uses index offset shifting to maintain document consistency.",
    icon: GitBranch,
    tag: "DSA",
    gradient: "from-cyan-500/20 to-sky-500/20",
  },
  {
    title: "Hybrid Persistence Strategy",
    desc: "Structural data (Workspaces, Documents, Users) is persisted via Spring Data JPA with Hibernate ORM. High-frequency keystroke events bypass JPA entirely and are logged using Raw JDBC for zero-overhead append-only writes.",
    icon: Database,
    tag: "JPA + JDBC",
    gradient: "from-violet-500/20 to-indigo-500/20",
  },
  {
    title: "Real-time STOMP Protocol",
    desc: "Spring WebSocket with STOMP message broker enables instant broadcasting of typing deltas and cursor positions to all connected collaborators on the same document channel.",
    icon: Zap,
    tag: "WebSocket",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    title: "CI/CD Automation",
    desc: "GitHub Actions workflows automatically build, lint, type-check, and test both the Java backend (Gradle + JUnit) and the Next.js frontend (TypeScript + ESLint) on every push.",
    icon: Shield,
    tag: "DevOps",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
];

export default function AboutPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative">
      {/* Background Glow */}
      <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <section className="text-center space-y-6 relative z-10 mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-full text-xs font-mono text-slate-400">
          <Layers size={14} className="text-cyan-400" />
          System Architecture Overview
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400">
          How Nexus Works
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          A deep dive into the engineering decisions, data structures, and distributed systems 
          patterns that power real-time collaborative code editing.
        </p>
      </section>

      {/* Architecture Diagram */}
      <section className="glass-card p-8 md:p-12 mb-16 relative z-10">
        <h2 className="text-xl font-bold mb-8 text-slate-100 flex items-center gap-2">
          <GitBranch size={20} className="text-cyan-400" />
          System Flow
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Frontend */}
          <div className="p-6 bg-sky-500/5 border border-sky-500/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-400 animate-pulse" />
              <h3 className="font-bold text-sky-400 text-sm uppercase tracking-wider">Frontend</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-sky-400 mt-0.5">→</span>
                User opens workspace and selects a file
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 mt-0.5">→</span>
                Monaco Editor renders the code content
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 mt-0.5">→</span>
                Each keystroke generates a Delta message
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 mt-0.5">→</span>
                Delta is sent via STOMP WebSocket to backend
              </li>
            </ul>
          </div>

          {/* Backend */}
          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wider">Backend Engine</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">→</span>
                STOMP Controller receives the Delta payload
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">→</span>
                OT Engine applies insert/delete to in-memory cache
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">→</span>
                Raw JDBC logs the operation to audit table
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">→</span>
                Broadcasts Delta to all other subscribers
              </li>
            </ul>
          </div>

          {/* Database */}
          <div className="p-6 bg-violet-500/5 border border-violet-500/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-400 animate-pulse" />
              <h3 className="font-bold text-violet-400 text-sm uppercase tracking-wider">Persistence</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">→</span>
                <strong className="text-slate-300">JPA:</strong> Saves Workspace, Document snapshots
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">→</span>
                <strong className="text-slate-300">JDBC:</strong> Append-only keystroke_logs table
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">→</span>
                H2 (dev) or MySQL (prod) compatible
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">→</span>
                Analytics queries via JdbcTemplate
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="mb-16 relative z-10">
        <h2 className="text-2xl font-bold mb-8 text-slate-100">Core Engineering Pillars</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="glass-card p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} border border-slate-700/30`}>
                  <feature.icon size={20} className="text-slate-200" />
                </div>
                <span className="text-[10px] font-mono px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-400 uppercase tracking-wider">
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-16 relative z-10">
        <h2 className="text-2xl font-bold mb-8 text-slate-100">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {techStack.map((tech, i) => (
            <div key={i} className="glass-card p-5 flex items-start gap-4">
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/50">
                <tech.icon size={18} className={tech.color} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">{tech.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{tech.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center glass-card p-12 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Users size={20} className="text-cyan-400" />
          <h2 className="text-2xl font-bold text-slate-100">Ready to Collaborate?</h2>
        </div>
        <p className="text-slate-400 text-sm mb-8 max-w-lg mx-auto">
          Open two browser tabs side-by-side and start typing. Watch your changes sync instantly 
          across sessions through the STOMP WebSocket broker.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-cyan-500/25"
        >
          Open Dashboard <ArrowRight size={18} />
        </a>
      </section>
    </main>
  );
}
