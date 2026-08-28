import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg", "head_chef", "kitchen_head")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("menus").select("*").eq("id", id).single();

    const allowedFields = ["week_start", "day", "recipe_ids", "portions", "total_days", "active_days"];
    const updates = {};
    for (const k of allowedFields) {
      if (body[k] !== undefined) updates[k] = body[k];
    }

    const { error } = await supabase.from("menus").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_MENU",
      entity: "menus", entity_id: id,
      before: { recipe_ids: old?.recipe_ids, portions: old?.portions },
      after: { recipe_ids: updates.recipe_ids, portions: updates.portions },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps", "admin_sppg", "kitchen_head", "head_chef")(user);
    const { id } = await params;
    const supabase = await createClient();

    const { data: existing } = await supabase.from("menus").select("*").eq("id", id).single();
    if (!existing) return apiError("Menu tidak ditemukan", 404);

    const { error } = await supabase.from("menus").delete().eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "DELETE_MENU", entity: "menus", entity_id: id,
      before: { recipe_ids: existing.recipe_ids, portions: existing.portions },
      after: null,
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
