"use client";

import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { fmtIDR } from "@/lib/format";
import { BookOpen, Filter } from "lucide-react";
import Pagination from "@/components/Pagination";
import { useAuth } from "@/contexts/AuthContext";

const BUKU_PEMBANTU = [
  { value: "BANK", label: "Kas di Bank", color: "#2C4251" },
  { value: "PETTY_CASH", label: "Petty Cash", color: "#D97706" },
  { value: "BAHAN_BAKU", label: "Bahan Baku", color: "#4A7C59" },
  { value: "OPERASIONAL", label: "Operasional", color: "#C5533B" },
  { value: "FASILITAS", label: "Fasilitas", color: "#6D28D9" },
  { value: "PAJAK", label: "Pajak", color: "#0891B2" },
];

export default function SubLedgerPage() {
  const { activeRole } = useAuth();
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("BANK");
  const [page, setPage] = useState(1);
  const perPage = 15;

  useEffect(() => {
    api.get("/transactions")
      .then(r => setTransaksi(r.data || []))
      .catch(e => { console.error(e); setTransaksi([]); })
      .finally(() => setLoading(false));
  }, []);

  const filteredByBP = useMemo(() => {
    return transaksi.filter(t => t.buku_pembantu === activeTab);
  }, [transaksi, activeTab]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredByBP.slice(start, start + perPage);
  }, [filteredByBP, page, perPage]);

  const totals = useMemo(() => {
    return filteredByBP.reduce((acc, t) => ({
      debit: acc.debit + (t.debit || 0),
      credit: acc.credit + (t.credit || 0),
    }), { debit: 0, credit: 0 });
  }, [filteredByBP]);

  const allTotals = useMemo(() => {
    const result = {};
    for (const bp of BUKU_PEMBANTU) {
      const items = transaksi.filter(t => t.buku_pembantu === bp.value);
      result[bp.value] = {
        count: items.length,
        debit: items.reduce((s, t) => s + (t.debit || 0), 0),
        credit: items.reduce((s, t) => s + (t.credit || 0), 0),
      };
    }
    return result;
  }, [transaksi]);

  if (!["admin_apps", "admin_sppg", "accountant"].includes(activeRole)) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Akses Dibatasi</h1>
          <p className="text-[#5C5C5C]">Anda tidak memiliki akses ke halaman ini.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Buku Pembantu</h1>
          <p className="text-[#5C5C5C] mt-1">6 buku pembantu: Bank, Petty Cash, Bahan Baku, Operasional, Fasilitas, Pajak</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {BUKU_PEMBANTU.map(bp => {
            const tot = allTotals[bp.value] || { count: 0, debit: 0, credit: 0 };
            return (
              <button
                key={bp.value}
                onClick={() => { setActiveTab(bp.value); setPage(1); }}
                className={`card-soft p-4 text-left transition-all ${activeTab === bp.value ? "ring-2" : "hover:bg-[#F9F6F0]"}`}
                style={activeTab === bp.value ? { borderColor: bp.color, ringColor: bp.color } : {}}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: bp.color }}>{bp.label}</div>
                <div className="font-display font-bold text-lg mt-1">{tot.count} transaksi</div>
                <div className="text-xs text-[#5C5C5C]">
                  D: {fmtIDR(tot.debit)} / K: {fmtIDR(tot.credit)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Book Detail */}
        {loading ? (
          <div className="card-soft p-6 sm:p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full mx-auto" /></div>
        ) : (
          <div className="card-soft overflow-hidden">
            <div className="px-5 py-3 border-b border-[#EAE4D8] bg-[#F9F6F0] flex flex-wrap justify-between items-center gap-2">
              <div className="font-display font-bold flex items-center gap-2">
                <BookOpen size={16} style={{ color: BUKU_PEMBANTU.find(b => b.value === activeTab)?.color }} />
                {BUKU_PEMBANTU.find(b => b.value === activeTab)?.label}
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span>D: <span className="font-bold text-[#4A7C59]">{fmtIDR(totals.debit)}</span></span>
                <span>K: <span className="font-bold text-[#C5533B]">{fmtIDR(totals.credit)}</span></span>
                <span>Saldo: <span className={`font-bold ${totals.debit - totals.credit >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(totals.debit - totals.credit)}</span></span>
              </div>
            </div>
            <div className="md:hidden space-y-3 p-5">
              {paginated.length === 0 ? (
                <div className="card-soft p-12 text-center text-[#5C5C5C]">Tidak ada data</div>
              ) : (
                paginated.map((t, i) => (
                  <div key={i} className="card-soft p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#5C5C5C]">{t.transaction_date}</span>
                      <span className="text-xs font-mono text-[#5C5C5C]">{t.account_code}</span>
                    </div>
                    <div className="text-sm font-medium mb-2">{t.description}</div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#4A7C59] font-semibold">{t.debit > 0 ? fmtIDR(t.debit) : "—"}</span>
                      <span className="text-[#C5533B] font-semibold">{t.credit > 0 ? fmtIDR(t.credit) : "—"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-[#5C5C5C] uppercase tracking-wider border-b border-[#EAE4D8] bg-[#F9F6F0]">
                    <th className="text-left py-3 px-4">Tanggal</th>
                    <th className="text-left py-3 px-4">Kode Akun</th>
                    <th className="text-left py-3 px-4">Keterangan</th>
                    <th className="text-right py-3 px-4">Debet</th>
                    <th className="text-right py-3 px-4">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(t => (
                    <tr key={t.id} className="border-b border-[#EAE4D8] last:border-0 hover:bg-[#F9F6F0]">
                      <td className="py-3 px-4">{t.transaction_date}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAE4D8]">{t.account_code}</span>
                      </td>
                      <td className="py-3 px-4 max-w-[150px] sm:max-w-[200px] md:max-w-[300px] truncate">{t.description}</td>
                      <td className="py-3 px-4 text-right font-semibold text-[#4A7C59]">{t.debit ? fmtIDR(t.debit) : "—"}</td>
                      <td className="py-3 px-4 text-right font-semibold text-[#C5533B]">{t.credit ? fmtIDR(t.credit) : "—"}</td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr><td colSpan={5} className="py-10 text-center text-[#5C5C5C]">Tidak ada transaksi di buku ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredByBP.length > perPage && (
          <Pagination page={page} totalPages={Math.ceil(filteredByBP.length / perPage)} onPageChange={setPage} />
        )}
      </div>
    </Layout>
  );
}
