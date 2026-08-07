import { NextResponse } from "next/server";
import { updateUser } from "@/lib/userDb";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { id, firstName, lastName, email, password } = body || {};
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  const result = await updateUser(id, { firstName, lastName, email, password });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const { passwordHash, ...safe } = result.user;
  return NextResponse.json({ user: safe });
}