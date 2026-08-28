import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();

    const { data: lots } = await supabase
      .from("stock_lots")
      .select("id, item_id, zone, actual_quantity, quantity, expiry_date, items(name, unit, category)");

    const rows = (lots || []).map(l => {
      const it = l.items || {};
      return {
        lot_id: l.id,
        item_id: l.item_id,
        item_name: it.name || "—",
        unit: it.unit || "",
        zone: l.zone || "DRY",
        category: it.category || "",
        actual_quantity: l.actual_quantity || l.quantity || 0,
        expiry_date: l.expiry_date,
      };
    });

    rows.sort((a, b) => (a.zone || "").localeCompare(b.zone || "") || (a.item_name || "").localeCompare(b.item_name || ""));

    const byZone = {};
    for (const r of rows) {
      if (!byZone[r.zone]) byZone[r.zone] = [];
      byZone[r.zone].push(r);
    }

    return apiSuccess({ rows, by_zone: byZone });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
