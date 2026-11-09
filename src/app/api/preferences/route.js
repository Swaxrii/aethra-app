import { eq } from "drizzle-orm";
import { currentUser } from "@/server/auth";
import { getDb } from "@/server/db";
import { preferences } from "@/server/schema";
import { body, error, json, safeFailure, validOrigin } from "@/server/http";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return error("Unauthorized", 401);
    const [value] = await getDb()
      .select()
      .from(preferences)
      .where(eq(preferences.userId, user.id))
      .limit(1);
    return json({
      preferences: value || { model: "Aethra 1.0", temperature: 0.7, responseLength: "Balanced" },
    });
  } catch {
    return safeFailure();
  }
}

export async function PUT(req) {
  if (!validOrigin(req)) return error("Invalid origin", 403);
  let data;
  try {
    data = await body(req);
  } catch {
    return error("Invalid request", 400);
  }
  if (
    !["Aethra 1.0", "Aethra 1.1"].includes(data.model) ||
    !Number.isFinite(data.temperature) ||
    data.temperature < 0 ||
    data.temperature > 2 ||
    !["Short", "Balanced", "Detailed"].includes(data.responseLength)
  )
    return error("Invalid preferences", 400);
  try {
    const user = await currentUser();
    if (!user) return error("Unauthorized", 401);
    const [value] = await getDb()
      .insert(preferences)
      .values({
        userId: user.id,
        model: data.model,
        temperature: data.temperature,
        responseLength: data.responseLength,
      })
      .onConflictDoUpdate({
        target: preferences.userId,
        set: {
          model: data.model,
          temperature: data.temperature,
          responseLength: data.responseLength,
          updatedAt: new Date(),
        },
      })
      .returning();
    return json({ preferences: value });
  } catch {
    return safeFailure();
  }
}
