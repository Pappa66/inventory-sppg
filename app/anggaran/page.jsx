"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, Save, Calculator, DollarSign, Users, Package } from "lucide-react";
import { BENEFICIARY_TYPES, fmtIDR } from "@/lib/format";

const EMPTY_FORM = {
  plan_date: "",
  // Section 1: Bahan Makanan
  bahan_balita: 0, bahan_paud_tk_ra: 0, bahan_sd_1_3: 0,
  bahan_sd_4_6: 0, bahan_smp_mts: 0, bahan_sma_ma_smk: 0,
  bahan_slb: 0, bahan_santri: 0, bahan_pend_tk: 0,
  bahan_bumil: 0, bahan_busui: 0,
  harga_satuan1: 8000, harga_satuan2: 10000,
  bahan_actual: 0,
  // Section 2: Operasional
  ops_jumlah_paket: 0, ops_harga_satuan: 0, ops_actual: 0,
  // Section 3: Insentif
  ins_jumlah_paket: 0, ins_harga_satuan: 0, ins_actual: 0,
  notes: "",
};

const BAHAN_FIELDS = [
  { key: "bahan_balita", label: "Balita", priceGroup: 1 },
  { key: "bahan_paud_tk_ra", label: "PAUD/TK/RA", priceGroup: 1 },
  { key: "bahan_sd_1_3", label: "SD/MI 1-3", priceGroup: 1 },
  { key: "bahan_sd_4_6", label: "SD/MI 4-6", priceGroup: 2 },
  { key: "bahan_smp_mts", label: "SMP/MTs", priceGroup: 2 },
  { key: "bahan_sma_ma_smk", label: "SMA/MA/SMK", priceGroup: 2 },
  { key: "bahan_slb", label: "SLB", priceGroup: 2 },
  { key: "bahan_santri", label: "Santri", priceGroup: 2 },
  { key: "bahan_pend_tk", label: "Pend/TK", priceGroup: 2 },
  { key: "bahan_bumil", label: "Bumil", priceGroup: 2 },
  { key: "bahan_busui", label: "Busui", priceGroup: 2 },
];

function calcBahanRab(form) {
  const p1 = form.harga_satuan1 || 8000;
  const p2 = form.harga_satuan2 || 10000;
  const g1 = (form.bahan_balita || 0) + (form.bahan_paud_tk_ra || 0) + (form.bahan_sd_1_3 || 0);
  const g2 = (form.bahan_sd_4_6 || 0) + (form.bahan_smp_mts || 0) + (form.bahan_sma_ma_smk || 0) +
             (form.bahan_slb || 0) + (form.bahan_santri || 0) + (form.bahan_pend_tk || 0) +
             (form.bahan_bumil || 0) + (form.bahan_busui || 0);
  return g1 * p1 + g2 * p2;
}

function calcOpsRab(form) {
  return (form.ops_jumlah_paket || 0) * (form.ops_harga_satuan || 0);
}

function calcInsRab(form) {
  return (form.ins_jumlah_paket || 0) * (form.ins_harga_satuan || 0);
}

function calcTotalPorsi(form) {
  return BAHAN_FIELDS.reduce((sum, f) => sum + (form[f.key] || 0), 0);
}

export default function Page() {
  const { activeRole } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterDate, setFilterDate] = useState("");

  const canEdit = activeRole === "admin_apps" || activeRole === "admin_sppg" || activeRole === "kitchen_head" || activeRole === "accountant";
  const canDelete = activeRole === "admin_apps" || activeRole === "admin_sppg";

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

  const totals = useMemo(() => {
    return filtered.reduce((acc, a) => ({
      bahan_rab: acc.bahan_rab + (a.bahan_rab || 0),
      bahan_actual: acc.bahan_actual + (a.bahan_actual || 0),
      ops_rab: acc.ops_rab + (a.ops_rab || 0),
      ops_actual: acc.ops_actual + (a.ops_actual || 0),
      ins_rab: acc.ins_rab + (a.ins_rab || 0),
      ins_actual: acc.ins_actual + (a.ins_actual || 0),
    }), { bahan_rab: 0, bahan_actual: 0, ops_rab: 0, ops_actual: 0, ins_rab: 0, ins_actual: 0 });
  }, [filtered]);

  const totalRab = totals.bahan_rab + totals.ops_rab + totals.ins_rab;
  const totalActual = totals.bahan_actual + totals.ops_actual + totals.ins_actual;

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setOpenForm(true); };
  const openEdit = (a) => {
    setEditId(a.id);
    setForm({ ...EMPTY_FORM, ...a });
    setOpenForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        bahan_rab: calcBahanRab(form),
        ops_rab: calcOpsRab(form),
        ins_rab: calcInsRab(form),
      };
      if (editId) {
        await api.put(`/anggaran-periods/${editId}`, payload);
        toast.success("Anggaran diperbarui");
      } else {
        await api.post("/anggaran-periods", payload);
        toast.success("Anggaran ditambahkan");
      }
      setOpenForm(false);
      load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus anggaran ini?")) return;
    try {
      await api.delete(`/anggaran-periods/${id}`);
      toast.success("Anggaran dihapus");
      load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const bahanRab = calcBahanRab(form);
  const opsRab = calcOpsRab(form);
  const insRab = calcInsRab(form);
  const totalPorsi = calcTotalPorsi(form);

  return (
    <Layout>
      <div className="space-y-6" data-testid="anggaran-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">Anggaran</h1>
            <p className="text-[#5C5C5C] mt-1">3 Section: Bahan Makanan, Operasional, Insentif Fasilitas</p>
          </div>
          {canEdit && (
            <button onClick={openAdd} className="btn-primary"><Plus size={16}/> Tambah Anggaran</button>
          )}
        </div>

        {/* Filter */}
        <div className="card-soft p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Tanggal</label>
            <input type="date" className="mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1"><Package size={12}/> Bahan Makanan</div>
            <div className="font-display text-xl font-bold mt-1">{fmtIDR(totals.bahan_rab)}</div>
            <div className="text-xs text-[#5C5C5C]">Aktual: {fmtIDR(totals.bahan_actual)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1"><DollarSign size={12}/> Operasional</div>
            <div className="font-display text-xl font-bold mt-1">{fmtIDR(totals.ops_rab)}</div>
            <div className="text-xs text-[#5C5C5C]">Aktual: {fmtIDR(totals.ops_actual)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1"><Users size={12}/> Insentif Fasilitas</div>
            <div className="font-display text-xl font-bold mt-1">{fmtIDR(totals.ins_rab)}</div>
            <div className="text-xs text-[#5C5C5C]">Aktual: {fmtIDR(totals.ins_actual)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1"><Calculator size={12}/> Total</div>
            <div className="font-display text-xl font-bold mt-1">{fmtIDR(totalRab)}</div>
            <div className="text-xs text-[#5C5C5C]">Aktual: {fmtIDR(totalActual)}</div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="card-soft p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full mx-auto" /></div>
        ) : (
          <div className="card-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-3 px-3">Tanggal</th>
                    <th className="text-right py-3 px-3">Total Porsi</th>
                    <th className="text-right py-3 px-3">RAB Bahan</th>
                    <th className="text-right py-3 px-3">Aktual Bahan</th>
                    <th className="text-right py-3 px-3">RAB Ops</th>
                    <th className="text-right py-3 px-3">RAB Insentif</th>
                    <th className="text-right py-3 px-3">Total RAB</th>
                    <th className="text-right py-3 px-3">Total Aktual</th>
                    <th className="text-right py-3 px-3">Selisih</th>
                    {canEdit && <th className="text-right py-3 px-3">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => {
                    const totalR = (a.bahan_rab || 0) + (a.ops_rab || 0) + (a.ins_rab || 0);
                    const totalA = (a.bahan_actual || 0) + (a.ops_actual || 0) + (a.ins_actual || 0);
                    const selisih = totalR - totalA;
                    const totalP = BAHAN_FIELDS.reduce((s, f) => s + (a[f.key] || 0), 0);
                    return (
                      <tr key={a.id} className="border-b border-[#EAE4D8] last:border-0 hover:bg-[#F9F6F0]">
                        <td className="py-3 px-3 font-medium">{a.plan_date}</td>
                        <td className="py-3 px-3 text-right">{totalP.toLocaleString("id-ID")}</td>
                        <td className="py-3 px-3 text-right">{fmtIDR(a.bahan_rab)}</td>
                        <td className="py-3 px-3 text-right">{fmtIDR(a.bahan_actual)}</td>
                        <td className="py-3 px-3 text-right">{fmtIDR(a.ops_rab)}</td>
                        <td className="py-3 px-3 text-right">{fmtIDR(a.ins_rab)}</td>
                        <td className="py-3 px-3 text-right font-bold">{fmtIDR(totalR)}</td>
                        <td className="py-3 px-3 text-right">{fmtIDR(totalA)}</td>
                        <td className={`py-3 px-3 text-right font-semibold ${selisih >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(selisih)}</td>
                        {canEdit && (
                          <td className="py-3 px-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => openEdit(a)} className="btn-ghost text-xs"><Pencil size={14}/></button>
                              {canDelete && <button onClick={() => handleDelete(a.id)} className="btn-ghost text-xs text-[#C5533B]"><Trash2 size={14}/></button>}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && <tr><td colSpan={canEdit ? 10 : 9} className="py-10 text-center text-[#5C5C5C]">Belum ada data anggaran.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {openForm && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 pt-10 overflow-y-auto" onClick={() => setOpenForm(false)}>
            <form onClick={e => e.stopPropagation()} onSubmit={submitForm} className="card-soft p-4 sm:p-6 w-full max-w-4xl space-y-6">
              <h2 className="font-display text-2xl font-bold">{editId ? "Edit Anggaran" : "Tambah Anggaran"}</h2>

              {/* Tanggal */}
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Tanggal Rencana</label>
                <input required type="date" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.plan_date} onChange={e => update("plan_date", e.target.value)} />
              </div>

              {/* Section 1: Anggaran Bahan Makanan */}
              <div className="border border-[#EAE4D8] rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-[#4A7C59] text-white font-display font-bold text-sm flex items-center gap-2">
                  <Package size={14}/> Section 1: Anggaran Bahan Makanan (Bahan Baku Pangan)
                </div>
                <div className="p-4 space-y-4">
                  {/* Harga Satuan */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Harga Satuan Kelompok 1 (Balita, PAUD, SD 1-3)</label>
                      <input type="number" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.harga_satuan1} onChange={e => update("harga_satuan1", parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Harga Satuan Kelompok 2 (SD 4-6 s.d. Busui)</label>
                      <input type="number" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.harga_satuan2} onChange={e => update("harga_satuan2", parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                  {/* Jumlah Porsi per Kelompok */}
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {BAHAN_FIELDS.map(f => (
                      <div key={f.key}>
                        <label className="text-[10px] uppercase tracking-wider text-[#5C5C5C]">{f.label}</label>
                        <input type="number" min="0" className="w-full mt-1 px-2 py-1.5 rounded border border-[#EAE4D8] bg-white text-sm text-right" value={form[f.key] || ""} onChange={e => update(f.key, parseInt(e.target.value) || 0)} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div>Total Porsi: <span className="font-bold">{totalPorsi.toLocaleString("id-ID")}</span></div>
                    <div>RAB Bahan: <span className="font-bold">{fmtIDR(bahanRab)}</span></div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Biaya Aktual Bahan (Rp)</label>
                    <input type="number" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.bahan_actual || ""} onChange={e => update("bahan_actual", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
              </div>

              {/* Section 2: Anggaran Operasional */}
              <div className="border border-[#EAE4D8] rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-[#D97706] text-white font-display font-bold text-sm flex items-center gap-2">
                  <DollarSign size={14}/> Section 2: Anggaran Operasional
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div>
                     <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Jumlah Paket</label>
                     <input type="number" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.ops_jumlah_paket || ""} onChange={e => update("ops_jumlah_paket", parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Harga Satuan (Rp)</label>
                    <input type="number" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.ops_harga_satuan || ""} onChange={e => update("ops_harga_satuan", parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Biaya Aktual (Rp)</label>
                    <input type="number" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.ops_actual || ""} onChange={e => update("ops_actual", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="px-4 pb-4 text-sm">RAB Operasional: <span className="font-bold">{fmtIDR(opsRab)}</span></div>
              </div>

              {/* Section 3: Anggaran Insentif Fasilitas */}
              <div className="border border-[#EAE4D8] rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-[#6D28D9] text-white font-display font-bold text-sm flex items-center gap-2">
                  <Users size={14}/> Section 3: Anggaran Insentif Fasilitas
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div>
                     <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Jumlah Paket</label>
                     <input type="number" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.ins_jumlah_paket || ""} onChange={e => update("ins_jumlah_paket", parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Harga Satuan (Rp)</label>
                    <input type="number" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.ins_harga_satuan || ""} onChange={e => update("ins_harga_satuan", parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Biaya Aktual (Rp)</label>
                    <input type="number" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.ins_actual || ""} onChange={e => update("ins_actual", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="px-4 pb-4 text-sm">RAB Insentif: <span className="font-bold">{fmtIDR(insRab)}</span></div>
              </div>

              {/* Total Summary */}
              <div className="p-4 rounded-lg bg-[#EAE4D8] grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>Total RAB: <span className="font-bold text-lg">{fmtIDR(bahanRab + opsRab + insRab)}</span></div>
                <div>Selisih: <span className={`font-bold text-lg ${(bahanRab + opsRab + insRab) - ((form.bahan_actual || 0) + (form.ops_actual || 0) + (form.ins_actual || 0)) >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>
                  {fmtIDR((bahanRab + opsRab + insRab) - ((form.bahan_actual || 0) + (form.ops_actual || 0) + (form.ins_actual || 0)))}
                </span></div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Catatan</label>
                  <input className="w-full mt-1 px-3 py-1.5 rounded border border-[#EAE4D8] bg-white text-sm" value={form.notes || ""} onChange={e => update("notes", e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setOpenForm(false)} className="btn-ghost">Batal</button>
                <button type="submit" className="btn-primary"><Save size={14}/> Simpan</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
