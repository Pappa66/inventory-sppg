import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("sppg_token")?.value;
  const { pathname } = request.nextUrl;

  // Allow login page and API login endpoint without auth
  if (pathname === "/login" || pathname === "/api/auth/login") {
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // All other routes need auth
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
