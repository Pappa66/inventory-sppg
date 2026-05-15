import { createClient } from "@/lib/supabase";
import { getTokenUser, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("purchases").select("*").eq("id", id).single();

    const updates = { ...body };
    delete updates.id;

    if (body.verified === true && !old.verified) {
      updates.verified_by = user.email;
      updates.verified_at = new Date().toISOString();
    }

    const { error } = await supabase.from("purchases").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_PURCHASE", entity: "purchases", entity_id: id,
      before: { verified: old?.verified },
      after: { verified: updates.verified ?? old?.verified },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
