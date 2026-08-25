import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();
    const { data } = await supabase.from("opnames").select("*, items(name, unit)").order("created_at", { ascending: false });
    const enriched = (data || []).map(o => ({
      ...o,
      item_name: o.items?.name || "—",
      unit: o.items?.unit || "",
      selisih: o.system_quantity != null ? o.counted_quantity - o.system_quantity : null,
    }));
    return apiSuccess(enriched);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg","kitchen_head","head_chef","field_assistant")(user);
    const body = await request.json();
    const supabase = await createClient();

    // Get current stock from stock_lots
    let system_quantity = null;
    if (body.lot_id) {
      const { data: lot } = await supabase.from("stock_lots").select("actual_quantity").eq("id", body.lot_id).single();
      if (lot) system_quantity = lot.actual_quantity;
    }

    const opname = {
      id: crypto.randomUUID(),
      item_id: body.item_id,
      lot_id: body.lot_id || null,
      counted_quantity: body.counted_quantity,
      system_quantity: system_quantity,
      note: body.note || "",
      zone: body.zone,
      temperature_c: body.temperature_c || null,
      humidity_pct: body.humidity_pct || null,
      reason: body.reason || "",
      counted_by: user.name,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("opnames").insert(opname);
    if (error) return apiError(error.message);

    // Update stock lot actual_quantity
    if (body.lot_id) {
      const { error: lotErr } = await supabase.from("stock_lots").update({ actual_quantity: body.counted_quantity }).eq("id", body.lot_id);
      if (lotErr) console.error("[OPNAME] stock_lot update error:", lotErr);
    }

    const selisih = system_quantity != null ? body.counted_quantity - system_quantity : "N/A";
    await logAudit(supabase, {
      actor: user, action: "OPNAME", entity: "opnames", entity_id: opname.id,
      zone: body.zone, note: `Counted: ${body.counted_quantity}, System: ${system_quantity}, Selisih: ${selisih} (reason: ${body.reason || "routine"})`,
    });

    return apiSuccess(opname, 201);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
