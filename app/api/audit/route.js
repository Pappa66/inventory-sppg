import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg","accountant","kitchen_head","head_chef")(user);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "200");

    const supabase = await createClient();
    const { data } = await supabase
      .from("audit_trail")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    return apiSuccess(data || []);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
