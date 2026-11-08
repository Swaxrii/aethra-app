"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ArrowUpRight, Pencil, Trash2, MessageSquare } from "lucide-react";
import { loadProjects, renameProject, deleteProject } from "@/lib/store";
export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const refresh = () => setProjects(loadProjects());
    const timer = setTimeout(refresh, 0);
    window.addEventListener("aethra-projects", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("aethra-projects", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const rename = (id) => {
    try {
      if (!title.trim()) return;
      renameProject(id, title);
      setEditing(null);
    } catch {
      setError("Could not save this name.");
    }
  };
  const remove = (id) => {
    if (!confirm("Delete this conversation? This cannot be undone.")) return;
    try {
      deleteProject(id);
    } catch {
      setError("Could not delete this conversation.");
    }
  };
  return (
    <section className="page-shell">
      <div className="page-width">
        <header className="page-header">
          <div>
            <span className="eyebrow">Your workspace</span>
            <h1>Conversations</h1>
            <p>A place for every question, idea, and next step. Saved in this browser.</p>
          </div>
          <Link href="/" className="ui-button">
            <Plus size={16} />
            New conversation
          </Link>
        </header>
        {error && (
          <p role="alert" className="feedback error">
            {error}
          </p>
        )}
        <div className="conversation-list">
          {projects.length ? (
            projects.map((p) => (
              <article key={p.id}>
                <div className="conversation-symbol">
                  <MessageSquare size={20} />
                </div>
                <div className="conversation-info">
                  {editing === p.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        rename(p.id);
                      }}
                    >
                      <label className="sr-only" htmlFor="conversation-name">
                        Conversation name
                      </label>
                      <input
                        id="conversation-name"
                        autoFocus
                        className="ui-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setEditing(null);
                        }}
                      />
                      <button className="ui-button" type="submit">
                        Save
                      </button>
                    </form>
                  ) : (
                    <Link href={`/chat/${p.id}`}>
                      <h2>{p.title}</h2>
                      <p>
                        {p.messages.length} messages · {p.model || "Aethra 1.0"}
                      </p>
                    </Link>
                  )}
                </div>
                <div className="conversation-actions">
                  <button
                    className="icon-button"
                    aria-label={`Rename ${p.title}`}
                    onClick={() => {
                      setEditing(p.id);
                      setTitle(p.title);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Delete ${p.title}`}
                    onClick={() => remove(p.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                  <Link
                    className="icon-button"
                    href={`/chat/${p.id}`}
                    aria-label={`Open ${p.title}`}
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-conversations">
              <MessageSquare size={32} />
              <h2>Start with a question.</h2>
              <p>Your conversations will appear here.</p>
              <Link className="ui-button" href="/">
                Start a conversation
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
