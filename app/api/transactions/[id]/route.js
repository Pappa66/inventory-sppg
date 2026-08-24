import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function PUT(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg","accountant")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transaksis")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_TRANSAKSI", entity: "transaksis", entity_id: id,
      note: `Update transaksi ${body.account_code || ""}`,
    });

    return apiSuccess(data);
  } catch (e) {
    return apiError(e.message, 401);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg","accountant")(user);
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from("transaksis").delete().eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "DELETE_TRANSAKSI", entity: "transaksis", entity_id: id,
      note: `Hapus transaksi`,
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
