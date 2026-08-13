import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
});

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const model = typeof body.model === "string" && body.model ? body.model : process.env.NVIDIA_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b";

  const rawTemperature = Number.isFinite(body.temperature) ? body.temperature : 0.7;
  const temperature = Math.min(1.2, Math.max(0, rawTemperature));

  if (!process.env.NVIDIA_API_KEY) {
    return Response.json({ error: "NVIDIA_API_KEY is not configured" }, { status: 500 });
  }

  if (!messages.length) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  const payloadMessages = [
    { role: "system", content: "You are Aethra, a helpful and concise AI assistant. Always reply in the same language the user writes in, keep answers clean and well-structured." },
  ];
  if (typeof body.system === "string" && body.system.trim()) {
    payloadMessages.push({ role: "system", content: body.system.trim() });
  }
  payloadMessages.push(...messages);

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: payloadMessages,
      temperature,
      top_p: 0.95,
      max_tokens: 16384,
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices?.[0]?.delta?.content;
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err) {
    console.error("NVIDIA chat error:", err);
    return Response.json({ error: err.message || "AI request failed" }, { status: 502 });
  }
}