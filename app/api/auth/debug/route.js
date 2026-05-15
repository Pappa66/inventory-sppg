import { apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  const authHeader = request.headers.get("Authorization") || "";
  const cookieToken = request.cookies.get("sppg_token")?.value;
  const hasJwtSecret = !!process.env.JWT_SECRET;

  return apiSuccess({
    hasAuthHeader: authHeader.startsWith("Bearer "),
    authHeaderPrefix: authHeader.startsWith("Bearer ") ? authHeader.slice(0, 30) + "..." : "(none)",
    hasCookie: !!cookieToken,
    cookiePrefix: cookieToken ? cookieToken.slice(0, 20) + "..." : "(none)",
    jwtSecretExists: hasJwtSecret,
    jwtSecretPrefix: hasJwtSecret ? process.env.JWT_SECRET.slice(0, 10) + "..." : "(not set)",
    nodeEnv: process.env.NODE_ENV,
  });
}
