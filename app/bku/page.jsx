"use client";

import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { fmtIDR } from "@/lib/format";
import { ScrollText, Filter, Download } from "lucide-react";

const ACCOUNT_CODES = [
  { code: "1000", name: "BUKU KAS UMUM" },
  { code: "1100", name: "Petty Cash" },
  { code: "1200", name: "Kas di Bank" },
  { code: "1300", name: "Dana Bantuan Pemerintah" },
  { code: "2100", name: "Biaya Bahan Baku" },
  { code: "2200", name: "Biaya Operasional" },
  { code: "2300", name: "Biaya Insentif Fasilitas" },
  { code: "3100", name: "PPN" },
];

export default function BKUPage() {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAccount, setFilterAccount] = useState("");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  useEffect(() => {
    api.get("/transactions")
      .then(r => setTransaksi(r.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = transaksi;
    if (filterAccount) list = list.filter(t => t.account_code === filterAccount);
    if (filterDateStart) list = list.filter(t => t.transaction_date >= filterDateStart);
    if (filterDateEnd) list = list.filter(t => t.transaction_date <= filterDateEnd);
    return list;
  }, [transaksi, filterAccount, filterDateStart, filterDateEnd]);

  // Group by account code
  const groupedByAccount = useMemo(() => {
    const groups = {};
    for (const t of filtered) {
      if (!groups[t.account_code]) groups[t.account_code] = [];
      groups[t.account_code].push(t);
    }
    return groups;
  }, [filtered]);

  const accountTotals = useMemo(() => {
    const totals = {};
    for (const [code, items] of Object.entries(groupedByAccount)) {
      totals[code] = items.reduce((acc, t) => ({
        debit: acc.debit + (t.debit || 0),
        credit: acc.credit + (t.credit || 0),
        saldo: (acc.debit + (t.debit || 0)) - (acc.credit + (t.credit || 0)),
      }), { debit: 0, credit: 0, saldo: 0 });
    }
    return totals;
  }, [groupedByAccount]);

  const grandTotal = useMemo(() => {
    return filtered.reduce((acc, t) => ({
      debit: acc.debit + (t.debit || 0),
      credit: acc.credit + (t.credit || 0),
    }), { debit: 0, credit: 0 });
  }, [filtered]);

  const getAccountName = (code) => ACCOUNT_CODES.find(a => a.code === code)?.name || code;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-bold">BKU - Buku Kas Umum</h1>
          <p className="text-[#5C5C5C] mt-1">Ringkasan transaksi per kode akun (otomatis dari input transaksi)</p>
        </div>

        {/* Filters */}
        <div className="card-soft p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kode Akun</label>
            <select className="mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm" value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
              <option value="">Semua</option>
              {ACCOUNT_CODES.map(a => <option key={a.code} value={a.code}>{a.code} - {a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Dari Tanggal</label>
            <input type="date" className="mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Sampai Tanggal</label>
            <input type="date" className="mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} />
          </div>
        </div>

        {/* Grand Total */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Debet</div>
            <div className="font-display text-2xl font-bold mt-1 text-[#4A7C59]">{fmtIDR(grandTotal.debit)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Kredit</div>
            <div className="font-display text-2xl font-bold mt-1 text-[#C5533B]">{fmtIDR(grandTotal.credit)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Saldo BKU</div>
            <div className={`font-display text-2xl font-bold mt-1 ${grandTotal.debit - grandTotal.credit >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>
              {fmtIDR(grandTotal.debit - grandTotal.credit)}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card-soft p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full mx-auto" /></div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByAccount).sort(([a], [b]) => a.localeCompare(b)).map(([code, items]) => {
              const tot = accountTotals[code];
              return (
                <div key={code} className="card-soft overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#EAE4D8] bg-[#F9F6F0] flex justify-between items-center">
                    <div className="font-display font-bold flex items-center gap-2">
                      <ScrollText size={16} className="text-[#4A7C59]" />
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4A7C59]/10 text-[#4A7C59]">{code}</span>
                      {getAccountName(code)}
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span>D: <span className="font-bold text-[#4A7C59]">{fmtIDR(tot.debit)}</span></span>
                      <span>K: <span className="font-bold text-[#C5533B]">{fmtIDR(tot.credit)}</span></span>
                      <span>Saldo: <span className={`font-bold ${tot.debit - tot.credit >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(tot.debit - tot.credit)}</span></span>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-[#5C5C5C] uppercase tracking-wider border-b border-[#EAE4D8]">
                        <th className="text-left py-2 px-4">Tanggal</th>
                        <th className="text-left py-2 px-4">Keterangan</th>
                        <th className="text-right py-2 px-4">Debet</th>
                        <th className="text-right py-2 px-4">Kredit</th>
                        <th className="text-left py-2 px-4">Buku Pembantu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(t => (
                        <tr key={t.id} className="border-b border-[#EAE4D8] last:border-0 hover:bg-[#F9F6F0]">
                          <td className="py-2 px-4">{t.transaction_date}</td>
                          <td className="py-2 px-4 max-w-[250px] truncate">{t.description}</td>
                          <td className="py-2 px-4 text-right font-semibold text-[#4A7C59]">{t.debit ? fmtIDR(t.debit) : "—"}</td>
                          <td className="py-2 px-4 text-right font-semibold text-[#C5533B]">{t.credit ? fmtIDR(t.credit) : "—"}</td>
                          <td className="py-2 px-4 text-xs text-[#5C5C5C]">{t.buku_pembantu || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
            {Object.keys(groupedByAccount).length === 0 && (
              <div className="card-soft p-12 text-center text-[#5C5C5C]">Belum ada transaksi.</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
