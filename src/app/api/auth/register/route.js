import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { users, preferences } from "@/server/schema";
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
  const firstName = typeof data.firstName === "string" ? data.firstName.trim() : "";
  const lastName = typeof data.lastName === "string" ? data.lastName.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const password = data.password;
  if (
    !firstName ||
    firstName.length > 100 ||
    !lastName ||
    lastName.length > 100 ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    email.length > 254 ||
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 128
  )
    return error("Enter a valid name, email, and password of at least 12 characters", 400);
  try {
    if (!(await limit("register", email, 5))) return error("Try again later", 429);
    const db = getDb();
    if (
      (await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)).length
    )
      return error("Email already registered", 409);
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const { user, session } = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(users)
        .values({ firstName, lastName, email, passwordHash })
        .returning();
      await tx.insert(preferences).values({ userId: created.id });
      return { user: created, session: await createSession(created.id, tx) };
    });
    await setSessionCookie(session);
    return json({ user: publicUser(user) }, 201);
  } catch (err) {
    if (err.code === "23505") return error("Email already registered", 409);
    return safeFailure();
  }
}
