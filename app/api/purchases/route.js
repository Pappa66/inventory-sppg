import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();
    const { data } = await supabase.from("purchases").select("*").order("purchased_at", { ascending: false }).limit(2000);
    return apiSuccess(data || []);
  } catch (e) {
    return apiError(e.message, 401);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    const body = await request.json();
    const supabase = await createClient();

    const purchase = {
      id: crypto.randomUUID(),
      category: body.category,
      description: body.description,
      amount_idr: body.amount_idr,
      receipt_total_idr: body.receipt_total_idr || null,
      receipt_photo: body.receipt_photo || null,
      transport_amount_idr: body.transport_amount_idr || 0,
      supplier: body.supplier || null,
      items: body.items || [],
      purchased_at: body.purchased_at || new Date().toISOString(),
      created_by: user.email,
      created_by_name: user.name,
      created_at: new Date().toISOString(),
      verified: false,
    };

    const { error } = await supabase.from("purchases").insert(purchase);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "CREATE_PURCHASE", entity: "purchases", entity_id: purchase.id,
      note: `${body.category}: ${body.description} (${body.amount_idr})`,
    });

    return apiSuccess(purchase, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
