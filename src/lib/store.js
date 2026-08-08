const KEY = "aethra_projects";

export function loadProjects() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function saveProjects(list) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("aethra-projects"));
}

export function createProject(prompt) {
  const model = "Aethra 1.0";
  const project = {
    id: "p-" + Date.now(),
    title: prompt,
    model,
    messages: [
      { role: "user", text: prompt },
      { role: "ai", text: aiReply(prompt, model) },
    ],
  };
  const list = loadProjects();
  list.unshift(project);
  saveProjects(list);
  return project;
}

export function getProject(id) {
  return loadProjects().find((p) => p.id === id);
}

export function addMessage(id, text, model) {
  const list = loadProjects();
  const project = list.find((p) => p.id === id);
  if (!project) return;
  project.model = model;
  project.messages.push({ role: "user", text });
  project.messages.push({ role: "ai", text: aiReply(text, model) });
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

export function aiReply(prompt, model) {
  const t = prompt.toLowerCase();
  if (t.includes("build") || t.includes("landing") || t.includes("page")) return "I'll help you build that. Start with a clean component structure and a mobile-first layout, then layer in the styling with Tailwind. I can scaffold the sections one by one as you need them.";
  if (t.includes("color") || t.includes("palette") || t.includes("theme")) return "For a modern dark UI I'd go with a deep charcoal background, a single vivid accent for interactive elements, and white with varying opacity for text hierarchy. That keeps contrast high and the interface easy on the eyes.";
  if (t.includes("code") || t.includes("function") || t.includes("api")) return "Sure. I'd break this into a small utility module with clear function names and error handling, then test each path with a few edge cases. Send me the exact inputs and I'll write the implementation.";
  if (t.includes("bug") || t.includes("error") || t.includes("debug")) return "Let's debug it step by step. Reproduce the error, check the stack trace, and narrow it down to the smallest failing case. Once you share the relevant code and the error message, I can pinpoint the cause.";
  if (t.includes("test")) return "Good idea to add tests early. I'd write a few focused tests covering the main scenarios and edge cases, then run them to make sure everything passes before moving on.";
  return `Thanks for the prompt. Here's how I'd approach "${prompt}" — I'll break it into small, clear steps and give you practical guidance in plain English as we go.`;
}