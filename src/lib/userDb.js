import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const FILE = path.join(process.cwd(), "data", "users.json");

async function readUsers() {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeUsers(users) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(users, null, 2), "utf8");
}

export async function findUserByEmail(email) {
  const users = await readUsers();
  return users.find((u) => u.email === email.toLowerCase()) || null;
}

export async function registerUser({ firstName, lastName, email, password }) {
  const users = await readUsers();
  const normalized = email.toLowerCase();
  if (users.some((u) => u.email === normalized)) {
    return { error: "Email already registered" };
  }
  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    email: normalized,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeUsers(users);
  return { user };
}

export async function verifyCredentials(email, password) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return user;
}
