import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";
import bcrypt from "bcryptjs";

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("users").select("*").eq("id", id).single();

    const updates = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.role !== undefined) updates.role = body.role;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.password && body.password.length >= 6) {
      updates.password_hash = bcrypt.hashSync(body.password, 10);
    }

    const { error } = await supabase.from("users").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_USER", entity: "users", entity_id: id,
      before: { name: old?.name, role: old?.role, is_active: old?.is_active },
      after: { ...updates, password_hash: updates.password_hash ? "[REDACTED]" : undefined },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
