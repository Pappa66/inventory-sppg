import { createClient } from "@/lib/supabase";
import { getTokenUser, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const updates = { ...body };
    delete updates.id;

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
