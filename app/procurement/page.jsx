"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { fmtIDR, fmtDateTime } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Camera, Plus, BadgeCheck, AlertCircle, Receipt } from "lucide-react";
import { SkeletonCards } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";

const EMPTY = {
  category: "STOCK", description: "", amount_idr: 0,
  receipt_total_idr: 0, receipt_photo: "", transport_amount_idr: 0,
  supplier: "", items: [],
};

export default function Page() {
  const { activeRole } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [stockLots, setStockLots] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [verifyOf, setVerifyOf] = useState(null);
  const [verifyNote, setVerifyNote] = useState("");
  const fileRef = useRef();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const load = () => { setLoading(true); Promise.all([api.get("/purchases"), api.get("/items"), api.get("/stock-lots")]).then(([a,b,c]) => { setPurchases(a.data); setItems(b.data); setStockLots(c.data || []); setPage(1); }).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const pickPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, receipt_photo: reader.result }));
    reader.readAsDataURL(f);
  };

  const addItemRow = () => setForm((p) => ({ ...p, items: [...p.items, { item_id: "", quantity: 0, unit_price: 0 }] }));
  const updItemRow = (i, k, v) => setForm((p) => {
    const list = [...p.items]; list[i] = { ...list[i], [k]: v }; return { ...p, items: list };
  });
  const removeItemRow = (i) => setForm((p) => ({ ...p, items: p.items.filter((_,idx)=>idx!==i) }));

  const stockByItem = useMemo(() => {
    const map = {};
    for (const lot of stockLots) {
      if (!lot.item_id) continue;
      if (!map[lot.item_id]) map[lot.item_id] = 0;
      map[lot.item_id] += Number(lot.actual_quantity) || 0;
    }
    return map;
  }, [stockLots]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.receipt_photo) return toast.error("Foto struk wajib diunggah");
    try {
      await api.post("/purchases", form);
      toast.success("Belanja tercatat");
      setOpen(false); setForm(EMPTY); load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const verify = async (approve) => {
    try {
      await api.post(`/purchases/${verifyOf.id}/verify`, { verified: approve, note: verifyNote });
      toast.success(approve ? "Pembelian diverifikasi" : "Pembelian ditolak");
      setVerifyOf(null); setVerifyNote(""); load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const paginatedPurchases = useMemo(() => {
    const start = (page - 1) * perPage;
    return purchases.slice(start, start + perPage);
  }, [purchases, page]);

  const ALLOWED_ROLES = ["admin_apps","admin_sppg","field_assistant","accountant","kitchen_head"];
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
      <div className="space-y-6" data-testid="procurement-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Belanja & Struk</h1>
            <p className="text-[#5C5C5C] mt-1">STOCK = bahan baku · OPERATIONAL = transport/bbm. Foto struk wajib untuk setiap entri.</p>
          </div>
          {(activeRole === "field_assistant" || activeRole === "admin_apps" || activeRole === "admin_sppg") &&
            <button data-testid="add-purchase-btn" onClick={()=>{setForm(EMPTY); setOpen(true);}} className="btn-primary"><Plus size={16}/> Catat Belanja</button>}
        </div>

        {loading ? (
          <SkeletonCards count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedPurchases.map((p) => {
              const mismatch = p.receipt_total_idr && Math.abs(p.receipt_total_idr - p.amount_idr) > 1;
              return (
                <div key={p.id} className="card-soft p-4" data-testid={`purchase-${p.id}`}>
                  <div className="flex items-center justify-between">
                    <span className="tag" style={{background: p.category==="STOCK"?"#4A7C59"+"1A":"#D97706"+"1A", color: p.category==="STOCK"?"#4A7C59":"#D97706"}}>{p.category}</span>
                    {p.verified ? <span className="tag bg-[#2C4251]/10 text-[#2C4251]"><BadgeCheck size={12} className="inline mr-1"/>Tervalidasi</span> : <span className="tag bg-[#5C5C5C]/10 text-[#5C5C5C]">Belum divalidasi</span>}
                  </div>
                  <div className="font-display font-bold text-lg mt-2">{p.description}</div>
                  <img alt="struk" src={p.receipt_photo} className="mt-3 w-full h-44 object-cover rounded-md border border-[#EAE4D8] bg-[#2D2D2D]"/>
                  <div className="text-xs audit-ts text-[#5C5C5C] mt-2">{fmtDateTime(p.purchased_at)} · {p.created_by_name}</div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <div className="text-[#5C5C5C]">Manual</div><div className="audit-ts font-semibold">{fmtIDR(p.amount_idr)}</div>
                  </div>
                  {p.receipt_total_idr ? (
                    <div className={`flex items-center justify-between text-sm ${mismatch?"text-[#C5533B]":""}`}>
                      <div className="text-[#5C5C5C]">Struk Digital</div><div className="audit-ts font-semibold flex items-center gap-1">{mismatch && <AlertCircle size={12}/>}{fmtIDR(p.receipt_total_idr)}</div>
                    </div>
                  ) : null}
                  {p.transport_amount_idr ? (
                    <div className="flex items-center justify-between text-sm"><div className="text-[#5C5C5C]">Transport</div><div className="audit-ts">{fmtIDR(p.transport_amount_idr)}</div></div>
                  ) : null}
                  {(activeRole === "accountant" || activeRole === "admin_apps" || activeRole === "admin_sppg") && !p.verified && (
                    <button data-testid={`verify-${p.id}`} onClick={()=>setVerifyOf(p)} className="btn-outline w-full mt-3 text-xs py-1.5"><Receipt size={14}/> Validasi Akuntan</button>
                  )}
                </div>
              );
            })}
            {purchases.length === 0 && <div className="col-span-full text-center text-[#5C5C5C] py-10">
              <p className="mb-3">Belum ada catatan belanja.</p>
              <button onClick={() => setOpen(true)} className="btn-primary text-xs">+ Catat Belanja</button>
            </div>}
          </div>
        )}
        <Pagination page={page} totalPages={Math.ceil(purchases.length / perPage)} onPageChange={setPage} />

        {open && (
          <div className="modal-overlay" onClick={()=>setOpen(false)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={submit} className="modal-panel modal-panel-lg" data-testid="purchase-form">
              <div className="modal-header">
                <h2 className="font-display text-2xl font-bold">Catat Belanja</h2>
                <button type="button" onClick={()=>setOpen(false)} className="btn-ghost text-lg leading-none p-1">&times;</button>
              </div>
              <div className="modal-body">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="form-label">Kategori</label>
                    <div className="role-switch w-full mt-1" style={{display:"grid", gridTemplateColumns:"1fr 1fr"}}>
                      {["STOCK","OPERATIONAL"].map((c) => (
                        <button data-testid={`cat-${c}`} type="button" key={c} data-active={form.category===c} onClick={()=>setForm({...form, category:c})}
                          style={form.category===c?{background:c==="STOCK"?"#4A7C59":"#D97706", color:"white"}:{}}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="form-label">Deskripsi</label>
                    <input data-testid="purchase-desc" required className="form-input" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})}/>
                  </div>
                  <div>
                    <label className="form-label">Jumlah manual (Rp)</label>
                    <input data-testid="purchase-amount" required type="number" className="form-input" value={form.amount_idr || ""} onChange={(e)=>setForm({...form, amount_idr:parseFloat(e.target.value)||0})}/>
                  </div>
                  <div>
                    <label className="form-label">Total struk (Rp)</label>
                    <input type="number" className="form-input" value={form.receipt_total_idr || ""} onChange={(e)=>setForm({...form, receipt_total_idr:parseFloat(e.target.value)||0})}/>
                  </div>
                  <div>
                    <label className="form-label">Supplier</label>
                    <input className="form-input" value={form.supplier} onChange={(e)=>setForm({...form, supplier:e.target.value})}/>
                  </div>
                  <div>
                    <label className="form-label">Transport / BBM (Rp)</label>
                    <input type="number" className="form-input" value={form.transport_amount_idr || ""} onChange={(e)=>setForm({...form, transport_amount_idr:parseFloat(e.target.value)||0})}/>
                  </div>

                  {form.category === "STOCK" && (
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mt-2">
                        <label className="form-label">Rincian Bahan</label>
                        <button data-testid="add-purchase-item" type="button" onClick={addItemRow} className="btn-ghost text-xs"><Plus size={12}/> Baris</button>
                      </div>
                      <div className="space-y-2 mt-2">
                        {form.items.map((row, i) => (
                          <div key={i} className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                            <select className="col-span-6 form-select text-sm" value={row.item_id} onChange={(e)=>updItemRow(i,"item_id",e.target.value)}>
                              <option value="">— bahan —</option>
                              {items.map(it => {
                                const stok = stockByItem[it.id] || 0;
                                const low = stok < (it.par_level || 0);
                                return <option key={it.id} value={it.id}>{it.name} ({it.unit}){stok > 0 ? ` — Stok: ${stok}` : ""}{low ? " ⚠" : ""}</option>;
                              })}
                            </select>
                            <input placeholder="qty" type="number" step="0.01" className="col-span-2 form-input text-sm" value={row.quantity || ""} onChange={(e)=>updItemRow(i,"quantity",parseFloat(e.target.value)||0)}/>
                            <input placeholder="harga" type="number" className="col-span-3 form-input text-sm" value={row.unit_price || ""} onChange={(e)=>updItemRow(i,"unit_price",parseFloat(e.target.value)||0)}/>
                            <button type="button" onClick={()=>removeItemRow(i)} className="col-span-1 text-[#C5533B]">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="form-label">Foto Struk (wajib)</label>
                    <input data-testid="purchase-photo" ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickPhoto} className="w-full mt-1 text-sm"/>
                    {form.receipt_photo ? (
                      <div className="relative mt-2 rounded-md overflow-hidden border border-[#EAE4D8]">
                        <img alt="struk" src={form.receipt_photo} className="w-full h-52 object-cover"/>
                        <div className="absolute bottom-0 left-0 right-0 bg-[#2D2D2D]/85 text-white text-[10px] audit-ts p-2 flex items-center justify-between">
                          <span>SPPG · {new Date().toISOString()}</span><span>WATERMARK · ROLE: {activeRole}</span>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={()=>fileRef.current?.click()} className="w-full mt-2 h-32 border-2 border-dashed border-[#EAE4D8] rounded-md text-[#5C5C5C] flex flex-col items-center justify-center gap-2"><Camera/> Ambil / Pilih Foto Struk</button>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={()=>setOpen(false)} className="btn-ghost">Batal</button>
                <button data-testid="submit-purchase" type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {verifyOf && (
          <div className="modal-overlay" onClick={()=>setVerifyOf(null)}>
            <div onClick={(e)=>e.stopPropagation()} className="modal-panel modal-panel-md">
              <div className="modal-header">
                <h2 className="font-display text-2xl font-bold">Validasi Akuntan</h2>
                <button type="button" onClick={()=>setVerifyOf(null)} className="btn-ghost text-lg leading-none p-1">&times;</button>
              </div>
              <div className="modal-body">
                <p className="text-[#5C5C5C] text-sm">{verifyOf.description}</p>
                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="card-soft p-3">
                    <div className="form-label">Input Manual</div>
                    <div className="audit-ts text-xl font-bold">{fmtIDR(verifyOf.amount_idr)}</div>
                  </div>
                  <div className="card-soft p-3">
                    <div className="form-label">Struk Digital</div>
                    <div className="audit-ts text-xl font-bold">{fmtIDR(verifyOf.receipt_total_idr||0)}</div>
                  </div>
                </div>
                <img alt="struk" src={verifyOf.receipt_photo} className="mt-3 w-full h-52 object-contain rounded-md border border-[#EAE4D8] bg-[#2D2D2D]"/>
                <label className="form-label mt-3 block">Catatan</label>
                <textarea data-testid="verify-note" className="form-textarea" rows={2} value={verifyNote} onChange={(e)=>setVerifyNote(e.target.value)}/>
              </div>
              <div className="modal-footer">
                <button data-testid="reject-purchase" onClick={()=>verify(false)} className="btn-outline" style={{borderColor:"#C5533B", color:"#C5533B"}}>Tolak</button>
                <button data-testid="approve-purchase" onClick={()=>verify(true)} className="btn-primary">Setujui</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
