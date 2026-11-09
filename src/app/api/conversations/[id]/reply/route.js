import { and, desc, eq, sql } from "drizzle-orm";
import { currentUser, limit } from "@/server/auth";
import { getDb } from "@/server/db";
import { conversations, messages, preferences } from "@/server/schema";
import { readConversation } from "@/server/conversations";
import { aiReply } from "@/server/demoReply";
import { error, json, safeFailure, validOrigin } from "@/server/http";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req, { params }) {
  if (!validOrigin(req)) return error("Invalid origin", 403);
  const { id } = await params;
  if (!uuid.test(id)) return error("Not found", 404);
  try {
    const user = await currentUser();
    if (!user) return error("Unauthorized", 401);
    if (!(await limit("reply", user.id, 100))) return error("Try again later", 429);
    const db = getDb();
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, user.id)))
      .limit(1);
    if (!conversation) return error("Not found", 404);
    const [settings] = await db
      .select()
      .from(preferences)
      .where(eq(preferences.userId, user.id))
      .limit(1);
    const saved = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${id}))`);
      const [last] = await tx
        .select()
        .from(messages)
        .where(eq(messages.conversationId, id))
        .orderBy(desc(messages.position), desc(messages.createdAt), desc(messages.id))
        .limit(1);
      if (!last || last.role !== "user" || req.signal.aborted) return false;
      const reply =
        "Demo response (not AI-generated):\n\n" +
        aiReply(last.content, conversation.model, settings || {});
      await tx
        .insert(messages)
        .values({ conversationId: id, role: "ai", position: last.position + 1, content: reply });
      await tx.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, id));
      return true;
    });
    if (!saved) return error("No pending message", 409);
    return json({ conversation: await readConversation(user.id, id) });
  } catch {
    return safeFailure();
  }
}
