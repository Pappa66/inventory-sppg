import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_EDIT = ["admin", "head_chef", "kitchen_head", "nutritionist"];

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles(...CAN_EDIT)(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("items").select("*").eq("id", id).single();

    const updates = { ...body, updated_at: new Date().toISOString() };
    delete updates.id;

    const { error } = await supabase.from("items").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_ITEM", entity: "items", entity_id: id,
      before: { name: old?.name, par_level: old?.par_level },
      after: { name: updates.name || old?.name, par_level: updates.par_level ?? old?.par_level },
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

    const { data: old } = await supabase.from("items").select("*").eq("id", id).single();
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "DELETE_ITEM", entity: "items", entity_id: id,
      before: { name: old?.name },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
