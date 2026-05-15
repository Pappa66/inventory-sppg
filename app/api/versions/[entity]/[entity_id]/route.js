import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request, { params }) {
  try {
    await getTokenUser(request);
    const { entity, entity_id } = await params;
    const supabase = await createClient();

    const { data: audit } = await supabase
      .from("audit_trail")
      .select("*")
      .eq("entity", entity)
      .eq("entity_id", entity_id)
      .order("timestamp", { ascending: false })
      .limit(50);

    const { data: item } = await supabase
      .from("items")
      .select("name")
      .eq("id", entity_id)
      .single();

    return apiSuccess({
      item: { name: item?.name || entity_id },
      rows: (audit || []).map(r => ({
        ts: r.timestamp,
        action: r.action,
        actor: r.actor,
        changes: r.changes,
        snapshot: r.changes,
        note: r.note,
      })),
    });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
