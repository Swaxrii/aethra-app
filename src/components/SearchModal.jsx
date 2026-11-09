"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, MessageSquare, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";
export default function SearchModal({ open, onClose }) {
  const dialog = useRef(null);
  const input = useRef(null);
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const currentQuery = useRef("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) {
      dialog.current?.close();
      return;
    }
    const node = dialog.current;
    const previous = document.activeElement;
    node?.showModal();
    const timer = setTimeout(() => {
      setQuery("");
      input.current?.focus();
    }, 0);
    return () => {
      clearTimeout(timer);
      node?.close();
      previous?.focus();
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    currentQuery.current = query;
    let active = true;
    const timer = setTimeout(
      async () => {
        try {
          const result = await api(`/api/conversations?q=${encodeURIComponent(query.trim())}`);
          if (active) {
            setProjects(result.conversations);
            setHasMore(result.hasMore);
            setError("");
          }
        } catch (err) {
          if (active) {
            setProjects([]);
            setHasMore(false);
            setError(err.message);
          }
        }
      },
      query ? 180 : 0,
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, query]);
  const loadMore = async () => {
    const search = query.trim();
    setLoadingMore(true);
    try {
      const result = await api(
        `/api/conversations?q=${encodeURIComponent(search)}&offset=${projects.length}`,
      );
      if (currentQuery.current === query) {
        setProjects((current) => [...current, ...result.conversations]);
        setHasMore(result.hasMore);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };
  const results = projects;
  return (
    <dialog
      ref={dialog}
      className="search-dialog"
      aria-labelledby="search-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
    >
      <div className="search-heading">
        <h2 id="search-title">Search</h2>
        <button className="icon-button" onClick={onClose} aria-label="Close search">
          <X size={16} />
        </button>
      </div>
      <div className="search-field">
        <Search size={17} aria-hidden="true" />
        <input
          ref={input}
          className="search-input"
          aria-label="Search conversations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations..."
        />
      </div>
      {error && (
        <p role="alert" className="feedback error">
          {error}
        </p>
      )}
      <div className="search-results">
        {results.length > 0 && (
          <p className="search-results-label">{query.trim() ? "Results" : "Recent"}</p>
        )}
        {results.length ? (
          results.map((p) => (
            <Link key={p.id} href={`/chat/${p.id}`} onClick={onClose}>
              <MessageSquare size={17} />
              <span>{p.title}</span>
              <ArrowUpRight size={15} />
            </Link>
          ))
        ) : (
          <p className="search-empty" role="status">
            {query.trim() ? "No conversations found." : "Your conversations will appear here."}
          </p>
        )}
        {hasMore && (
          <button className="ui-button secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "More results"}
          </button>
        )}
      </div>
    </dialog>
  );
}
