import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("biweekly_periods")
      .select("*")
      .eq("is_active", true)
      .order("start_date", { ascending: false });

    if (error) return apiError(error.message);
    return apiSuccess(data);
  } catch (e) {
    return apiError(e.message);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg")(user);
    const body = await request.json();
    const { period_name, start_date, end_date } = body;

    if (!period_name || !start_date || !end_date) {
      return apiError("period_name, start_date, end_date wajib diisi");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("biweekly_periods")
      .insert({ period_name, start_date, end_date })
      .select()
      .single();

    if (error) return apiError(error.message);
    return apiSuccess(data);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
