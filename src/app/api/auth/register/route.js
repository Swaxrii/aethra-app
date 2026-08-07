import { NextResponse } from "next/server";
import { registerUser } from "@/lib/userDb";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { firstName, lastName, email, password } = body || {};
  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const result = await registerUser({ firstName, lastName, email, password });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const { passwordHash, ...safe } = result.user;
  return NextResponse.json({ user: safe });
}
