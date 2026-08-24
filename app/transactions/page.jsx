"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { SkeletonTable } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";
import { fmtIDR, fmtDate } from "@/lib/format";

const AUX_BOOKS = ["BANK", "PETTY_CASH", "BAHAN_BAKU", "OPERASIONAL", "FASILITAS", "PAJAK"];
const AUX_BOOK_COLORS = {
  BANK: "#2C4251",
  PETTY_CASH: "#D97706",
  BAHAN_BAKU: "#4A7C59",
  OPERASIONAL: "#5C5C5C",
  FASILITAS: "#7C3AED",
  PAJAK: "#C5533B",
};

const EMPTY_FORM = {
  transaction_date: "",
  evidence_number: "",
  description: "",
  debit_amount: 0,
  credit_amount: 0,
  auxiliary_book: "OPERASIONAL",
  account_source: "",
  account_dest: "",
  account_code: "",
  notes: "",
};

export default function Page() {
  const { activeRole } = useAuth();
  const [transaksis, setTransaksis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterAux, setFilterAux] = useState("ALL");

  const canEdit = activeRole === "admin" || activeRole === "accountant";
  const canDelete = activeRole === "admin";

  const load = () => {
    setLoading(true);
    api.get("/transaksis")
      .then((r) => { setTransaksis(r.data); setPage(1); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = transaksis;
    if (filterDateFrom) list = list.filter((t) => t.transaction_date >= filterDateFrom);
    if (filterDateTo) list = list.filter((t) => t.transaction_date <= filterDateTo);
    if (filterAux !== "ALL") list = list.filter((t) => t.auxiliary_book === filterAux);
    return [...list].sort((a, b) => (a.transaction_date || "").localeCompare(b.transaction_date || ""));
  }, [transaksis, filterDateFrom, filterDateTo, filterAux]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const totalDebit = useMemo(() => filtered.reduce((s, t) => s + (t.debit_amount || 0), 0), [filtered]);
  const totalCredit = useMemo(() => filtered.reduce((s, t) => s + (t.credit_amount || 0), 0), [filtered]);
  const saldo = totalDebit - totalCredit;

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setOpenForm(true); };
  const openEdit = (t) => {
    setEditId(t.id);
    setForm({
      transaction_date: t.transaction_date || "",
      evidence_number: t.evidence_number || "",
      description: t.description || "",
      debit_amount: t.debit_amount || 0,
      credit_amount: t.credit_amount || 0,
      auxiliary_book: t.auxiliary_book || "OPERASIONAL",
      account_source: t.account_source || "",
      account_dest: t.account_dest || "",
      account_code: t.account_code || "",
      notes: t.notes || "",
    });
    setOpenForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.patch(`/transaksis/${editId}`, form);
        toast.success("Transaksi diperbarui");
      } else {
        await api.post("/transaksis", form);
        toast.success("Transaksi ditambahkan");
      }
      setOpenForm(false); load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus transaksi ini?")) return;
    try {
      await api.delete(`/transaksis/${id}`);
      toast.success("Transaksi dihapus");
      load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Layout>
      <div className="space-y-6" data-testid="transactions-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">Transaksi</h1>
            <p className="text-[#5C5C5C] mt-1">Kelola pencatatan transaksi keuangan harian.</p>
          </div>
          {canEdit && (
            <button data-testid="add-transaksi-btn" onClick={openAdd} className="btn-primary"><Plus size={16}/> Tambah Transaksi</button>
          )}
        </div>

        <div className="card-soft p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Dari Tanggal</label>
            <input type="date" className="mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={filterDateFrom} onChange={(e)=>{setFilterDateFrom(e.target.value); setPage(1);}}/>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Sampai Tanggal</label>
            <input type="date" className="mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={filterDateTo} onChange={(e)=>{setFilterDateTo(e.target.value); setPage(1);}}/>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Buku Pembantu</label>
            <select className="mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={filterAux} onChange={(e)=>{setFilterAux(e.target.value); setPage(1);}}>
              <option value="ALL">Semua</option>
              {AUX_BOOKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Debet</div>
            <div className="font-display text-2xl font-bold mt-1 text-[#4A7C59]">{fmtIDR(totalDebit)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Kredit</div>
            <div className="font-display text-2xl font-bold mt-1 text-[#C5533B]">{fmtIDR(totalCredit)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Saldo</div>
            <div className={`font-display text-2xl font-bold mt-1 ${saldo >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(saldo)}</div>
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={8} cols={8} />
        ) : (
          <div className="card-soft overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-3 px-4">Tanggal</th>
                    <th className="text-left py-3 px-4">No. Bukti</th>
                    <th className="text-left py-3 px-4">Uraian</th>
                    <th className="text-right py-3 px-4">Debet</th>
                    <th className="text-right py-3 px-4">Kredit</th>
                    <th className="text-left py-3 px-4">Buku Pembantu</th>
                    <th className="text-left py-3 px-4">Akun</th>
                    <th className="text-left py-3 px-4">Catatan</th>
                    {canEdit && <th className="text-right py-3 px-4">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => (
                    <tr key={t.id} className="border-b border-[#EAE4D8] last:border-0">
                      <td className="py-3 px-4 audit-ts">{t.transaction_date}</td>
                      <td className="py-3 px-4 font-semibold">{t.evidence_number}</td>
                      <td className="py-3 px-4">{t.description}</td>
                      <td className="py-3 px-4 text-right audit-ts">{t.debit_amount ? fmtIDR(t.debit_amount) : "—"}</td>
                      <td className="py-3 px-4 text-right audit-ts">{t.credit_amount ? fmtIDR(t.credit_amount) : "—"}</td>
                      <td className="py-3 px-4">
                        <span className="role-pill" style={{ background: `${AUX_BOOK_COLORS[t.auxiliary_book] || "#5C5C5C"}1A`, color: AUX_BOOK_COLORS[t.auxiliary_book] || "#5C5C5C" }}>{t.auxiliary_book}</span>
                      </td>
                      <td className="py-3 px-4 audit-ts">{t.account_code}</td>
                      <td className="py-3 px-4 text-xs text-[#5C5C5C] max-w-[150px] truncate">{t.notes}</td>
                      {canEdit && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button data-testid={`edit-${t.id}`} onClick={() => openEdit(t)} className="btn-ghost text-xs"><Pencil size={14}/> Edit</button>
                            {canDelete && <button data-testid={`del-${t.id}`} onClick={() => handleDelete(t.id)} className="btn-ghost text-xs text-[#C5533B]"><Trash2 size={14}/> Hapus</button>}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={canEdit ? 9 : 8} className="py-10 text-center text-[#5C5C5C]">Belum ada transaksi.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-3 p-3">
              {paginated.map((t) => (
                <div key={t.id} className="card-soft p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="audit-ts text-sm">{t.transaction_date}</div>
                      <div className="font-semibold">{t.evidence_number}</div>
                    </div>
                    <span className="role-pill text-xs" style={{ background: `${AUX_BOOK_COLORS[t.auxiliary_book] || "#5C5C5C"}1A`, color: AUX_BOOK_COLORS[t.auxiliary_book] || "#5C5C5C" }}>{t.auxiliary_book}</span>
                  </div>
                  <div className="text-sm">{t.description}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-[#5C5C5C]">Debet</span><div className="audit-ts font-semibold">{t.debit_amount ? fmtIDR(t.debit_amount) : "—"}</div></div>
                    <div><span className="text-[#5C5C5C]">Kredit</span><div className="audit-ts font-semibold">{t.credit_amount ? fmtIDR(t.credit_amount) : "—"}</div></div>
                  </div>
                  {canEdit && (
                    <div className="flex justify-end gap-1 pt-1">
                      <button onClick={() => openEdit(t)} className="btn-ghost text-xs"><Pencil size={14}/> Edit</button>
                      {canDelete && <button onClick={() => handleDelete(t.id)} className="btn-ghost text-xs text-[#C5533B]"><Trash2 size={14}/> Hapus</button>}
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && <div className="text-center text-[#5C5C5C] py-10">Belum ada transaksi.</div>}
            </div>
            <Pagination page={page} totalPages={Math.ceil(filtered.length / perPage)} onPageChange={setPage} />
          </div>
        )}

        {openForm && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={() => setOpenForm(false)}>
            <form onClick={(e) => e.stopPropagation()} onSubmit={submitForm} className="card-soft p-6 w-full max-w-lg">
              <h2 className="font-display text-2xl font-bold">{editId ? "Edit Transaksi" : "Tambah Transaksi"}</h2>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Tanggal</label>
                    <input required type="date" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.transaction_date} onChange={(e) => update("transaction_date", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">No. Bukti</label>
                    <input className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.evidence_number} onChange={(e) => update("evidence_number", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Uraian</label>
                  <input required className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.description} onChange={(e) => update("description", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Debet</label>
                    <input type="number" min="0" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.debit_amount} onChange={(e) => update("debit_amount", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kredit</label>
                    <input type="number" min="0" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.credit_amount} onChange={(e) => update("credit_amount", parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Buku Pembantu</label>
                  <select className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.auxiliary_book} onChange={(e) => update("auxiliary_book", e.target.value)}>
                    {AUX_BOOKS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Akun Sumber</label>
                    <input className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.account_source} onChange={(e) => update("account_source", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Akun Tujuan</label>
                    <input className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.account_dest} onChange={(e) => update("account_dest", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kode Akun</label>
                  <input className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.account_code} onChange={(e) => update("account_code", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Catatan</label>
                  <textarea rows={2} className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={() => setOpenForm(false)} className="btn-ghost">Batal</button>
                <button data-testid="save-transaksi" type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
