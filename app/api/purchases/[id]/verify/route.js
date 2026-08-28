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
      verified_by: user.id,
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

    if (body.verified) {
      const purchaseItems = old.items || [];
      const totalAmount = Number(old.amount_idr) || 0;
      const transportAmount = Number(old.transport_amount_idr) || 0;

      try {
        if (purchaseItems.length > 0) {
          const itemIds = purchaseItems.map(it => it.item_id).filter(Boolean);
          const { data: itemRows } = await supabase.from("items").select("id, zone").in("id", itemIds);
          const itemZoneMap = {};
          (itemRows || []).forEach(it => { itemZoneMap[it.id] = it.zone || "DRY"; });

          const lotRows = purchaseItems.map((it) => ({
            item_id: it.item_id,
            quantity: Number(it.quantity) || 0,
            actual_quantity: Number(it.quantity) || 0,
            zone: itemZoneMap[it.item_id] || "DRY",
            note: `Pembelian ${old.description || id}`,
            received_at: old.purchased_at || new Date().toISOString(),
          }));

          const { error: lotErr } = await supabase.from("stock_lots").insert(lotRows);
          if (lotErr) {
            await supabase.from("purchases").update({ verified: false }).eq("id", id);
            return apiError("Gagal membuat stok lot: " + lotErr.message);
          }

          await logAudit(supabase, {
            actor: user, action: "AUTO_STOCK_LOT_CREATED",
            entity: "purchases", entity_id: id,
            note: `Dibuat ${lotRows.length} lot stok dari pembelian`,
          });
        }

        if (totalAmount > 0) {
          const txDate = old.purchased_at ? new Date(old.purchased_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
          const isOperational = old.category === "OPERATIONAL" || old.category === "Operasional";
          const accountCode = isOperational ? "2200" : "2100";
          const desc = `${old.description || "Pembelian"} (${old.supplier || ""})`;

          const txEntries = [{
            transaction_date: txDate,
            account_code: accountCode,
            description: desc,
            debit: totalAmount,
            credit: 0,
            source_table: "purchases",
            source_id: id,
            buku_pembantu: old.supplier || null,
            notes: `Auto dari verifikasi pembelian`,
          }, {
            transaction_date: txDate,
            account_code: "1100",
            description: desc,
            debit: 0,
            credit: totalAmount,
            source_table: "purchases",
            source_id: id,
            buku_pembantu: old.supplier || null,
            notes: `Auto dari verifikasi pembelian (kas keluar)`,
          }];

          if (transportAmount > 0) {
            txEntries.push({
              transaction_date: txDate,
              account_code: "2200",
              description: `Transport: ${old.description || "Pembelian"}`,
              debit: transportAmount,
              credit: 0,
              source_table: "purchases",
              source_id: id,
              buku_pembantu: old.supplier || null,
              notes: `Auto transport dari verifikasi pembelian`,
            }, {
              transaction_date: txDate,
              account_code: "1100",
              description: `Transport: ${old.description || "Pembelian"}`,
              debit: 0,
              credit: transportAmount,
              source_table: "purchases",
              source_id: id,
              buku_pembantu: old.supplier || null,
              notes: `Auto transport dari verifikasi pembelian (kas keluar)`,
            });
          }

          const { error: txErr } = await supabase.from("transaksis").insert(txEntries);
          if (txErr) {
            await supabase.from("purchases").update({ verified: false }).eq("id", id);
            return apiError("Gagal membuat transaksi: " + txErr.message);
          }

          await logAudit(supabase, {
            actor: user, action: "AUTO_TX_CREATED",
            entity: "purchases", entity_id: id,
            note: `${txEntries.length} transaksi dibuat dari verifikasi pembelian (D ${totalAmount} + K ${totalAmount})`,
          });
        }
      } catch (e) {
        await supabase.from("purchases").update({ verified: false }).eq("id", id);
        return apiError("Gagal membuat stok/transaksi: " + e.message);
      }
    }

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}
