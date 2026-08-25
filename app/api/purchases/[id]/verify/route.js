import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function POST(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg", "accountant")(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    if (typeof body.verified !== "boolean") {
      return apiError("Field 'verified' wajib boolean", 400);
    }

    const { data: old } = await supabase.from("purchases").select("*").eq("id", id).single();
    if (!old) return apiError("Pembelian tidak ditemukan", 404);
    if (old.verified) return apiError("Pembelian sudah divalidasi sebelumnya", 400);

    const updates = {
      verified: body.verified,
      verified_by: user.email,
      verified_at: new Date().toISOString(),
      verification_note: body.note || null,
    };

    const { error } = await supabase.from("purchases").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: body.verified ? "VERIFY_PURCHASE" : "REJECT_PURCHASE",
      entity: "purchases", entity_id: id,
      before: { verified: old.verified },
      after: { verified: body.verified, note: body.note },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
