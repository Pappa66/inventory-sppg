"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { fmtDateTime, ZONES, ZONE_COLORS, ZONE_LABELS, ITEM_CATEGORIES } from "@/lib/format";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, ClipboardCheck, Thermometer, Droplets, HandPlatter } from "lucide-react";
import { SkeletonTable } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";

export default function Page() {
  const { activeRole } = useAuth();
  const [lots, setLots] = useState([]);
  const [items, setItems] = useState([]);
  const [openLot, setOpenLot] = useState(false);
  const [openOpname, setOpenOpname] = useState(null);
  const [openTaken, setOpenTaken] = useState(null);
  const [lotForm, setLotForm] = useState({ item_id: "", quantity: 0, expiry_date: "" });
  const [opnameForm, setOpnameForm] = useState({ counted_quantity: 0, zone: "DRY", temperature_c: "", humidity_pct: "", reason: "Routine" });
  const [takenForm, setTakenForm] = useState({ quantity: 0, reason: "COOKING" });
  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const load = () => { setLoading(true); Promise.all([api.get("/stock-lots"), api.get("/items")])
    .then(([a,b]) => { setLots(a.data); setItems(b.data); setPage(1); }).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [zoneFilter]);

  const today = new Date();
  const filtered = useMemo(() => {
    const list = zoneFilter === "ALL" ? lots : lots.filter(l => (l.zone||"DRY") === zoneFilter);
    return [...list].sort((a,b) => (a.expiry_date||"").localeCompare(b.expiry_date||""));
  }, [lots, zoneFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const statusFor = (lot) => {
    const d = new Date(lot.expiry_date);
    const diff = (d - today) / (1000*60*60*24);
    if (diff < 0) return { label: "Kadaluarsa", color: "#C5533B" };
    if (diff <= 5) return { label: "Hampir Kadaluarsa", color: "#D97706" };
    return { label: "Aman", color: "#4A7C59" };
  };

  const submitLot = async (e) => {
    e.preventDefault();
    try {
      await api.post("/stock-lots", lotForm);
      toast.success("Lot stok ditambahkan");
      setOpenLot(false); setLotForm({ item_id: "", quantity: 0, expiry_date: "" }); load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const submitOpname = async (e) => {
    e.preventDefault();
    try {
      await api.post("/opnames", {
        item_id: openOpname.item_id,
        lot_id: openOpname.id,
        counted_quantity: opnameForm.counted_quantity,
        zone: opnameForm.zone,
        temperature_c: opnameForm.temperature_c === "" ? null : parseFloat(opnameForm.temperature_c),
        humidity_pct: opnameForm.humidity_pct === "" ? null : parseFloat(opnameForm.humidity_pct),
        reason: opnameForm.reason,
      });
      toast.success("Opname tercatat. Selisih dihitung otomatis.");
      setOpenOpname(null); load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const submitTaken = async (e) => {
    e.preventDefault();
    if (takenForm.quantity <= 0) return toast.error("Jumlah harus lebih dari 0");
    try {
      await api.post("/stock-taken", {
        lot_id: openTaken.id,
        quantity: takenForm.quantity,
        reason: takenForm.reason,
      });
      toast.success(`Berhasil mengambil ${takenForm.quantity} ${openTaken.unit}`);
      setOpenTaken(null); setTakenForm({ quantity: 0, reason: "COOKING" }); load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="inventory-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">Stok (FEFO)</h1>
            <p className="text-[#5C5C5C] mt-1">Urut berdasarkan tanggal kadaluarsa terdekat. Filter berdasarkan zona penyimpanan.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 bg-[#EAE4D8] p-1 rounded-full" data-testid="zone-filter">
              {["ALL", ...ZONES].map((z) => (
                <button key={z} type="button" onClick={()=>setZoneFilter(z)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-150"
                  style={zoneFilter===z ? {
                    background: z==="ALL" ? "#2D2D2D" : ZONE_COLORS[z],
                    color: "white",
                    boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.18)",
                  } : {
                    background: "transparent",
                    color: "#5C5C5C",
                  }}>
                  {z === "ALL" ? "Semua" : ZONE_LABELS[z]}
                </button>
              ))}
            </div>
            {(activeRole === "field_assistant" || activeRole === "admin_apps" || activeRole === "admin_sppg" || activeRole === "kitchen_head" || activeRole === "head_chef") && (
              <button data-testid="add-lot-btn" onClick={()=>setOpenLot(true)} className="btn-primary"><Plus size={16}/> Tambah Lot</button>
            )}
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
                    <th className="text-left py-3 px-4">Bahan</th>
                    <th className="text-left py-3 px-4">Kategori</th>
                    <th className="text-left py-3 px-4">Zona</th>
                    <th className="text-right py-3 px-4">Awal</th>
                    <th className="text-right py-3 px-4">Aktual</th>
                    <th className="text-left py-3 px-4">Kadaluarsa</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((l) => {
                  const s = statusFor(l);
                  const z = l.zone || "DRY";
                  const cat = l.category || "BB";
                  const catInfo = ITEM_CATEGORIES[cat] || ITEM_CATEGORIES.BB;
                  return (
                    <tr key={l.id} className="border-b border-[#EAE4D8] last:border-0">
                      <td className="py-3 px-4 font-semibold">{l.item_name}</td>
                      <td className="py-3 px-4"><span className="role-pill" style={{background:`${catInfo.color}1A`, color:catInfo.color}}>{catInfo.label}</span></td>
                      <td className="py-3 px-4"><span className="role-pill" style={{background:`${ZONE_COLORS[z]}1A`, color:ZONE_COLORS[z]}}>{ZONE_LABELS[z]}</span></td>
                      <td className="py-3 px-4 text-right audit-ts">{l.quantity} {l.unit}</td>
                      <td className="py-3 px-4 text-right audit-ts font-semibold">{l.actual_quantity} {l.unit}</td>
                      <td className="py-3 px-4 audit-ts">{l.expiry_date}</td>
                      <td className="py-3 px-4"><span className="role-pill" style={{background:`${s.color}1A`, color:s.color}}>{s.label}</span></td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          {(activeRole === "field_assistant" || activeRole === "admin_apps" || activeRole === "admin_sppg" || activeRole === "kitchen_head" || activeRole === "head_chef") && (
                            <>
                              <button data-testid={`taken-${l.id}`} onClick={()=>{setOpenTaken(l); setTakenForm({quantity:0, reason:"COOKING"});}} className="btn-ghost text-xs text-[#D97706]"><HandPlatter size={14}/> Ambil</button>
                              <button data-testid={`opname-${l.id}`} onClick={()=>{setOpenOpname(l); setOpnameForm({counted_quantity:l.actual_quantity, zone:l.zone||"DRY", temperature_c:"", humidity_pct:"", reason:"Routine"});}} className="btn-ghost text-xs"><ClipboardCheck size={14}/> Opname</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-[#5C5C5C]">Belum ada lot stok untuk zona ini.</td></tr>}
              </tbody>
            </table>
            </div>
            <div className="md:hidden space-y-3">
              {paginated.map((l) => {
              const s = statusFor(l);
              const z = l.zone || "DRY";
              const cat = l.category || "BB";
              const catInfo = ITEM_CATEGORIES[cat] || ITEM_CATEGORIES.BB;
              return (
                <div key={l.id} className="card-soft p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold">{l.item_name}</div>
                    <div className="flex gap-1">
                      <span className="role-pill text-xs" style={{background:`${catInfo.color}1A`, color:catInfo.color}}>{catInfo.label}</span>
                      <span className="role-pill text-xs" style={{background:`${ZONE_COLORS[z]}1A`, color:ZONE_COLORS[z]}}>{ZONE_LABELS[z]}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[#5C5C5C]">Awal</span>
                      <div className="audit-ts">{l.quantity} {l.unit}</div>
                    </div>
                    <div>
                      <span className="text-[#5C5C5C]">Aktual</span>
                      <div className="audit-ts font-semibold">{l.actual_quantity} {l.unit}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5C5C5C]">Kadaluarsa</span>
                    <span className="audit-ts">{l.expiry_date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="role-pill text-xs" style={{background:`${s.color}1A`, color:s.color}}>{s.label}</span>
                    <div className="flex gap-1">
                      {(activeRole === "field_assistant" || activeRole === "admin_apps" || activeRole === "admin_sppg" || activeRole === "kitchen_head" || activeRole === "head_chef") && (
                        <>
                          <button data-testid={`taken-${l.id}`} onClick={()=>{setOpenTaken(l); setTakenForm({quantity:0, reason:"COOKING"});}} className="btn-ghost text-xs text-[#D97706]"><HandPlatter size={14}/> Ambil</button>
                          <button data-testid={`opname-${l.id}`} onClick={()=>{setOpenOpname(l); setOpnameForm({counted_quantity:l.actual_quantity, zone:l.zone||"DRY", temperature_c:"", humidity_pct:"", reason:"Routine"});}} className="btn-ghost text-xs"><ClipboardCheck size={14}/> Opname</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center text-[#5C5C5C] py-10">Belum ada lot stok untuk zona ini.</div>
            )}
            </div>
            <Pagination page={page} totalPages={Math.ceil(filtered.length / perPage)} onPageChange={setPage} />
          </div>
        )}

        {openLot && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={()=>setOpenLot(false)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={submitLot} className="card-soft p-6 w-full max-w-md">
              <h2 className="font-display text-2xl font-bold">Tambah Lot Stok</h2>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Bahan</label>
                <select data-testid="lot-item" required className="px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={lotForm.item_id} onChange={(e)=>setLotForm({...lotForm, item_id:e.target.value})}>
                  <option value="">— pilih bahan —</option>
                  {items.map(it => <option key={it.id} value={it.id}>{it.name} ({it.unit})</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Jumlah</label>
                    <input data-testid="lot-qty" required type="number" step="0.01" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={lotForm.quantity} onChange={(e)=>setLotForm({...lotForm, quantity:parseFloat(e.target.value)||0})}/>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kadaluarsa</label>
                    <input data-testid="lot-expiry" required type="date" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={lotForm.expiry_date} onChange={(e)=>setLotForm({...lotForm, expiry_date:e.target.value})}/>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={()=>setOpenLot(false)} className="btn-ghost">Batal</button>
                <button data-testid="save-lot" type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {openOpname && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={()=>setOpenOpname(null)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={submitOpname} className="card-soft p-6 w-full max-w-lg">
              <h2 className="font-display text-2xl font-bold">Opname Fisik</h2>
              <p className="text-[#5C5C5C] text-sm mt-1">{openOpname.item_name} · kadaluarsa <span className="audit-ts">{openOpname.expiry_date}</span></p>
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] mt-4 block">Pilih Zona Penyimpanan (wajib)</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {ZONES.map(z => (
                  <button data-testid={`opname-zone-${z}`} type="button" key={z} onClick={()=>setOpnameForm(p=>({...p, zone:z}))} className="px-3 py-2 rounded-md border text-sm font-semibold transition"
                    style={opnameForm.zone===z?{background:ZONE_COLORS[z], color:"white", borderColor:ZONE_COLORS[z], boxShadow:`0 0 0 2px white, 0 0 0 4px ${ZONE_COLORS[z]}`}:{background:"#F9F6F0", color:ZONE_COLORS[z], borderColor:"#EAE4D8"}}>{ZONE_LABELS[z]}</button>
                ))}
              </div>
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] mt-4 block">Hitungan fisik aktual ({openOpname.unit})</label>
              <input data-testid="opname-qty" required type="number" step="0.01" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={opnameForm.counted_quantity} onChange={(e)=>setOpnameForm(p=>({...p, counted_quantity:parseFloat(e.target.value)||0}))}/>
              <div className="mt-2 p-2 rounded bg-[#EAE4D8] text-sm">
                <span className="text-[#5C5C5C]">Stok sistem: </span>
                <span className="font-semibold">{openOpname.actual_quantity} {openOpname.unit}</span>
                {opnameForm.counted_quantity > 0 && (
                  <span className={opnameForm.counted_quantity !== openOpname.actual_quantity ? "text-[#C5533B] ml-2" : "text-[#4A7C59] ml-2"}>
                    → Selisih: {opnameForm.counted_quantity - openOpname.actual_quantity} {openOpname.unit}
                  </span>
                )}
              </div>
              {opnameForm.zone === "DRY" ? (
                <div className="mt-3">
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-2"><Droplets size={12}/> Kelembapan (%) · ideal &lt; 65%</label>
                  <input data-testid="opname-humidity" type="number" step="0.1" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={opnameForm.humidity_pct} onChange={(e)=>setOpnameForm(p=>({...p, humidity_pct:e.target.value}))}/>
                </div>
              ) : (
                <div className="mt-3">
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-2"><Thermometer size={12}/> Suhu (°C) · {opnameForm.zone==="WET"?"target 0–4°C":"target ≤ -18°C"}</label>
                  <input data-testid="opname-temp" type="number" step="0.1" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={opnameForm.temperature_c} onChange={(e)=>setOpnameForm(p=>({...p, temperature_c:e.target.value}))}/>
                  {opnameForm.temperature_c !== "" && (
                    (opnameForm.zone === "WET" && (parseFloat(opnameForm.temperature_c) < 0 || parseFloat(opnameForm.temperature_c) > 4)) ||
                    (opnameForm.zone === "FREEZER" && parseFloat(opnameForm.temperature_c) > -18)
                  ) ? <div className="text-xs text-[#C5533B] mt-1">⚠ Suhu di luar threshold!</div> : null}
                </div>
              )}
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] mt-3 block">Alasan / Catatan</label>
              <input data-testid="opname-reason" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" placeholder="Spoilage / Routine / Adjustment" value={opnameForm.reason} onChange={(e)=>setOpnameForm(p=>({...p, reason:e.target.value}))}/>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={()=>setOpenOpname(null)} className="btn-ghost">Batal</button>
                <button data-testid="save-opname" type="submit" className="btn-primary">Catat Opname</button>
              </div>
            </form>
          </div>
        )}

        {openTaken && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={()=>setOpenTaken(null)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={submitTaken} className="card-soft p-6 w-full max-w-md">
              <h2 className="font-display text-2xl font-bold">Pengambilan Barang</h2>
              <p className="text-[#5C5C5C] text-sm mt-1">{openTaken.item_name} · stok tersedia: <span className="font-semibold">{openTaken.actual_quantity} {openTaken.unit}</span></p>
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] mt-4 block">Jumlah yang diambil ({openTaken.unit})</label>
              <input data-testid="taken-qty" required type="number" step="0.01" min="0.01" max={openTaken.actual_quantity} className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={takenForm.quantity} onChange={(e)=>setTakenForm(p=>({...p, quantity:parseFloat(e.target.value)||0}))}/>
              {takenForm.quantity > 0 && (
                <div className="mt-2 p-2 rounded bg-[#EAE4D8] text-sm">
                  <span className="text-[#5C5C5C]">Sisa setelah diambil: </span>
                  <span className="font-semibold">{openTaken.actual_quantity - takenForm.quantity} {openTaken.unit}</span>
                </div>
              )}
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] mt-3 block">Alasan Pengambilan</label>
              <select data-testid="taken-reason" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={takenForm.reason} onChange={(e)=>setTakenForm(p=>({...p, reason:e.target.value}))}>
                <option value="COOKING">Masak Hari Ini</option>
                <option value="PREP">Persiapan</option>
                <option value="OTHER">Lainnya</option>
              </select>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={()=>setOpenTaken(null)} className="btn-ghost">Batal</button>
                <button data-testid="save-taken" type="submit" className="btn-primary" style={{background:"#D97706"}}>Ambil Barang</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
