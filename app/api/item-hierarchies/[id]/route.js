import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function PUT(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("item_hierarchies")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_ITEM_HIERARCHY", entity: "item_hierarchies", entity_id: id,
      note: `Update hierarki barang: ${body.code || ""} ${body.name || ""}`,
    });

    return apiSuccess(data);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg")(user);
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("item_hierarchies")
      .update({ is_active: false })
      .eq("id", id);

    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "DELETE_ITEM_HIERARCHY", entity: "item_hierarchies", entity_id: id,
      note: `Nonaktifkan hierarki barang`,
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
