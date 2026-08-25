import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg", "field_assistant", "kitchen_head", "head_chef")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const allowed = ["quantity","actual_quantity","expiry_date","note","zone","taken_by","taken_at","taken_reason"];
    const updates = { updated_at: new Date().toISOString() };
    for (const key of allowed) { if (body[key] !== undefined) updates[key] = body[key]; }

    const { error } = await supabase.from("stock_lots").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
