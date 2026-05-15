import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request, { params }) {
  try {
    await getTokenUser();
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

    const { data: item } = await supabase
      .from("items")
      .select("name")
      .eq("id", entity_id)
      .maybeSingle();

    const rows = (audit || []).map(r => {
      const snapshot = {};
      if (r.changes && typeof r.changes === "object") {
        for (const [k, v] of Object.entries(r.changes)) {
          if (v && typeof v === "object" && "new" in v) {
            snapshot[k] = v.new;
          }
        }
      }
      return {
        id: r.id,
        ts: r.timestamp,
        action: r.action,
        actor: r.actor,
        actor_email: r.actor,
        changes: r.changes,
        snapshot,
        note: r.note,
      };
    });

    return apiSuccess({
      item: { name: item?.name || entity_id },
      rows,
    });
  } catch (e) {
    return apiError(e.message, 500);
  }
}
