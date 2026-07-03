import { createClient } from "@/lib/supabase";
import { apiError, apiSuccess } from "@/lib/db-helpers";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase());

    if (error) {
      console.error("[LOGIN] Supabase error:", error.message);
      return apiError("Gagal terhubung ke database", 500);
    }

    if (!rows || rows.length === 0) {
      return apiError("Email atau password salah", 401);
    }

    const user = rows[0];

    if (!user.is_active) {
      return apiError("Akun dinonaktifkan", 403);
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return apiError("Email atau password salah", 401);
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: user.is_active,
    };

    return apiSuccess({
      token: Buffer.from(JSON.stringify(payload)).toString("base64"),
      user: payload,
    });
  } catch (e) {
    console.error("[LOGIN] Error:", e.message);
    return apiError("Terjadi kesalahan server", 500);
  }
}
