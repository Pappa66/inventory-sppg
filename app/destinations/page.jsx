"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, MapPin, Pencil, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SkeletonTable } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";

const EMPTY_FORM = {
  name: "",
  address: "",
  contact_person: "",
  phone: "",
  notes: "",
};

export default function Page() {
  const { activeRole } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const perPage = 15;

  const canWrite = activeRole === "admin_apps" || activeRole === "admin_sppg" || activeRole === "field_assistant";

  const load = () => {
    setLoading(true);
    api
      .get("/destinations")
      .then(({ data }) => {
        setDestinations(data);
        setPage(1);
      })
      .catch((e) => toast.error(formatErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return destinations;
    const q = search.toLowerCase();
    return destinations.filter((d) => d.name?.toLowerCase().includes(q));
  }, [destinations, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      name: d.name || "",
      address: d.address || "",
      contact_person: d.contact_person || "",
      phone: d.phone || "",
      notes: d.notes || "",
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.patch(`/destinations/${editing.id}`, form);
        toast.success("Tujuan antar diperbarui");
      } else {
        await api.post("/destinations", form);
        toast.success("Tujuan antar ditambahkan");
      }
      setOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      load();
    } catch (er) {
      toast.error(formatErr(er));
    }
  };

  const toggleActive = async (d, val) => {
    try {
      await api.patch(`/destinations/${d.id}`, { is_active: val });
      toast.success(val ? "Tujuan diaktifkan" : "Tujuan dinonaktifkan");
      load();
    } catch (e) {
      toast.error(formatErr(e));
    }
  };

  const ALLOWED_ROLES = ["admin_apps","admin_sppg","field_assistant"];
  if (!ALLOWED_ROLES.includes(activeRole)) {
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
      <div className="space-y-6" data-testid="destinations-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Tujuan Antar</h1>
            <p className="text-[#5C5C5C] mt-1">Kelola data tujuan pengantaran makanan.</p>
          </div>
          {canWrite && (
            <button data-testid="add-destination-btn" onClick={openCreate} className="btn-primary">
              <Plus size={16} /> Tambah Tujuan
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C5C]" />
          <input
            data-testid="search-destination"
            type="text"
            placeholder="Cari nama tujuan..."
            className="w-full pl-9 pr-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : (
          <div className="card-soft overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-3 px-4">Nama</th>
                    <th className="text-left py-3 px-4">Alamat</th>
                    <th className="text-left py-3 px-4">Kontak</th>
                    <th className="text-left py-3 px-4">Telepon</th>
                    <th className="text-left py-3 px-4">Aktif</th>
                    {canWrite && <th className="text-right py-3 px-4">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((d) => (
                    <tr key={d.id} className="border-b border-[#EAE4D8] last:border-0">
                      <td className="py-3 px-4 font-semibold flex items-center gap-2">
                        <MapPin size={14} className="text-[#4A7C59]" /> {d.name}
                      </td>
                      <td className="py-3 px-4 text-[#5C5C5C] max-w-[200px] truncate">{d.address || "—"}</td>
                      <td className="py-3 px-4 audit-ts">{d.contact_person || "—"}</td>
                      <td className="py-3 px-4 audit-ts">{d.phone || "—"}</td>
                      <td className="py-3 px-4">
                        <Switch
                          data-testid={`toggle-active-${d.id}`}
                          checked={!!d.is_active}
                          onCheckedChange={(v) => toggleActive(d, v)}
                        />
                      </td>
                      {canWrite && (
                        <td className="py-3 px-4 text-right">
                          <button
                            data-testid={`edit-destination-${d.id}`}
                            onClick={() => openEdit(d)}
                            className="btn-ghost text-xs"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={canWrite ? 6 : 5} className="py-10 text-center text-[#5C5C5C]">
                        {search ? "Tidak ada tujuan yang cocok dengan pencarian." : "Belum ada data tujuan antar."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {paginated.map((d) => (
                <div key={d.id} className="card-soft p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold flex items-center gap-2">
                      <MapPin size={14} className="text-[#4A7C59]" /> {d.name}
                    </div>
                    <Switch checked={!!d.is_active} onCheckedChange={(v) => toggleActive(d, v)} />
                  </div>
                  {d.address && (
                    <div className="text-sm text-[#5C5C5C]">{d.address}</div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[#5C5C5C]">Kontak</span>
                      <div className="audit-ts">{d.contact_person || "—"}</div>
                    </div>
                    <div>
                      <span className="text-[#5C5C5C]">Telepon</span>
                      <div className="audit-ts">{d.phone || "—"}</div>
                    </div>
                  </div>
                  {canWrite && (
                    <div className="flex justify-end pt-1">
                      <button onClick={() => openEdit(d)} className="btn-ghost text-xs">
                        <Pencil size={14} /> Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {paginated.length === 0 && (
                <div className="text-center text-[#5C5C5C] py-10">
                  {search ? "Tidak ada tujuan yang cocok dengan pencarian." : "Belum ada data tujuan antar."}
                </div>
              )}
            </div>

            <Pagination page={page} totalPages={Math.ceil(filtered.length / perPage)} onPageChange={setPage} />
          </div>
        )}

        {/* Create / Edit Modal */}
        {open && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={() => setOpen(false)}>
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={submit}
              className="card-soft p-6 w-full max-w-md"
              data-testid="destination-modal"
            >
              <h2 className="font-display text-2xl font-bold">
                {editing ? "Edit Tujuan" : "Tambah Tujuan Baru"}
              </h2>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Nama Tujuan</label>
                  <input
                    data-testid="dest-name"
                    required
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]"
                    placeholder="Contoh: PAUD Ceria"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Alamat</label>
                  <input
                    data-testid="dest-address"
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]"
                    placeholder="Alamat lengkap"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kontak Person</label>
                    <input
                      data-testid="dest-contact"
                      className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]"
                      placeholder="Nama PIC"
                      value={form.contact_person}
                      onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Telepon</label>
                    <input
                      data-testid="dest-phone"
                      className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]"
                      placeholder="08xxxxxxxxxx"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Catatan</label>
                  <textarea
                    data-testid="dest-notes"
                    rows={3}
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm resize-none"
                    placeholder="Catatan tambahan (opsional)"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                  Batal
                </button>
                <button data-testid="save-destination" type="submit" className="btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
