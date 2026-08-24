import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_EDIT = ["admin", "field_assistant"];

export async function PATCH(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles(...CAN_EDIT)(user);
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: old } = await supabase.from("anggaran").select("*").eq("id", id).single();

    const updates = { ...body, updated_at: new Date().toISOString() };
    delete updates.id;

    if (updates.balita != null || updates.paud_tk != null || updates.sd_1_3 != null || updates.sd_4_6 != null || updates.smp != null || updates.sma != null || updates.slb != null || updates.santri != null || updates.pend_tk != null || updates.bumil != null || updates.busui != null || updates.lainnya != null || updates.price_paket_a != null) {
      const balita = updates.balita ?? old?.balita ?? 0;
      const paud_tk = updates.paud_tk ?? old?.paud_tk ?? 0;
      const sd_1_3 = updates.sd_1_3 ?? old?.sd_1_3 ?? 0;
      const sd_4_6 = updates.sd_4_6 ?? old?.sd_4_6 ?? 0;
      const smp = updates.smp ?? old?.smp ?? 0;
      const sma = updates.sma ?? old?.sma ?? 0;
      const slb = updates.slb ?? old?.slb ?? 0;
      const santri = updates.santri ?? old?.santri ?? 0;
      const pend_tk = updates.pend_tk ?? old?.pend_tk ?? 0;
      const bumil = updates.bumil ?? old?.bumil ?? 0;
      const busui = updates.busui ?? old?.busui ?? 0;
      const lainnya = updates.lainnya ?? old?.lainnya ?? 0;
      const price_paket_a = updates.price_paket_a ?? old?.price_paket_a ?? 0;
      updates.total_pakets = balita + paud_tk + sd_1_3 + sd_4_6 + smp + sma + slb + santri + pend_tk + bumil + busui + lainnya;
      updates.rab = updates.total_pakets * price_paket_a;
    }

    const { error } = await supabase.from("anggaran").update(updates).eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_ANGGARAN", entity: "anggaran", entity_id: id,
      before: { plan_date: old?.plan_date, total_pakets: old?.total_pakets, rab: old?.rab },
      after: { plan_date: updates.plan_date || old?.plan_date, total_pakets: updates.total_pakets ?? old?.total_pakets, rab: updates.rab ?? old?.rab },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin")(user);
    const { id } = await params;
    const supabase = await createClient();

    const { data: old } = await supabase.from("anggaran").select("*").eq("id", id).single();
    const { error } = await supabase.from("anggaran").delete().eq("id", id);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "DELETE_ANGGARAN", entity: "anggaran", entity_id: id,
      before: { plan_date: old?.plan_date },
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
