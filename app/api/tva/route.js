import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();

    const { data: items } = await supabase.from("items").select("*");
    const { data: lots } = await supabase.from("stock_lots").select("*");
    const { data: purchases } = await supabase.from("purchases").select("*");

    const itemById = {};
    for (const it of items || []) itemById[it.id] = it;

    const actualByItem = {};
    for (const l of lots || []) {
      actualByItem[l.item_id] = (actualByItem[l.item_id] || 0) + Number(l.actual_quantity || l.quantity || 0);
    }

    const theoreticalByItem = {};
    for (const p of purchases || []) {
      if (p.category === "STOCK" && p.items) {
        for (const pi of p.items) {
          theoreticalByItem[pi.item_id] = (theoreticalByItem[pi.item_id] || 0) + Number(pi.quantity || 0);
        }
      }
    }

    const rows = (items || []).map(it => {
      const iid = it.id;
      const th = theoreticalByItem[iid] || 0;
      const ac = actualByItem[iid] || 0;
      const variance = Math.round((ac - th) * 1000) / 1000;
      const variancePct = th ? Math.round((variance / th) * 1000) / 10 : 0;
      return {
        item_id: iid,
        item_name: it.name || "—",
        unit: it.unit || "",
        theoretical: th,
        actual: ac,
        variance,
        variance_pct: variancePct,
      };
    });

    rows.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
    return apiSuccess(rows);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
