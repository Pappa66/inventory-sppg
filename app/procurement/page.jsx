"use client";

import React, { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { fmtIDR, fmtDateTime } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Camera, Plus, BadgeCheck, AlertCircle, Receipt } from "lucide-react";

const EMPTY = {
  category: "STOCK", description: "", amount_idr: 0,
  receipt_total_idr: 0, receipt_photo: "", transport_amount_idr: 0,
  supplier: "", items: [],
};

export default function Page() {
  const { activeRole } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [verifyOf, setVerifyOf] = useState(null);
  const [verifyNote, setVerifyNote] = useState("");
  const fileRef = useRef();

  const load = () => Promise.all([api.get("/purchases"), api.get("/items")]).then(([a,b]) => { setPurchases(a.data); setItems(b.data); });
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

  return (
    <Layout>
      <div className="space-y-6" data-testid="procurement-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">Belanja & Struk</h1>
            <p className="text-[#5C5C5C] mt-1">STOCK = bahan baku · OPERATIONAL = transport/bbm. Foto struk wajib untuk setiap entri.</p>
          </div>
          {(activeRole === "field_assistant" || activeRole === "admin") &&
            <button data-testid="add-purchase-btn" onClick={()=>{setForm(EMPTY); setOpen(true);}} className="btn-primary"><Plus size={16}/> Catat Belanja</button>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {purchases.map((p) => {
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
                {(activeRole === "accountant" || activeRole === "admin") && !p.verified && (
                  <button data-testid={`verify-${p.id}`} onClick={()=>setVerifyOf(p)} className="btn-outline w-full mt-3 text-xs py-1.5"><Receipt size={14}/> Validasi Akuntan</button>
                )}
              </div>
            );
          })}
          {purchases.length === 0 && <div className="col-span-full text-center text-[#5C5C5C] py-10">Belum ada catatan belanja.</div>}
        </div>

        {open && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4 overflow-y-auto" onClick={()=>setOpen(false)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={submit} className="card-soft p-6 w-full max-w-2xl my-8" data-testid="purchase-form">
              <h2 className="font-display text-2xl font-bold">Catat Belanja</h2>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kategori</label>
                  <div className="role-switch w-full mt-1" style={{display:"grid", gridTemplateColumns:"1fr 1fr"}}>
                    {["STOCK","OPERATIONAL"].map((c) => (
                      <button data-testid={`cat-${c}`} type="button" key={c} data-active={form.category===c} onClick={()=>setForm({...form, category:c})}
                        style={form.category===c?{background:c==="STOCK"?"#4A7C59":"#D97706", color:"white"}:{}}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Deskripsi</label>
                  <input data-testid="purchase-desc" required className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})}/>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Jumlah manual (Rp)</label>
                  <input data-testid="purchase-amount" required type="number" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.amount_idr} onChange={(e)=>setForm({...form, amount_idr:parseFloat(e.target.value)||0})}/>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total struk (Rp)</label>
                  <input type="number" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.receipt_total_idr} onChange={(e)=>setForm({...form, receipt_total_idr:parseFloat(e.target.value)||0})}/>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Supplier</label>
                  <input className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.supplier} onChange={(e)=>setForm({...form, supplier:e.target.value})}/>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Transport / BBM (Rp)</label>
                  <input type="number" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.transport_amount_idr} onChange={(e)=>setForm({...form, transport_amount_idr:parseFloat(e.target.value)||0})}/>
                </div>

                {form.category === "STOCK" && (
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mt-2">
                      <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Rincian Bahan</label>
                      <button data-testid="add-purchase-item" type="button" onClick={addItemRow} className="btn-ghost text-xs"><Plus size={12}/> Baris</button>
                    </div>
                    <div className="space-y-2 mt-2">
                      {form.items.map((row, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2">
                          <select className="col-span-6 px-2 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={row.item_id} onChange={(e)=>updItemRow(i,"item_id",e.target.value)}>
                            <option value="">— bahan —</option>
                            {items.map(it => <option key={it.id} value={it.id}>{it.name} ({it.unit})</option>)}
                          </select>
                          <input placeholder="qty" type="number" step="0.01" className="col-span-2 px-2 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={row.quantity} onChange={(e)=>updItemRow(i,"quantity",parseFloat(e.target.value)||0)}/>
                          <input placeholder="harga" type="number" className="col-span-3 px-2 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={row.unit_price} onChange={(e)=>updItemRow(i,"unit_price",parseFloat(e.target.value)||0)}/>
                          <button type="button" onClick={()=>removeItemRow(i)} className="col-span-1 text-[#C5533B]">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Foto Struk (wajib)</label>
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
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={()=>setOpen(false)} className="btn-ghost">Batal</button>
                <button data-testid="submit-purchase" type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {verifyOf && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={()=>setVerifyOf(null)}>
            <div onClick={(e)=>e.stopPropagation()} className="card-soft p-6 w-full max-w-lg">
              <h2 className="font-display text-2xl font-bold">Validasi Akuntan</h2>
              <p className="text-[#5C5C5C] text-sm mt-1">{verifyOf.description}</p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div className="card-soft p-3">
                  <div className="text-[10px] uppercase tracking-widest text-[#5C5C5C]">Input Manual</div>
                  <div className="audit-ts text-xl font-bold">{fmtIDR(verifyOf.amount_idr)}</div>
                </div>
                <div className="card-soft p-3">
                  <div className="text-[10px] uppercase tracking-widest text-[#5C5C5C]">Struk Digital</div>
                  <div className="audit-ts text-xl font-bold">{fmtIDR(verifyOf.receipt_total_idr||0)}</div>
                </div>
              </div>
              <img alt="struk" src={verifyOf.receipt_photo} className="mt-3 w-full h-52 object-contain rounded-md border border-[#EAE4D8] bg-[#2D2D2D]"/>
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] mt-3 block">Catatan</label>
              <textarea data-testid="verify-note" className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" rows={2} value={verifyNote} onChange={(e)=>setVerifyNote(e.target.value)}/>
              <div className="flex justify-end gap-2 mt-4">
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
