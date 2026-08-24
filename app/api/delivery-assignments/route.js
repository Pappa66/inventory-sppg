import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_MANAGE = ["admin", "field_assistant"];

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("plan_id");
    const driverId = searchParams.get("driver_id");

    let query = supabase
      .from("delivery_assignments")
      .select(`
        *,
        driver:users ( id, name, email, phone ),
        delivery_plans ( id, plan_date, notes )
      `)
      .order("created_at", { ascending: false });

    if (planId) {
      query = query.eq("plan_id", planId);
    }
    if (driverId) {
      query = query.eq("driver_id", driverId);
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
    if (!body.plan_id) return apiError("plan_id wajib diisi");
    if (!body.driver_id) return apiError("driver_id wajib diisi");

    const supabase = await createClient();

    // Verify plan exists
    const { data: plan } = await supabase.from("delivery_plans").select("id").eq("id", body.plan_id).single();
    if (!plan) return apiError("Delivery plan tidak ditemukan", 404);

    // Verify driver exists and has driver role
    const { data: driver } = await supabase.from("users").select("id, role").eq("id", body.driver_id).single();
    if (!driver) return apiError("Driver tidak ditemukan", 404);
    if (driver.role !== "driver") return apiError("User bukan driver", 400);

    const assignment = {
      id: crypto.randomUUID(),
      plan_id: body.plan_id,
      driver_id: body.driver_id,
      status: "PENDING",
      started_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("delivery_assignments").insert(assignment);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user,
      action: "CREATE_DELIVERY_ASSIGNMENT",
      entity: "delivery_assignments",
      entity_id: assignment.id,
      after: { plan_id: assignment.plan_id, driver_id: assignment.driver_id, status: assignment.status },
    });

    return apiSuccess(assignment, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
