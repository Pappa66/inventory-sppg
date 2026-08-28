import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, apiError, apiSuccess } from "@/lib/db-helpers";

// Pengambilan Barang: Persiapan mengambil barang dari stok untuk dimasak
// Stok langsung berkurang di sistem

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg","field_assistant","kitchen_head","head_chef","persiapan","tenaga_masak")(user);
    const supabase = await createClient();
    const { data } = await supabase.from("stock_lots")
      .select("*, items(name, unit)")
      .not("taken_by", "is", null)
      .order("taken_at", { ascending: false });
    const enriched = (data || []).map(l => ({
      ...l,
      item_name: l.items?.name || "—",
      unit: l.items?.unit || "",
    }));
    return apiSuccess(enriched);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg", "field_assistant", "kitchen_head", "head_chef", "persiapan", "tenaga_masak")(user);
    const body = await request.json();
    const supabase = await createClient();

    const isBatch = Array.isArray(body);
    const items = isBatch ? body : [body];
    const lotIds = items.map(i => i.lot_id);

    // 1) Single batch fetch for all requested lots
    const { data: lots, error: fetchErr } = await supabase
      .from("stock_lots")
      .select("*, items(name, unit)")
      .in("id", lotIds);

    if (fetchErr) return apiError(fetchErr.message);

    // 2) Build lookup map
    const lotMap = new Map((lots || []).map(l => [l.id, l]));

    // 3) Validate all items before any writes
    for (const item of items) {
      const lot = lotMap.get(item.lot_id);
      if (!lot) return apiError(`Lot stok ${item.lot_id} tidak ditemukan`);
      if (lot.actual_quantity < item.quantity) {
        return apiError(`${lot.items?.name || "Item"}: stok tidak cukup. Tersedia: ${lot.actual_quantity} ${lot.items?.unit || ""}`);
      }
    }

    const now = new Date().toISOString();

    // 4) Execute all updates concurrently
    const updateResults = await Promise.all(items.map(async (item) => {
      const lot = lotMap.get(item.lot_id);
      const newQty = lot.actual_quantity - item.quantity;
      const { error: updateErr } = await supabase.from("stock_lots").update({
        actual_quantity: newQty,
        taken_by: user.id,
        taken_at: now,
        taken_reason: item.reason || "COOKING",
      }).eq("id", item.lot_id);

      if (updateErr) throw new Error(updateErr.message);
      return { item, lot, newQty };
    }));

    // 5) Batch insert audit trail
    const auditEntries = updateResults.map(({ item, lot, newQty }) => ({
      actor: user?.name || user?.email || "System",
      actor_email: user?.email || null,
      action: "STOCK_TAKEN",
      entity: "stock_lots",
      entity_id: item.lot_id,
      note: `Diambil: ${item.quantity} ${lot.items?.unit || ""} dari ${lot.items?.name || "unknown"}. Sisa: ${newQty}. Alasan: ${item.reason || "COOKING"}`,
      before_data: { actual_quantity: lot.actual_quantity, taken_by: null, taken_at: null, taken_reason: null },
      after_data: { actual_quantity: newQty, taken_by: user.id, taken_at: now, taken_reason: item.reason || "COOKING" },
      zone: null,
      created_at: now,
    }));

    const { error: auditErr } = await supabase.from("audit_trail").insert(auditEntries);
    if (auditErr) console.error("Audit insert failed:", auditErr);

    // 6) Build response
    const results = updateResults.map(({ item, lot, newQty }) => ({
      lot_id: item.lot_id,
      item_name: lot.items?.name,
      taken_quantity: item.quantity,
      remaining_quantity: newQty,
      unit: lot.items?.unit,
    }));

    return apiSuccess(isBatch ? results : results[0], 201);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
