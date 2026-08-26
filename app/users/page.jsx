"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { ROLE_LABELS, ROLE_COLORS, fmtDateTime } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { SkeletonTable } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";
import { useAuth } from "@/contexts/AuthContext";

export default function Page() {
  const { activeRole } = useAuth();

  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ email: "", name: "", role: "driver", password: "" });
  const [editForm, setEditForm] = useState({ name: "", role: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const load = () => { setLoading(true); api.get("/users").then(({data}) => { setUsers(data); setPage(1); }).catch(e => toast.error(formatErr(e))).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const toggle = async (u, val) => {
    if (u.email === "admin@sppg.id" && !val) {
      toast.error("Akun admin utama tidak bisa dinonaktifkan");
      return;
    }
    try {
      await api.patch(`/users/${u.id}`, { is_active: val });
      toast.success(val ? "Akun diaktifkan" : "Akun dinonaktifkan");
      load();
    } catch (e) { toast.error(formatErr(e)); }
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", form);
      toast.success("Pengguna ditambahkan");
      setOpen(false);
      setForm({ email: "", name: "", role: "driver", password: "" });
      load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({ name: u.name, role: u.role, password: "" });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: editForm.name, role: editForm.role };
      if (editForm.password.length >= 6) payload.password = editForm.password;
      await api.patch(`/users/${editingUser.id}`, payload);
      toast.success("Pengguna diperbarui");
      setEditingUser(null);
      load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * perPage;
    return users.slice(start, start + perPage);
  }, [users, page]);

  if (!["admin_apps", "admin_sppg"].includes(activeRole)) {
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
      <div className="space-y-6" data-testid="users-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">Pengguna & Aktivasi</h1>
            <p className="text-[#5C5C5C] mt-1">Aktifkan / nonaktifkan akun. Penghapusan tidak diizinkan.</p>
          </div>
          {["admin_apps", "admin_sppg"].includes(activeRole) && (
            <button data-testid="add-user-btn" onClick={()=>setOpen(true)} className="btn-primary"><Plus size={16}/> Tambah Pengguna</button>
          )}
        </div>

        {loading ? (
          <SkeletonTable rows={8} cols={5} />
        ) : (
          <div className="card-soft overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-3 px-4">Nama</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Peran</th>
                    <th className="text-left py-3 px-4">Dibuat</th>
                    <th className="text-left py-3 px-4">Aktif</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((u) => (
                  <tr key={u.id} className="border-b border-[#EAE4D8] last:border-0">
                    <td className="py-3 px-4 font-semibold">{u.name}</td>
                    <td className="py-3 px-4 audit-ts text-xs">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="role-pill" style={{background:`${ROLE_COLORS[u.role]}1A`, color:ROLE_COLORS[u.role]}}>{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td className="py-3 px-4 audit-ts text-xs">{fmtDateTime(u.created_at)}</td>
                      <td className="py-3 px-4">
                        <Switch data-testid={`activate-${u.email}`} checked={!!u.is_active} onCheckedChange={(v)=>toggle(u, v)} disabled={u.email === "admin@sppg.id"} />
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={()=>openEdit(u)} className="btn-ghost text-xs">Edit</button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="md:hidden space-y-3">
              {paginatedUsers.map((u) => (
                <div key={u.id} className="card-soft p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{u.name}</div>
                      <div className="audit-ts text-xs">{u.email}</div>
                    </div>
                    <Switch checked={!!u.is_active} onCheckedChange={(v)=>toggle(u, v)} disabled={u.email === "admin@sppg.id"} />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5C5C5C]">Peran</span>
                    <span className="role-pill" style={{background:`${ROLE_COLORS[u.role]}1A`, color:ROLE_COLORS[u.role]}}>{ROLE_LABELS[u.role]}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5C5C5C]">Dibuat</span>
                    <span className="audit-ts text-xs">{fmtDateTime(u.created_at)}</span>
                  </div>
                </div>
              ))}
              {paginatedUsers.length === 0 && (
                <div className="text-center text-[#5C5C5C] py-10">Belum ada pengguna.</div>
              )}
            </div>
            <Pagination page={page} totalPages={Math.ceil(users.length / perPage)} onPageChange={setPage} />
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={()=>setOpen(false)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={create} className="card-soft p-4 sm:p-6 w-full max-w-md" data-testid="user-create-modal">
              <h2 className="font-display text-2xl font-bold">Pengguna Baru</h2>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Nama</label>
                <input data-testid="new-user-name" required className="px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Email</label>
                <input data-testid="new-user-email" type="email" required className="px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})}/>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Peran</label>
                <select data-testid="new-user-role" className="px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.role} onChange={(e)=>setForm({...form, role:e.target.value})}>
                  {Object.entries(ROLE_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Password awal</label>
                <input data-testid="new-user-password" required minLength={6} type="password" className="px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={()=>setOpen(false)} className="btn-ghost">Batal</button>
                <button data-testid="submit-new-user" type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {editingUser && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={()=>setEditingUser(null)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={saveEdit} className="card-soft p-4 sm:p-6 w-full max-w-md">
              <h2 className="font-display text-2xl font-bold">Edit Pengguna</h2>
              <p className="text-sm text-[#5C5C5C] mt-1">{editingUser.email}</p>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Nama</label>
                <input required className="px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={editForm.name} onChange={(e)=>setEditForm({...editForm, name:e.target.value})}/>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Peran</label>
                <select className="px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={editForm.role} onChange={(e)=>setEditForm({...editForm, role:e.target.value})}>
                  {Object.entries(ROLE_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Password Baru (kosongkan jika tidak ubah)</label>
                <input minLength={6} type="password" placeholder="Minimal 6 karakter" className="px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={editForm.password} onChange={(e)=>setEditForm({...editForm, password:e.target.value})}/>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={()=>setEditingUser(null)} className="btn-ghost">Batal</button>
                <button type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
