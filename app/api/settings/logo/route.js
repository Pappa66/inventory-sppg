import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();
    const { data } = await supabase.from("settings").select("value").eq("key", "logo").single();
    return apiSuccess({ logo: data?.value || null });
  } catch (e) {
    return apiSuccess({ logo: null });
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin")(user);
    const body = await request.json();
    if (!body.logo) return apiError("Logo tidak boleh kosong");

    const supabase = await createClient();
    await supabase.from("settings").upsert({ key: "logo", value: body.logo });

    await logAudit(supabase, {
      actor: user, action: "UPDATE_LOGO", entity: "settings", entity_id: "logo",
      note: "Logo diperbarui",
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
