import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();
    const url = new URL(request.url);
    const planDate = url.searchParams.get("plan_date");

    let planQuery = supabase.from("delivery_plans").select(`
      id, plan_date, notes, created_at,
      delivery_plan_items (id, category, portions, destination_id, destinations (id, name, address)),
      delivery_assignments (id, driver_id, status, started_at, completed_at, users (id, name),
        delivery_logs (id, destination_id, status, photo_url, notes, created_at))
    `);

    if (planDate) planQuery = planQuery.eq("plan_date", planDate);

    const { data: plans, error } = await planQuery.order("plan_date", { ascending: false });
    if (error) return apiError(error.message);

    const summary = {
      total_plans: plans.length,
      total_destinations: 0,
      delivered: 0,
      in_transit: 0,
      not_delivered: 0,
      pending: 0,
      by_category: {},
    };

    for (const plan of plans) {
      const items = plan.delivery_plan_items || [];
      const uniqueDests = new Set(items.map(i => i.destination_id));
      summary.total_destinations += uniqueDests.size;

      for (const assignment of plan.delivery_assignments || []) {
        const logs = assignment.delivery_logs || [];
        for (const dest of uniqueDests) {
          const log = logs.find(l => l.destination_id === dest);
          if (log) {
            if (log.status === "DELIVERED") summary.delivered++;
            else if (log.status === "IN_TRANSIT") summary.in_transit++;
            else summary.not_delivered++;
          } else {
            summary.pending++;
          }
        }
      }

      if (plan.delivery_assignments.length === 0) {
        summary.pending += uniqueDests.size;
      }

      for (const item of items) {
        if (!summary.by_category[item.category]) {
          summary.by_category[item.category] = { total_portions: 0, destinations: 0 };
        }
        summary.by_category[item.category].total_portions += item.portions;
        summary.by_category[item.category].destinations++;
      }
    }

    return apiSuccess({ plans, summary });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
