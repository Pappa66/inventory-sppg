import { apiError, apiSuccess } from "@/lib/db-helpers";

const DEMO_USERS = [
  { email: "admin@sppg.id", name: "Administrator", role: "admin" },
  { email: "akuntan@sppg.id", name: "Sri Akuntansi", role: "accountant" },
  { email: "kepala@sppg.id", name: "Pak Kepala Dapur", role: "kitchen_head" },
  { email: "chef@sppg.id", name: "Chef Wulan", role: "head_chef" },
  { email: "asisten@sppg.id", name: "Asisten Belanja", role: "field_assistant" },
  { email: "staf@sppg.id", name: "Staf Gudang", role: "field_staff" },
  { email: "ahligizi@sppg.id", name: "Ahli Gizi Maya", role: "nutritionist" },
];

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (password !== "admin123") {
      return apiError("Email atau password salah", 401);
    }

    const user = DEMO_USERS.find((u) => u.email === email.toLowerCase());
    if (!user) return apiError("Email atau password salah", 401);

    return apiSuccess({
      token: "demo",
      user: { ...user, id: null, is_active: true },
    });
  } catch (e) {
    return apiError(e.message, 500);
  }
}
