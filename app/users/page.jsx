"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { ROLE_LABELS, ROLE_COLORS, fmtDateTime } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function Page() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "field_staff", password: "" });

  const load = () => api.get("/users").then(({data}) => setUsers(data)).catch(e => toast.error(formatErr(e)));
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
      setForm({ email: "", name: "", role: "field_staff", password: "" });
      load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="users-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold">Pengguna & Aktivasi</h1>
            <p className="text-[#5C5C5C] mt-1">Aktifkan / nonaktifkan akun. Penghapusan tidak diizinkan.</p>
          </div>
          <button data-testid="add-user-btn" onClick={()=>setOpen(true)} className="btn-primary"><Plus size={16}/> Tambah Pengguna</button>
        </div>

        <div className="card-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left py-3 px-4">Nama</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Peran</th>
                <th className="text-left py-3 px-4">Dibuat</th>
                <th className="text-left py-3 px-4">Aktif</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {open && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={()=>setOpen(false)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={create} className="card-soft p-6 w-full max-w-md" data-testid="user-create-modal">
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
                <input data-testid="new-user-password" required minLength={6} type="text" className="px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={()=>setOpen(false)} className="btn-ghost">Batal</button>
                <button data-testid="submit-new-user" type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
