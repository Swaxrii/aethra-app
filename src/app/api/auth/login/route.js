import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { users } from "@/server/schema";
import { createSession, limit, publicUser, setSessionCookie } from "@/server/auth";
import { body, error, json, safeFailure, validOrigin } from "@/server/http";

export async function POST(req) {
  if (!validOrigin(req)) return error("Invalid origin", 403);
  let data;
  try {
    data = await body(req);
  } catch {
    return error("Invalid request", 400);
  }
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (!/^\S+@\S+\.\S+$/.test(email) || typeof data.password !== "string")
    return error("Invalid credentials", 401);
  try {
    if (!(await limit("login", email))) return error("Try again later", 429);
    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (
      !user ||
      user.status !== "active" ||
      !(await argon2.verify(user.passwordHash, data.password))
    )
      return error("Invalid credentials", 401);
    const now = new Date();
    const session = await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ lastLoginAt: now, lastActivityAt: now })
        .where(eq(users.id, user.id));
      return createSession(user.id, tx);
    });
    await setSessionCookie(session);
    return json({ user: publicUser({ ...user, lastLoginAt: now, lastActivityAt: now }) });
  } catch {
    return safeFailure();
  }
}
