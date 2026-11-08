import { readConversations, writeConversations } from "./localConversations";
const KEY = "aethra_projects";
const DAY = 24 * 60 * 60 * 1000;

export function loadProjects() {
  if (typeof window === "undefined") return [];
  try {
    return readConversations();
  } catch {
    return [];
  }
}

function saveProjects(list) {
  if (typeof window === "undefined") return;
  writeConversations(list);
}

function lastActivity(p) {
  return p.lastAccessed || p.createdAt || Date.now();
}

function readModelPref() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("aethra_model");
  } catch {
    return null;
  }
}

export function isRecent(p) {
  return Date.now() - lastActivity(p) < DAY;
}

export function getRecentProjects() {
  return loadProjects()
    .filter(isRecent)
    .sort((a, b) => lastActivity(b) - lastActivity(a));
}

export function createProject(prompt) {
  const model = readModelPref() || "Aethra 1.0";
  const now = Date.now();
  const project = {
    id: "p-" + now,
    title: prompt,
    model,
    createdAt: now,
    lastAccessed: now,
    messages: [{ role: "user", text: prompt }],
  };
  const list = loadProjects();
  list.unshift(project);
  saveProjects(list);
  return project;
}

export function getProject(id) {
  return loadProjects().find((p) => p.id === id);
}

export function touchProject(id) {
  const list = loadProjects();
  const project = list.find((p) => p.id === id);
  if (!project) return;
  project.lastAccessed = Date.now();
  saveProjects(list);
}

export function addMessage(id, text, model) {
  const list = loadProjects();
  const project = list.find((p) => p.id === id);
  if (!project) return;
  project.model = model;
  project.messages.push({ role: "user", text });
  saveProjects(list);
}

export function addAIMessage(id, text) {
  const list = loadProjects();
  const project = list.find((p) => p.id === id);
  if (!project) return;
  project.messages.push({ role: "ai", text });
  saveProjects(list);
}

export function renameProject(id, title) {
  const list = loadProjects();
  const project = list.find((p) => p.id === id);
  if (!project || !title.trim()) return;
  project.title = title.trim();
  saveProjects(list);
}

export function deleteProject(id) {
  const list = loadProjects().filter((p) => p.id !== id);
  saveProjects(list);
}

export function projectToJSON(project) {
  return JSON.stringify(
    {
      app: "aethra",
      version: 1,
      title: project.title,
      model: project.model,
      createdAt: project.createdAt,
      messages: project.messages,
    },
    null,
    2,
  );
}

export function importProject(payload) {
  if (!payload || !Array.isArray(payload.messages)) throw new Error("Invalid conversation file");
  const now = Date.now();
  const project = {
    id: "p-" + now,
    title: (payload.title && String(payload.title).trim()) || "Imported conversation",
    model: (payload.model && String(payload.model)) || "Aethra 1.0",
    createdAt: payload.createdAt || now,
    lastAccessed: now,
    messages: payload.messages.map((m) => ({
      role: m.role === "user" ? "user" : "ai",
      text: String(m.text || ""),
    })),
  };
  const list = loadProjects();
  list.unshift(project);
  saveProjects(list);
  return project;
}

export function projectToHTML(project, userName) {
  const rows = (project.messages || [])
    .map((m) => {
      const role = m.role === "user" ? userName || "You" : "Aethra AI";
      const classRole = m.role === "user" ? "user" : "ai";
      return `<div class="msg ${classRole}">
        <div class="meta">${escapeHTML(role)}</div>
        <p>${escapeHTML(m.text)}</p>
      </div>`;
    })
    .join("\n      ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHTML(project.title)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 56px 24px;
        background: #0b0c0f;
        color: #e9e9ee;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        line-height: 1.6;
      }
      .wrap { max-width: 720px; margin: 0 auto; }
      .brand { color: #d7d8df; font-size: 11px; font-weight: 700; letter-spacing: .22em; }
      header { padding: 28px 0; margin-bottom: 28px; border-bottom: 1px solid #ffffff1a; }
      h1 { font-size: clamp(24px, 4vw, 34px); line-height: 1.2; margin: 0 0 10px; font-weight: 600; overflow-wrap: anywhere; }
      .model { color: #a2a5b0; font-size: 13px; }
      .msg { margin: 0 0 26px; }
      .msg.user p { background: #191a20; border: 1px solid #ffffff14; border-radius: 10px; padding: 14px 16px; }
      .meta { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #a2a5b0; margin-bottom: 9px; }
      .msg p { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 15px; line-height: 1.75; }
      @media (max-width: 480px) { body { padding: 28px 18px; } header { padding: 22px 0; } }
      @media print { body { background: #fff; color: #111; padding: 0; } header { border-color: #ccc; } .brand, .model, .meta { color: #555; } .msg.user p { background: #f5f5f5; border-color: #ddd; } .msg { break-inside: avoid; } }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="brand">AETHRA</div>
      <header>
        <h1>${escapeHTML(project.title)}</h1>
        <div class="model">Conversation · ${escapeHTML(project.model || "Aethra AI")}</div>
      </header>
      ${rows}
    </div>
  </body>
</html>`;
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readPref(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function adjustByTemperature(text, temperature) {
  const creative = [
    " I'd also experiment a little here — try a couple of variations and keep whichever feels most intuitive.",
    " Along the way, don't be afraid to play with the details until it feels right.",
    " And if you want, we can even take a more playful angle on it.",
  ];
  const focused = [
    " Keep it simple and consistent with the rest of the UI.",
    " Stick to a focused, minimal approach.",
    " Avoid over-complicating it — clarity wins.",
  ];
  if (temperature >= 1.1) return text + creative[Math.floor(Math.random() * creative.length)];
  if (temperature <= 0.4) return text + focused[Math.floor(Math.random() * focused.length)];
  return text;
}

export function aiReply(prompt, model) {
  const t = prompt.toLowerCase();
  const temperature = parseFloat(readPref("aethra_temperature", "0.7")) || 0.7;
  const length = readPref("aethra_response_length", "Balanced");

  const topics = {
    build: [
      "I'll help you build that. Start with a clean component structure and a mobile-first layout, then layer in the styling with Tailwind.",
      "I'll help you build that with a clean component structure. After a solid mobile-first layout, I'll add Tailwind styling, then refine the spacing, states, and responsiveness section by section.",
      "Let's build it properly. Start with a clean component structure and a mobile-first layout, then layer in the styling with Tailwind. From there we'll divide it into independent sections, review each one's states and edge cases, and iterate until the result feels polished on every breakpoint.",
    ],
    color: [
      "For a modern dark UI, use a deep charcoal background, a single vivid accent, and white in varying opacity for hierarchy.",
      "For a modern dark UI I'd reach for a deep charcoal background, one vivid accent color for interactive elements, and white in varying opacity to build text hierarchy. That keeps contrast strong and the interface easy on the eyes.",
      "For a modern dark UI, a deep charcoal background gives you a calm canvas. Pick a single vivid accent and apply it sparingly — buttons, links, active states — so it reads as intentional. Use white in varying opacity to stack text hierarchy, and test the palette in both normal and low-light conditions before committing.",
    ],
    code: [
      "I'd break this into a small utility module with clear function names and solid error handling.",
      "I'd break this into a small, focused module with clear function names and error handling, then cover each path with a couple of edge-case tests.",
      "I'd structure this as a small utility module with clear function names and consistent error handling. Separate the core logic from side effects, keep every function single-purpose, and then cover each path — happy case, empty input, and failures — with focused tests so refactoring stays safe.",
    ],
    bug: [
      "Reproduce the error, check the stack trace, and narrow it to the smallest failing case.",
      "Let's debug it step by step: reproduce the error, read the stack trace, and narrow it down to the smallest failing case.",
      "Let's debug it methodically. Reproduce the error reliably, then read the stack trace to locate the failing layer. Add logging around the suspicious boundary and bisect the inputs until you reach the smallest failing case. Once you share the code and the exact error message, I can pinpoint the cause.",
    ],
    test: [
      "Write a few focused tests covering the main scenarios and edge cases.",
      "I'd write focused tests covering the main scenarios and key edge cases, then run them to confirm everything passes.",
      "I'd write focused tests early, covering the main scenarios along with the important edge cases — empty inputs, failures, and boundary values. Keep each test isolated and descriptive, then run the suite to confirm everything passes before moving on.",
    ],
  };

  const topic = Object.keys(topics).find((k) => t.includes(k));
  let reply;
  if (topic) {
    const tier = length === "Short" ? 0 : length === "Detailed" ? 2 : 1;
    reply = topics[topic][tier];
  } else {
    reply = `Thanks for the prompt. Here's how I'd approach "${prompt}" — I'll break it into small, clear steps and give you practical guidance in plain English as we go.`;
  }

  return adjustByTemperature(reply, temperature);
}
