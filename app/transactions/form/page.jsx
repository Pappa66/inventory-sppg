"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { fmtIDR } from "@/lib/format";
import { Save, ArrowLeft, AlertTriangle } from "lucide-react";

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

const BUKU_PEMBANTU = [
  { value: "BANK", label: "Kas di Bank" },
  { value: "PETTY_CASH", label: "Petty Cash" },
  { value: "BAHAN_BAKU", label: "Bahan Baku" },
  { value: "OPERASIONAL", label: "Operasional" },
  { value: "FASILITAS", label: "Fasilitas" },
  { value: "PAJAK", label: "Pajak" },
];

const CODE_GROUPS = [
  { label: "Kas & Bank", codes: ["1000", "1100", "1200"], color: "#4A7C59" },
  { label: "Pendapatan", codes: ["1300"], color: "#2C4251" },
  { label: "Beban", codes: ["2100", "2200", "2300"], color: "#D97706" },
  { label: "Pajak", codes: ["3100"], color: "#0891B2" },
];

const EMPTY_FORM = {
  transaction_date: "",
  account_code: "1100",
  description: "",
  debit: 0,
  credit: 0,
  buku_pembantu: "",
  notes: "",
};

function TransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const { activeRole } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);

  const canEdit = ["admin_apps", "admin_sppg", "accountant"].includes(activeRole);

  useEffect(() => {
    if (!editId) return;
    setLoading(true);
    api.get("/transactions").then(({ data }) => {
      const found = (data || []).find(t => t.id === editId);
      if (found) {
        setForm({
          transaction_date: found.transaction_date || "",
          account_code: found.account_code || "1100",
          description: found.description || "",
          debit: found.debit || 0,
          credit: found.credit || 0,
          buku_pembantu: found.buku_pembantu || "",
          notes: found.notes || "",
        });
      }
    }).finally(() => setLoading(false));
  }, [editId]);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const isBothFilled = form.debit > 0 && form.credit > 0;
  const isNeither = form.debit === 0 && form.credit === 0;
  const hasError = isBothFilled || isNeither;

  const getAccountInfo = (code) => {
    const group = CODE_GROUPS.find(g => g.codes.includes(code));
    return { group, account: ACCOUNT_CODES.find(a => a.code === code) };
  };

  const selectedInfo = getAccountInfo(form.account_code);

  const submit = async (e) => {
    e.preventDefault();
    if (hasError) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/transactions/${editId}`, form);
        toast.success("Transaksi diperbarui");
      } else {
        await api.post("/transactions", form);
        toast.success("Transaksi ditambahkan");
      }
      router.push("/transactions");
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
          <Link href="/transactions" className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">{editId ? "Edit Transaksi" : "Tambah Transaksi"}</h1>
            <p className="text-[#5C5C5C] mt-1">Input transaksi debet atau kredit</p>
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
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] font-semibold">Tanggal Transaksi</label>
              <input required type="date" className="w-full mt-2 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-lg" value={form.transaction_date} onChange={e => update("transaction_date", e.target.value)} />
            </div>

            {/* Kode Akun */}
            <div className="card-soft p-5">
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] font-semibold">Kode Akun</label>
              <p className="text-[11px] text-[#5C5C5C] mb-2">Pilih akun yang terdampak</p>
              <div className="space-y-3">
                {CODE_GROUPS.map(group => (
                  <div key={group.label}>
                    <div className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: group.color }}>{group.label}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {group.codes.map(code => {
                        const acct = ACCOUNT_CODES.find(a => a.code === code);
                        const selected = form.account_code === code;
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => update("account_code", code)}
                            className={`px-3 py-2 rounded-lg border text-left text-xs transition-all ${selected ? "font-bold shadow-sm" : "hover:bg-[#F9F6F0]"}`}
                            style={selected ? { background: group.color + "15", borderColor: group.color, color: group.color } : { borderColor: "#EAE4D8" }}
                          >
                            <div className="font-mono text-[10px]">{code}</div>
                            <div className="text-[#5C5C5C] mt-0.5">{acct?.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Keterangan */}
            <div className="card-soft p-5">
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] font-semibold">Keterangan</label>
              <input required className="w-full mt-2 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.description} onChange={e => update("description", e.target.value)} placeholder="Deskripsi transaksi" />
            </div>

            {/* Debet & Kredit */}
            <div className="card-soft p-5">
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] font-semibold">Nominal</label>
              <p className="text-[11px] text-[#5C5C5C] mb-3">Isi salah satu saja — Debet ATAU Kredit</p>

              {isBothFilled && (
                <div className="flex items-center gap-2 text-[#C5533B] text-sm mb-3 bg-[#C5533B]/10 rounded-lg px-3 py-2">
                  <AlertTriangle size={14} /> Debit dan Kredit tidak boleh diisi bersamaan
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Debet (Rp)</label>
                  <p className="text-[10px] text-[#5C5C5C]">Uang masuk / aset naik</p>
                  <input
                    type="number" min="0"
                    className="w-full mt-1 px-4 py-3 rounded-md border text-right text-lg font-bold focus:outline-none transition-colors"
                    style={{ borderColor: form.debit > 0 ? "#4A7C59" : "#EAE4D8", background: form.debit > 0 ? "#4A7C5910" : "#F9F6F0", color: "#4A7C59" }}
                    value={form.debit || ""}
                    onChange={e => update("debit", parseInt(e.target.value) || 0)}
                  />
                  {form.debit > 0 && <div className="text-xs text-[#4A7C59] mt-1 font-semibold">{fmtIDR(form.debit)}</div>}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kredit (Rp)</label>
                  <p className="text-[10px] text-[#5C5C5C]">Uang keluar / kewajiban naik</p>
                  <input
                    type="number" min="0"
                    className="w-full mt-1 px-4 py-3 rounded-md border text-right text-lg font-bold focus:outline-none transition-colors"
                    style={{ borderColor: form.credit > 0 ? "#C5533B" : "#EAE4D8", background: form.credit > 0 ? "#C5533B10" : "#F9F6F0", color: "#C5533B" }}
                    value={form.credit || ""}
                    onChange={e => update("credit", parseInt(e.target.value) || 0)}
                  />
                  {form.credit > 0 && <div className="text-xs text-[#C5533B] mt-1 font-semibold">{fmtIDR(form.credit)}</div>}
                </div>
              </div>

              {/* Quick fill buttons */}
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => { update("debit", 0); update("credit", form.debit || 0); }} className="btn-ghost text-xs" disabled={form.debit === 0}>
                  Pindahkan ke Kredit →
                </button>
                <button type="button" onClick={() => { update("credit", 0); update("debit", form.credit || 0); }} className="btn-ghost text-xs" disabled={form.credit === 0}>
                  ← Pindahkan ke Debet
                </button>
              </div>
            </div>

            {/* Buku Pembantu */}
            <div className="card-soft p-5">
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] font-semibold">Buku Pembantu</label>
              <p className="text-[11px] text-[#5C5C5C] mb-2">Opsional — untuk pelacakan di sub-ledger</p>
              <select className="w-full px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.buku_pembantu} onChange={e => update("buku_pembantu", e.target.value)}>
                <option value="">— Tidak perlu —</option>
                {BUKU_PEMBANTU.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>

            {/* Catatan */}
            <div className="card-soft p-5">
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] font-semibold">Catatan</label>
              <textarea rows={2} className="w-full mt-2 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={form.notes || ""} onChange={e => update("notes", e.target.value)} placeholder="Opsional" />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link href="/transactions" className="btn-ghost">Batal</Link>
              <button type="submit" disabled={saving || hasError} className="btn-primary" style={{ opacity: saving || hasError ? 0.5 : 1 }}>
                <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}

export default function TransactionFormPage() {
  return (
    <Suspense fallback={<Layout><div className="p-8 text-center text-[#5C5C5C]">Memuat...</div></Layout>}>
      <TransactionForm />
    </Suspense>
  );
}
