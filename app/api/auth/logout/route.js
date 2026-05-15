import { apiSuccess } from "@/lib/db-helpers";

export async function POST() {
  const response = apiSuccess({ ok: true });
  response.headers.set(
    "Set-Cookie",
    "sppg_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  );
  return response;
}
