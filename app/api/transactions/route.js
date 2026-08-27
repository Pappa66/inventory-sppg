import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const VALID_ACCOUNT_CODES = ["1000", "1100", "1200", "1300", "2100", "2200", "2300", "3100"];

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

    if (!body.account_code || !VALID_ACCOUNT_CODES.includes(body.account_code)) {
      return apiError(`Kode akun tidak valid. Yang diperbolehkan: ${VALID_ACCOUNT_CODES.join(", ")}`, 400);
    }
    if (body.debit && body.credit) {
      return apiError("Transaksi tidak boleh memiliki debit DAN kredit sekaligus", 400);
    }
    if (!body.debit && !body.credit) {
      return apiError("Transaksi harus memiliki minimal debit atau kredit", 400);
    }

    if (body.transaction_date && body.account_code && body.description) {
      const { data: existing } = await supabase
        .from("transaksis")
        .select("id")
        .eq("transaction_date", body.transaction_date)
        .eq("account_code", body.account_code)
        .eq("description", body.description)
        .eq("debit", body.debit || 0)
        .eq("credit", body.credit || 0)
        .limit(1);
      if (existing && existing.length > 0) {
        return apiError("Transaksi duplikat terdeteksi — data yang sama sudah ada", 409);
      }
    }

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
