import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();
    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .order("purchased_at", { ascending: false });

    const total_stock = (purchases || []).filter(p => p.category === "STOCK").reduce((s, p) => s + (p.amount_idr || 0), 0);
    const total_opex = (purchases || []).filter(p => p.category === "OPERATIONAL").reduce((s, p) => s + (p.amount_idr || 0), 0);
    const total_transport = (purchases || []).reduce((s, p) => s + (p.transport_amount_idr || 0), 0);
    const verified_count = (purchases || []).filter(p => p.verified).length;

    return apiSuccess({
      rows: purchases || [],
      summary: {
        total_stock,
        total_opex,
        total_transport,
        grand_total: total_stock + total_opex + total_transport,
        verified_count,
        total_count: (purchases || []).length,
      },
    });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
