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
      .order("timestamp", { ascending: false })
      .limit(50);

    if (auditErr) return apiError("Gagal ambil riwayat: " + auditErr.message, 500);

    const allowedEntities = ["items", "users", "stock_lots", "item_hierarchies", "periods", "suppliers"];
    const tableName = allowedEntities.includes(entity) ? entity : "items";
    const { data: item } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", entity_id)
      .maybeSingle();

    const rows = (audit || []).map(r => {
      const diff = {};
      const oldValues = {};
      if (r.changes && typeof r.changes === "object") {
        for (const [k, v] of Object.entries(r.changes)) {
          if (v && typeof v === "object" && "new" in v) {
            diff[k] = { old: v.old, new: v.new };
            oldValues[k] = v.old;
          }
        }
      }
      return {
        id: r.id,
        ts: r.timestamp,
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
