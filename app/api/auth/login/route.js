import { createClient } from "@/lib/supabase";
import { createAccessToken, apiError, apiSuccess } from "@/lib/db-helpers";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const supabase = await createClient();

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (!user) return apiError("Email atau password salah", 401);
    if (!user.is_active) return apiError("Akun dinonaktifkan oleh admin", 403);

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return apiError("Email atau password salah", 401);

    const token = createAccessToken(user.id, user.email);

    const response = apiSuccess({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
      },
    });

    response.headers.set(
      "Set-Cookie",
      `sppg_token=${token}; HttpOnly; Path=/; Max-Age=43200; SameSite=Lax`
    );

    return response;
  } catch (e) {
    return apiError(e.message, 500);
  }
}
