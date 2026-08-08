"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { loadProjects, renameProject, deleteProject } from "@/lib/store";
import { clearSession } from "@/lib/session";
import SearchModal from "./SearchModal";
import { SearchIcon, FolderIcon, SettingsIcon, LogoutIcon, PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon } from "./Icons";

const GRADIENT_HOVER = "hover:bg-[linear-gradient(90deg,#A64D79_0%,rgba(64,30,47,0)_100%)] hover:text-white";
const GRADIENT_ACTIVE = "bg-[linear-gradient(90deg,#A64D79_0%,rgba(64,30,47,0)_100%)] text-white";
const NAV_BASE = "flex cursor-pointer items-center gap-3 rounded-[5px] px-2 py-2 text-[15px] font-normal transition-all";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const isSettings = pathname === "/settings";
  const isAuth = pathname === "/auth";
  const [isOpen, setIsOpen] = useState(true);
  const [showCloseIcon, setShowCloseIcon] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [projects, setProjects] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menu, setMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const logout = () => {
    clearSession();
    router.push("/auth");
  };

  const openMenu = (e, id) => {
    e.preventDefault();
    setMenu({ id, x: e.clientX, y: e.clientY });
  };

  const closeMenu = () => setMenu(null);

  const startRename = () => {
    const p = projects.find((x) => x.id === menu.id);
    setEditingId(menu.id);
    setEditValue(p ? p.title : "");
    closeMenu();
  };

  const commitRename = (id) => {
    renameProject(id, editValue);
    setEditingId(null);
    setEditValue("");
  };

  const removeProject = (id) => {
    deleteProject(id);
    closeMenu();
    if (pathname === `/chat/${id}`) router.push("/");
  };

  useEffect(() => {
    const onDown = (e) => {
      if (e.key === "Escape") {
        setMenu(null);
        setEditingId(null);
      }
    };
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, []);

  useEffect(() => {
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    setProjects(loadProjects());
    const onStore = () => setProjects(loadProjects());
    window.addEventListener("aethra-projects", onStore);
    return () => window.removeEventListener("aethra-projects", onStore);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (isAuth) return null;

  const commonWrapper = "flex-shrink-0 w-[18px] h-[18px]";

  return (
    <>
      {isMobile && isOpen && <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} />}
      <aside className={isMobile && isOpen ? "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#3B1C32] shadow-[-1px_0px_0px_rgba(255,255,255,0.15)] transition-all duration-300 ease-in-out w-[200px]" : `h-full flex-shrink-0 flex flex-col bg-[#3B1C32] shadow-[-1px_0px_0px_rgba(255,255,255,0.15)] transition-all duration-300 ease-in-out ${isOpen ? "w-[200px]" : "w-[52px]"}`} onMouseEnter={() => setShowCloseIcon(true)} onMouseLeave={() => setShowCloseIcon(false)}>
        {isOpen ? (
          <>
            <div className="flex items-center gap-3 px-4 pt-6 relative">
              <Image src="/logo.svg" alt="AethraCore" width={50} height={50} className="flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xl leading-tight text-white truncate">AETHRA AI</span>
                <span className="font-extralight text-[11px] leading-tight text-white/50 truncate">Artificial Intelligence</span>
              </div>
              {showCloseIcon && (
                <button onClick={() => setIsOpen(false)} className="absolute -right-2 top-6 flex items-center justify-center rounded-full bg-[#A64D79] p-1 transition-all hover:scale-110">
                  <ChevronLeftIcon className="w-3.5 h-3.5 text-white" />
                </button>
              )}
            </div>

            <button onClick={() => router.push("/")} className="mx-4 mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-[5px] bg-[#A64D79] px-3 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:bg-[#A64D79]/90 hover:shadow-md active:scale-[0.97] active:shadow-none">
              <PlusIcon className="w-[10px] h-[10px]" />
              New Chat
            </button>

            <nav className="mt-6 flex flex-col gap-1 px-4">
              <button onClick={() => setSearchOpen(true)} className={`flex cursor-pointer items-center justify-between rounded-[5px] px-2 py-2 text-[15px] font-normal transition-all ${searchOpen ? GRADIENT_ACTIVE : "text-white/75 " + GRADIENT_HOVER}`}>
                <span className="flex items-center gap-3 min-w-0">
                  <SearchIcon className={commonWrapper} />
                  <span className="truncate">Search</span>
                </span>
                <span className="border-[0.5px] border-[rgba(255,255,255,0.49)] rounded-[5px] px-1.5 py-0.5 text-[10px] font-light text-white flex-shrink-0">CTRL + M</span>
              </button>
              <button className={`${NAV_BASE} text-white/75 ${GRADIENT_HOVER}`}>
                <FolderIcon className={commonWrapper} />
                <span className="truncate">Projects</span>
              </button>
            </nav>

            {projects.length > 0 && (
              <div className="mt-5 px-4 flex flex-col">
                <span className="px-2 text-[11px] font-light uppercase tracking-wider text-white/50">Recents</span>
                <div className="mt-2 flex flex-col gap-1 max-h-[240px] overflow-y-auto">
                  {projects.map((p) => {
                    const active = pathname === `/chat/${p.id}`;
                    if (editingId === p.id) {
                      return (
                        <input
                          key={p.id}
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
                          className="w-full rounded-[5px] bg-[rgba(69,69,69,0.3)] border border-[#A64D79] px-2 py-2 text-[13px] text-white outline-none"
                        />
                      );
                    }
                    return (
                      <button
                        key={p.id}
                        onClick={() => router.push(`/chat/${p.id}`)}
                        onContextMenu={(e) => openMenu(e, p.id)}
                        className={`flex cursor-pointer items-center gap-2 rounded-[5px] px-2 py-2 text-[13px] font-normal transition-all ${active ? GRADIENT_ACTIVE : "text-white/70 " + GRADIENT_HOVER}`}>
                        <span className="truncate">{p.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {menu && (
              <div
                className="fixed z-[80] min-w-[170px] rounded-xl bg-[#232326]/95 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-1.5 animate-[fade-in_0.12s_ease-out]"
                style={{ left: menu.x, top: menu.y }}>
                <button onClick={startRename} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-white/80 hover:bg-[#A64D79]/15 hover:text-white transition-colors cursor-pointer text-left">
                  <PencilIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Rename</span>
                </button>
                <div className="h-px mx-2 my-1 bg-white/[0.06]" />
                <button onClick={() => removeProject(menu.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer text-left">
                  <TrashIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Delete</span>
                </button>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-1 px-4 pb-4">
              <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15)_15%,rgba(255,255,255,0.15)_85%,transparent)]" />
              <button onClick={() => router.push("/settings")} className={`${NAV_BASE} ${isSettings ? GRADIENT_ACTIVE : "text-white/75 " + GRADIENT_HOVER}`}>
                <SettingsIcon className={commonWrapper} />
                <span className="truncate">Settings</span>
              </button>
              <button onClick={logout} className={`${NAV_BASE} text-white/75 ${GRADIENT_HOVER}`}>
                <LogoutIcon className={commonWrapper} />
                <span className="truncate">Logout</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-5 pt-6 w-full h-full">
            <button onClick={() => setIsOpen(true)} className="cursor-pointer">
              <Image src="/logo.svg" alt="AethraCore" width={28} height={28} className="flex-shrink-0 cursor-pointer" />
            </button>

            <button onClick={() => setSearchOpen(true)} className={`cursor-pointer transition-colors ${searchOpen ? "text-white" : "text-white/75 hover:text-white"}`}>
              <SearchIcon className={commonWrapper} />
            </button>

            <button className="cursor-pointer text-white/75 hover:text-white transition-colors">
              <FolderIcon className={commonWrapper} />
            </button>

            <div className="mt-auto flex flex-col items-center gap-5 pb-4">
              <button onClick={() => router.push("/settings")} className={`cursor-pointer transition-colors ${isSettings ? "text-white" : "text-white/75 hover:text-white"}`}>
                <SettingsIcon className={commonWrapper} />
              </button>
              <button onClick={logout} className="cursor-pointer text-white/75 hover:text-white transition-colors">
                <LogoutIcon className={commonWrapper} />
              </button>
            </div>
          </div>
        )}
      </aside>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}