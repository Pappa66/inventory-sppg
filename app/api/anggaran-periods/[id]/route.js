import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function PUT(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg","kitchen_head","accountant")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const allowed = ["plan_date","total_porsi","bahan_balita","bahan_paud_tk_ra","bahan_sd_1_3","bahan_sd_4_6","bahan_smp_mts","bahan_sma_ma_smk","bahan_slb","bahan_santri","bahan_pend_tk","bahan_bumil","bahan_busui","harga_satuan1","harga_satuan2","bahan_rab","bahan_actual","ops_jumlah_paket","ops_harga_satuan","ops_rab","ops_actual","ins_jumlah_paket","ins_harga_satuan","ins_rab","ins_actual","notes"];
    const updates = { updated_at: new Date().toISOString() };
    for (const key of allowed) { if (body[key] !== undefined) updates[key] = body[key]; }

    const { data, error } = await supabase
      .from("anggaran_periods")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_ANGGARAN", entity: "anggaran_periods", entity_id: id,
      note: `Update anggaran ${body.plan_date || ""}`,
    });

    return apiSuccess(data);
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

    const { error } = await supabase.from("anggaran_periods").delete().eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "DELETE_ANGGARAN", entity: "anggaran_periods", entity_id: id,
      note: `Hapus anggaran`,
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
