import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const plan_date = searchParams.get("plan_date");
    const period_id = searchParams.get("period_id");

    let query = supabase.from("anggaran_periods").select("*").order("plan_date", { ascending: true });
    if (plan_date) query = query.eq("plan_date", plan_date);
    if (period_id) query = query.eq("period_id", period_id);

    const { data, error } = await query;
    if (error) return apiError(error.message);
    return apiSuccess(data || []);
  } catch (e) {
    return apiError(e.message, 401);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg","kitchen_head","accountant")(user);
    const body = await request.json();
    const supabase = await createClient();

    const anggaran = {
      plan_date: body.plan_date,
      period_id: body.period_id || null,
      // Section 1
      bahan_balita: body.bahan_balita || 0,
      bahan_paud_tk_ra: body.bahan_paud_tk_ra || 0,
      bahan_sd_1_3: body.bahan_sd_1_3 || 0,
      bahan_sd_4_6: body.bahan_sd_4_6 || 0,
      bahan_smp_mts: body.bahan_smp_mts || 0,
      bahan_sma_ma_smk: body.bahan_sma_ma_smk || 0,
      bahan_slb: body.bahan_slb || 0,
      bahan_santri: body.bahan_santri || 0,
      bahan_pend_tk: body.bahan_pend_tk || 0,
      bahan_bumil: body.bahan_bumil || 0,
      bahan_busui: body.bahan_busui || 0,
      harga_satuan1: body.harga_satuan1 || 8000,
      harga_satuan2: body.harga_satuan2 || 10000,
      bahan_rab: body.bahan_rab || 0,
      bahan_actual: body.bahan_actual || 0,
      // Section 2
      ops_jumlah_paket: body.ops_jumlah_paket || 0,
      ops_harga_satuan: body.ops_harga_satuan || 0,
      ops_rab: body.ops_rab || 0,
      ops_actual: body.ops_actual || 0,
      // Section 3
      ins_jumlah_paket: body.ins_jumlah_paket || 0,
      ins_harga_satuan: body.ins_harga_satuan || 0,
      ins_rab: body.ins_rab || 0,
      ins_actual: body.ins_actual || 0,
      notes: body.notes || "",
      created_by: user.id,
    };

    const { data, error } = await supabase.from("anggaran_periods").insert(anggaran).select().single();
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "CREATE_ANGGARAN", entity: "anggaran_periods", entity_id: data.id,
      note: `Anggaran ${body.plan_date}: RAB ${body.bahan_rab || 0}`,
    });

    return apiSuccess(data, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
