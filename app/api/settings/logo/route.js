import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const SETTINGS_KEYS = [
  "logo", "sppg_name", "sppg_address", "default_transport_cost",
  "price_balita_paud_sd13", "price_sd4_smp_sma_bumil_busui",
  "cooking_start_hour", "distribution_start_hour", "beneficiaries",
  "id_sppg", "nama_kepala", "nama_akuntan", "nama_yayasan",
  "rekening_va", "tahun_anggaran", "periode_start", "periode_end",
];

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();
    const { data } = await supabase.from("settings").select("key, value").in("key", SETTINGS_KEYS);
    const result = {};
    for (const row of data || []) {
      const val = row.value;
      if (["default_transport_cost", "price_balita_paud_sd13", "price_sd4_smp_sma_bumil_busui", "cooking_start_hour", "distribution_start_hour", "tahun_anggaran"].includes(row.key)) {
        result[row.key] = parseInt(val) || 0;
      } else {
        result[row.key] = val;
      }
    }
    return apiSuccess(result);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg")(user);
    const body = await request.json();
    const supabase = await createClient();

    const upserts = [];
    for (const key of SETTINGS_KEYS) {
      if (body[key] !== undefined) {
        upserts.push({ key, value: String(body[key]) });
      }
    }

    if (upserts.length > 0) {
      const { error } = await supabase.from("settings").upsert(upserts);
      if (error) return apiError(error.message);
    }

    await logAudit(supabase, {
      actor: user, action: "UPDATE_SETTINGS", entity: "settings", entity_id: "global",
      note: `Settings diperbarui: ${upserts.map(u => u.key).join(", ")}`,
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
