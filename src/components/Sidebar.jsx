"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, FolderOpen, Settings, Plus, PanelLeftClose, PanelLeftOpen, MoreHorizontal, LogOut, User, Pencil, Trash2 } from "lucide-react";
import { getRecentProjects, renameProject, deleteProject } from "@/lib/store";
import { getSession, clearSession } from "@/lib/session";
import SearchModal from "./SearchModal";

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [menu, setMenu] = useState(null);
  const [account, setAccount] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => { setMobile(media.matches); setExpanded(!media.matches); };
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const sync = () => { setProjects(getRecentProjects()); setUser(getSession()); };
    const timer = setTimeout(sync, 0);
    window.addEventListener("aethra-projects", sync); window.addEventListener("storage", sync);
    return () => { clearTimeout(timer); window.removeEventListener("aethra-projects", sync); window.removeEventListener("storage", sync); };
  }, [path]);
  useEffect(() => {
    const handle = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "m") { event.preventDefault(); setSearch((value) => !value); }
      if (event.key === "Escape") { setMenu(null); setAccount(false); if (mobile) setExpanded(false); }
    };
    window.addEventListener("keydown", handle); return () => window.removeEventListener("keydown", handle);
  }, [mobile]);
  if (path === "/auth") return null;
  const close = () => { if (mobile) setExpanded(false); setMenu(null); setAccount(false); };
  const rename = (id) => { try { if (!title.trim()) return; renameProject(id, title); setEditing(null); setError(""); } catch { setError("Could not save the conversation name."); } };
  const remove = (id) => { if (!confirm("Delete this conversation? This cannot be undone.")) return; try { deleteProject(id); setMenu(null); if (path === `/chat/${id}`) router.push("/"); } catch { setError("Could not delete this conversation."); } };
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Guest workspace";
  return <>
    {mobile && expanded && <button className="nav-backdrop" aria-label="Close navigation" onClick={() => setExpanded(false)}/>}
    <aside className={`app-sidebar ${expanded ? "expanded" : "collapsed"} ${mobile ? "mobile" : ""}`} aria-label="Workspace navigation">
      <div className="nav-brand"><Link href="/" onClick={close} aria-label="Aethra home"><Image src="/logo.svg" alt="" width={34} height={34}/><span>Aethra<small>LOCAL WORKSPACE</small></span></Link><button className="icon-button" aria-label={expanded ? "Collapse navigation" : "Expand navigation"} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? <PanelLeftClose size={17}/> : <PanelLeftOpen size={17}/>}</button></div>
      <Link className="nav-create" href="/" onClick={close} aria-label="New chat"><Plus size={18}/><span>New conversation</span></Link>
      <nav className="nav-primary" aria-label="Main"><p>WORKSPACE</p>{[["/", "Home", Home], ["/projects", "Projects", FolderOpen], ["/settings", "Settings", Settings]].map(([href, label, Icon]) => <Link key={href} href={href} onClick={close} aria-label={label} aria-current={path === href ? "page" : undefined}><Icon size={18}/><span>{label}</span></Link>)}<button onClick={() => setSearch(true)} aria-label="Search conversations"><Search size={18}/><span>Search</span><kbd>⌘ M</kbd></button></nav>
      <section className="nav-history" aria-label="Recent conversations"><p>RECENT CONVERSATIONS</p>{projects.length === 0 && <small className="nav-empty">Your next idea starts here.</small>}{projects.map((project) => <div className="nav-history-item" key={project.id}>{editing === project.id ? <input autoFocus aria-label="Conversation name" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") rename(project.id); if (e.key === "Escape") setEditing(null); }} onBlur={() => rename(project.id)}/> : <><Link href={`/chat/${project.id}`} onClick={close} aria-current={path === `/chat/${project.id}` ? "page" : undefined}>{project.title}</Link><button className="icon-button" aria-label={`Actions for ${project.title}`} aria-expanded={menu === project.id} onClick={() => setMenu(menu === project.id ? null : project.id)}><MoreHorizontal size={17}/></button></>}{menu === project.id && <div className="nav-popover"><button onClick={() => { setTitle(project.title); setEditing(project.id); setMenu(null); }}><Pencil size={15}/>Rename</button><button onClick={() => remove(project.id)}><Trash2 size={15}/>Delete</button></div>}</div>)}</section>
      {error && <p role="alert" className="feedback error">{error}</p>}
      <div className="nav-account">{account && <div className="nav-popover"><Link href={user ? "/settings" : "/auth"} onClick={close}><User size={16}/>{user ? "Edit profile" : "Sign in / Register"}</Link><button onClick={() => { clearSession(); setAccount(false); router.push("/auth"); }}><LogOut size={16}/>Log out</button></div>}<button aria-label="Account menu" aria-expanded={account} onClick={() => setAccount(!account)}><span className="nav-avatar">{name[0]}</span><span>{name}<small>{user ? "Local demo account" : "Demo mode"}</small></span><MoreHorizontal size={17}/></button></div>
    </aside><SearchModal open={search} onClose={() => setSearch(false)}/>
  </>;
}
