import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_EDIT = ["admin_apps","admin_sppg", "kitchen_head", "head_chef", "field_assistant", "nutritionist"];

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles(...CAN_EDIT)(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("items").select("*").eq("id", id).single();

    const allowed = ["name","unit","category","par_level","price_per_unit","zone","allergens","nutrition_per_100g"];
    const updates = { updated_at: new Date().toISOString() };
    for (const key of allowed) { if (body[key] !== undefined) updates[key] = body[key]; }

    const { error } = await supabase.from("items").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_ITEM", entity: "items", entity_id: id,
      before: { name: old?.name, par_level: old?.par_level },
      after: { name: updates.name || old?.name, par_level: updates.par_level ?? old?.par_level },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    console.error("[items PATCH]", e.message);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg")(user);
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
    return apiError("Internal server error", 500);
  }
}
