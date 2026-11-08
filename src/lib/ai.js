import { aiReply } from "./store";

export async function streamAIReply(messages, { model, onToken, signal } = {}) {
  const prompt = messages.filter((message) => message.role === "user").at(-1)?.content || "";
  const response = "Demo response (not AI-generated):\n\n" + aiReply(prompt, model);
  let text = "";
  for (const part of response.match(/.{1,8}/gs) || []) {
    if (signal?.aborted) throw new DOMException("Stopped", "AbortError");
    text += part;
    onToken?.(text);
    await new Promise((resolve) => setTimeout(resolve, 18));
  }
  return text;
}
