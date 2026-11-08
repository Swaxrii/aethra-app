const PROJECTS_KEY = "aethra_projects";

export function readConversations() {
  if (typeof window === "undefined") return [];
  let raw;
  try {
    raw = window.localStorage.getItem(PROJECTS_KEY);
  } catch {
    throw new Error("Browser storage is unavailable. Your conversations have not been changed.");
  }
  if (raw === null) return [];
  let projects;
  try {
    projects = JSON.parse(raw);
  } catch {
    throw new Error("Conversation data could not be read. It has not been overwritten.");
  }
  if (!Array.isArray(projects) || projects.some((project) => !project || typeof project.id !== "string" || !Array.isArray(project.messages))) {
    throw new Error("Conversation data has an unsupported format. It has not been overwritten.");
  }
  return projects;
}

export function writeConversations(projects) {
  if (typeof window === "undefined") throw new Error("Browser storage is unavailable.");
  readConversations();
  try {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    throw new Error("Could not save conversations. Your existing data has not been changed.");
  }
  window.dispatchEvent(new CustomEvent("aethra-projects"));
}

export function exportConversationBackup() {
  return JSON.stringify({ app: "aethra", version: 1, conversations: readConversations() }, null, 2);
}
