"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, changed } from "@/lib/api";
import AethraMark from "@/components/AethraMark";
import Select from "@/components/Select";
import { ArrowUp, ArrowUpRight } from "lucide-react";

const SUGGESTIONS = [
  {
    title: "Brainstorm ideas",
    prompt:
      "Brainstorm ideas for a modern web application, focusing on the architecture and UI design.",
  },
  {
    title: "Design system",
    prompt: "Help me create a design system with reusable components and design tokens.",
  },
  {
    title: "Generate code",
    prompt: "Generate code for full-stack features and explain the implementation step by step.",
  },
  {
    title: "Debug & test",
    prompt: "Help me debug and test my application, focusing on performance and quality assurance.",
  },
];

export default function Home() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [model, setModel] = useState("Aethra 1.0");

  useEffect(() => {
    let active = true;
    Promise.all([api("/api/auth/session"), api("/api/preferences")])
      .then(([session, settings]) => {
        if (!active) return;
        setFirstName(session.user.firstName || "");
        setModel(settings.preferences.model);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSend = async () => {
    if (!value.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const { conversation: project } = await api("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ prompt: value.trim(), model }),
      });
      changed();
      router.push(`/chat/${project.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };
  const openSuggestion = async (suggestion) => {
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const { conversation: project } = await api("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ prompt: suggestion.prompt, model }),
      });
      changed();
      router.push(`/chat/${project.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="workspace-home">
      <div className="workspace-home-inner">
        <div className="cinema-brand">
          <AethraMark size={58} />
        </div>
        <h1>Where shall we begin{firstName ? `, ${firstName}` : ""}?</h1>
        <form
          className="workspace-composer"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <label className="sr-only" htmlFor="workspace-prompt">
            Message Aethra
          </label>
          <textarea
            id="workspace-prompt"
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Bring your next idea to light…"
          />
          <div className="workspace-composer-actions">
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
                } catch {
                  setError("Model preference could not be saved.");
                }
              }}
            />
            <button
              type="submit"
              disabled={!value.trim() || sending}
              aria-label="Send message"
              aria-busy={sending}
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </form>
        {error && (
          <p role="alert" className="feedback error">
            {error}
          </p>
        )}
        <div className="cinema-suggestions">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.title}
              onClick={() => openSuggestion(suggestion)}
              disabled={sending}
            >
              {suggestion.title}
              <ArrowUpRight size={13} />
            </button>
          ))}
        </div>
        <p className="cinema-disclaimer">
          Conversations are saved to your account. Responses are scripted demonstrations.
        </p>
      </div>
    </section>
  );
}
