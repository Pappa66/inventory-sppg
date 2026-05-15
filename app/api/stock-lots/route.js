import { createClient } from "@/lib/supabase";
import { getTokenUser, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    const supabase = await createClient();
    const { data } = await supabase.from("stock_lots").select("*").order("expiry_date");
    return apiSuccess(data || []);
  } catch (e) {
    return apiError(e.message, 401);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
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
