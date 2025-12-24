




import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { ClipLoader } from "react-spinners";
import { FaArrowLeft, FaTrash, FaPlus, FaBars } from "react-icons/fa";
import { toast } from "react-toastify";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  saveDebuggerSession,
  getDebuggerSessions,
  clearDebuggerSessions,
} from "../utils/storage";

const Debugger = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [responseBlocks, setResponseBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [mode, setMode] = useState("debug"); // debug | generate | explain
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

  useEffect(() => {
    setSessions(getDebuggerSessions());
  }, []);

  const parseMarkdownBlocks = (text) => {
    const blocks = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const before = text.slice(lastIndex, match.index).trim();
      if (before) blocks.push({ type: "text", content: before });

      blocks.push({
        type: "code",
        language: match[1] || "text",
        content: match[2].trim(),
      });

      lastIndex = regex.lastIndex;
    }

    const after = text.slice(lastIndex).trim();
    if (after) blocks.push({ type: "text", content: after });

    return blocks;
  };

  const analyzeCode = async () => {
    if (!code.trim() && mode !== "generate") return toast.error("Please provide code or prompt!");

    setLoading(true);
    setResponseBlocks([]);

    try {
      // const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
       const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      let prompt = "";

      if (mode === "debug") {
        prompt = `
You are an expert software engineer. Analyze the following code:
1️⃣ Find bugs or issues.
2️⃣ Explain the code.
3️⃣ Suggest improvements.
4️⃣ Provide a fixed version (in markdown code blocks).

Code:
\`\`\`
${code}
\`\`\`
`;
      } else if (mode === "generate") {
        prompt = `
You are an expert software engineer. Generate working, clean, and optimized code based on the following description:
\`\`\`
${code}
\`\`\`
Provide the output in markdown code blocks.
`;
      } else if (mode === "explain") {
        prompt = `
You are an expert software engineer. Explain the following code **line by line**, including logic and potential improvements:
\`\`\`
${code}
\`\`\`
`;
      }

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      const parsed = parseMarkdownBlocks(text);

      const newSession = {
        id: Date.now(),
        title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Session ${sessions.length + 1}`,
        code,
        response: parsed,
        date: new Date().toLocaleString(),
        mode,
      };

      saveDebuggerSession(newSession);
      setSessions((prev) => [...prev, newSession]);
      setActiveSession(newSession);
      setResponseBlocks(parsed);
      toast.success(`✅ ${mode.charAt(0).toUpperCase() + mode.slice(1)} complete!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to process request!");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("✅ Copied!");
  };

  const loadSession = (session) => {
    setActiveSession(session);
    setCode(session.code);
    setResponseBlocks(session.response);
    setMode(session.mode || "debug");
  };

  // 🆕 New Function: Delete a specific session
  const deleteSession = (sessionId) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    clearDebuggerSessions(); // clear storage first
    updated.forEach((s) => saveDebuggerSession(s)); // re-save remaining sessions
    if (activeSession?.id === sessionId) {
      setActiveSession(null);
      setResponseBlocks([]);
    }
    toast.info("🗑 Session deleted!");
  };

  const clearAllSessions = () => {
    clearDebuggerSessions();
    setSessions([]);
    setActiveSession(null);
    setResponseBlocks([]);
    toast.info("🧹 All sessions cleared!");
  };

  const createNewChat = () => {
    setCode("");
    setResponseBlocks([]);
    setActiveSession(null);
    toast.info("🆕 New Session Started!");
  };

  return (
    <div className="flex flex-col md:flex-row bg-gradient-to-b from-[#0B0B0F] via-[#101019] to-[#0B0B0F] text-white min-h-screen">
      
      {/* Sidebar */}
      <div
        className={`bg-[#151521]/90 border-r border-cyan-500/20 p-4 backdrop-blur-md shadow-[0_0_15px_#0ff3] transition-all duration-300
          ${sidebarOpen ? "w-full md:w-64 h-auto md:h-screen" : "w-0 md:w-0 overflow-hidden"}`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-cyan-400">🧠 Sessions</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={createNewChat}
              className="text-green-400 hover:scale-125 transition-transform"
              title="New Chat"
            >
              <FaPlus />
            </button>
            <button
              onClick={clearAllSessions}
              className="text-red-500 hover:scale-125 transition-transform"
              title="Clear all"
            >
              <FaTrash />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-300 md:hidden hover:text-white transition"
            >
              <FaBars />
            </button>
          </div>
        </div>

        {sessions.length === 0 && <p className="text-gray-400 text-sm">No previous sessions.</p>}

        <div className="flex flex-col gap-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`relative cursor-pointer p-3 rounded-lg transition-all duration-300 group ${
                activeSession?.id === s.id
                  ? "bg-gradient-to-r from-purple-700 to-cyan-700 shadow-[0_0_10px_#00c6ff50]"
                  : "bg-[#1E1E26] hover:bg-[#252532]"
              }`}
            >
              <div onClick={() => loadSession(s)}>
                <div className="text-sm font-semibold truncate">{s.title}</div>
                <div className="text-xs text-gray-400 truncate">{s.date}</div>
              </div>
              {/* 🗑 Individual delete button */}
              <button
                onClick={() => deleteSession(s.id)}
                className="absolute top-2 right-2 opacity-70 hover:opacity-100 text-red-400 hover:text-red-500 transition-all"
                title="Delete this session"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 border border-cyan-400/30 px-4 py-2 rounded-lg hover:bg-cyan-500/20 text-cyan-300 transition-all duration-300"
          >
            <FaArrowLeft /> Back to Home
          </button>
          <div className="text-left md:text-right">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI Code Assistant
            </h2>
            <p className="text-gray-400 text-sm mt-1 italic">
              Debug, Generate, or Explain your code instantly
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="bg-[#1E1E26] text-white px-4 py-2 rounded-lg border border-cyan-400/30 w-full md:w-auto"
          >
            <option value="debug">Debug & Fix</option>
            <option value="generate">Generate Code</option>
            <option value="explain">Explain Code Line by Line</option>
          </select>
        </div>

        <div className="rounded-xl border border-cyan-400/10 bg-[#141421]/60 backdrop-blur-md shadow-[0_0_25px_#00c6ff20] overflow-hidden mb-6">
          <Editor
            height="320px"
            language="javascript"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val)}
          />
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={analyzeCode}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 px-6 md:px-8 py-3 rounded-lg text-white font-semibold hover:shadow-[0_0_25px_#00c6ff80] hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            {loading ? <ClipLoader color="white" size={18} /> : "⚡ Run AI"}
          </button>
        </div>

        {responseBlocks.length > 0 && (
          <div className="mt-4 md:mt-8 bg-[#151521]/80 border border-cyan-500/20 rounded-xl p-4 md:p-6 shadow-[0_0_20px_#00c6ff20] max-h-[500px] overflow-y-auto">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">🔍 AI Report</h3>

            {responseBlocks.map((block, idx) =>
              block.type === "text" ? (
                <p key={idx} className="text-gray-200 whitespace-pre-wrap leading-relaxed mb-4">
                  {block.content}
                </p>
              ) : (
                <div key={idx} className="relative bg-[#0D0D12] border border-gray-700 rounded-lg mb-5 overflow-hidden">
                  <div className="absolute top-2 left-2 text-xs text-cyan-400 uppercase font-semibold">
                    {block.language}
                  </div>
                  <button
                    onClick={() => copyToClipboard(block.content)}
                    className="absolute top-2 right-2 text-xs bg-cyan-500/20 hover:bg-cyan-500/40 px-2 py-1 rounded-md text-white transition-all duration-200"
                  >
                    Copy
                  </button>
                  <pre className="overflow-x-auto p-4 text-sm font-mono text-gray-100">{block.content}</pre>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Debugger;
