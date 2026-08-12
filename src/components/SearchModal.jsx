"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadProjects } from "@/lib/store";

const SHORTCUTS = [
  { label: "New Chat", to: "/", icon: "new-chat" },
  { label: "Settings", to: "/settings", icon: "settings" },
];

export default function SearchModal({ open, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setProjects(loadProjects());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const filteredProjects = q ? projects.filter((p) => p.title.toLowerCase().includes(q)) : projects;
  const filteredShortcuts = q ? SHORTCUTS.filter((s) => s.label.toLowerCase().includes(q)) : SHORTCUTS;

  const openRoute = (to) => {
    onClose();
    router.push(to);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 pt-[12vh] px-4 animate-fade-in-slow" onClick={onClose}>
      <div className="w-full max-w-[560px] rounded-2xl bg-[#232326] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-drop-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <input ref={inputRef} type="text" placeholder="Search projects, pages, commands..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none" />
          <button onClick={onClose} className="flex-shrink-0 text-[11px] px-2 py-1 rounded-md border border-white/10 text-white/50 hover:text-white/80 hover:border-white/25 transition-all cursor-pointer">
            ESC
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filteredProjects.length > 0 && (
            <>
              <div className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-white/40">Projects</div>
              {filteredProjects.map((p, i) => (
                <button key={p.id} onClick={() => openRoute(`/chat/${p.id}`)} style={{ animationDelay: `${i * 0.04}s` }} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-[rgba(166,77,121,0.15)] hover:text-white transition-all cursor-pointer text-left animate-rise">
                  <svg className="w-4 h-4 text-[#A64D79] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M3 12h18M3 18h18" />
                  </svg>
                  <span className="truncate">{p.title}</span>
                </button>
              ))}
            </>
          )}

          {filteredShortcuts.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-white/40">Pages</div>
              {filteredShortcuts.map((s, i) => (
                <button key={s.label} onClick={() => openRoute(s.to)} style={{ animationDelay: `${(filteredProjects.length + i) * 0.04}s` }} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-[rgba(166,77,121,0.15)] hover:text-white transition-all cursor-pointer text-left animate-rise">
                  {s.icon === "new-chat" ? (
                    <svg className="w-4 h-4 text-[#A64D79] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#A64D79] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  )}
                  <span>{s.label}</span>
                </button>
              ))}
            </>
          )}

          {filteredProjects.length === 0 && filteredShortcuts.length === 0 && <div className="px-3 py-8 text-center text-sm text-white/40">No results for &quot;{query}&quot;</div>}
        </div>
      </div>
    </div>
  );
}
