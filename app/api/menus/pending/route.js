import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET() {
  try {
    await getTokenUser();
    const supabase = await createClient();
    const { data } = await supabase
      .from("menus")
      .select("*")
      .in("status", ["DRAFT", "PENDING_REVIEW"])
      .order("created_at", { ascending: false });
    return apiSuccess(data || []);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
