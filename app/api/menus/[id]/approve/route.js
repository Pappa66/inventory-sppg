import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function POST(request, { params }) {
  try {
    const user = await getTokenUser();
    requireRoles("admin", "nutritionist")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

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
    return apiError(e.message, 401);
  }
}
