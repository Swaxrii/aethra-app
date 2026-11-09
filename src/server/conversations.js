import "server-only";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import { conversations, messages } from "./schema";

export function normalizeConversation(row, rows) {
  return {
    id: row.id,
    title: row.title,
    model: row.model,
    createdAt: row.createdAt.getTime(),
    lastAccessed: row.updatedAt.getTime(),
    messages: rows.map((m) => ({
      id: m.id,
      role: m.role,
      text: m.content,
      createdAt: m.createdAt.getTime(),
    })),
  };
}

export async function readConversation(userId, id) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
    .limit(1);
  if (!row) return null;
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.position), asc(messages.createdAt), asc(messages.id));
  return normalizeConversation(row, rows);
}

export async function listConversations(userId, query = "", offset = 0) {
  const db = getDb();
  const term = query.trim();
  const pattern = `%${term.replace(/[\\%_]/g, "\\$&")}%`;
  const matches = term
    ? and(
        eq(conversations.userId, userId),
        or(
          ilike(conversations.title, pattern),
          sql`EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = ${conversations.id} AND m.content ILIKE ${pattern})`,
        ),
      )
    : eq(conversations.userId, userId);
  const rows = await db
    .select({
      id: conversations.id,
      title: conversations.title,
      model: conversations.model,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
      messageCount:
        sql`(SELECT COUNT(*)::integer FROM messages m WHERE m.conversation_id = ${conversations.id})`.mapWith(
          Number,
        ),
    })
    .from(conversations)
    .where(matches)
    .orderBy(desc(conversations.updatedAt), desc(conversations.id))
    .limit(101)
    .offset(offset);
  return {
    conversations: rows.slice(0, 100).map((row) => ({
      id: row.id,
      title: row.title,
      model: row.model,
      createdAt: row.createdAt.getTime(),
      lastAccessed: row.updatedAt.getTime(),
      messageCount: row.messageCount,
    })),
    hasMore: rows.length > 100,
  };
}
