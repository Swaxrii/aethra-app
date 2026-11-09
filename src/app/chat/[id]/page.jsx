"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Copy, Download, Send, Square, MessageSquare } from "lucide-react";
import { projectToHTML } from "@/lib/store";
import { api, changed } from "@/lib/api";
import Markdown from "@/components/Markdown";
import Select from "@/components/Select";
export default function ChatPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("Aethra 1.0");
  const [streaming, setStreaming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const abort = useRef(null);
  const generated = useRef(0);
  const scroll = useRef(null);
  useEffect(() => {
    generated.current = 0;
    let active = true;
    api(`/api/conversations/${id}`)
      .then((data) => {
        if (!active) return;
        setProject(data.conversation);
        setModel(data.conversation.model);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      abort.current?.abort();
    };
  }, [id]);
  useEffect(() => {
    const refresh = () =>
      api(`/api/conversations/${id}`)
        .then((data) => setProject(data.conversation))
        .catch(() => {});
    window.addEventListener("aethra-projects", refresh);
    return () => window.removeEventListener("aethra-projects", refresh);
  }, [id]);
  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [project]);
  const count = project?.messages.length || 0;
  const lastRole = project?.messages.at(-1)?.role;
  useEffect(() => {
    if (lastRole !== "user" || count <= generated.current) return;
    generated.current = count;
    const controller = new AbortController();
    abort.current = controller;
    const timer = setTimeout(async () => {
      setStreaming(true);
      setError("");
      try {
        const data = await api(`/api/conversations/${id}/reply`, {
          method: "POST",
          body: "{}",
          signal: controller.signal,
        });
        setProject(data.conversation);
        changed();
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Could not create the response.");
      } finally {
        setStreaming(false);
      }
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [id, count, lastRole, retryKey]);
  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || streaming || saving || lastRole === "user") return;
    setSaving(true);
    try {
      const data = await api(`/api/conversations/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: input.trim(), role: "user", model }),
      });
      setInput("");
      setProject(data.conversation);
      changed();
    } catch (err) {
      setError(err.message || "Could not save your message.");
    } finally {
      setSaving(false);
    }
  };
  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("Message copied.");
    } catch {
      setError("Copy was unavailable. Select and copy the text instead.");
    }
  };
  const download = () => {
    const blob = new Blob([projectToHTML(project, "You")], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aethra-conversation.html";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  if (loading)
    return (
      <p role="status" className="p-8 text-white/70">
        Loading conversation…
      </p>
    );
  if (!project)
    return (
      <div className="empty-conversations">
        <MessageSquare size={32} />
        <h1>Conversation not found</h1>
        <Link href="/" className="ui-button">
          Start a new conversation
        </Link>
      </div>
    );
  return (
    <section className="chat-shell">
      <header className="chat-header">
        <div>
          <span className="eyebrow">Conversation</span>
          <h1>{project.title}</h1>
        </div>
        <button className="ui-button secondary" onClick={download}>
          <Download size={16} />
          Export HTML
        </button>
      </header>
      <div className="chat-messages" ref={scroll}>
        <div className="chat-reading">
          {project.messages.map((m, i) => (
            <article key={i} className={`chat-message ${m.role}`}>
              <div className="message-label">
                {m.role === "user" ? "You" : "Aethra · local demo"}
              </div>
              <div className="message-body">
                {m.role === "ai" ? <Markdown text={m.text} /> : <p>{m.text}</p>}
              </div>
              <button
                className="message-copy"
                aria-label={`Copy message ${i + 1}`}
                onClick={() => copy(m.text)}
              >
                <Copy size={14} />
                Copy
              </button>
            </article>
          ))}
          {streaming && (
            <article className="chat-message ai">
              <div className="message-label">Aethra · local demo</div>
              <Markdown text="Preparing a local response…" />
            </article>
          )}
          {error && (
            <div className="feedback error" role="alert">
              {error}
              {lastRole === "user" && !streaming && (
                <button
                  className="ui-button secondary"
                  type="button"
                  onClick={() => {
                    generated.current = 0;
                    setRetryKey((value) => value + 1);
                  }}
                >
                  Retry response
                </button>
              )}
            </div>
          )}
          {status && (
            <p role="status" className="text-xs text-white/70">
              {status}
            </p>
          )}
        </div>
      </div>
      <footer className="chat-composer">
        <form onSubmit={send}>
          <label className="sr-only" htmlFor="message">
            Message Aethra
          </label>
          <textarea
            id="message"
            rows="2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Continue the conversation…"
          />
          <div>
            <Select
              label="Model style"
              value={model}
              options={["Aethra 1.0", "Aethra 1.1"]}
              onChange={async (next) => {
                try {
                  const result = await api("/api/preferences");
                  await api("/api/preferences", {
                    method: "PUT",
                    body: JSON.stringify({ ...result.preferences, model: next }),
                  });
                  setModel(next);
                } catch (err) {
                  setError(err.message);
                }
              }}
            />
            {streaming ? (
              <button
                className="ui-button secondary chat-composer-button"
                type="button"
                onClick={() => {
                  abort.current?.abort();
                  setError("Response stopped. You can retry.");
                }}
              >
                <Square size={15} />
                Stop
              </button>
            ) : (
              <button
                className="ui-button chat-composer-button"
                disabled={!input.trim() || saving || lastRole === "user"}
              >
                <Send size={15} />
                Send
              </button>
            )}
          </div>
        </form>
        <p>Responses are demonstrations. No AI service is connected.</p>
      </footer>
    </section>
  );
}
