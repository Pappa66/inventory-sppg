import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const VALID_ACCOUNT_CODES = ["1000", "1100", "1200", "1300", "2100", "2200", "2300", "3100"];

export async function PUT(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg","accountant")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: existing } = await supabase.from("transaksis").select("id").eq("id", id).single();
    if (!existing) return apiError("Transaksi tidak ditemukan", 404);

    if (body.account_code && !VALID_ACCOUNT_CODES.includes(body.account_code)) {
      return apiError(`Kode akun tidak valid. Yang diperbolehkan: ${VALID_ACCOUNT_CODES.join(", ")}`, 400);
    }

    const allowed = ["period_id","transaction_date","account_code","description","debit","credit","buku_pembantu","notes"];
    const updates = {};
    for (const key of allowed) { if (body[key] !== undefined) updates[key] = body[key]; }

    const { data, error } = await supabase
      .from("transaksis")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_TRANSAKSI", entity: "transaksis", entity_id: id,
      note: `Update transaksi ${body.account_code || ""}`,
    });

    return apiSuccess(data);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg","accountant")(user);
    const { id } = await params;
    const supabase = await createClient();

    const { data: existing } = await supabase.from("transaksis").select("id").eq("id", id).single();
    if (!existing) return apiError("Transaksi tidak ditemukan", 404);

    const { error } = await supabase.from("transaksis").delete().eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "DELETE_TRANSAKSI", entity: "transaksis", entity_id: id,
      note: `Hapus transaksi`,
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
