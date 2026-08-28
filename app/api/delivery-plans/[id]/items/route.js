import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_MANAGE = ["admin_apps","admin_sppg", "field_assistant"];

export async function POST(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles(...CAN_MANAGE)(user);

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    // Verify plan exists
    const { data: plan } = await supabase.from("delivery_plans").select("id").eq("id", id).single();
    if (!plan) return apiError("Delivery plan tidak ditemukan", 404);

    if (!body.destination_id) return apiError("destination_id wajib diisi");
    if (!body.category) return apiError("category wajib diisi");

    const item = {
      id: crypto.randomUUID(),
      plan_id: id,
      destination_id: body.destination_id,
      category: body.category,
      portions: body.portions || 0,
      notes: body.notes || null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("delivery_plan_items").insert(item);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user,
      action: "CREATE_DELIVERY_PLAN_ITEM",
      entity: "delivery_plan_items",
      entity_id: item.id,
      after: { plan_id: id, destination_id: item.destination_id, category: item.category, portions: item.portions },
    });

    return apiSuccess(item, 201);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles(...CAN_MANAGE)(user);

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    if (!body.item_id) return apiError("item_id wajib diisi untuk update");

    const { data: old } = await supabase.from("delivery_plan_items").select("*").eq("id", body.item_id).eq("plan_id", id).single();
    if (!old) return apiError("Plan item tidak ditemukan", 404);

    const allowedFields = ["category", "portions", "notes"];
    const updates = {};
    for (const k of allowedFields) {
      if (body[k] !== undefined) updates[k] = body[k];
    }

    const { error } = await supabase.from("delivery_plan_items").update(updates).eq("id", body.item_id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user,
      action: "UPDATE_DELIVERY_PLAN_ITEM",
      entity: "delivery_plan_items",
      entity_id: body.item_id,
      before: { category: old.category, portions: old.portions },
      after: { category: updates.category || old.category, portions: updates.portions ?? old.portions },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
