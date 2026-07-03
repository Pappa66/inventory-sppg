import { createClient } from "@/lib/supabase";
import { getTokenUser, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();
    const url = new URL(request.url);
    const weekStart = url.searchParams.get("week_start");
    let query = supabase.from("menus").select("*");
    if (weekStart) query = query.eq("week_start", weekStart);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return apiError(error.message);
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

    const menu = {
      id: crypto.randomUUID(),
      week_start: body.week_start,
      day: body.day,
      recipe_ids: body.recipe_ids || [],
      portions: body.portions || 1,
      status: "DRAFT",
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("menus").insert(menu);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "CREATE_MENU", entity: "menus", entity_id: menu.id,
      note: `${body.week_start} ${body.day}`,
    });

    return apiSuccess(menu, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
