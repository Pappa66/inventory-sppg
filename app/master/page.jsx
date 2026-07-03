"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { fmtIDR, fmtDateTime, ZONES, ZONE_COLORS, ZONE_LABELS, COMMON_ALLERGENS } from "@/lib/format";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, History } from "lucide-react";
import { SkeletonTable } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";

const EMPTY = { name: "", unit: "kg", category: "Sayur", par_level: 0, price_per_unit: 0, zone: "DRY", allergens: [] };

const CAN_EDIT = ["admin", "kitchen_head"];

export default function Page() {
  const { activeRole } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [versions, setVersions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const load = () => { setLoading(true); api.get("/items").then(({data}) => { setItems(data); setPage(1); }).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.patch(`/items/${editing.id}`, form);
      else await api.post("/items", form);
      toast.success("Tersimpan");
      setOpen(false); setEditing(null); setForm(EMPTY); load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const showHistory = async (it) => {
    try {
      const { data } = await api.get(`/versions/items/${it.id}`);
      setVersions(data);
    } catch (er) { toast.error(formatErr(er)); }
  };

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, page]);

  return (
    <Layout>
      <div className="space-y-6" data-testid="master-data-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold">Master Bahan</h1>
            <p className="text-[#5C5C5C] mt-1">Daftar bahan baku, satuan, par-level. Setiap perubahan tersimpan sebagai versi baru.</p>
          </div>
          {CAN_EDIT.includes(activeRole) && <button data-testid="add-item-btn" onClick={()=>{setEditing(null); setForm(EMPTY); setOpen(true);}} className="btn-primary"><Plus size={16}/> Bahan Baru</button>}
        </div>

        {loading ? (
          <SkeletonTable rows={8} cols={8} />
        ) : (
          <div className="card-soft overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-3 px-4">Nama</th>
                    <th className="text-left py-3 px-4">Zona</th>
                    <th className="text-left py-3 px-4">Kategori</th>
                    <th className="text-left py-3 px-4">Satuan</th>
                    <th className="text-right py-3 px-4">Par-Level</th>
                    <th className="text-right py-3 px-4">Harga/Satuan</th>
                    <th className="text-left py-3 px-4">Alergen</th>
                    <th className="text-right py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((it) => (
                  <tr key={it.id} className="border-b border-[#EAE4D8] last:border-0">
                    <td className="py-3 px-4 font-semibold">{it.name}</td>
                    <td className="py-3 px-4"><span className="role-pill" style={{background:`${ZONE_COLORS[it.zone||"DRY"]}1A`, color:ZONE_COLORS[it.zone||"DRY"]}}>{ZONE_LABELS[it.zone||"DRY"]}</span></td>
                    <td className="py-3 px-4">{it.category}</td>
                    <td className="py-3 px-4 audit-ts">{it.unit}</td>
                    <td className="py-3 px-4 text-right audit-ts">{it.par_level}</td>
                    <td className="py-3 px-4 text-right audit-ts">{fmtIDR(it.price_per_unit)}</td>
                    <td className="py-3 px-4 text-xs">{(it.allergens||[]).join(", ") || "—"}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {CAN_EDIT.includes(activeRole) && <button data-testid={`edit-item-${it.id}`} onClick={()=>{setEditing(it); setForm({name:it.name,unit:it.unit,category:it.category,par_level:it.par_level,price_per_unit:it.price_per_unit,zone:it.zone||"DRY",allergens:it.allergens||[]}); setOpen(true);}} className="btn-ghost text-xs">Edit</button>}
                      <button data-testid={`history-${it.id}`} onClick={()=>showHistory(it)} className="btn-ghost text-xs"><History size={14}/> Riwayat</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="md:hidden space-y-3">
              {paginatedItems.map((it) => (
                <div key={it.id} className="card-soft p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold">{it.name}</div>
                    <span className="role-pill text-xs" style={{background:`${ZONE_COLORS[it.zone||"DRY"]}1A`, color:ZONE_COLORS[it.zone||"DRY"]}}>{ZONE_LABELS[it.zone||"DRY"]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[#5C5C5C]">Kategori</span>
                      <div>{it.category}</div>
                    </div>
                    <div>
                      <span className="text-[#5C5C5C]">Satuan</span>
                      <div className="audit-ts">{it.unit}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[#5C5C5C]">Par-Level</span>
                      <div className="audit-ts">{it.par_level}</div>
                    </div>
                    <div>
                      <span className="text-[#5C5C5C]">Harga</span>
                      <div className="audit-ts">{fmtIDR(it.price_per_unit)}</div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    {CAN_EDIT.includes(activeRole) && <button data-testid={`edit-item-${it.id}`} onClick={()=>{setEditing(it); setForm({name:it.name,unit:it.unit,category:it.category,par_level:it.par_level,price_per_unit:it.price_per_unit,zone:it.zone||"DRY",allergens:it.allergens||[]}); setOpen(true);}} className="btn-ghost text-xs">Edit</button>}
                    <button data-testid={`history-${it.id}`} onClick={()=>showHistory(it)} className="btn-ghost text-xs"><History size={14}/> Riwayat</button>
                  </div>
                </div>
              ))}
              {paginatedItems.length === 0 && (
                <div className="text-center text-[#5C5C5C] py-10">Belum ada bahan.</div>
              )}
            </div>
            <Pagination page={page} totalPages={Math.ceil(items.length / perPage)} onPageChange={setPage} />
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={()=>setOpen(false)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={save} className="card-soft p-6 w-full max-w-md">
              <h2 className="font-display text-2xl font-bold">{editing ? "Edit Bahan" : "Bahan Baru"}</h2>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Nama</label>
                <input data-testid="item-name" required className="px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kategori</label>
                    <select className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})}>
                      {["Sayur","Protein","Karbo","Bumbu","Buah","Lainnya"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Satuan</label>
                    <input className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.unit} onChange={(e)=>setForm({...form, unit:e.target.value})}/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Par-Level</label>
                    <input type="number" step="0.01" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.par_level} onChange={(e)=>setForm({...form, par_level:parseFloat(e.target.value)||0})}/>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Harga / Satuan</label>
                    <input type="number" step="100" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.price_per_unit} onChange={(e)=>setForm({...form, price_per_unit:parseFloat(e.target.value)||0})}/>
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Zona Penyimpanan</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {ZONES.map(z => (
                      <button data-testid={`zone-${z}`} type="button" key={z} onClick={()=>setForm({...form, zone:z})} className="px-3 py-2 rounded-md border text-sm font-semibold transition"
                        style={form.zone===z?{background:ZONE_COLORS[z], color:"white", borderColor:ZONE_COLORS[z]}:{background:"#F9F6F0", color:ZONE_COLORS[z], borderColor:"#EAE4D8"}}>{ZONE_LABELS[z]}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Alergen (klik untuk toggle)</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {COMMON_ALLERGENS.map(a => {
                      const on = form.allergens?.includes(a);
                      return <button data-testid={`allergen-${a}`} type="button" key={a} onClick={()=>setForm(p=>({...p, allergens: on?p.allergens.filter(x=>x!==a):[...(p.allergens||[]), a]}))} className={`tag ${on?"bg-[#C5533B]/15 text-[#C5533B]":"bg-[#EAE4D8] text-[#5C5C5C]"}`}>{a}</button>;
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={()=>setOpen(false)} className="btn-ghost">Batal</button>
                <button data-testid="save-item" type="submit" className="btn-primary">{editing?"Simpan Versi Baru":"Tambah"}</button>
              </div>
            </form>
          </div>
        )}

        {versions && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={()=>setVersions(null)}>
            <div onClick={(e)=>e.stopPropagation()} className="card-soft p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
              <h2 className="font-display text-2xl font-bold">Riwayat Versi · {versions.item.name}</h2>
              <p className="text-[#5C5C5C] text-sm">Semua field ditampilkan. Yang diubah ditandai kuning dengan nilai lama → baru.</p>
              <div className="mt-4 relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-[#EAE4D8]"/>
                {versions.rows.map((v) => {
                  const isCreate = v.action === "CREATE";
                  const changed = v.changes || {};
                  const fields = [
                    ["name", "Nama"], ["zone", "Zona"], ["category", "Kategori"],
                    ["unit", "Satuan"], ["par_level", "Par-Level"],
                    ["price_per_unit", "Harga/Satuan"], ["allergens", "Alergen"],
                  ];
                  const fmt = (val) => {
                    if (val == null || val === "") return "—";
                    if (Array.isArray(val)) return val.length ? val.join(", ") : "—";
                    if (typeof val === "number") return val.toLocaleString("id-ID");
                    return String(val);
                  };
                  return (
                    <div key={v.id} className="mb-5 relative">
                      <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full" style={{background: isCreate?"#4A7C59":"#D97706"}}/>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="audit-ts text-xs text-[#5C5C5C]">{fmtDateTime(v.ts)}</span>
                        <span className="tag" style={{background: isCreate?"#4A7C59"+"1A":"#D97706"+"1A", color: isCreate?"#4A7C59":"#D97706"}}>{v.action}</span>
                        <span className="text-sm font-semibold">{v.actor_email}</span>
                        {v.note && <span className="text-xs text-[#5C5C5C]">— {v.note}</span>}
                      </div>
                      <div className="mt-2 rounded-md border border-[#EAE4D8] overflow-hidden">
                        <table className="w-full text-sm">
                          <tbody>
                            {fields.map(([k, label]) => {
                              const c = changed[k];
                              return (
                                <tr key={k} className={`border-b border-[#EAE4D8] last:border-0 ${c ? "bg-[#FFF7E6]" : ""}`}>
                                  <td className="py-1.5 px-3 text-[#5C5C5C] text-xs uppercase tracking-wider w-40">{label}</td>
                                  <td className="py-1.5 px-3 audit-ts text-sm">
                                    {c ? (
                                      <span><span className="line-through text-[#C5533B]">{fmt(c.old)}</span> <span className="text-[#5C5C5C]">→</span> <span className="text-[#4A7C59] font-semibold">{fmt(c.new)}</span></span>
                                    ) : (
                                      <span className="text-[#5C5C5C]">{fmt(versions.item[k])}</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
                {versions.rows.length === 0 && <div className="text-sm text-[#5C5C5C]">Belum ada perubahan.</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
