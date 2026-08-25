import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function POST(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg", "nutritionist")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    if (typeof body.approve !== "boolean") {
      return apiError("Field 'approve' wajib boolean", 400);
    }

    const { data: old } = await supabase.from("menus").select("status").eq("id", id).single();
    if (!old || old.status !== "PENDING_REVIEW") {
      return apiError("Menu harus dalam status PENDING_REVIEW untuk disetujui/ditolak", 400);
    }

    const newStatus = body.approve ? "APPROVED" : "REJECTED";
    const updates = {
      status: newStatus,
      approved_by: user.id,
      approved_by_name: user.name,
      approved_at: new Date().toISOString(),
      signature: body.signature || `${user.name} (${user.role}) · ${new Date().toISOString()}`,
    };

    const { error } = await supabase.from("menus").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: `MENU_${newStatus}`, entity: "menus", entity_id: id,
      note: body.note || "",
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
