import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { users } from "@/server/schema";
import { cleanupExpired, createSession, limit, publicUser, setSessionCookie } from "@/server/auth";
import { body, clientAddress, error, json, safeFailure, validOrigin } from "@/server/http";

const DUMMY_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$sjECtuaAgQuJX+6oVqPlYg$aGnXv3Xe1SsqAXUdc8LbWuj4ZAiPf/NvIuXi6tuq640";

export async function POST(req) {
  if (!validOrigin(req)) return error("Invalid origin", 403);
  let data;
  try {
    data = await body(req);
  } catch {
    return error("Invalid request", 400);
  }
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (
    !/^\S+@\S+\.\S+$/.test(email) ||
    email.length > 254 ||
    typeof data.password !== "string" ||
    data.password.length < 1 ||
    data.password.length > 128
  )
    return error("Invalid credentials", 401);
  try {
    if (!(await limit("login-ip", clientAddress(req), 40))) return error("Try again later", 429);
    if (!(await limit("login", email))) return error("Try again later", 429);
    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const validPassword = await argon2.verify(user?.passwordHash || DUMMY_HASH, data.password);
    if (!user || user.status !== "active" || !validPassword)
      return error("Invalid credentials", 401);
    await cleanupExpired().catch(() => {});
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
