import { NextResponse } from "next/server";

export function proxy(request) {
  if (!request.cookies.get("aethra_session")?.value) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat/:path*", "/projects/:path*", "/settings/:path*"],
};
