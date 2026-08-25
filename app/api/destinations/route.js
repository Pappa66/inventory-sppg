import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_MANAGE = ["admin_apps","admin_sppg", "field_assistant"];

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("is_active");

    let query = supabase.from("destinations").select("*").order("name");
    if (isActive !== null) {
      query = query.eq("is_active", isActive === "true");
    }

    const { data, error } = await query;
    if (error) return apiError(error.message);
    return apiSuccess(data || []);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles(...CAN_MANAGE)(user);

    const body = await request.json();
    if (!body.name) return apiError("name wajib diisi");

    const supabase = await createClient();

    const destination = {
      id: crypto.randomUUID(),
      name: body.name,
      address: body.address || null,
      contact_person: body.contact_person || null,
      phone: body.phone || null,
      notes: body.notes || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("destinations").insert(destination);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user,
      action: "CREATE_DESTINATION",
      entity: "destinations",
      entity_id: destination.id,
      after: { name: destination.name, address: destination.address },
    });

    return apiSuccess(destination, 201);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
