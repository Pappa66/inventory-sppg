import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();
    const url = new URL(request.url);
    const checkDate = url.searchParams.get("check_date");

    let query = supabase.from("stock_cross_checks").select("*, items(name, unit, category)").order("check_date", { ascending: false });
    if (checkDate) query = query.eq("check_date", checkDate);
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
    requireRoles("admin", "field_assistant", "pemeriksa")(user);
    const body = await request.json();
    const supabase = await createClient();

    const checks = body.checks || [];
    const rows = checks.map(c => ({
      id: crypto.randomUUID(),
      check_date: body.check_date,
      item_id: c.item_id,
      opening_quantity: c.opening_quantity || 0,
      received_quantity: c.received_quantity || 0,
      used_quantity: c.used_quantity || 0,
      closing_quantity: c.closing_quantity || 0,
      actual_closing: c.actual_closing ?? null,
      zone: c.zone || "DRY",
      notes: c.notes || "",
      checked_by: user.id,
      checked_by_name: user.name,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("stock_cross_checks").insert(rows);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "CREATE_CROSS_CHECK", entity: "stock_cross_checks",
      note: `${body.check_date}: ${rows.length} bahan dicek`,
    });

    return apiSuccess({ count: rows.length }, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
