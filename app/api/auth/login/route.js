import { createClient } from "@/lib/supabase";
import { apiError, apiSuccess } from "@/lib/db-helpers";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

const DEMO_USERS = [
  { id: "a0000001-0000-0000-0000-000000000001", email: "admin@sppg.id",      name: "Administrator Aplikasi", role: "admin_apps" },
  { id: "a0000001-0000-0000-0000-000000000002", email: "admin-sppg@sppg.id", name: "Admin Dapur SPPG",       role: "admin_sppg" },
  { id: "a0000001-0000-0000-0000-000000000003", email: "akuntan@sppg.id",    name: "Sri Akuntansi",          role: "accountant" },
  { id: "a0000001-0000-0000-0000-000000000004", email: "kepala@sppg.id",     name: "Pak Kepala Dapur",       role: "kitchen_head" },
  { id: "a0000001-0000-0000-0000-000000000005", email: "chef@sppg.id",       name: "Chef Wulan",             role: "head_chef" },
  { id: "a0000001-0000-0000-0000-000000000006", email: "asisten@sppg.id",    name: "Asisten Lapangan",       role: "field_assistant" },
  { id: "a0000001-0000-0000-0000-000000000007", email: "ahligizi@sppg.id",   name: "Ahli Gizi Maya",         role: "nutritionist" },
  { id: "a0000001-0000-0000-0000-000000000008", email: "driver@sppg.id",     name: "Driver Budi",            role: "driver" },
  { id: "a0000001-0000-0000-0000-000000000009", email: "driver2@sppg.id",    name: "Driver Sari",            role: "driver" },
  { id: "a0000001-0000-0000-0000-000000000010", email: "persiapan@sppg.id",  name: "Rina Persiapan",         role: "persiapan" },
  { id: "a0000001-0000-0000-0000-000000000011", email: "masak@sppg.id",      name: "Sari Masak",            role: "tenaga_masak" },
  { id: "a0000001-0000-0000-0000-000000000012", email: "pemorsian@sppg.id",  name: "Dewi Pemorsian",         role: "pemorsian" },
  { id: "a0000001-0000-0000-0000-000000000013", email: "kebersihan@sppg.id", name: "Siti Kebersihan",        role: "kebersihan" },
  { id: "a0000001-0000-0000-0000-000000000014", email: "pencuci@sppg.id",    name: "Budi Pencuci",           role: "pencuci" },
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
      token: signToken(payload),
      user: payload,
    });
  } catch (e) {
    console.error("[LOGIN] Error:", e.message);
    return apiError("Terjadi kesalahan server", 500);
  }
}
