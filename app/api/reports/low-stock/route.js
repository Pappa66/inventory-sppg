import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();

    const { data: items } = await supabase.from("items").select("*");
    const { data: lots } = await supabase.from("stock_lots").select("*");

    const byItem = {};
    for (const l of lots || []) {
      byItem[l.item_id] = (byItem[l.item_id] || 0) + Number(l.actual_quantity || l.quantity || 0);
    }

    const low = (items || [])
      .filter(it => (byItem[it.id] || 0) < it.par_level)
      .map(it => ({
        item_id: it.id,
        item_name: it.name,
        unit: it.unit,
        zone: it.zone || "DRY",
        current: byItem[it.id] || 0,
        par_level: it.par_level,
        shortage: Math.round((it.par_level - (byItem[it.id] || 0)) * 1000) / 1000,
      }));

    return apiSuccess(low);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
