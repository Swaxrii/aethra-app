import OpenAI from "openai";
import { and, desc, eq, sql } from "drizzle-orm";
import { currentUser, limit } from "@/server/auth";
import { getDb } from "@/server/db";
import { conversations, messages, preferences } from "@/server/schema";
import { readConversation } from "@/server/conversations";
import { error, safeFailure, validOrigin } from "@/server/http";

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
    const conversation = await readConversation(user.id, id);
    if (!conversation) return error("Not found", 404);
    const last = conversation.messages.at(-1);
    if (!last || last.role !== "user") return error("No pending message", 409);
    if (!process.env.NIVIDA_AI_API) return error("AI service is not configured", 503);
    const [settings] = await db
      .select()
      .from(preferences)
      .where(eq(preferences.userId, user.id))
      .limit(1);
    const advanced = conversation.model === "Aethra 1.1";
    const history = conversation.messages.slice(-30).map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.text.slice(0, 10000),
    }));
    const client = new OpenAI({
      apiKey: process.env.NIVIDA_AI_API,
      baseURL: "https://integrate.api.nvidia.com/v1",
      timeout: 120000,
      maxRetries: 0,
    });
    const upstream = await client.chat.completions.create(
      {
        model: "nvidia/nemotron-3.5-lightning-30b-a3b",
        messages: [
          {
            role: "system",
            content:
              (advanced
                ? "Answer in the user's language. Provide thoughtful, well-structured answers."
                : "Answer in the user's language. Be concise and direct.") +
              ` Preferred response length: ${settings?.responseLength || "Balanced"}.`,
          },
          ...history,
        ],
        stream: true,
        temperature: settings?.temperature ?? 0.7,
        max_tokens: advanced ? 4096 : 1024,
        chat_template_kwargs: { enable_thinking: advanced },
        ...(advanced ? { reasoning_budget: 2048 } : {}),
      },
      { signal: req.signal },
    );
    const encoder = new TextEncoder();
    let cancelled = false;
    const stream = new ReadableStream({
      async start(controller) {
        let content = "";
        let pending = "";
        let thinking = false;
        const emit = (value) => controller.enqueue(encoder.encode(JSON.stringify(value) + "\n"));
        try {
          for await (const chunk of upstream) {
            if (cancelled || req.signal.aborted) throw new Error("Cancelled");
            const text = chunk.choices[0]?.delta?.content;
            if (!text) continue;
            pending += text;
            while (pending.length) {
              const marker = thinking ? "</think>" : "<think>";
              const index = pending.indexOf(marker);
              if (index >= 0) {
                if (!thinking && index) {
                  const part = pending.slice(0, index);
                  content += part;
                  emit({ text: part });
                }
                pending = pending.slice(index + marker.length);
                thinking = !thinking;
              } else {
                const keep = marker.length - 1;
                if (pending.length <= keep) break;
                const part = pending.slice(0, -keep);
                pending = pending.slice(-keep);
                if (!thinking) {
                  content += part;
                  emit({ text: part });
                }
                break;
              }
            }
          }
          if (!thinking && pending) {
            content += pending;
            emit({ text: pending });
          }
          if (thinking || !content.trim() || cancelled || req.signal.aborted)
            throw new Error("Incomplete response");
          const saved = await db.transaction(async (tx) => {
            await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${id}))`);
            const [current] = await tx
              .select()
              .from(messages)
              .where(eq(messages.conversationId, id))
              .orderBy(desc(messages.position))
              .limit(1);
            if (!current || current.id !== last.id || cancelled || req.signal.aborted) return false;
            const [owner] = await tx
              .select({ id: conversations.id })
              .from(conversations)
              .where(and(eq(conversations.id, id), eq(conversations.userId, user.id)))
              .limit(1);
            if (!owner) return false;
            await tx
              .insert(messages)
              .values({ conversationId: id, role: "ai", position: current.position + 1, content });
            await tx
              .update(conversations)
              .set({ updatedAt: new Date() })
              .where(eq(conversations.id, id));
            return true;
          });
          if (!saved) throw new Error("Conversation changed");
          emit({ done: true });
        } catch {
          if (!cancelled && !req.signal.aborted)
            emit({ error: "The response could not be completed. Please retry." });
        } finally {
          if (!cancelled) controller.close();
        }
      },
      cancel() {
        cancelled = true;
        upstream.controller.abort();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err?.status === 429) return error("AI service is busy. Please try again later.", 429);
    return safeFailure();
  }
}
