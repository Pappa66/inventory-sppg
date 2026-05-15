import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function POST(request, { params }) {
  try {
    const user = await getTokenUser();
    requireRoles("admin", "head_chef", "kitchen_head")(user);
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from("menus").update({ status: "PENDING_REVIEW" }).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "MENU_PENDING_REVIEW", entity: "menus", entity_id: id,
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
