"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Download } from "lucide-react";
import { SkeletonTable } from "@/components/Skeleton";
import { fmtIDR } from "@/lib/format";

export default function Page() {
  const { activeRole } = useAuth();
  const [data, setData] = useState({ rows: [], saldo_awal: 0, saldo_akhir: 0, total_debit: 0, total_credit: 0 });
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const canView = activeRole === "admin" || activeRole === "accountant";

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    api.get(`/reports/bku?${params.toString()}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const exportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const wsData = [
        ["BUKU KAS UMUM (BKU)"],
        [""],
        ["Bulan", "Tanggal", "No. Bukti", "Uraian", "Debet", "Kredit", "Saldo"],
      ];
      data.rows.forEach((r) => {
        wsData.push([r.month, r.day, r.evidence, r.description, r.debit, r.credit, r.balance]);
      });
      wsData.push([""]);
      wsData.push(["", "", "", "Saldo Awal", "", "", data.saldo_awal]);
      wsData.push(["", "", "", "Total Debet", data.total_debit, "", ""]);
      wsData.push(["", "", "", "Total Kredit", "", data.total_credit, ""]);
      wsData.push(["", "", "", "Saldo Akhir", "", "", data.saldo_akhir]);

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = [{ wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 35 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, ws, "BKU");
      XLSX.writeFile(wb, `BKU_${from || "all"}_${to || "all"}.xlsx`);
      toast.success("File BKU berhasil diunduh");
    } catch (er) {
      toast.error("Gagal export: " + formatErr(er));
    }
  };

  if (!canView) {
    return (
      <Layout>
        <div className="card-soft p-10 text-center text-[#5C5C5C]">Anda tidak memiliki akses ke halaman ini.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="bku-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">BKU - Buku Kas Umum</h1>
            <p className="text-[#5C5C5C] mt-1">Laporan pencatatan transaksi keuangan dengan saldo berjalan.</p>
          </div>
          <button onClick={exportExcel} className="btn-primary"><Download size={16}/> Export Excel</button>
        </div>

        <div className="card-soft p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Dari Tanggal</label>
            <input type="date" className="mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Sampai Tanggal</label>
            <input type="date" className="mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button onClick={load} className="btn-primary">Terapkan</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Saldo Awal</div>
            <div className="font-display text-2xl font-bold mt-1">{fmtIDR(data.saldo_awal)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Debet</div>
            <div className="font-display text-2xl font-bold mt-1 text-[#4A7C59]">{fmtIDR(data.total_debit)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Kredit</div>
            <div className="font-display text-2xl font-bold mt-1 text-[#C5533B]">{fmtIDR(data.total_credit)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Saldo Akhir</div>
            <div className={`font-display text-2xl font-bold mt-1 ${data.saldo_akhir >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(data.saldo_akhir)}</div>
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={8} cols={7} />
        ) : (
          <div className="card-soft overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-3 px-4">Bulan</th>
                    <th className="text-left py-3 px-4">Tanggal</th>
                    <th className="text-left py-3 px-4">No. Bukti</th>
                    <th className="text-left py-3 px-4">Uraian</th>
                    <th className="text-right py-3 px-4">Debet</th>
                    <th className="text-right py-3 px-4">Kredit</th>
                    <th className="text-right py-3 px-4">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r, i) => (
                    <tr key={i} className="border-b border-[#EAE4D8] last:border-0">
                      <td className="py-3 px-4 text-xs text-[#5C5C5C]">{r.month}</td>
                      <td className="py-3 px-4 audit-ts">{r.day}</td>
                      <td className="py-3 px-4 font-semibold">{r.evidence}</td>
                      <td className="py-3 px-4">{r.description}</td>
                      <td className="py-3 px-4 text-right audit-ts">{r.debit ? fmtIDR(r.debit) : "—"}</td>
                      <td className="py-3 px-4 text-right audit-ts">{r.credit ? fmtIDR(r.credit) : "—"}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${r.balance >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(r.balance)}</td>
                    </tr>
                  ))}
                  {data.rows.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-[#5C5C5C]">Tidak ada data transaksi.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-3 p-3">
              {data.rows.map((r, i) => (
                <div key={i} className="card-soft p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="audit-ts text-sm">{r.day}</div>
                    <span className="text-xs text-[#5C5C5C]">{r.month}</span>
                  </div>
                  <div className="font-semibold">{r.evidence}</div>
                  <div className="text-sm">{r.description}</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><span className="text-[#5C5C5C]">Debet</span><div className="audit-ts">{r.debit ? fmtIDR(r.debit) : "—"}</div></div>
                    <div><span className="text-[#5C5C5C]">Kredit</span><div className="audit-ts">{r.credit ? fmtIDR(r.credit) : "—"}</div></div>
                    <div><span className="text-[#5C5C5C]">Saldo</span><div className={`font-semibold ${r.balance >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(r.balance)}</div></div>
                  </div>
                </div>
              ))}
              {data.rows.length === 0 && <div className="text-center text-[#5C5C5C] py-10">Tidak ada data transaksi.</div>}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
