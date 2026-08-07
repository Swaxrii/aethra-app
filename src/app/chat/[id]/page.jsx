"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { getProject, addMessage } from "@/lib/store";

const MODELS = ["Aethra 1.0", "Aethra 1.1"];

export default function ChatPage() {
  const params = useParams();
  const id = params.id;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(MODELS[0].value);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const p = getProject(id);
    setProject(p);
    if (p) setModel(p.model);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-[1100px] mx-auto space-y-6">
          {project.messages.map((m, i) => (
            <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
              {m.role === "ai" ? (
                <>
                  <div className="rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] p-5 text-sm font-light leading-relaxed text-white/85">
                    {m.text}
                  </div>
                  <div className="hidden lg:block" />
                </>
              ) : (
                <>
                  <div className="hidden lg:block" />
                  <div className="rounded-[10px] bg-[rgba(166,77,121,0.08)] border border-[#A64D79]/60 p-5 text-sm font-light leading-relaxed text-white">
                    {m.text}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[rgba(69,69,69,0.3)] px-6 py-4">
        <div className="max-w-[1100px] mx-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask aethra or type /command"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            className="flex-1 h-[44px] rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] px-4 text-sm text-white font-light placeholder:text-white/70 outline-none transition-all duration-500 focus:border-[#A64D79]"
          />
          <div ref={ref} className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="h-[44px] min-w-[190px] rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] px-3.5 flex items-center justify-between gap-2 text-sm text-white/75 transition-all duration-300 hover:border-[#A64D79] cursor-pointer"
            >
              <span className="truncate">{model}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-300 flex-shrink-0 ${open ? "rotate-180" : ""}`}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {open && (
              <div className="absolute z-20 right-0 bottom-[52px] w-[200px] rounded-[12px] bg-[#2A2A2D] border border-[rgba(69,69,69,0.8)] shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-1.5 space-y-1">
                {MODELS.map((m) => {
                  const on = model === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setModel(m); setOpen(false); }}
                      className={`w-full flex items-center justify-between gap-3 rounded-[10px] px-3.5 py-2.5 text-sm transition-all duration-200 cursor-pointer ${
                        on
                          ? "bg-[#A64D79]/15 text-white font-medium"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
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