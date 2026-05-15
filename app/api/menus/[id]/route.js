import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("menus").select("*").eq("id", id).single();

    const updates = { ...body };
    delete updates.id;

    if (body.status === "APPROVED") {
      updates.approved_by = user.id;
      updates.approved_by_name = user.name;
      updates.approved_at = new Date().toISOString();
      updates.signature = `${user.name} (${user.role}) · ${new Date().toISOString()}`;
    }

    const { error } = await supabase.from("menus").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: body.status ? `MENU_${body.status}` : "UPDATE_MENU",
      entity: "menus", entity_id: id,
      before: { status: old?.status },
      after: { status: updates.status || old?.status },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
