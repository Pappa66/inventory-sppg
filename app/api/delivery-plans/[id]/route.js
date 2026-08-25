import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_MANAGE = ["admin_apps","admin_sppg", "field_assistant"];

export async function GET(request, { params }) {
  try {
    const user = await getTokenUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("delivery_plans")
      .select(`
        *,
        delivery_plan_items (
          *,
          destinations ( name, address )
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) return apiError("Delivery plan tidak ditemukan", 404);
    return apiSuccess(data);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles(...CAN_MANAGE)(user);

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("delivery_plans").select("*").eq("id", id).single();
    if (!old) return apiError("Delivery plan tidak ditemukan", 404);

    const allowed = ["plan_date","notes","driver_id"];
    const updates = { updated_at: new Date().toISOString() };
    for (const key of allowed) { if (body[key] !== undefined) updates[key] = body[key]; }

    const { error } = await supabase.from("delivery_plans").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    if (body.driver_id) {
      const { data: existingAssignment } = await supabase
        .from("delivery_assignments")
        .select("id")
        .eq("plan_id", id)
        .single();

      if (!existingAssignment) {
        const { error: assignErr } = await supabase.from("delivery_assignments").insert({
          plan_id: id,
          driver_id: body.driver_id,
          status: "PENDING",
          created_at: new Date().toISOString(),
        });
        if (assignErr) return apiError(assignErr.message);
      }
    }

    await logAudit(supabase, {
      actor: user,
      action: "UPDATE_DELIVERY_PLAN",
      entity: "delivery_plans",
      entity_id: id,
      before: { plan_date: old.plan_date, notes: old.notes },
      after: { plan_date: updates.plan_date || old.plan_date, notes: updates.notes ?? old.notes },
    });

    return apiSuccess({ ok: true });
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

    const { data: old } = await supabase.from("delivery_plans").select("*").eq("id", id).single();
    if (!old) return apiError("Delivery plan tidak ditemukan", 404);

    const { error } = await supabase.from("delivery_plans").delete().eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user,
      action: "DELETE_DELIVERY_PLAN",
      entity: "delivery_plans",
      entity_id: id,
      before: { plan_date: old.plan_date },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
