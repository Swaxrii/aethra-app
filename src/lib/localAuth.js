const KEY = "aethra_demo_accounts";
function accounts() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  const value = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error("Local account data is invalid; it has not been changed.");
  return value;
}
async function digest(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (n) => n.toString(16).padStart(2, "0")).join("");
}
function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}
export async function registerDemo({ firstName, lastName, email, password }) {
  const normalized = email.trim().toLowerCase();
  if (!firstName.trim() || !lastName.trim() || !/^\S+@\S+\.\S+$/.test(normalized) || password.length < 6) throw new Error("Enter a name, valid email, and demo password of at least 6 characters.");
  const list = accounts();
  if (list.some((u) => u.email === normalized)) throw new Error("This email is already registered in this browser.");
  const user = { id: crypto.randomUUID(), firstName: firstName.trim(), lastName: lastName.trim(), email: normalized, passwordHash: await digest(password) };
  list.push(user);
  localStorage.setItem(KEY, JSON.stringify(list));
  return publicUser(user);
}
export async function loginDemo(email, password) {
  const user = accounts().find((u) => u.email === email.trim().toLowerCase());
  if (!user || user.passwordHash !== await digest(password)) throw new Error("Invalid demo email or password.");
  return publicUser(user);
}
export async function updateDemo(id, { firstName, lastName, email, password }) {
  const list = accounts();
  const index = list.findIndex((u) => u.id === id);
  if (index < 0) throw new Error("This older session is not a local demo account. Register a new demo account to edit the profile.");
  const normalized = email.trim().toLowerCase();
  if (!firstName.trim() || !/^\S+@\S+\.\S+$/.test(normalized)) throw new Error("Enter a name and valid email.");
  if (list.some((u) => u.id !== id && u.email === normalized)) throw new Error("This email is already registered.");
  if (password && password.length < 6) throw new Error("Demo password must have at least 6 characters.");
  list[index] = { ...list[index], firstName: firstName.trim(), lastName: lastName.trim(), email: normalized, ...(password ? { passwordHash: await digest(password) } : {}) };
  localStorage.setItem(KEY, JSON.stringify(list));
  return publicUser(list[index]);
}
