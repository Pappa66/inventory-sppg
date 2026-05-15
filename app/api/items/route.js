import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_EDIT = ["admin", "head_chef", "kitchen_head", "nutritionist"];

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    const supabase = await createClient();
    const { data } = await supabase.from("items").select("*").order("name");
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

    const item = {
      id: crypto.randomUUID(),
      name: body.name,
      unit: body.unit,
      category: body.category,
      par_level: body.par_level || 0,
      price_per_unit: body.price_per_unit || 0,
      zone: body.zone || "DRY",
      allergens: body.allergens || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("items").insert(item);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "CREATE_ITEM", entity: "items", entity_id: item.id,
      after: { name: item.name, category: item.category },
    });

    return apiSuccess(item, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
