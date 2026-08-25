import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

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
    return apiError(e.message, 401);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg", "field_assistant", "kitchen_head", "head_chef", "persiapan", "tenaga_masak")(user);
    const body = await request.json();
    const supabase = await createClient();

    // Validate lot exists and has enough stock
    const { data: lot, error: lotErr } = await supabase.from("stock_lots")
      .select("*, items(name, unit)")
      .eq("id", body.lot_id)
      .single();

    if (lotErr || !lot) return apiError("Lot stok tidak ditemukan");
    if (lot.actual_quantity < body.quantity) {
      return apiError(`Stok tidak cukup. Tersedia: ${lot.actual_quantity} ${lot.items?.unit || ""}`);
    }

    // Reduce stock
    const newQty = lot.actual_quantity - body.quantity;
    const { error: updateErr } = await supabase.from("stock_lots").update({
      actual_quantity: newQty,
      taken_by: user.id,
      taken_at: new Date().toISOString(),
      taken_reason: body.reason || "COOKING",
    }).eq("id", body.lot_id);

    if (updateErr) return apiError(updateErr.message);

    await logAudit(supabase, {
      actor: user, action: "STOCK_TAKEN", entity: "stock_lots", entity_id: body.lot_id,
      note: `Diambil: ${body.quantity} ${lot.items?.unit || ""} dari ${lot.item_name}. Sisa: ${newQty}. Alasan: ${body.reason || "COOKING"}`,
    });

    return apiSuccess({
      lot_id: body.lot_id,
      item_name: lot.items?.name,
      taken_quantity: body.quantity,
      remaining_quantity: newQty,
      unit: lot.items?.unit,
    }, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
