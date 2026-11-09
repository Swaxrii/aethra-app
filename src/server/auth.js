import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt, isNull, ne, sql } from "drizzle-orm";
import { getDb } from "./db";
import { sessions, users, rateLimits } from "./schema";

const COOKIE = "aethra_session";
const TTL = 1000 * 60 * 60 * 24 * 14;

export function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function publicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    lastActivityAt: user.lastActivityAt,
    updatedAt: user.updatedAt,
    status: user.status,
  };
}

export async function createSession(userId, db = getDb()) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL);
  await db.insert(sessions).values({ userId, tokenHash: hash(token), expiresAt });
  return { token, expiresAt };
}

export async function setSessionCookie({ token, expiresAt }) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const rows = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, hash(token)),
        gt(sessions.expiresAt, new Date()),
        isNull(sessions.revokedAt),
        eq(users.status, "active"),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (Date.now() - row.session.lastUsedAt.getTime() > 5 * 60 * 1000) {
    await db
      .update(sessions)
      .set({ lastUsedAt: new Date() })
      .where(eq(sessions.id, row.session.id));
  }
  if (!row.user.lastActivityAt || Date.now() - row.user.lastActivityAt.getTime() > 15 * 60 * 1000) {
    await db.update(users).set({ lastActivityAt: new Date() }).where(eq(users.id, row.user.id));
  }
  return row.user;
}

export async function revokeSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (token)
    await getDb()
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.tokenHash, hash(token)));
  (await cookies()).delete(COOKIE);
}

export async function revokeOtherSessions(userId) {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return;
  await getDb()
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(sessions.userId, userId),
        ne(sessions.tokenHash, hash(token)),
        isNull(sessions.revokedAt),
      ),
    );
}

export async function limit(action, identifier, max = 8) {
  const key = `${action}:${hash(identifier)}`;
  const rows = await getDb().execute(
    sql`INSERT INTO rate_limits (key, hits, reset_at) VALUES (${key}, 1, now() + interval '15 minutes') ON CONFLICT (key) DO UPDATE SET hits = CASE WHEN rate_limits.reset_at < now() THEN 1 ELSE rate_limits.hits + 1 END, reset_at = CASE WHEN rate_limits.reset_at < now() THEN now() + interval '15 minutes' ELSE rate_limits.reset_at END RETURNING hits`,
  );
  return Number(rows.rows[0].hits) <= max;
}
