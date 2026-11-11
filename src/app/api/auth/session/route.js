import { currentUser, publicUser } from "@/server/auth";
import { error, json, safeFailure } from "@/server/http";

export async function GET() {
  try {
    const user = await currentUser();
    return user ? json({ user: publicUser(user) }) : error("Unauthorized", 401);
  } catch {
    return safeFailure();
  }
}
