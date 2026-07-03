import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin", "field_staff", "kitchen_head", "head_chef")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const updates = { ...body };
    delete updates.id;

    const { error } = await supabase.from("stock_lots").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
