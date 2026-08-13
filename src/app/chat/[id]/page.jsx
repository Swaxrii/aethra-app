"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { getProject, addMessage, touchProject, projectToHTML } from "@/lib/store";
import { getModelPref, getSession } from "@/lib/session";

const MODELS = ["Aethra 1.0", "Aethra 1.1"];

export default function ChatPage() {
  const params = useParams();
  const id = params.id;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(MODELS.includes(getModelPref()) ? getModelPref() : MODELS[0]);
  const [open, setOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const ref = useRef(null);
  const scrollRef = useRef(null);
  const exportRef = useRef(null);

  useEffect(() => {
    const p = getProject(id);
    setProject(p);
    if (p) setModel(p.model);
    setLoading(false);
    touchProject(id);
  }, [id]);

  useEffect(() => {
    const onStore = () => {
      const p = getProject(id);
      if (p) {
        setProject(p);
        setModel(p.model);
      }
    };
    window.addEventListener("aethra-projects", onStore);
    return () => window.removeEventListener("aethra-projects", onStore);
  }, [id]);

  useEffect(() => {
    if (!loading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [project, loading]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const safeName = () => (project?.title ? project.title.replace(/[\\/:*?"<>|\n]+/g, " ").trim().slice(0, 60) : "conversation") || "conversation";

  const userName = () => {
    const u = getSession();
    if (!u) return "You";
    return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email?.split("@")[0] || "You";
  };

  const download = (filename, content, type) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportHTML = () => download(`${safeName()}.html`, projectToHTML(project, userName()), "text/html");

  const send = () => {
    const text = input.trim();
    if (!text) return;
    addMessage(id, text, model);
    setProject(getProject(id));
    setInput("");
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-white/40">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-white/40">Conversation not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex-shrink-0 px-4 sm:px-6 pt-4 pb-3 animate-rise">
        <div className="max-w-[820px] mx-auto flex items-center justify-between gap-3">
          <h1 className="flex-1 min-w-0 text-base sm:text-lg font-bold tracking-tight text-white truncate">{project.title}</h1>
          <div ref={exportRef} className="relative flex-shrink-0">
            <button type="button" onClick={() => setExportOpen(!exportOpen)} className="h-8 sm:h-9 px-3 rounded-lg bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] text-sm text-white/75 transition-all duration-300 hover:border-[#A64D79] hover:text-white cursor-pointer">
              <span className="flex items-center gap-1.5">
                Export
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-300 ${exportOpen ? "rotate-180" : ""}`}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            {exportOpen && (
              <div className="absolute z-30 right-0 top-[42px] w-[170px] rounded-[12px] bg-[#2A2A2D] border border-[rgba(69,69,69,0.8)] shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-1.5 space-y-1 animate-drop-in">
                <button type="button" onClick={() => { exportHTML(); setExportOpen(false); }} className="w-full text-left rounded-[10px] px-3.5 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all duration-200 cursor-pointer">Download as HTML</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-px flex-shrink-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15)_15%,rgba(255,255,255,0.15)_85%,transparent)]" />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="max-w-[820px] mx-auto space-y-6 sm:space-y-8">
          {project.messages.map((m, i) =>
            m.role === "ai" ? (
              <div key={i} className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#A64D79] to-[#5C1E4D] flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="8" width="16" height="12" rx="2" />
                      <path d="M12 8V4" />
                      <circle cx="12" cy="3" r="1" />
                      <circle cx="9" cy="13" r="1" fill="white" />
                      <circle cx="15" cy="13" r="1" fill="white" />
                      <path d="M9 17h6" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-sm sm:text-[15px] leading-relaxed text-white/90 font-light whitespace-pre-wrap break-words">{m.text}</div>
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-[14px] bg-[#A64D79] px-3.5 sm:px-4 py-2.5 text-sm sm:text-[15px] leading-relaxed text-white font-light break-words">{m.text}</div>
              </div>
            ),
          )}
          </div>
        </div>

      <div className="relative px-3 sm:px-6 py-3 sm:py-4">
        <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,rgba(69,69,69,0.4)_12%,rgba(69,69,69,0.4)_88%,transparent)]" />
        <div className="max-w-[820px] mx-auto flex items-center gap-2 sm:gap-3">
          <input
            type="text"
            placeholder="Ask aethra anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            onFocus={() => setOpen(false)}
            className="flex-1 min-w-0 h-[46px] sm:h-[44px] rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] px-3.5 sm:px-4 text-sm text-white font-light placeholder:text-white/70 outline-none transition-all duration-500 focus:border-[#A64D79]"
          />
          <div ref={ref} className="relative flex-shrink-0">
            <button type="button" onClick={() => setOpen(!open)} aria-label="Select AI model" className="h-[46px] sm:h-[44px] rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] px-3 sm:px-3.5 flex items-center justify-center gap-2 text-sm text-white/75 transition-all duration-300 hover:border-[#A64D79] cursor-pointer">
              <span className="max-w-[110px] truncate">{model}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-300 flex-shrink-0 ${open ? "rotate-180" : ""}`}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {open && (
              <div className="absolute z-20 right-0 bottom-[52px] w-[180px] sm:w-[200px] rounded-[12px] bg-[#2A2A2D] border border-[rgba(69,69,69,0.8)] shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-1.5 space-y-1">
                {MODELS.map((m) => {
                  const on = model === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setModel(m);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-3 rounded-[10px] px-3.5 py-2.5 text-sm transition-all duration-200 cursor-pointer ${on ? "bg-[#A64D79]/15 text-white font-medium" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
                      <span>{m}</span>
                      {on && (
                        <span className="w-4 h-4 rounded-full border-[2px] border-[#A64D79] flex items-center justify-center flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A64D79]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function parseHTMLConversation(html, title) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const messages = Array.from(doc.querySelectorAll(".msg")).map((el) => {
    const isUser = Array.from(el.classList).includes("user");
    const text = (el.querySelector("p")?.textContent || "").trim();
    return { role: isUser ? "user" : "ai", text };
  });
  const model = doc.querySelector(".model")?.textContent?.trim() || "Aethra 1.0";
  return { title: title || "Imported conversation", model, messages };
}
