"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, Calculator, DollarSign, Users, Package } from "lucide-react";
import { fmtIDR } from "@/lib/format";
import Pagination from "@/components/Pagination";

function calcBahanRab(a) {
  const p1 = a.harga_satuan1 || 8000;
  const p2 = a.harga_satuan2 || 10000;
  const totalPorsi = a.total_porsi || ["bahan_balita","bahan_paud_tk_ra","bahan_sd_1_3","bahan_sd_4_6","bahan_smp_mts","bahan_sma_ma_smk","bahan_slb","bahan_santri","bahan_pend_tk","bahan_bumil","bahan_busui"].reduce((s, k) => s + (a[k] || 0), 0);
  const g1 = Math.round(totalPorsi * 0.3);
  const g2 = totalPorsi - g1;
  return g1 * p1 + g2 * p2;
}

export default function Page() {
  const { activeRole } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 15;

  useEffect(() => { setPage(1); }, [filterDate]);

  const canEdit = ["admin_apps", "admin_sppg", "kitchen_head", "accountant"].includes(activeRole);
  const canDelete = ["admin_apps", "admin_sppg"].includes(activeRole);

  const load = () => {
    setLoading(true);
    api.get("/anggaran-periods")
      .then((r) => setData(r.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = data;
    if (filterDate) list = list.filter(a => a.plan_date === filterDate);
    return [...list].sort((a, b) => (a.plan_date || "").localeCompare(b.plan_date || ""));
  }, [data, filterDate]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const totals = useMemo(() => {
    return filtered.reduce((acc, a) => {
      const bRab = a.bahan_rab || calcBahanRab(a);
      const totalR = bRab + (a.ops_rab || 0) + (a.ins_rab || 0);
      const totalA = (a.bahan_actual || 0) + (a.ops_actual || 0) + (a.ins_actual || 0);
      return {
        bahan_rab: acc.bahan_rab + bRab,
        bahan_actual: acc.bahan_actual + (a.bahan_actual || 0),
        ops_rab: acc.ops_rab + (a.ops_rab || 0),
        ops_actual: acc.ops_actual + (a.ops_actual || 0),
        ins_rab: acc.ins_rab + (a.ins_rab || 0),
        ins_actual: acc.ins_actual + (a.ins_actual || 0),
        totalRab: acc.totalRab + totalR,
        totalActual: acc.totalActual + totalA,
      };
    }, { bahan_rab: 0, bahan_actual: 0, ops_rab: 0, ops_actual: 0, ins_rab: 0, ins_actual: 0, totalRab: 0, totalActual: 0 });
  }, [filtered]);

  const handleDelete = async (id) => {
    if (!confirm("Hapus anggaran ini?")) return;
    try {
      await api.delete(`/anggaran-periods/${id}`);
      toast.success("Anggaran dihapus");
      load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  if (!["admin_apps", "admin_sppg", "accountant", "kitchen_head"].includes(activeRole)) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-[#5C5C5C]">Akses Dibatasi</h1>
            <p className="text-[#5C5C5C] mt-2">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="anggaran-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Anggaran</h1>
            <p className="text-[#5C5C5C] mt-1">Rencana vs Aktual: Bahan, Operasional, Insentif</p>
          </div>
          {canEdit && (
            <Link href="/anggaran/form" className="btn-primary"><Plus size={16} /> Tambah Anggaran</Link>
          )}
        </div>

        {/* Filter */}
        <div className="card-soft p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Tanggal</label>
            <input type="date" className="mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          {filterDate && <button onClick={() => setFilterDate("")} className="btn-ghost text-xs">Reset</button>}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-soft p-4 border-l-4 border-l-[#4A7C59]">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1"><Package size={12} /> Bahan Makanan</div>
            <div className="font-display text-lg sm:text-xl font-bold mt-1 text-[#4A7C59]">{fmtIDR(totals.bahan_rab)}</div>
            <div className="text-xs text-[#5C5C5C]">Aktual: {fmtIDR(totals.bahan_actual)}</div>
          </div>
          <div className="card-soft p-4 border-l-4 border-l-[#D97706]">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1"><DollarSign size={12} /> Operasional</div>
            <div className="font-display text-lg sm:text-xl font-bold mt-1 text-[#D97706]">{fmtIDR(totals.ops_rab)}</div>
            <div className="text-xs text-[#5C5C5C]">Aktual: {fmtIDR(totals.ops_actual)}</div>
          </div>
          <div className="card-soft p-4 border-l-4 border-l-[#6D28D9]">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1"><Users size={12} /> Insentif Relawan</div>
            <div className="font-display text-lg sm:text-xl font-bold mt-1 text-[#6D28D9]">{fmtIDR(totals.ins_rab)}</div>
            <div className="text-xs text-[#5C5C5C]">Aktual: {fmtIDR(totals.ins_actual)}</div>
          </div>
          <div className="card-soft p-4 border-l-4 border-l-[#2C4251]">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1"><Calculator size={12} /> Total</div>
            <div className="font-display text-lg sm:text-xl font-bold mt-1">{fmtIDR(totals.totalRab)}</div>
            <div className="text-xs text-[#5C5C5C]">Aktual: {fmtIDR(totals.totalActual)}</div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="card-soft p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full mx-auto" /></div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {paginated.length === 0 && (
                <div className="card-soft p-12 text-center text-[#5C5C5C]">
                  <p className="mb-3">Belum ada data anggaran.</p>
                  {canEdit && <Link href="/anggaran/form" className="btn-primary text-xs">+ Tambah Anggaran</Link>}
                </div>
              )}
              {paginated.map(a => {
                const bRab = a.bahan_rab || calcBahanRab(a);
                const totalR = bRab + (a.ops_rab || 0) + (a.ins_rab || 0);
                const totalA = (a.bahan_actual || 0) + (a.ops_actual || 0) + (a.ins_actual || 0);
                const selisih = totalR - totalA;
                const porsi = a.total_porsi || 0;
                return (
                  <div key={a.id} className="card-soft p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm">{a.plan_date}</div>
                        <div className="text-xs text-[#5C5C5C]">{porsi.toLocaleString("id-ID")} porsi</div>
                      </div>
                      {canEdit && (
                        <div className="flex gap-1 shrink-0">
                          <Link href={`/anggaran/form?id=${a.id}`} className="btn-ghost text-xs"><Pencil size={14} /></Link>
                          {canDelete && <button onClick={() => handleDelete(a.id)} className="btn-ghost text-xs text-[#C5533B]"><Trash2 size={14} /></button>}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><span className="text-[#5C5C5C]">RAB:</span> <span className="font-semibold">{fmtIDR(totalR)}</span></div>
                      <div><span className="text-[#5C5C5C]">Aktual:</span> <span className="font-semibold">{fmtIDR(totalA)}</span></div>
                      <div><span className="text-[#5C5C5C]">Selisih:</span> <span className={`font-semibold ${selisih >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(selisih)}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block card-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left py-3 px-4">Tanggal</th>
                      <th className="text-right py-3 px-4">Porsi</th>
                      <th className="text-right py-3 px-4">Bahan (RAB)</th>
                      <th className="text-right py-3 px-4">Bahan (Aktual)</th>
                      <th className="text-right py-3 px-4">Ops (RAB)</th>
                      <th className="text-right py-3 px-4">Insentif (RAB)</th>
                      <th className="text-right py-3 px-4">Total RAB</th>
                      <th className="text-right py-3 px-4">Total Aktual</th>
                      <th className="text-right py-3 px-4">Selisih</th>
                      {canEdit && <th className="text-right py-3 px-4">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(a => {
                      const bRab = a.bahan_rab || calcBahanRab(a);
                      const totalR = bRab + (a.ops_rab || 0) + (a.ins_rab || 0);
                      const totalA = (a.bahan_actual || 0) + (a.ops_actual || 0) + (a.ins_actual || 0);
                      const selisih = totalR - totalA;
                      const porsi = a.total_porsi || 0;
                      return (
                        <tr key={a.id} className="border-b border-[#EAE4D8] last:border-0 hover:bg-[#F9F6F0]">
                          <td className="py-3 px-4 font-medium">{a.plan_date}</td>
                          <td className="py-3 px-4 text-right audit-ts">{porsi.toLocaleString("id-ID")}</td>
                          <td className="py-3 px-4 text-right">{fmtIDR(bRab)}</td>
                          <td className="py-3 px-4 text-right">{fmtIDR(a.bahan_actual)}</td>
                          <td className="py-3 px-4 text-right">{fmtIDR(a.ops_rab)}</td>
                          <td className="py-3 px-4 text-right">{fmtIDR(a.ins_rab)}</td>
                          <td className="py-3 px-4 text-right font-bold">{fmtIDR(totalR)}</td>
                          <td className="py-3 px-4 text-right">{fmtIDR(totalA)}</td>
                          <td className={`py-3 px-4 text-right font-semibold ${selisih >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(selisih)}</td>
                          {canEdit && (
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-1">
                                <Link href={`/anggaran/form?id=${a.id}`} className="btn-ghost text-xs"><Pencil size={14} /></Link>
                                {canDelete && <button onClick={() => handleDelete(a.id)} className="btn-ghost text-xs text-[#C5533B]"><Trash2 size={14} /></button>}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {paginated.length === 0 && <tr><td colSpan={canEdit ? 10 : 9} className="py-10 text-center text-[#5C5C5C]">
                      <p className="mb-3">Belum ada data anggaran.</p>
                      {canEdit && <Link href="/anggaran/form" className="btn-primary text-xs">+ Tambah Anggaran</Link>}
                    </td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>
    </Layout>
  );
}
