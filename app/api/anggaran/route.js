import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_EDIT = ["admin", "kitchen_head"];

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

    const total_portions = body.total_portions || 0;
    const price_per_portion = body.price_per_portion || 15000;
    const rab = total_portions * price_per_portion;

    const anggaran = {
      id: crypto.randomUUID(),
      plan_date: body.plan_date,
      total_portions,
      price_per_portion,
      rab,
      actual: body.actual || 0,
      notes: body.notes || "",
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("anggaran").insert(anggaran);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "CREATE_ANGGARAN", entity: "anggaran", entity_id: anggaran.id,
      after: { plan_date: anggaran.plan_date, total_portions: anggaran.total_portions, rab: anggaran.rab },
    });

    return apiSuccess(anggaran, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
