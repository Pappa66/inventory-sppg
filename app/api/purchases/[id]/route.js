import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg", "accountant")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("purchases").select("*").eq("id", id).single();

    const allowedFields = ["description", "amount_idr", "receipt_total_idr", "receipt_photo", "transport_amount_idr", "supplier", "items", "category"];
    const updates = {};
    for (const k of allowedFields) {
      if (body[k] !== undefined) updates[k] = body[k];
    }

    const { error } = await supabase.from("purchases").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_PURCHASE", entity: "purchases", entity_id: id,
      before: { amount_idr: old?.amount_idr, category: old?.category },
      after: { amount_idr: updates.amount_idr ?? old?.amount_idr, category: updates.category ?? old?.category },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
