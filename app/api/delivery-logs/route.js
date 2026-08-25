import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignment_id");

    let query = supabase
      .from("delivery_logs")
      .select(`
        *,
        destinations ( name, address )
      `)
      .order("created_at", { ascending: false });

    if (assignmentId) {
      query = query.eq("assignment_id", assignmentId);
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
    requireRoles("admin_apps","admin_sppg", "field_assistant", "driver")(user);

    const body = await request.json();
    if (!body.assignment_id) return apiError("assignment_id wajib diisi");
    if (!body.destination_id) return apiError("destination_id wajib diisi");
    if (!body.status) return apiError("status wajib diisi");

    const validStatuses = ["NOT_DELIVERED", "IN_TRANSIT", "DELIVERED"];
    if (!validStatuses.includes(body.status)) {
      return apiError(`status harus salah satu dari: ${validStatuses.join(", ")}`);
    }

    const supabase = await createClient();

    // Verify assignment exists
    const { data: assignment } = await supabase.from("delivery_assignments").select("id").eq("id", body.assignment_id).single();
    if (!assignment) return apiError("Assignment tidak ditemukan", 404);

    // Verify destination exists
    const { data: dest } = await supabase.from("destinations").select("id").eq("id", body.destination_id).single();
    if (!dest) return apiError("Destination tidak ditemukan", 404);

    const log = {
      id: crypto.randomUUID(),
      assignment_id: body.assignment_id,
      destination_id: body.destination_id,
      status: body.status,
      photo_url: body.photo_url || null,
      notes: body.notes || null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("delivery_logs").insert(log);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user,
      action: "CREATE_DELIVERY_LOG",
      entity: "delivery_logs",
      entity_id: log.id,
      after: {
        assignment_id: log.assignment_id,
        destination_id: log.destination_id,
        status: log.status,
      },
    });

    return apiSuccess(log, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
