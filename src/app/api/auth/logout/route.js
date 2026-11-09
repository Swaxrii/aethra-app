import { revokeSession } from "@/server/auth";
import { error, json, safeFailure, validOrigin } from "@/server/http";

export async function POST(req) {
  if (!validOrigin(req)) return error("Invalid origin", 403);
  try {
    await revokeSession();
    return json({ ok: true });
  } catch {
    return safeFailure();
  }
}
