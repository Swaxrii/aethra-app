"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadProjects, touchProject, renameProject, deleteProject } from "@/lib/store";
import { PencilIcon, TrashIcon, MoreVerticalIcon, FolderIcon } from "@/components/Icons";

function subtitle(p) {
  const count = p.messages?.length || 0;
  return `${count} messages`;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [menuId, setMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const menuRef = useRef(null);

  const refresh = () => setProjects(loadProjects());

  useEffect(() => {
    refresh();
    const onStore = () => refresh();
    window.addEventListener("aethra-projects", onStore);
    return () => window.removeEventListener("aethra-projects", onStore);
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuId(null);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const startRename = (p) => {
    setEditingId(p.id);
    setEditValue(p.title);
    setMenuId(null);
  };

  const commitRename = (id) => {
    renameProject(id, editValue);
    setEditingId(null);
    setEditValue("");
  };

  const removeProject = (id) => {
    deleteProject(id);
    setMenuId(null);
    if (editingId === id) setEditingId(null);
  };

  const openProject = (id) => {
    touchProject(id);
    router.push(`/chat/${id}`);
  };

  return (
    <div className="w-full h-full overflow-y-auto px-6 py-10">
      <div className="max-w-[960px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white animate-rise">Projects</h1>
          <p className="mt-1 text-sm font-light text-white/55 animate-rise-1">All your projects, stored permanently.</p>
        </header>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-rise">
            <FolderIcon className="w-12 h-12 text-white/30" />
            <p className="mt-4 text-sm font-light text-white/60">Your projects will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, i) => {
              if (editingId === p.id) {
                return (
                  <div key={p.id} style={{ animationDelay: `${i * 0.06}s` }} className="animate-rise rounded-xl bg-white/[0.03] border border-[#A64D79] p-5 flex flex-col gap-3">
                    <span className="text-xs font-light text-white/45">Rename project</span>
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => commitRename(p.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(p.id);
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditValue("");
                        }
                      }}
                      className="w-full bg-[rgba(69,69,69,0.3)] border border-[#A64D79] rounded-lg px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>
                );
              }
              return (
                <div
                  key={p.id}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  className="animate-rise group relative rounded-xl bg-white/[0.03] border border-white/10 p-5 flex flex-col gap-4 transition-all duration-300 hover:border-[#A64D79]/50 hover:bg-white/[0.05] cursor-pointer"
                  onClick={() => openProject(p.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">{p.title}</span>
                      <span className="block mt-1 text-xs font-light text-white/45">{subtitle(p)}</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuId(menuId === p.id ? null : p.id);
                      }}
                      className="flex-shrink-0 p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                      <MoreVerticalIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openProject(p.id);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#A64D79] py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[#A64D79]/90 cursor-pointer">
                    Enter Project
                  </button>

                  {menuId === p.id && (
                    <div ref={menuRef} className="absolute z-20 right-4 top-12 min-w-[150px] rounded-xl bg-[#232326]/95 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-1.5 animate-[fade-in_0.12s_ease-out]" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => startRename(p)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-white/80 hover:bg-[#A64D79]/15 hover:text-white transition-colors cursor-pointer text-left">
                        <PencilIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Rename</span>
                      </button>
                      <div className="h-px mx-2 my-1 bg-white/[0.06]" />
                      <button onClick={() => removeProject(p.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer text-left">
                        <TrashIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
