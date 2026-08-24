import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_MANAGE = ["admin", "field_assistant"];

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const planDate = searchParams.get("plan_date");

    let query = supabase
      .from("delivery_plans")
      .select(`
        *,
        delivery_plan_items (
          *,
          destinations ( name, address )
        )
      `)
      .order("plan_date", { ascending: false });

    if (planDate) {
      query = query.eq("plan_date", planDate);
    }

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
    requireRoles(...CAN_MANAGE)(user);

    const body = await request.json();
    if (!body.plan_date) return apiError("plan_date wajib diisi");

    const supabase = await createClient();
    const planId = crypto.randomUUID();

    const plan = {
      id: planId,
      plan_date: body.plan_date,
      created_by: user.id,
      notes: body.notes || null,
      created_at: new Date().toISOString(),
    };

    const { error: planError } = await supabase.from("delivery_plans").insert(plan);
    if (planError) return apiError(planError.message);

    // Insert plan items if provided
    if (Array.isArray(body.items) && body.items.length > 0) {
      const items = body.items.map((item) => ({
        id: crypto.randomUUID(),
        plan_id: planId,
        destination_id: item.destination_id,
        category: item.category,
        portions: item.portions || 0,
        notes: item.notes || null,
        created_at: new Date().toISOString(),
      }));

      const { error: itemsError } = await supabase.from("delivery_plan_items").insert(items);
      if (itemsError) return apiError(itemsError.message);
    }

    await logAudit(supabase, {
      actor: user,
      action: "CREATE_DELIVERY_PLAN",
      entity: "delivery_plans",
      entity_id: planId,
      after: { plan_date: plan.plan_date, items_count: body.items?.length || 0 },
    });

    return apiSuccess(plan, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
