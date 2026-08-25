import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const VALID_TRANSITIONS = {
  PENDING: "IN_TRANSIT",
  IN_TRANSIT: "COMPLETED",
};

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg", "field_assistant", "driver")(user);

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("delivery_assignments").select("*").eq("id", id).single();
    if (!old) return apiError("Assignment tidak ditemukan", 404);

    // Enforce status transition if status is being updated
    if (body.status && body.status !== old.status) {
      const expectedNext = VALID_TRANSITIONS[old.status];
      if (body.status !== expectedNext) {
        return apiError(`Transisi status tidak valid: ${old.status} → ${body.status}. Harusnya: ${old.status} → ${expectedNext}`);
      }
    }

    const updates = { ...body };
    delete updates.id;
    delete updates.created_at;

    // Set timestamps based on status transitions
    if (body.status === "IN_TRANSIT" && !old.started_at) {
      updates.started_at = new Date().toISOString();
    }
    if (body.status === "COMPLETED") {
      updates.completed_at = new Date().toISOString();
      if (!old.started_at) {
        updates.started_at = new Date().toISOString();
      }
    }

    const { error } = await supabase.from("delivery_assignments").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user,
      action: "UPDATE_DELIVERY_ASSIGNMENT",
      entity: "delivery_assignments",
      entity_id: id,
      before: { status: old.status },
      after: { status: updates.status || old.status },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
