import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();

    const { data: lots } = await supabase
      .from("stock_lots")
      .select("item_id, actual_quantity, quantity, items(name, unit, zone, category, par_level)");

    const byItem = {};
    for (const l of lots || []) {
      if (!byItem[l.item_id]) {
        byItem[l.item_id] = { item: l.items || {}, total: 0 };
      }
      byItem[l.item_id].total += Number(l.actual_quantity || l.quantity || 0);
    }

    const low = Object.entries(byItem)
      .filter(([, v]) => v.total < (v.item.par_level || 0))
      .map(([item_id, v]) => ({
        item_id,
        item_name: v.item.name,
        unit: v.item.unit,
        zone: v.item.zone || "DRY",
        current: v.total,
        par_level: v.item.par_level || 0,
        shortage: Math.round(((v.item.par_level || 0) - v.total) * 1000) / 1000,
      }));

    return apiSuccess(low);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
