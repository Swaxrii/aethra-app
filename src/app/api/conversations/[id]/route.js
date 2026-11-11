import { and, eq } from "drizzle-orm";
import { currentUser } from "@/server/auth";
import { getDb } from "@/server/db";
import { conversations } from "@/server/schema";
import { readConversation } from "@/server/conversations";
import { body, error, json, safeFailure, validOrigin } from "@/server/http";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req, { params }) {
  const { id } = await params;
  if (!uuid.test(id)) return error("Not found", 404);
  try {
    const user = await currentUser();
    if (!user) return error("Unauthorized", 401);
    const value = await readConversation(user.id, id);
    return value ? json({ conversation: value }) : error("Not found", 404);
  } catch {
    return safeFailure();
  }
}

export async function PATCH(req, { params }) {
  if (!validOrigin(req)) return error("Invalid origin", 403);
  const { id } = await params;
  if (!uuid.test(id)) return error("Not found", 404);
  let data;
  try {
    data = await body(req);
  } catch {
    return error("Invalid request", 400);
  }
  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title || title.length > 300) return error("Invalid title", 400);
  try {
    const user = await currentUser();
    if (!user) return error("Unauthorized", 401);
    const rows = await getDb()
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(and(eq(conversations.id, id), eq(conversations.userId, user.id)))
      .returning({ id: conversations.id });
    return rows.length
      ? json({ conversation: await readConversation(user.id, id) })
      : error("Not found", 404);
  } catch {
    return safeFailure();
  }
}

export async function DELETE(req, { params }) {
  if (!validOrigin(req)) return error("Invalid origin", 403);
  const { id } = await params;
  if (!uuid.test(id)) return error("Not found", 404);
  try {
    const user = await currentUser();
    if (!user) return error("Unauthorized", 401);
    const rows = await getDb()
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, user.id)))
      .returning({ id: conversations.id });
    return rows.length ? json({ ok: true }) : error("Not found", 404);
  } catch {
    return safeFailure();
  }
}
