import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const parent_code = searchParams.get("parent_code");
    const category = searchParams.get("category");

    let query = supabase.from("item_hierarchies").select("*").eq("is_active", true).order("code");
    if (level) query = query.eq("level", parseInt(level));
    if (parent_code) query = query.eq("parent_code", parent_code);
    if (category) query = query.eq("category", category);

    const { data, error } = await query;
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
    const { code, name, level, parent_code, category, unit, zone } = body;

    if (!code || !name || !level) {
      return apiError("code, name, level wajib diisi");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("item_hierarchies")
      .insert({ code, name, level, parent_code: parent_code || null, category: category || null, unit: unit || null, zone: zone || null })
      .select()
      .single();

    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "CREATE_ITEM_HIERARCHY", entity: "item_hierarchies", entity_id: data.id,
      note: `Hierarki barang baru: ${code} - ${name} (Level ${level})`,
    });

    return apiSuccess(data);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
