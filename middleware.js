import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login") return NextResponse.next();

  const isPublicApi = pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/ping");
  const token = request.cookies.get("sppg_token")?.value;

  if (!token) {
    if (isPublicApi) return NextResponse.next();
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = verifyToken(token);
  if (!payload || !payload.email) {
    if (isPublicApi) return NextResponse.next();
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ detail: "Token tidak valid" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.id);
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-user-role", payload.role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
