import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request, { params }) {
  try {
    await getTokenUser(request);
    const { entity, entity_id } = await params;
    const supabase = await createClient();

    const { data: audit, error: auditErr } = await supabase
      .from("audit_trail")
      .select("*")
      .eq("entity", entity)
      .eq("entity_id", entity_id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (auditErr) return apiError("Gagal ambil riwayat: " + auditErr.message, 500);

    const allowedEntities = ["items", "menus", "purchases", "users", "recipes", "destinations", "anggaran"];
    const tableName = allowedEntities.includes(entity) ? entity : "items";
    const { data: item } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", entity_id)
      .maybeSingle();

    const rows = (audit || []).map(r => {
      const diff = {};
      const oldValues = {};
      const oldData = r.before_data && typeof r.before_data === "object" ? r.before_data : {};
      const afterData = r.after_data && typeof r.after_data === "object" ? r.after_data : {};
      for (const k of Object.keys({ ...oldData, ...afterData })) {
        if (oldData[k] !== afterData[k]) {
          diff[k] = { old: oldData[k], new: afterData[k] };
        }
      }
      Object.assign(oldValues, oldData);
      return {
        id: r.id,
        ts: r.created_at,
        action: r.action,
        actor: r.actor,
        actor_email: r.actor,
        changes: diff,
        snapshot: { ...oldValues },
        note: r.note,
      };
    });

    return apiSuccess({
      item: item || { name: entity_id },
      rows,
    });
  } catch (e) {
    return apiError(e.message, 500);
  }
}
