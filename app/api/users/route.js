import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";
import bcrypt from "bcryptjs";

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg")(user);
    const supabase = await createClient();
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    return apiSuccess(data || []);
  } catch (e) {
    return apiError(e.message, 401);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg")(user);
    const body = await request.json();
    const supabase = await createClient();

    const id = crypto.randomUUID();
    const passwordHash = bcrypt.hashSync(body.password, 10);

    const newUser = {
      id,
      email: body.email.toLowerCase(),
      name: body.name,
      role: body.role,
      is_active: true,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("users").insert(newUser);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "CREATE_USER", entity: "users", entity_id: id,
      after: { email: newUser.email, name: newUser.name, role: newUser.role },
    });

    const { password_hash, ...safe } = newUser;
    return apiSuccess(safe, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
