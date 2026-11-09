import { currentUser, limit } from "@/server/auth";
import { getDb } from "@/server/db";
import { conversations, messages } from "@/server/schema";
import { body, error, json, safeFailure, validOrigin } from "@/server/http";

function validTime(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 946684800000 &&
    value <= Date.now() + 86400000
  );
}

function validConversation(value) {
  return (
    value &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 110 &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    value.title.length <= 10000 &&
    ["Aethra 1.0", "Aethra 1.1", undefined].includes(value.model) &&
    (value.createdAt === undefined || validTime(value.createdAt)) &&
    Array.isArray(value.messages) &&
    value.messages.length <= 500 &&
    value.messages.every(
      (message) =>
        message &&
        ["user", "ai"].includes(message.role) &&
        typeof message.text === "string" &&
        message.text.trim().length > 0 &&
        message.text.length <= 10000,
    )
  );
}

export async function POST(req) {
  if (!validOrigin(req)) return error("Invalid origin", 403);
  let data;
  try {
    data = await body(req, 1048576);
  } catch {
    return error("Invalid request", 400);
  }
  if (
    !Array.isArray(data.conversations) ||
    data.conversations.length < 1 ||
    data.conversations.length > 25 ||
    !data.conversations.every(validConversation)
  )
    return error("Invalid browser conversations", 400);
  const ids = data.conversations.map((item) => item.id);
  if (new Set(ids).size !== ids.length) return error("Duplicate browser conversations", 400);
  try {
    const user = await currentUser();
    if (!user) return error("Unauthorized", 401);
    if (!(await limit("import", user.id, 25))) return error("Try again later", 429);
    const imported = await getDb().transaction(async (tx) => {
      let count = 0;
      for (const item of data.conversations) {
        const [created] = await tx
          .insert(conversations)
          .values({
            userId: user.id,
            legacyId: `browser:${item.id}`,
            title: item.title.trim().slice(0, 300),
            model: item.model || "Aethra 1.0",
            ...(validTime(item.createdAt) ? { createdAt: new Date(item.createdAt) } : {}),
          })
          .onConflictDoNothing({ target: [conversations.userId, conversations.legacyId] })
          .returning({ id: conversations.id });
        if (!created) continue;
        if (item.messages.length)
          await tx.insert(messages).values(
            item.messages.map((message, position) => ({
              conversationId: created.id,
              role: message.role,
              position,
              content: message.text,
            })),
          );
        count++;
      }
      return count;
    });
    return json({ imported, skipped: data.conversations.length - imported });
  } catch {
    return safeFailure();
  }
}
