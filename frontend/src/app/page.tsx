"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Terminal, Code, PlusCircle, ArrowRight } from "lucide-react";

interface Workspace {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export default function Home() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");
  const [showModal, setShowModal] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085";

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/workspaces`)
      .then((res) => res.json())
      .then((data) => setWorkspaces(data))
      .catch((err) => console.error("Error loading workspaces:", err));
  }, [API_BASE_URL]);

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    fetch(`${API_BASE_URL}/api/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newWorkspaceName, description: newWorkspaceDesc }),
    })
      .then((res) => res.json())
      .then((newWS) => {
        setWorkspaces((prev) => [...prev, newWS]);
        setNewWorkspaceName("");
        setNewWorkspaceDesc("");
        setShowModal(false);
      });
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:py-24">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-semibold border border-cyan-500/20 mb-4 animate-pulse">
          <Terminal size={14} /> Systems online: Port 8085
        </div>
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 leading-tight">
          NEXUS
        </h1>
        <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
          High-performance collaborative engineering workspace. Code, review, and synchronize in real-time.
        </p>
      </section>

      {/* Interactive Controls */}
      <section className="mt-16 md:mt-24 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Active Workspaces</h2>
            <p className="text-slate-500 text-sm">Select a sandbox or spin up a new server room.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
          >
            <PlusCircle size={18} /> New Workspace
          </button>
        </div>

        {/* Workspaces Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="group glass-card p-6 flex flex-col justify-between min-h-[180px]"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 group-hover:border-cyan-500/50 transition-colors">
                    <Code className="text-cyan-400" size={20} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">ID: {ws.id}</span>
                </div>
                <h3 className="text-lg font-bold mt-4 text-slate-100 group-hover:text-cyan-400 transition-colors">
                  {ws.name}
                </h3>
                <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                  {ws.description || "No description provided."}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(ws.createdAt).toLocaleDateString()}
                </span>
                <Link
                  href={`/workspace/${ws.id}`}
                  className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Join Room <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-8 relative border border-slate-700/80">
            <h3 className="text-xl font-bold mb-2">Create Collaborative Room</h3>
            <p className="text-slate-400 text-xs mb-6">Initialize a fresh sandbox for synchronous coding sessions.</p>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2">Room Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flight Router Core"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2">Description</label>
                <textarea
                  placeholder="What are you building?"
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Deploy Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
