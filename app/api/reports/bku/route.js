import { createClient } from "@/lib/supabase";
import { getTokenUser, apiError, apiSuccess } from "@/lib/db-helpers";

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    let query = supabase.from("transaksis").select("*").order("transaction_date", { ascending: true });

    const from = searchParams.get("from");
    if (from) query = query.gte("transaction_date", from);

    const to = searchParams.get("to");
    if (to) query = query.lte("transaction_date", to);

    const { data, error } = await query;
    if (error) return apiError(error.message);

    const transaksis = data || [];

    let balance = 0;
    const rows = transaksis.map((t) => {
      balance += (t.debit_amount || 0) - (t.credit_amount || 0);
      const d = new Date(t.transaction_date);
      return {
        month: d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
        day: t.transaction_date,
        evidence: t.evidence_number,
        description: t.description,
        debit: t.debit_amount || 0,
        credit: t.credit_amount || 0,
        balance,
      };
    });

    const totalDebit = transaksis.reduce((s, t) => s + (t.debit_amount || 0), 0);
    const totalCredit = transaksis.reduce((s, t) => s + (t.credit_amount || 0), 0);

    return apiSuccess({
      rows,
      saldo_awal: rows.length > 0 ? rows[0].debit - rows[0].credit : 0,
      saldo_akhir: balance,
      total_debit: totalDebit,
      total_credit: totalCredit,
    });
  } catch (e) {
    return apiError(e.message, 401);
  }
}
