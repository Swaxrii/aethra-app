"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/store";
import { getSession, getModelPref, setModelPref } from "@/lib/session";
import AethraMark from "@/components/AethraMark";
import { ArrowUp, ArrowUpRight } from "lucide-react";

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
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [model, setModel] = useState("Aethra 1.0");

  useEffect(() => {
    const timer = setTimeout(() => { const user = getSession(); setModel(getModelPref() || "Aethra 1.0"); if (user) setFirstName(user.firstName || user.email.split("@")[0]); }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    if (!value.trim()) return;
    try { const project = createProject(value.trim()); router.push(`/chat/${project.id}`); } catch (err) { setError(err.message); }
  };
  const openSuggestion = (suggestion) => {
    try { const project = createProject(suggestion.prompt); router.push(`/chat/${project.id}`); } catch (err) { setError(err.message); }
  };

  return (
    <section className="workspace-home">
      <div className="workspace-home-inner">
        <div className="cinema-brand"><AethraMark size={58}/><span>A E T H R A</span></div>
        <p className="cinema-overline">A LITTLE SPACE. A WORLD OF POSSIBILITIES.</p>
        <h1>Where shall we begin{firstName ? `, ${firstName}` : ""}?</h1>
        <p className="workspace-lead">Think clearly. Explore freely. Make something meaningful.</p>
        <form className="workspace-composer" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <label className="sr-only" htmlFor="workspace-prompt">Message Aethra</label>
          <textarea id="workspace-prompt" rows={3} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Bring your next idea to light…" />
          <div className="workspace-composer-actions"><label className="sr-only" htmlFor="home-model">Model style</label><select id="home-model" value={model} onChange={(e)=>{setModel(e.target.value);setModelPref(e.target.value);}}><option>Aethra 1.0</option><option>Aethra 1.1</option></select><span className="composer-note">LOCAL DEMO</span><button type="submit" disabled={!value.trim()} aria-label="Send message"><ArrowUp size={20}/></button></div>
        </form>
        {error && <p role="alert" className="feedback error">{error}</p>}
        <div className="cinema-suggestions">{SUGGESTIONS.map((suggestion) => <button key={suggestion.title} onClick={() => openSuggestion(suggestion)}>{suggestion.title}<ArrowUpRight size={13}/></button>)}</div>
        <p className="cinema-disclaimer">A private browser workspace. Responses are local demonstrations, not connected AI.</p>
      </div>
    </section>
  );
}
