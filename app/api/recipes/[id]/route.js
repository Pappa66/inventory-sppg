import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_EDIT = ["admin", "head_chef", "nutritionist", "kitchen_head"];

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles(...CAN_EDIT)(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const allowedFields = ["name", "servings", "ingredients", "instructions", "calories_kcal", "protein_g", "carbs_g", "fats_g", "sodium_mg", "allergens"];
    const updates = {};
    for (const k of allowedFields) {
      if (body[k] !== undefined) updates[k] = body[k];
    }

    const { error } = await supabase.from("recipes").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_RECIPE", entity: "recipes", entity_id: id,
      after: { name: updates.name || "updated" },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin", "head_chef", "kitchen_head")(user);
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) return apiError(error.message);
    await logAudit(supabase, { actor: user, action: "DELETE_RECIPE", entity: "recipes", entity_id: id });
    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
