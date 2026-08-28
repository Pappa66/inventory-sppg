import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_EDIT = ["admin_apps","admin_sppg", "kitchen_head"];

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles(...CAN_EDIT)(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("anggaran").select("*").eq("id", id).single();
    if (!old) return apiError("Anggaran tidak ditemukan", 404);

    const allowed = ["total_portions", "price_per_portion", "rab", "notes"];
    const updates = Object.fromEntries(
      allowed.filter((k) => k in body).map((k) => [k, body[k]])
    );

    if (updates.total_portions != null || updates.price_per_portion != null) {
      const total_portions = updates.total_portions ?? old?.total_portions ?? 0;
      const price_per_portion = updates.price_per_portion ?? old?.price_per_portion ?? 15000;
      updates.total_portions = total_portions;
      updates.rab = total_portions * price_per_portion;
    }

    const { error } = await supabase.from("anggaran").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_ANGGARAN", entity: "anggaran", entity_id: id,
      before: { plan_date: old?.plan_date, total_portions: old?.total_portions, rab: old?.rab },
      after: { plan_date: updates.plan_date || old?.plan_date, total_portions: updates.total_portions ?? old?.total_portions, rab: updates.rab ?? old?.rab },
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

    const { data: old } = await supabase.from("anggaran").select("*").eq("id", id).single();
    if (!old) return apiError("Anggaran tidak ditemukan", 404);
    const { error } = await supabase.from("anggaran").delete().eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "DELETE_ANGGARAN", entity: "anggaran", entity_id: id,
      before: { plan_date: old?.plan_date },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
