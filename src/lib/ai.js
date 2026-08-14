import { getTemperaturePref, getResponseLengthPref } from "./session";

const LENGTH_GUIDES = {
  Short: "Be concise and to the point. Keep the answer short.",
  Balanced: "Give a clear, balanced answer.",
  Detailed: "Be thorough and detailed in your answer.",
};

export async function streamAIReply(messages, { model, onToken, signal } = {}) {
  const temperature = getTemperaturePref();
  const length = getResponseLengthPref();

  const body = {
    messages,
    model,
    temperature,
    ...(length && LENGTH_GUIDES[length] ? { system: LENGTH_GUIDES[length] } : {}),
  };

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    let message = "AI request failed";
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onToken?.(text);
  }
  onToken?.(text);
  return text;
}