import argon2 from "argon2";
import { and, eq, ne } from "drizzle-orm";
import { currentUser, limit, publicUser, revokeOtherSessions } from "@/server/auth";
import { getDb } from "@/server/db";
import { users } from "@/server/schema";
import { body, error, json, safeFailure, validOrigin } from "@/server/http";

export async function PATCH(req) {
  if (!validOrigin(req)) return error("Invalid origin", 403);
  let data;
  try {
    data = await body(req);
  } catch {
    return error("Invalid request", 400);
  }
  try {
    const user = await currentUser();
    if (!user) return error("Unauthorized", 401);
    const firstName = typeof data.firstName === "string" ? data.firstName.trim() : "";
    const lastName = typeof data.lastName === "string" ? data.lastName.trim() : "";
    const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
    if (
      !firstName ||
      firstName.length > 100 ||
      lastName.length > 100 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      email.length > 254
    )
      return error("Invalid profile", 400);
    const sensitive = email !== user.email || Boolean(data.password);
    if (sensitive && !(await limit("profile", user.id, 8))) return error("Try again later", 429);
    if (
      sensitive &&
      (typeof data.currentPassword !== "string" ||
        !(await argon2.verify(user.passwordHash, data.currentPassword)))
    )
      return error("Current password required", 403);
    if (
      data.password &&
      (typeof data.password !== "string" || data.password.length < 12 || data.password.length > 128)
    )
      return error("Password must have 12 to 128 characters", 400);
    const db = getDb();
    if (
      (
        await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.email, email), ne(users.id, user.id)))
          .limit(1)
      ).length
    )
      return error("Email already registered", 409);
    const passwordHash = data.password
      ? await argon2.hash(data.password, { type: argon2.argon2id })
      : user.passwordHash;
    const [updated] = await db
      .update(users)
      .set({ firstName, lastName, email, passwordHash, updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();
    if (data.password) await revokeOtherSessions(user.id);
    return json({ user: publicUser(updated) });
  } catch (err) {
    if (err.code === "23505") return error("Email already registered", 409);
    return safeFailure();
  }
}
