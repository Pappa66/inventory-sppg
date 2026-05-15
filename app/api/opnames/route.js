import { createClient } from "@/lib/supabase";
import { getTokenUser, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();
    const { data } = await supabase.from("opnames").select("*").order("created_at", { ascending: false });
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

    const opname = {
      id: crypto.randomUUID(),
      item_id: body.item_id,
      lot_id: body.lot_id || null,
      counted_quantity: body.counted_quantity,
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
      await supabase.from("stock_lots").update({ actual_quantity: body.counted_quantity }).eq("id", body.lot_id);
    }

    await logAudit(supabase, {
      actor: user, action: "OPNAME", entity: "opnames", entity_id: opname.id,
      zone: body.zone, note: `Counted: ${body.counted_quantity} (reason: ${body.reason || "routine"})`,
    });

    return apiSuccess(opname, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
