import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    await getTokenUser(request);
    const supabase = await createClient();
    const { data } = await supabase.from("recipes").select("*").order("name");
    return apiSuccess(data || []);
  } catch (e) {
    return apiError(e.message, 401);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin", "head_chef", "nutritionist", "kitchen_head")(user);
    const body = await request.json();
    const supabase = await createClient();

    const recipe = {
      id: crypto.randomUUID(),
      name: body.name,
      servings: body.servings || 1,
      ingredients: body.ingredients || [],
      instructions: body.instructions || "",
      calories_kcal: body.calories_kcal || 0,
      protein_g: body.protein_g || 0,
      carbs_g: body.carbs_g || 0,
      fats_g: body.fats_g || 0,
      sodium_mg: body.sodium_mg || 0,
      allergens: body.allergens || [],
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("recipes").insert(recipe);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "CREATE_RECIPE", entity: "recipes", entity_id: recipe.id,
      after: { name: recipe.name },
    });

    return apiSuccess(recipe, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
