import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();

    const { data: menus } = await supabase
      .from("menus")
      .select("*")
      .in("status", ["DRAFT", "PENDING_REVIEW"])
      .order("created_at", { ascending: false });

    const allRecipeIds = Array.from(new Set((menus||[]).flatMap(m => m.recipe_ids||[])));
    const { data: allRecipes } = await supabase
      .from("recipes")
      .select("*")
      .in("id", allRecipeIds.length > 0 ? allRecipeIds : ["00000000-0000-0000-0000-000000000000"]);

    const recipeMap = {};
    (allRecipes||[]).forEach(r => { recipeMap[r.id] = r; });

    const result = (menus||[]).map(m => ({
      ...m,
      recipes: (m.recipe_ids||[]).map(id => recipeMap[id]).filter(Boolean),
    }));

    return apiSuccess(result);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
