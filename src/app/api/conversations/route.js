import { currentUser, limit } from "@/server/auth";
import { getDb } from "@/server/db";
import { conversations, messages } from "@/server/schema";
import { listConversations, readConversation } from "@/server/conversations";
import { body, error, json, safeFailure, validOrigin } from "@/server/http";

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) return error("Unauthorized", 401);
    const params = new URL(req.url).searchParams;
    const q = params.get("q") || "";
    const offset = params.get("offset") || "0";
    if (q.length > 200 || !/^\d{1,6}$/.test(offset)) return error("Invalid search", 400);
    return json(await listConversations(user.id, q, Number(offset)));
  } catch {
    return safeFailure();
  }
}

export async function POST(req) {
  if (!validOrigin(req)) return error("Invalid origin", 403);
  let data;
  try {
    data = await body(req);
  } catch {
    return error("Invalid request", 400);
  }
  const prompt = typeof data.prompt === "string" ? data.prompt.trim() : "";
  if (!prompt || prompt.length > 10000 || !["Aethra 1.0", "Aethra 1.1"].includes(data.model))
    return error("Invalid conversation", 400);
  try {
    const user = await currentUser();
    if (!user) return error("Unauthorized", 401);
    if (!(await limit("create", user.id, 80))) return error("Try again later", 429);
    const db = getDb();
    const [row] = await db.transaction(async (tx) => {
      const [conversation] = await tx
        .insert(conversations)
        .values({ userId: user.id, title: prompt.slice(0, 300), model: data.model })
        .returning();
      await tx
        .insert(messages)
        .values({ conversationId: conversation.id, role: "user", position: 0, content: prompt });
      return [conversation];
    });
    return json({ conversation: await readConversation(user.id, row.id) }, 201);
  } catch {
    return safeFailure();
  }
}
