import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, logAudit, apiError, apiSuccess } from "@/lib/db-helpers";

const CAN_EDIT = ["admin", "accountant"];

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    let query = supabase.from("transaksis").select("*").order("transaction_date", { ascending: true });

    const transaction_date = searchParams.get("transaction_date");
    if (transaction_date) query = query.eq("transaction_date", transaction_date);

    const auxiliary_book = searchParams.get("auxiliary_book");
    if (auxiliary_book) query = query.eq("auxiliary_book", auxiliary_book);

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
    requireRoles(...CAN_EDIT)(user);
    const body = await request.json();
    const supabase = await createClient();

    const transaksi = {
      id: crypto.randomUUID(),
      transaction_date: body.transaction_date,
      evidence_number: body.evidence_number || "",
      description: body.description || "",
      debit_amount: body.debit_amount || 0,
      credit_amount: body.credit_amount || 0,
      auxiliary_book: body.auxiliary_book || "OPERASIONAL",
      account_source: body.account_source || "",
      account_dest: body.account_dest || "",
      account_code: body.account_code || "",
      notes: body.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("transaksis").insert(transaksi);
    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "CREATE_TRANSAKSI", entity: "transaksis", entity_id: transaksi.id,
      after: { description: transaksi.description, debit_amount: transaksi.debit_amount, credit_amount: transaksi.credit_amount, auxiliary_book: transaksi.auxiliary_book },
    });

    return apiSuccess(transaksi, 201);
  } catch (e) {
    return apiError(e.message, 401);
  }
}
