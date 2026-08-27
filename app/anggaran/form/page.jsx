"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { fmtIDR } from "@/lib/format";
import { Save, ArrowLeft, Package, DollarSign, Users, Calculator } from "lucide-react";
import Link from "next/link";

const EMPTY_FORM = {
  plan_date: "",
  total_porsi: 0,
  harga_satuan1: 8000,
  harga_satuan2: 10000,
  bahan_actual: 0,
  ops_rab: 0,
  ops_actual: 0,
  ins_rab: 0,
  ins_actual: 0,
  notes: "",
};

function calcBahanRab(form) {
  const p1 = form.harga_satuan1 || 8000;
  const p2 = form.harga_satuan2 || 10000;
  const totalPorsi = form.total_porsi || 0;
  const g1 = Math.round(totalPorsi * 0.3);
  const g2 = totalPorsi - g1;
  return g1 * p1 + g2 * p2;
}

function AnggaranForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const { activeRole } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);

  const canEdit = ["admin_apps", "admin_sppg", "kitchen_head", "accountant"].includes(activeRole);

  useEffect(() => {
    if (!editId) return;
    setLoading(true);
    api.get("/anggaran-periods").then(({ data }) => {
      const found = (data || []).find(a => a.id === editId);
      if (found) {
        const totalPorsi = ["bahan_balita","bahan_paud_tk_ra","bahan_sd_1_3","bahan_sd_4_6","bahan_smp_mts","bahan_sma_ma_smk","bahan_slb","bahan_santri","bahan_pend_tk","bahan_bumil","bahan_busui"].reduce((s, k) => s + (found[k] || 0), 0);
        setForm({
          plan_date: found.plan_date || "",
          total_porsi: totalPorsi || found.total_porsi || 0,
          harga_satuan1: found.harga_satuan1 || 8000,
          harga_satuan2: found.harga_satuan2 || 10000,
          bahan_actual: found.bahan_actual || 0,
          ops_rab: found.ops_rab || 0,
          ops_actual: found.ops_actual || 0,
          ins_rab: found.ins_rab || 0,
          ins_actual: found.ins_actual || 0,
          notes: found.notes || "",
        });
      }
    }).finally(() => setLoading(false));
  }, [editId]);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const bahanRab = calcBahanRab(form);
  const totalRAB = bahanRab + (form.ops_rab || 0) + (form.ins_rab || 0);
  const totalActual = (form.bahan_actual || 0) + (form.ops_actual || 0) + (form.ins_actual || 0);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        plan_date: form.plan_date,
        total_porsi: form.total_porsi,
        harga_satuan1: form.harga_satuan1,
        harga_satuan2: form.harga_satuan2,
        bahan_rab: bahanRab,
        bahan_actual: form.bahan_actual || 0,
        ops_rab: form.ops_rab || 0,
        ops_actual: form.ops_actual || 0,
        ins_rab: form.ins_rab || 0,
        ins_actual: form.ins_actual || 0,
        notes: form.notes || "",
      };
      if (editId) {
        await api.put(`/anggaran-periods/${editId}`, payload);
        toast.success("Anggaran diperbarui");
      } else {
        await api.post("/anggaran-periods", payload);
        toast.success("Anggaran ditambahkan");
      }
      router.push("/anggaran");
    } catch (er) {
      toast.error(formatErr(er));
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/anggaran" className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">{editId ? "Edit Anggaran" : "Tambah Anggaran"}</h1>
            <p className="text-[#5C5C5C] mt-1">Isi data anggaran untuk satu hari</p>
          </div>
        </div>

        {loading ? (
          <div className="card-soft p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {/* Tanggal */}
            <div className="card-soft p-5">
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] font-semibold">Tanggal</label>
              <input required type="date" className="w-full mt-2 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.plan_date} onChange={e => update("plan_date", e.target.value)} />
            </div>

            {/* Section 1: Bahan Makanan */}
            <div className="card-soft overflow-hidden">
              <div className="px-5 py-3 bg-[#4A7C59] text-white font-display font-bold text-sm flex items-center gap-2">
                <Package size={14} /> Bahan Makanan
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Porsi Hari Ini</label>
                  <input required type="number" min="0" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-lg font-semibold" value={form.total_porsi || ""} onChange={e => update("total_porsi", parseInt(e.target.value) || 0)} placeholder="Contoh: 500" />
                  <p className="text-[11px] text-[#5C5C5C] mt-1">RAB dihitung otomatis: ~30% × Rp8.000 + ~70% × Rp10.000 per porsi</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Harga Porsi Kelompok 1</label>
                    <p className="text-[10px] text-[#5C5C5C]">Balita, PAUD, SD 1-3</p>
                    <input type="number" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm" value={form.harga_satuan1 || ""} onChange={e => update("harga_satuan1", parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Harga Porsi Kelompok 2</label>
                    <p className="text-[10px] text-[#5C5C5C]">SD 4-6 s.d. Busui</p>
                    <input type="number" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm" value={form.harga_satuan2 || ""} onChange={e => update("harga_satuan2", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm bg-[#F9F6F0] rounded-lg px-4 py-3">
                  <span className="text-[#5C5C5C]">RAB Bahan (otomatis):</span>
                  <span className="font-bold text-[#4A7C59] text-lg">{fmtIDR(bahanRab)}</span>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Biaya Aktual Bahan (Rp)</label>
                  <input type="number" min="0" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.bahan_actual || ""} onChange={e => update("bahan_actual", parseInt(e.target.value) || 0)} placeholder="Berapa yang benar-benar dikeluarkan" />
                </div>
              </div>
            </div>

            {/* Section 2: Operasional */}
            <div className="card-soft overflow-hidden">
              <div className="px-5 py-3 bg-[#D97706] text-white font-display font-bold text-sm flex items-center gap-2">
                <DollarSign size={14} /> Operasional (Gas, Listrik, dll)
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">RAB Operasional (Rp)</label>
                  <p className="text-[10px] text-[#5C5C5C]">Berapa yang direncanakan</p>
                  <input type="number" min="0" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.ops_rab || ""} onChange={e => update("ops_rab", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Biaya Aktual (Rp)</label>
                  <p className="text-[10px] text-[#5C5C5C]">Berapa yang benar-benar dikeluarkan</p>
                  <input type="number" min="0" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.ops_actual || ""} onChange={e => update("ops_actual", parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </div>

            {/* Section 3: Insentif Relawan */}
            <div className="card-soft overflow-hidden">
              <div className="px-5 py-3 bg-[#6D28D9] text-white font-display font-bold text-sm flex items-center gap-2">
                <Users size={14} /> Insentif Relawan
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">RAB Insentif (Rp)</label>
                  <p className="text-[10px] text-[#5C5C5C]">Berapa yang direncanakan</p>
                  <input type="number" min="0" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.ins_rab || ""} onChange={e => update("ins_rab", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Biaya Aktual (Rp)</label>
                  <p className="text-[10px] text-[#5C5C5C]">Berapa yang benar-benar dikeluarkan</p>
                  <input type="number" min="0" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.ins_actual || ""} onChange={e => update("ins_actual", parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="card-soft p-5 bg-[#F9F6F0]">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3"><Calculator size={14} /> Ringkasan</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total RAB:</span>
                  <span className="font-bold text-lg">{fmtIDR(totalRAB)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Aktual:</span>
                  <span className="font-bold">{fmtIDR(totalActual)}</span>
                </div>
                <div className="flex justify-between border-t border-[#EAE4D8] pt-2">
                  <span>Selisih:</span>
                  <span className={`font-bold ${totalRAB - totalActual >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>
                    {fmtIDR(totalRAB - totalActual)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card-soft p-5">
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] font-semibold">Catatan</label>
              <textarea rows={3} className="w-full mt-2 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.notes || ""} onChange={e => update("notes", e.target.value)} placeholder="Opsional — catatan tambahan tentang anggaran hari ini" />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link href="/anggaran" className="btn-ghost">Batal</Link>
              <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.5 : 1 }}>
                <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}

export default function AnggaranFormPage() {
  return (
    <Suspense fallback={<Layout><div className="p-8 text-center text-[#5C5C5C]">Memuat...</div></Layout>}>
      <AnggaranForm />
    </Suspense>
  );
}
