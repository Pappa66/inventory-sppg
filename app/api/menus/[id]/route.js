import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin", "head_chef", "kitchen_head")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("menus").select("*").eq("id", id).single();

    const allowedFields = ["week_start", "day", "recipe_ids", "portions"];
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
    return apiError(e.message, 401);
  }
}
