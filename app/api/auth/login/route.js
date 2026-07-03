import { createClient } from "@/lib/supabase";
import { apiError, apiSuccess } from "@/lib/db-helpers";
import bcrypt from "bcryptjs";

const DEMO_USERS = [
  { id: null, email: "admin@sppg.id",     name: "Administrator",    role: "admin" },
  { id: null, email: "akuntan@sppg.id",   name: "Sri Akuntansi",    role: "accountant" },
  { id: null, email: "kepala@sppg.id",    name: "Pak Kepala Dapur", role: "kitchen_head" },
  { id: null, email: "chef@sppg.id",      name: "Chef Wulan",       role: "head_chef" },
  { id: null, email: "asisten@sppg.id",   name: "Asisten Belanja",  role: "field_assistant" },
  { id: null, email: "staf@sppg.id",      name: "Staf Gudang",      role: "field_staff" },
  { id: null, email: "ahligizi@sppg.id",  name: "Ahli Gizi Maya",   role: "nutritionist" },
];

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (password !== "admin123") {
      return apiError("Email atau password salah", 401);
    }

    // Coba cari user dari database
    let user = null;
    try {
      const supabase = await createClient();
      const { data: rows } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase());

      if (rows && rows.length > 0) {
        const dbUser = rows[0];
        if (dbUser.is_active && bcrypt.compareSync(password, dbUser.password_hash)) {
          user = dbUser;
        }
      }
    } catch (dbErr) {
      console.error("[LOGIN] DB query error (fallback to demo):", dbErr.message);
    }

    // Fallback ke demo users jika DB gagal
    if (!user) {
      const demo = DEMO_USERS.find((u) => u.email === email.toLowerCase());
      if (!demo) return apiError("Email atau password salah", 401);
      user = demo;
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: user.is_active ?? true,
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
