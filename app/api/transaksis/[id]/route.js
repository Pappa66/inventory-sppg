import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_EDIT = ["admin", "accountant"];

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles(...CAN_EDIT)(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("transaksis").select("*").eq("id", id).single();

    const updates = { ...body, updated_at: new Date().toISOString() };
    delete updates.id;

    const { error } = await supabase.from("transaksis").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_TRANSAKSI", entity: "transaksis", entity_id: id,
      before: { description: old?.description, debit_amount: old?.debit_amount, credit_amount: old?.credit_amount },
      after: { description: updates.description || old?.description, debit_amount: updates.debit_amount ?? old?.debit_amount, credit_amount: updates.credit_amount ?? old?.credit_amount },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin")(user);
    const { id } = await params;
    const supabase = await createClient();

    const { data: old } = await supabase.from("transaksis").select("*").eq("id", id).single();
    const { error } = await supabase.from("transaksis").delete().eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "DELETE_TRANSAKSI", entity: "transaksis", entity_id: id,
      before: { description: old?.description },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
