"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { Client } from "@stomp/stompjs";
import { Code, Server, User, Play, Save, ChevronLeft, Layers, Database, Terminal, X, Loader2 } from "lucide-react";

interface DocumentFile {
  id: number;
  name: string;
  language: string;
  content: string;
}

interface Workspace {
  id: number;
  name: string;
  description: string;
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [activeFile, setActiveFile] = useState<DocumentFile | null>(null);
  const [editorVal, setEditorVal] = useState("");
  const [username, setUsername] = useState("");
  
  // Real-time Analytics fetched via JDBC
  const [jdbcAnalytics, setJdbcAnalytics] = useState<number>(0);
  const [connected, setConnected] = useState(false);

  // Code execution state
  const [execOutput, setExecOutput] = useState("");
  const [execError, setExecError] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const stompClientRef = useRef<Client | null>(null);
  const isIncomingEdit = useRef(false);

  // Initialize random username client-side only to prevent SSR hydration mismatch
  useEffect(() => {
    setUsername(`Engineer_${Math.floor(Math.random() * 900 + 100)}`);
  }, []);

  // 1. Fetch structural files & metadata on load
  useEffect(() => {
    fetch(`http://localhost:8085/api/workspaces/${workspaceId}`)
      .then((res) => res.json())
      .then((data) => setWorkspace(data))
      .catch((err) => console.error("Error loading workspace:", err));

    fetch(`http://localhost:8085/api/documents/workspace/${workspaceId}`)
      .then((res) => res.json())
      .then((data: DocumentFile[]) => {
        setFiles(data);
        if (data.length > 0) {
          handleFileSelect(data[0]);
        }
      })
      .catch((err) => console.error("Error loading files:", err));
  }, [workspaceId]);

  // 2. Query JDBC Analytics periodically
  useEffect(() => {
    if (!activeFile || !username) return;
    const interval = setInterval(() => {
      fetch(`http://localhost:8085/api/documents/${activeFile.id}/analytics/${username}`)
        .then((res) => res.json())
        .then((data) => setJdbcAnalytics(data.totalKeystrokesLogged || 0))
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [activeFile, username]);

  // 3. Connect to WebSocket
  useEffect(() => {
    if (!activeFile || !username) return;

    // Dynamically load SockJS to ensure robust SSR builds
    const SockJS = require("sockjs-client");

    const client = new Client({
      brokerURL: "ws://localhost:8085/ws-editor", // Backup URL
      webSocketFactory: () => new SockJS("http://localhost:8085/ws-editor"),
      debug: (str) => console.log("STOMP: ", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setConnected(true);
      
      // Subscribe to active document delta edits channel
      client.subscribe(`/topic/editor/${activeFile.id}`, (message) => {
        const payload = JSON.parse(message.body);
        if (payload.username !== username && payload.fullContent) {
          // Flag that we are modifying the Monaco buffer from an incoming broadcast
          isIncomingEdit.current = true;
          setEditorVal(payload.fullContent);
          isIncomingEdit.current = false;
        }
      });
    };

    client.onDisconnect = () => {
      setConnected(false);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [activeFile, username]);

  const handleFileSelect = (file: DocumentFile) => {
    setActiveFile(file);
    // Fetch latest fresh content from backend
    fetch(`http://localhost:8085/api/documents/${file.id}`)
      .then((res) => res.json())
      .then((data) => setEditorVal(data.content));
  };

  // 4. Send typing delta updates to WebSocket
  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setEditorVal(value);

    // If change was triggered from WebSocket loop, do not re-send
    if (isIncomingEdit.current) return;

    if (stompClientRef.current && stompClientRef.current.connected && activeFile) {
      // Calculate typing diff (Simplified character insertion for display)
      const opContent = value.length > editorVal.length ? value.slice(editorVal.length) : "";
      const opType = value.length > editorVal.length ? "INSERT" : "DELETE";
      
      stompClientRef.current.publish({
        destination: `/app/editor/edit/${activeFile.id}`,
        body: JSON.stringify({
          documentId: activeFile.id,
          username: username,
          opType: opType,
          opContent: opContent || " ",
          position: value.length,
        }),
      });
    }
  };

  // 5. Trigger persistent JPA save
  const handleJPASave = () => {
    if (!activeFile) return;
    fetch(`http://localhost:8085/api/documents/${activeFile.id}/save`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then(() => alert("Successfully persisted document back to Database via JPA."));
  };

  // 6. Execute code via backend ProcessBuilder
  const handleExecute = () => {
    if (!activeFile) return;
    setIsExecuting(true);
    setExecOutput("");
    setExecError("");
    setShowTerminal(true);

    fetch("http://localhost:8085/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: editorVal,
        language: activeFile.language,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setExecOutput(data.output || "");
        setExecError(data.error || "");
        setIsExecuting(false);
      })
      .catch((err) => {
        setExecError("Failed to connect to execution server: " + err.message);
        setIsExecuting(false);
      });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-100">{workspace?.name || "Loading..."}</h1>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Workspace Mode</p>
          </div>
        </div>

        {/* Real-time Status Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <User size={14} className="text-cyan-400" />
            <span className="text-slate-300">{username || "Linking..."}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              connected ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            <Server size={14} />
            {connected ? "STOMP Linked" : "Linking..."}
          </div>
        </div>
      </header>

      {/* Main Sandbox Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-950/40 backdrop-blur-md flex flex-col p-4 space-y-6">
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 mb-3">Room Explorer</h3>
            <div className="space-y-1">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => handleFileSelect(file)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                    activeFile?.id === file.id
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Code size={16} />
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Raw JDBC Live Feed Counter */}
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Database size={14} className="text-indigo-400" /> JDBC Event Engine
            </h4>
            <div className="font-mono">
              <p className="text-[10px] text-slate-500">Append-Only Logs Committed:</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{jdbcAnalytics}</p>
            </div>
            <p className="text-[9px] text-slate-600 leading-relaxed">
              *Actions bypass standard JPA persistence to record instantaneous keystroke analytics directly.
            </p>
          </div>
        </aside>

        {/* Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-900/10">
          {/* Controls Bar */}
          <div className="h-12 border-b border-slate-800 px-6 flex justify-between items-center bg-slate-950/20">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Layers size={14} className="text-cyan-400 animate-pulse" />
              <span>Editing:</span>
              <span className="text-slate-100 font-bold">{activeFile?.name}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleJPASave}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              >
                <Save size={12} /> JPA Save
              </button>
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 hover:from-cyan-400 hover:to-sky-400 rounded-lg text-xs font-bold transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                {isExecuting ? "Running..." : "Execute"}
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className={`overflow-hidden relative ${showTerminal ? 'h-[60%]' : 'flex-1'}`}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={activeFile?.language || "javascript"}
              value={editorVal}
              onChange={handleEditorChange}
              options={{
                fontSize: 14,
                fontFamily: "Fira Code, Menlo, Monaco, monospace",
                minimap: { enabled: false },
                scrollbar: { vertical: "hidden", horizontal: "hidden" },
                roundedSelection: true,
                padding: { top: 20 },
              }}
            />
          </div>

          {/* Terminal Output Panel */}
          {showTerminal && (
            <div className="h-[40%] border-t border-slate-800 bg-[#0d1117] flex flex-col">
              <div className="h-9 px-4 flex justify-between items-center border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <Terminal size={14} className={isExecuting ? 'text-amber-400 animate-pulse' : execError ? 'text-red-400' : 'text-emerald-400'} />
                  <span className="text-slate-400">
                    {isExecuting ? 'Compiling & Executing...' : execError ? 'Execution Failed' : 'Output'}
                  </span>
                </div>
                <button
                  onClick={() => setShowTerminal(false)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                {isExecuting && (
                  <div className="flex items-center gap-2 text-amber-400 text-xs">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Compiling source code...</span>
                  </div>
                )}
                {execOutput && (
                  <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">{execOutput}</pre>
                )}
                {execError && (
                  <pre className="text-red-400 whitespace-pre-wrap leading-relaxed">{execError}</pre>
                )}
                {!isExecuting && !execOutput && !execError && (
                  <p className="text-slate-600 text-xs">No output yet. Click Execute to run your code.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
