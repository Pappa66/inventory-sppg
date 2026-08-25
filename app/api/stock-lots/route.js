import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    const supabase = await createClient();
    const { data: lots } = await supabase.from("stock_lots").select("*, items(name, unit)").order("expiry_date");
    const enriched = (lots || []).map(l => ({
      ...l,
      item_name: l.items?.name || "—",
      unit: l.items?.unit || "",
      zone: l.zone || l.items?.zone || "DRY",
    }));
    return apiSuccess(enriched);
  } catch (e) {
    return apiError(e.message, 401);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg", "field_assistant", "kitchen_head", "head_chef")(user);
    const body = await request.json();
    const supabase = await createClient();

    const lot = {
      id: crypto.randomUUID(),
      item_id: body.item_id,
      quantity: body.quantity,
      actual_quantity: body.quantity,
      expiry_date: body.expiry_date || null,
      received_at: body.received_at || new Date().toISOString(),
      note: body.note || null,
      zone: body.zone || null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("stock_lots").insert(lot);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "CREATE_STOCK_LOT", entity: "stock_lots", entity_id: lot.id,
      note: `Qty: ${lot.quantity}, Exp: ${lot.expiry_date || "-"}`,
    });

    return apiSuccess(lot, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
