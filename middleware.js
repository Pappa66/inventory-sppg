import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/")) return NextResponse.next();
  if (pathname === "/login") return NextResponse.next();

  const token = request.cookies.get("sppg_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  // Basic validation: token should be valid base64 JSON
  try {
    const json = Buffer.from(token, "base64").toString("utf-8");
    const payload = JSON.parse(json);
    if (!payload || !payload.email) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
