import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();

    const url = new URL(request.url);
    const weekStart = url.searchParams.get("week_start");

    let query = supabase.from("menus").select("*");
    if (weekStart) query = query.eq("week_start", weekStart);
    const { data: menus } = await query;

    const recipeIds = [...new Set((menus || []).flatMap(m => m.recipe_ids || []))];
    const rmap = {};
    if (recipeIds.length > 0) {
      const { data: recipes } = await supabase.from("recipes").select("*").in("id", recipeIds);
      for (const r of recipes || []) rmap[r.id] = r;
    }

    const rows = (menus || []).map(m => {
      const portions = m.portions || 1;
      const agg = { calories_kcal: 0, protein_g: 0, carbs_g: 0, fats_g: 0, sodium_mg: 0 };
      const allergens = new Set();
      const recipeNames = [];

      for (const rid of m.recipe_ids || []) {
        const r = rmap[rid];
        if (!r) continue;
        recipeNames.push(r.name);
        for (const k of Object.keys(agg)) agg[k] += Number(r[k] || 0);
        for (const a of r.allergens || []) allergens.add(a);
      }

      return {
        day: m.day,
        week_start: m.week_start,
        portions,
        status: m.status,
        recipes: recipeNames,
        totals_per_serving: Object.fromEntries(Object.entries(agg).map(([k, v]) => [k, Math.round(v * 10) / 10])),
        totals_for_day: Object.fromEntries(Object.entries(agg).map(([k, v]) => [k, Math.round(v * portions * 10) / 10])),
        allergens: [...allergens].sort(),
      };
    });

    return apiSuccess(rows);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
