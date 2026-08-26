"use client";

import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, Save, Filter } from "lucide-react";
import { fmtIDR } from "@/lib/format";

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

const EMPTY_FORM = {
  transaction_date: "",
  account_code: "1100",
  description: "",
  debit: 0,
  credit: 0,
  buku_pembantu: "",
  notes: "",
};

export default function TransactionsPage() {
  const { activeRole } = useAuth();
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterAccount, setFilterAccount] = useState("");
  const [filterBP, setFilterBP] = useState("");

  const canEdit = activeRole === "admin_apps" || activeRole === "admin_sppg" || activeRole === "accountant";

  const load = () => {
    setLoading(true);
    api.get("/transactions")
      .then(r => setTransaksi(r.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = transaksi;
    if (filterAccount) list = list.filter(t => t.account_code === filterAccount);
    if (filterBP) list = list.filter(t => t.buku_pembantu === filterBP);
    return list;
  }, [transaksi, filterAccount, filterBP]);

  const totals = useMemo(() => {
    return filtered.reduce((acc, t) => ({
      debit: acc.debit + (t.debit || 0),
      credit: acc.credit + (t.credit || 0),
    }), { debit: 0, credit: 0 });
  }, [filtered]);

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setOpenForm(true); };
  const openEdit = (t) => { setEditId(t.id); setForm({ ...EMPTY_FORM, ...t }); setOpenForm(true); };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/transactions/${editId}`, form);
        toast.success("Transaksi diperbarui");
      } else {
        await api.post("/transactions", form);
        toast.success("Transaksi ditambahkan");
      }
      setOpenForm(false);
      load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus transaksi ini?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Transaksi dihapus");
      load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const getAccountName = (code) => ACCOUNT_CODES.find(a => a.code === code)?.name || code;

  if (!["admin_apps","admin_sppg","accountant"].includes(activeRole)) {
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
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Transaksi</h1>
            <p className="text-[#5C5C5C] mt-1">Input transaksi Debet/Kredit dengan kode akun</p>
          </div>
          {canEdit && (
            <button onClick={openAdd} className="btn-primary"><Plus size={16}/> Tambah Transaksi</button>
          )}
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
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Buku Pembantu</label>
            <select className="mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm" value={filterBP} onChange={e => setFilterBP(e.target.value)}>
              <option value="">Semua</option>
              {BUKU_PEMBANTU.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Debet</div>
            <div className="font-display text-xl sm:text-2xl font-bold mt-1 text-[#4A7C59]">{fmtIDR(totals.debit)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Kredit</div>
            <div className="font-display text-xl sm:text-2xl font-bold mt-1 text-[#C5533B]">{fmtIDR(totals.credit)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Saldo</div>
            <div className={`font-display text-xl sm:text-2xl font-bold mt-1 ${totals.debit - totals.credit >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>
              {fmtIDR(totals.debit - totals.credit)}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="card-soft p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full mx-auto" /></div>
        ) : (
          <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 && (
              <div className="card-soft p-12 text-center text-[#5C5C5C]">Belum ada transaksi.</div>
            )}
            {filtered.map(t => (
              <div key={t.id} className="card-soft p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{t.description || "—"}</div>
                    <div className="text-xs text-[#5C5C5C] mt-0.5">{t.transaction_date}</div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(t)} className="btn-ghost text-xs"><Pencil size={14}/></button>
                      <button onClick={() => handleDelete(t.id)} className="btn-ghost text-xs text-[#C5533B]"><Trash2 size={14}/></button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="font-mono px-2 py-0.5 rounded bg-[#EAE4D8]">{t.account_code}</span>
                  <span className="text-[#5C5C5C]">{getAccountName(t.account_code)}</span>
                  {t.buku_pembantu && <span className="text-[#5C5C5C]">| {t.buku_pembantu}</span>}
                </div>
                <div className="flex gap-4 text-sm font-semibold">
                  {t.debit ? <span className="text-[#4A7C59]">Debet: {fmtIDR(t.debit)}</span> : null}
                  {t.credit ? <span className="text-[#C5533B]">Kredit: {fmtIDR(t.credit)}</span> : null}
                  {!t.debit && !t.credit && <span className="text-[#5C5C5C]">—</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block card-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-3 px-3">Tanggal</th>
                    <th className="text-left py-3 px-3">Kode Akun</th>
                    <th className="text-left py-3 px-3">Keterangan</th>
                    <th className="text-right py-3 px-3">Debet</th>
                    <th className="text-right py-3 px-3">Kredit</th>
                    <th className="text-left py-3 px-3">Buku Pembantu</th>
                    {canEdit && <th className="text-right py-3 px-3">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} className="border-b border-[#EAE4D8] last:border-0 hover:bg-[#F9F6F0]">
                      <td className="py-3 px-3">{t.transaction_date}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAE4D8]">{t.account_code}</span>
                        <span className="ml-2 text-xs text-[#5C5C5C]">{getAccountName(t.account_code)}</span>
                      </td>
                      <td className="py-3 px-3 max-w-[200px] truncate">{t.description}</td>
                      <td className="py-3 px-3 text-right font-semibold text-[#4A7C59]">{t.debit ? fmtIDR(t.debit) : "—"}</td>
                      <td className="py-3 px-3 text-right font-semibold text-[#C5533B]">{t.credit ? fmtIDR(t.credit) : "—"}</td>
                      <td className="py-3 px-3 text-xs text-[#5C5C5C]">{t.buku_pembantu || "—"}</td>
                      {canEdit && (
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => openEdit(t)} className="btn-ghost text-xs"><Pencil size={14}/></button>
                            <button onClick={() => handleDelete(t.id)} className="btn-ghost text-xs text-[#C5533B]"><Trash2 size={14}/></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={canEdit ? 7 : 6} className="py-10 text-center text-[#5C5C5C]">Belum ada transaksi.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}

        {/* Form Modal */}
        {openForm && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setOpenForm(false)}>
            <form onClick={e => e.stopPropagation()} onSubmit={submitForm} className="card-soft p-4 sm:p-6 w-full max-w-md space-y-4">
              <h2 className="font-display text-2xl font-bold">{editId ? "Edit Transaksi" : "Tambah Transaksi"}</h2>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Tanggal</label>
                <input required type="date" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.transaction_date} onChange={e => update("transaction_date", e.target.value)} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kode Akun</label>
                <select className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.account_code} onChange={e => update("account_code", e.target.value)}>
                  {ACCOUNT_CODES.map(a => <option key={a.code} value={a.code}>{a.code} - {a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Keterangan</label>
                <input required className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.description} onChange={e => update("description", e.target.value)} placeholder="Deskripsi transaksi" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Debet (Rp)</label>
                  <input type="number" min="0" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-right" value={form.debit || ""} onChange={e => update("debit", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kredit (Rp)</label>
                  <input type="number" min="0" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-right" value={form.credit || ""} onChange={e => update("credit", parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Buku Pembantu</label>
                <select className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.buku_pembantu} onChange={e => update("buku_pembantu", e.target.value)}>
                  <option value="">—</option>
                  {BUKU_PEMBANTU.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Catatan</label>
                <textarea rows={2} className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.notes} onChange={e => update("notes", e.target.value)} />
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
