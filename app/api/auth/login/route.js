import { createClient } from "@/lib/supabase";
import { apiError, apiSuccess } from "@/lib/db-helpers";
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
    if (!user.is_active) return apiError("Akun dinonaktifkan", 403);

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return apiError("Email atau password salah", 401);

    return apiSuccess({
      token: "demo",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
      },
    });
  } catch (e) {
    return apiError(e.message, 500);
  }
}
