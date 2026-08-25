import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function POST(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg", "head_chef", "kitchen_head")(user);
    const { id } = await params;
    const supabase = await createClient();

    const { data: old } = await supabase.from("menus").select("status").eq("id", id).single();
    if (old && old.status !== "DRAFT") {
      return apiError("Menu sudah diajukan, tidak bisa submit ulang", 400);
    }

    const { error } = await supabase.from("menus").update({ status: "PENDING_REVIEW" }).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "MENU_PENDING_REVIEW", entity: "menus", entity_id: id,
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
