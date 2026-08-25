import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_MANAGE = ["admin_apps","admin_sppg", "field_assistant"];

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles(...CAN_MANAGE)(user);

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("destinations").select("*").eq("id", id).single();
    if (!old) return apiError("Destinations tidak ditemukan", 404);

    const updates = { ...body, updated_at: new Date().toISOString() };
    delete updates.id;
    delete updates.created_at;

    const { error } = await supabase.from("destinations").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user,
      action: "UPDATE_DESTINATION",
      entity: "destinations",
      entity_id: id,
      before: { name: old.name, is_active: old.is_active },
      after: { name: updates.name || old.name, is_active: updates.is_active ?? old.is_active },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg")(user);

    const { id } = await params;
    const supabase = await createClient();

    const { data: old } = await supabase.from("destinations").select("*").eq("id", id).single();
    if (!old) return apiError("Destinations tidak ditemukan", 404);

    const { error } = await supabase.from("destinations").delete().eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user,
      action: "DELETE_DESTINATION",
      entity: "destinations",
      entity_id: id,
      before: { name: old.name },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
