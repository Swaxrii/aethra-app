import { and, desc, eq, sql } from "drizzle-orm";
import { currentUser, limit } from "@/server/auth";
import { getDb } from "@/server/db";
import { conversations, messages } from "@/server/schema";
import { readConversation } from "@/server/conversations";
import { body, error, json, safeFailure, validOrigin } from "@/server/http";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req, { params }) {
  if (!validOrigin(req)) return error("Invalid origin", 403);
  const { id } = await params;
  if (!uuid.test(id)) return error("Not found", 404);
  let data;
  try {
    data = await body(req);
  } catch {
    return error("Invalid request", 400);
  }
  const content = typeof data.text === "string" ? data.text.trim() : "";
  if (!content || content.length > 10000 || !["user", "ai"].includes(data.role))
    return error("Invalid message", 400);
  if (data.role === "ai") return error("Assistant messages must be created by the server", 403);
  try {
    const user = await currentUser();
    if (!user) return error("Unauthorized", 401);
    if (!(await limit("message", user.id, 200))) return error("Try again later", 429);
    const db = getDb();
    const [row] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, user.id)))
      .limit(1);
    if (!row) return error("Not found", 404);
    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${id}))`);
      const [last] = await tx
        .select({ position: messages.position })
        .from(messages)
        .where(eq(messages.conversationId, id))
        .orderBy(desc(messages.position))
        .limit(1);
      await tx.insert(messages).values({
        conversationId: id,
        role: "user",
        position: (last?.position ?? -1) + 1,
        content,
      });
      await tx
        .update(conversations)
        .set({
          updatedAt: new Date(),
          ...(["Aethra 1.0", "Aethra 1.1"].includes(data.model) ? { model: data.model } : {}),
        })
        .where(eq(conversations.id, id));
    });
    return json({ conversation: await readConversation(user.id, id) }, 201);
  } catch {
    return safeFailure();
  }
}
