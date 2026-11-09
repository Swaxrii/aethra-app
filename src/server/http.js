import "server-only";

export function json(data, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function error(message, status) {
  return json({ error: message }, status);
}

export async function body(req, maxBytes = 65536) {
  const length = Number(req.headers.get("content-length") || 0);
  if (length > maxBytes) throw new Error("Invalid request");
  const value = await req.text();
  if (value.length > maxBytes) throw new Error("Invalid request");
  const data = JSON.parse(value);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid request");
  return data;
}

export function clientAddress(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  const value = forwarded?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  return value.slice(0, 64);
}

export function validOrigin(req) {
  const origin = req.headers.get("origin");
  const site = req.headers.get("sec-fetch-site");
  if (site === "cross-site" || !origin) return false;
  const url = new URL(req.url);
  return origin === `${url.protocol}//${req.headers.get("host") || url.host}`;
}

export function safeFailure() {
  return error("Service temporarily unavailable", 503);
}
