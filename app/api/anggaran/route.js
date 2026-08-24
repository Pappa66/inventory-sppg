import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_EDIT = ["admin", "field_assistant"];

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    let query = supabase.from("anggaran").select("*").order("plan_date", { ascending: true });

    const plan_date = searchParams.get("plan_date");
    if (plan_date) query = query.eq("plan_date", plan_date);

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
    requireRoles(...CAN_EDIT)(user);
    const body = await request.json();
    const supabase = await createClient();

    const balita = body.balita || 0;
    const paud_tk = body.paud_tk || 0;
    const sd_1_3 = body.sd_1_3 || 0;
    const sd_4_6 = body.sd_4_6 || 0;
    const smp = body.smp || 0;
    const sma = body.sma || 0;
    const slb = body.slb || 0;
    const santri = body.santri || 0;
    const pend_tk = body.pend_tk || 0;
    const bumil = body.bumil || 0;
    const busui = body.busui || 0;
    const lainnya = body.lainnya || 0;
    const price_paket_a = body.price_paket_a || 0;

    const total_pakets = balita + paud_tk + sd_1_3 + sd_4_6 + smp + sma + slb + santri + pend_tk + bumil + busui + lainnya;
    const rab = total_pakets * price_paket_a;

    const anggaran = {
      id: crypto.randomUUID(),
      plan_date: body.plan_date,
      balita, paud_tk, sd_1_3, sd_4_6, smp, sma, slb, santri, pend_tk, bumil, busui, lainnya,
      price_paket_a, price_paket_b: body.price_paket_b || 0,
      total_pakets, rab,
      notes: body.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("anggaran").insert(anggaran);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "CREATE_ANGGARAN", entity: "anggaran", entity_id: anggaran.id,
      after: { plan_date: anggaran.plan_date, total_pakets: anggaran.total_pakets, rab: anggaran.rab },
    });

    return apiSuccess(anggaran, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
