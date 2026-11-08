"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, MessageSquare, ArrowUpRight } from "lucide-react";
import { readConversations } from "@/lib/localConversations";
export default function SearchModal({ open, onClose }) {
  const dialog = useRef(null);
  const input = useRef(null);
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) {
      dialog.current?.close();
      return;
    }
    const node = dialog.current;
    const previous = document.activeElement;
    node?.showModal();
    const refresh = () => {
      try {
        setProjects(readConversations());
        setError("");
      } catch (err) {
        setProjects([]);
        setError(err.message);
      }
    };
    window.addEventListener("aethra-projects", refresh);
    window.addEventListener("storage", refresh);
    const timer = setTimeout(() => {
      setQuery("");
      refresh();
      input.current?.focus();
    }, 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("aethra-projects", refresh);
      window.removeEventListener("storage", refresh);
      node?.close();
      previous?.focus();
    };
  }, [open]);
  const results = projects.filter((p) =>
    [p.title, ...(p.messages || []).map((m) => m.text)]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
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
        <Search size={19} />
        <h2 id="search-title">Find a conversation</h2>
        <button className="icon-button" onClick={onClose} aria-label="Close search">
          <X size={18} />
        </button>
      </div>
      <input
        ref={input}
        className="search-input"
        aria-label="Search conversations"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search titles and messages…"
      />
      {error && (
        <p role="alert" className="feedback error">
          {error}
        </p>
      )}
      <div className="search-results">
        {results.length ? (
          results.map((p) => (
            <Link key={p.id} href={`/chat/${p.id}`} onClick={onClose}>
              <MessageSquare size={17} />
              <span>{p.title}</span>
              <ArrowUpRight size={15} />
            </Link>
          ))
        ) : (
          <p>No conversations found. Try another phrase.</p>
        )}
      </div>
      <footer>Tab to move through results · Enter to open · Esc to close</footer>
    </dialog>
  );
}
