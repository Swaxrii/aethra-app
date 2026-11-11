"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ArrowUpRight, Pencil, Trash2, MessageSquare } from "lucide-react";
import { api, changed } from "@/lib/api";
export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const refresh = () =>
      api("/api/conversations")
        .then((data) => {
          setProjects(data.conversations);
          setHasMore(data.hasMore);
          setError("");
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    const timer = setTimeout(refresh, 0);
    window.addEventListener("aethra-projects", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("aethra-projects", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await api(`/api/conversations?offset=${projects.length}`);
      setProjects((current) => [...current, ...data.conversations]);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };
  const rename = async (id) => {
    try {
      if (!title.trim()) return;
      await api(`/api/conversations/${id}`, { method: "PATCH", body: JSON.stringify({ title }) });
      changed();
      setEditing(null);
    } catch {
      setError("Could not save this name.");
    }
  };
  const remove = async (id) => {
    if (!confirm("Delete this conversation? This cannot be undone.")) return;
    try {
      await api(`/api/conversations/${id}`, { method: "DELETE" });
      changed();
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
            <p>Revisit your conversations. Your conversations are saved to your account.</p>
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
                        {p.messageCount} messages · {p.model || "Aethra 1.0"}
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
          ) : loading ? (
            <p role="status" className="feedback">
              Loading conversations…
            </p>
          ) : (
            <div className="empty-conversations">
              <MessageSquare size={32} />
              <h2>No conversations yet.</h2>
              <p>Start a conversation to keep your ideas and responses together.</p>
              <Link className="ui-button" href="/">
                Start a conversation
              </Link>
            </div>
          )}
        </div>
        {hasMore && (
          <button className="ui-button secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more conversations"}
          </button>
        )}
      </div>
    </section>
  );
}
