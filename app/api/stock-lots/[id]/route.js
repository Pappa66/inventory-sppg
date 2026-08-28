import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg", "field_assistant", "kitchen_head", "head_chef")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: existing } = await supabase.from("stock_lots").select("id").eq("id", id).single();
    if (!existing) return apiError("Stock lot tidak ditemukan", 404);

    const allowed = ["quantity","actual_quantity","expiry_date","note","zone","taken_by","taken_at","taken_reason"];
    const updates = {};
    for (const key of allowed) { if (body[key] !== undefined) updates[key] = body[key]; }

    const { error } = await supabase.from("stock_lots").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
