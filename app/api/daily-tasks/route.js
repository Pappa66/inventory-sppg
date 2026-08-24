import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    if (!user) return apiError("Unauthorized", 401);
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    let query = supabase
      .from("daily_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    const taskDate = searchParams.get("task_date");
    if (taskDate) query = query.eq("task_date", taskDate);

    const userId = searchParams.get("user_id");
    if (userId) query = query.eq("user_id", userId);

    const role = searchParams.get("role");
    if (role) query = query.eq("role", role);

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
    if (!user) return apiError("Unauthorized", 401);
    const supabase = await createClient();
    const body = await request.json();

    const { task_date, role, task_type, category, portions, photo_url, description, status } = body;

    if (!task_date || !task_type) {
      return apiError("task_date dan task_type wajib diisi");
    }

    const allowedRoles = ["pemorsian", "persiapan", "tenaga_masak", "kebersihan", "pencuci"];
    if (!allowedRoles.includes(task_type)) {
      return apiError("task_type tidak valid");
    }

    const { data, error } = await supabase
      .from("daily_tasks")
      .insert({
        task_date,
        user_id: user.id || user.user_id,
        role: user.role,
        task_type,
        category: category || null,
        portions: portions || 0,
        photo_url: photo_url || null,
        description: description || null,
        status: status || "SELESAI",
      })
      .select()
      .single();

    if (error) return apiError(error.message);

    return apiSuccess(data, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
