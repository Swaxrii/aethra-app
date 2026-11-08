"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/store";
import { getSession } from "@/lib/session";

const SUGGESTIONS = [
  {
    title: "Brainstorm ideas",
    sub: "Architecture & UI design",
    prompt: "Brainstorm ideas for a modern web application, focusing on the architecture and UI design.",
  },
  {
    title: "Design system",
    sub: "Components & tokens",
    prompt: "Help me create a design system with reusable components and design tokens.",
  },
  {
    title: "Generate code",
    sub: "Full-stack features",
    prompt: "Generate code for full-stack features and explain the implementation step by step.",
  },
  {
    title: "Debug & test",
    sub: "Performance & QA",
    prompt: "Help me debug and test my application, focusing on performance and quality assurance.",
  },
];

export default function Home() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const user = getSession();
    if (user) setFirstName(user.firstName || user.email.split("@")[0]);
  }, []);

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    const project = createProject(text);
    setValue("");
    router.push(`/chat/${project.id}`);
  };

  const openSuggestion = (s) => {
    const project = createProject(s.prompt);
    router.push(`/chat/${project.id}`);
  };

  return (
    <section className="workspace-home">
      <div className="workspace-home-inner">
        <div className="workspace-kicker"><span /> AETHRA WORKSPACE <span className="workspace-edition">01 / THINKING SPACE</span></div>
        <h1>Make room<br /><em>for better ideas.</em></h1>
        <p className="workspace-lead">Hello{firstName ? `, ${firstName}` : ""}. What would you like to explore today?</p>
        <form className="workspace-composer" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <label htmlFor="workspace-prompt">START A CONVERSATION</label>
          <textarea id="workspace-prompt" rows={3} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ask a question or describe what you're working on..." />
          <div className="workspace-composer-actions"><span>Write freely. Start anywhere.</span><button type="submit" disabled={!value.trim()}>Start conversation <span aria-hidden="true">→</span></button></div>
        </form>
        <div className="workspace-ideas"><div className="workspace-ideas-heading"><span>NEED A STARTING POINT?</span><span>SELECT AN IDEA ↗</span></div><div className="workspace-ideas-grid">{SUGGESTIONS.map((s, i) => <button key={s.title} onClick={() => openSuggestion(s)}><span className="workspace-number">0{i + 1}</span><span><strong>{s.title}</strong><small>{s.sub}</small></span><span className="workspace-arrow" aria-hidden="true">↗</span></button>)}</div></div>
      </div>
    </section>
  );
}
