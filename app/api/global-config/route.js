import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();
    const { data, error } = await supabase.from("global_config").select("key, value, description");
    if (error) return apiError(error.message);
    const result = {};
    for (const row of data || []) {
      result[row.key] = row.value;
    }
    return apiSuccess(result);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps")(user);
    const body = await request.json();
    const { config } = body;
    if (!config || typeof config !== "object") {
      return apiError("Config object required");
    }
    const supabase = await createClient();

    const upserts = [];
    for (const [key, value] of Object.entries(config)) {
      upserts.push({ key, value: String(value), updated_by: user.id, updated_at: new Date().toISOString() });
    }

    if (upserts.length > 0) {
      const { error } = await supabase.from("global_config").upsert(upserts, { onConflict: "key" });
      if (error) return apiError(error.message);
    }

    await logAudit(supabase, {
      actor: user, action: "UPDATE_GLOBAL_CONFIG", entity: "global_config", entity_id: "global",
      note: `Konfigurasi global diperbarui: ${upserts.map(u => u.key).join(", ")}`,
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
