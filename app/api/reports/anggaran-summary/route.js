import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    let query = supabase.from("anggaran_periods").select("*").order("created_at", { ascending: true });

    const from = searchParams.get("from");
    if (from) query = query.gte("created_at", from);

    const to = searchParams.get("to");
    if (to) query = query.lte("created_at", to);

    const { data, error } = await query;
    if (error) return apiError(error.message);

    const anggarans = data || [];

    const summary = anggarans.map((a) => ({
      period_name: a.period_name,
      total_portions: a.total_porsi || 0,
      rab: a.rab || 0,
      actual: 0,
      selisih: (a.rab || 0),
    }));

    const totals = summary.reduce(
      (acc, s) => ({
        total_portions: acc.total_portions + s.total_portions,
        rab: acc.rab + s.rab,
        actual: acc.actual + s.actual,
        selisih: acc.selisih + s.selisih,
      }),
      { total_portions: 0, rab: 0, actual: 0, selisih: 0 }
    );

    return apiSuccess({ summary, totals });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
