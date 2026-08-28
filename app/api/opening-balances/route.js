import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    if (!user) return apiError("Unauthorized", 401);
    requireRoles("admin_apps","admin_sppg")(user);
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const period_id = searchParams.get("period_id");

    let query = supabase.from("item_opening_balances").select("*, item_hierarchies(code, name, unit, category, zone)").order("created_at", { ascending: false });
    if (period_id) query = query.eq("period_id", period_id);

    const { data, error } = await query;
    if (error) return apiError(error.message);
    return apiSuccess(data);
  } catch (e) {
    return apiError(e.message);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg")(user);
    const body = await request.json();
    const { items, period_id } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiError("items array required");
    }

    const supabase = await createClient();

    const upserts = items.map(item => ({
      item_code: item.item_code,
      period_id: period_id || null,
      opening_quantity: item.opening_quantity || 0,
      opening_value: item.opening_value || 0,
    }));

    const { data, error } = await supabase
      .from("item_opening_balances")
      .upsert(upserts, { onConflict: "item_code,period_id" })
      .select();

    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_OPENING_BALANCES", entity: "item_opening_balances", entity_id: period_id || "global",
      note: `Saldo awal diperbarui: ${items.length} item`,
    });

    return apiSuccess(data);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
