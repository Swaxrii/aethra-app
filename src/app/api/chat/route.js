import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
});

// Maps the user-facing Aethra versions to the real NVIDIA NIM models
// and per-model tuning. Aethra 1.0 is fast and concise: a low token
// budget keeps it from drifting into noise. Aethra 1.1 reasons deeply,
// so it gets a larger budget and a lower temperature for precision.
const MODEL_CONFIG = {
  "Aethra 1.0": {
    model: process.env.NVIDIA_MODEL_FAST || "meta/llama-3.2-11b-vision-instruct",
    maxTokens: 512,
    temperatureCap: 0.6,
    reasoning: false,
  },
  "Aethra 1.1": {
    model: process.env.NVIDIA_MODEL_REASONING || "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    maxTokens: 16384,
    temperatureCap: 1.2,
    reasoning: true,
  },
};

function resolveModel(body) {
  const version = typeof body.model === "string" && MODEL_CONFIG[body.model] ? body.model : "Aethra 1.0";
  const config = MODEL_CONFIG[version];
  return {
    version,
    model: config.model,
    maxTokens: config.maxTokens,
    temperatureCap: config.temperatureCap,
    reasoning: config.reasoning,
  };
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const { version, model, maxTokens, temperatureCap, reasoning } = resolveModel(body);

  const rawTemperature = Number.isFinite(body.temperature) ? body.temperature : 0.7;
  const temperature = Math.min(temperatureCap, Math.max(0, rawTemperature));

  if (!process.env.NVIDIA_API_KEY) {
    return Response.json({ error: "NVIDIA_API_KEY is not configured" }, { status: 500 });
  }

  if (!messages.length) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  const payloadMessages = [
    {
      role: "system",
      content:
        version === "Aethra 1.1"
          ? "You are Aethra, a highly precise AI assistant. Reason carefully before answering and always reply in the same language the user writes in. Provide accurate, well-structured answers."
          : "You are Aethra, a fast and concise AI assistant. Always reply in the same language the user writes in. Give short, simple, clear answers — only the essential information, without filler.",
    },
  ];
  if (typeof body.system === "string" && body.system.trim()) {
    payloadMessages.push({ role: "system", content: body.system.trim() });
  }
  payloadMessages.push(...messages);

  try {
    const requestBody = {
      model,
      messages: payloadMessages,
      temperature,
      top_p: 0.95,
      max_tokens: maxTokens,
      stream: true,
    };

    if (reasoning) {
      requestBody.reasoning_budget = maxTokens;
      requestBody.chat_template_kwargs = { enable_thinking: true };
    }

    const completion = await client.chat.completions.create(requestBody);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const reasoningText = chunk.choices?.[0]?.delta?.reasoning_content;
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