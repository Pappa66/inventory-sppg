"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { SkeletonTable } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";
import { fmtIDR } from "@/lib/format";

const EMPTY_FORM = {
  plan_date: "",
  total_portions: 0,
  price_per_portion: 15000,
  actual: 0,
  notes: "",
};

export default function Page() {
  const { activeRole } = useAuth();
  const [anggarans, setAnggarans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [filterDate, setFilterDate] = useState("");

  const canEdit = activeRole === "admin" || activeRole === "kitchen_head";
  const canDelete = activeRole === "admin";

  const load = () => {
    setLoading(true);
    api.get("/anggaran")
      .then((r) => { setAnggarans(r.data); setPage(1); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = anggarans;
    if (filterDate) list = list.filter((a) => a.plan_date === filterDate);
    return [...list].sort((a, b) => (a.plan_date || "").localeCompare(b.plan_date || ""));
  }, [anggarans, filterDate]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, a) => ({
        total_portions: acc.total_portions + (a.total_portions || 0),
        rab: acc.rab + (a.rab || 0),
        actual: acc.actual + (a.actual || 0),
        selisih: acc.selisih + ((a.rab || 0) - (a.actual || 0)),
      }),
      { total_portions: 0, rab: 0, actual: 0, selisih: 0 }
    );
  }, [filtered]);

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setOpenForm(true); };
  const openEdit = (a) => {
    setEditId(a.id);
    setForm({
      plan_date: a.plan_date || "",
      total_portions: a.total_portions || 0,
      price_per_portion: a.price_per_portion || 15000,
      actual: a.actual || 0,
      notes: a.notes || "",
    });
    setOpenForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.patch(`/anggaran/${editId}`, form);
        toast.success("Anggaran diperbarui");
      } else {
        await api.post("/anggaran", form);
        toast.success("Anggaran ditambahkan");
      }
      setOpenForm(false); load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus anggaran ini?")) return;
    try {
      await api.delete(`/anggaran/${id}`);
      toast.success("Anggaran dihapus");
      load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Layout>
      <div className="space-y-6" data-testid="anggaran-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">Anggaran</h1>
            <p className="text-[#5C5C5C] mt-1">Perencanaan anggaran berdasarkan jumlah porsi harian.</p>
          </div>
          {canEdit && (
            <button data-testid="add-anggaran-btn" onClick={openAdd} className="btn-primary"><Plus size={16}/> Tambah Anggaran</button>
          )}
        </div>

        <div className="card-soft p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Tanggal Rencana</label>
            <input type="date" className="mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Porsi</div>
            <div className="font-display text-2xl font-bold mt-1">{totals.total_portions.toLocaleString("id-ID")}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total RAB</div>
            <div className="font-display text-2xl font-bold mt-1">{fmtIDR(totals.rab)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Aktual</div>
            <div className="font-display text-2xl font-bold mt-1 text-[#4A7C59]">{fmtIDR(totals.actual)}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Selisih</div>
            <div className={`font-display text-2xl font-bold mt-1 ${totals.selisih >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(totals.selisih)}</div>
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : (
          <div className="card-soft overflow-hidden">
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-3 px-4">Tanggal</th>
                    <th className="text-right py-3 px-4">Total Porsi</th>
                    <th className="text-right py-3 px-4">Harga/Porsi</th>
                    <th className="text-right py-3 px-4">RAB</th>
                    <th className="text-right py-3 px-4">Aktual</th>
                    <th className="text-right py-3 px-4">Selisih</th>
                    <th className="text-left py-3 px-4">Catatan</th>
                    {canEdit && <th className="text-right py-3 px-4">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a) => {
                    const selisih = (a.rab || 0) - (a.actual || 0);
                    return (
                      <tr key={a.id} className="border-b border-[#EAE4D8] last:border-0">
                        <td className="py-3 px-4 audit-ts">{a.plan_date}</td>
                        <td className="py-3 px-4 text-right font-semibold">{(a.total_portions || 0).toLocaleString("id-ID")}</td>
                        <td className="py-3 px-4 text-right audit-ts">{fmtIDR(a.price_per_portion)}</td>
                        <td className="py-3 px-4 text-right font-semibold">{fmtIDR(a.rab)}</td>
                        <td className="py-3 px-4 text-right audit-ts">{fmtIDR(a.actual)}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${selisih >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(selisih)}</td>
                        <td className="py-3 px-4 text-sm text-[#5C5C5C]">{a.notes || "—"}</td>
                        {canEdit && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button data-testid={`edit-${a.id}`} onClick={() => openEdit(a)} className="btn-ghost text-xs"><Pencil size={14}/> Edit</button>
                              {canDelete && <button data-testid={`del-${a.id}`} onClick={() => handleDelete(a.id)} className="btn-ghost text-xs text-[#C5533B]"><Trash2 size={14}/> Hapus</button>}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && <tr><td colSpan={canEdit ? 8 : 7} className="py-10 text-center text-[#5C5C5C]">Belum ada data anggaran.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="lg:hidden space-y-3 p-3">
              {paginated.map((a) => {
                const selisih = (a.rab || 0) - (a.actual || 0);
                return (
                  <div key={a.id} className="card-soft p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="audit-ts text-sm">{a.plan_date}</div>
                      <div className="text-xs font-semibold">{(a.total_portions || 0).toLocaleString("id-ID")} porsi</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div><span className="text-[#5C5C5C]">RAB</span><div className="font-semibold">{fmtIDR(a.rab)}</div></div>
                      <div><span className="text-[#5C5C5C]">Aktual</span><div className="audit-ts">{fmtIDR(a.actual)}</div></div>
                      <div><span className="text-[#5C5C5C]">Selisih</span><div className={`font-semibold ${selisih >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(selisih)}</div></div>
                    </div>
                    {canEdit && (
                      <div className="flex justify-end gap-1 pt-1">
                        <button onClick={() => openEdit(a)} className="btn-ghost text-xs"><Pencil size={14}/> Edit</button>
                        {canDelete && <button onClick={() => handleDelete(a.id)} className="btn-ghost text-xs text-[#C5533B]"><Trash2 size={14}/> Hapus</button>}
                      </div>
                    )}
                  </div>
                );
              })}
              {filtered.length === 0 && <div className="text-center text-[#5C5C5C] py-10">Belum ada data anggaran.</div>}
            </div>
            <Pagination page={page} totalPages={Math.ceil(filtered.length / perPage)} onPageChange={setPage} />
          </div>
        )}

        {openForm && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={() => setOpenForm(false)}>
            <form onClick={(e) => e.stopPropagation()} onSubmit={submitForm} className="card-soft p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="font-display text-2xl font-bold">{editId ? "Edit Anggaran" : "Tambah Anggaran"}</h2>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Tanggal Rencana</label>
                  <input required type="date" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.plan_date} onChange={(e) => update("plan_date", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Jumlah Porsi</label>
                  <input type="number" min="0" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.total_portions} onChange={(e) => update("total_portions", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Harga per Porsi (Rp)</label>
                  <input type="number" min="0" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.price_per_portion} onChange={(e) => update("price_per_portion", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Biaya Aktual (Rp)</label>
                  <input type="number" min="0" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.actual} onChange={(e) => update("actual", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Catatan</label>
                  <textarea rows={2} className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
                </div>
                <div className="p-3 rounded bg-[#EAE4D8] text-sm">
                  <span className="text-[#5C5C5C]">RAB: </span>
                  <span className="font-semibold">{fmtIDR(form.total_portions * form.price_per_portion)}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={() => setOpenForm(false)} className="btn-ghost">Batal</button>
                <button data-testid="save-anggaran" type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
