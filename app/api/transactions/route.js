import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const period_id = searchParams.get("period_id");
    const account_code = searchParams.get("account_code");
    const buku_pembantu = searchParams.get("buku_pembantu");

    let query = supabase.from("transaksis").select("*").order("transaction_date", { ascending: true });
    if (period_id) query = query.eq("period_id", period_id);
    if (account_code) query = query.eq("account_code", account_code);
    if (buku_pembantu) query = query.eq("buku_pembantu", buku_pembantu);

    const { data, error } = await query;
    if (error) return apiError(error.message);
    return apiSuccess(data || []);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    requireRoles("admin_apps","admin_sppg","accountant")(user);
    const body = await request.json();
    const supabase = await createClient();

    const transaksi = {
      period_id: body.period_id || null,
      transaction_date: body.transaction_date,
      account_code: body.account_code,
      description: body.description,
      debit: body.debit || 0,
      credit: body.credit || 0,
      source_table: body.source_table || null,
      source_id: body.source_id || null,
      buku_pembantu: body.buku_pembantu || null,
      notes: body.notes || "",
      created_by: user.id,
    };

    const { data, error } = await supabase.from("transaksis").insert(transaksi).select().single();
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "CREATE_TRANSAKSI", entity: "transaksis", entity_id: data.id,
      note: `Transaksi ${body.account_code}: D ${body.debit || 0} / K ${body.credit || 0}`,
    });

    return apiSuccess(data, 201);
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
