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
  const [openItem, setOpenItem] = useState(false);
  const [openOpname, setOpenOpname] = useState(null);
  const [openTaken, setOpenTaken] = useState(null);
  const [lotForm, setLotForm] = useState({ item_id: "", quantity: 0, expiry_date: "" });
  const [itemForm, setItemForm] = useState({ name: "", unit: "kg", category: "SY", par_level: 0, price_per_unit: 0, zone: "DRY" });
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

  const submitItem = async (e) => {
    e.preventDefault();
    if (!itemForm.name.trim()) return toast.error("Nama bahan wajib diisi");
    try {
      await api.post("/items", itemForm);
      toast.success("Bahan baru ditambahkan");
      setOpenItem(false); setItemForm({ name: "", unit: "kg", category: "SY", par_level: 0, price_per_unit: 0, zone: "DRY" }); load();
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
    if (takenForm.quantity > openTaken.actual_quantity) return toast.error(`Jumlah melebihi stok tersedia (${openTaken.actual_quantity} ${openTaken.unit})`);
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
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Stok (FEFO)</h1>
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
              <>
                <button data-testid="add-item-btn" onClick={()=>setOpenItem(true)} className="btn-outline"><Plus size={16}/> Tambah Bahan</button>
                <button data-testid="add-lot-btn" onClick={()=>setOpenLot(true)} className="btn-primary"><Plus size={16}/> Tambah Lot</button>
              </>
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
                          {(activeRole === "field_assistant" || activeRole === "admin_apps" || activeRole === "admin_sppg" || activeRole === "kitchen_head" || activeRole === "head_chef" || activeRole === "persiapan" || activeRole === "tenaga_masak") && (
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
                      {(activeRole === "field_assistant" || activeRole === "admin_apps" || activeRole === "admin_sppg" || activeRole === "kitchen_head" || activeRole === "head_chef" || activeRole === "persiapan" || activeRole === "tenaga_masak") && (
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
          <div className="modal-overlay" onClick={()=>setOpenLot(false)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={submitLot} className="modal-panel modal-panel-sm">
              <div className="modal-header">
                <h2 className="font-display text-2xl font-bold">Tambah Lot Stok</h2>
              </div>
              <div className="modal-body grid grid-cols-1 gap-3">
                <label className="form-label">Bahan</label>
                <select data-testid="lot-item" required className="form-select" value={lotForm.item_id} onChange={(e)=>setLotForm({...lotForm, item_id:e.target.value})}>
                  <option value="">— pilih bahan —</option>
                  {items.map(it => <option key={it.id} value={it.id}>{it.name} ({it.unit})</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Jumlah</label>
                    <input data-testid="lot-qty" required type="number" step="0.01" className="form-input" value={lotForm.quantity || ""} onChange={(e)=>setLotForm({...lotForm, quantity:parseFloat(e.target.value)||0})}/>
                  </div>
                  <div>
                    <label className="form-label">Kadaluarsa</label>
                    <input data-testid="lot-expiry" required type="date" className="form-input" value={lotForm.expiry_date} onChange={(e)=>setLotForm({...lotForm, expiry_date:e.target.value})}/>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={()=>setOpenLot(false)} className="btn-ghost">Batal</button>
                <button data-testid="save-lot" type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {openItem && (
          <div className="modal-overlay" onClick={()=>setOpenItem(false)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={submitItem} className="modal-panel modal-panel-md">
              <div className="modal-header">
                <h2 className="font-display text-2xl font-bold">Tambah Bahan Baru</h2>
              </div>
              <div className="modal-body grid grid-cols-1 gap-3">
                <div>
                  <label className="form-label">Nama Bahan</label>
                  <input data-testid="item-name" required className="form-input" value={itemForm.name} onChange={(e)=>setItemForm({...itemForm, name:e.target.value})}/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Satuan</label>
                    <select data-testid="item-unit" className="form-select" value={itemForm.unit} onChange={(e)=>setItemForm({...itemForm, unit:e.target.value})}>
                      <optgroup label="Berat">
                        <option value="kg">kg</option><option value="gram">gram</option>
                      </optgroup>
                      <optgroup label="Cair">
                        <option value="liter">liter</option><option value="ml">ml</option>
                      </optgroup>
                      <optgroup label="Jumlah">
                        <option value="pcs">pcs</option><option value="butir">butir</option><option value="ikat">ikat</option><option value="bungkus">bungkus</option>
                      </optgroup>
                      <optgroup label="Kemasan">
                        <option value="botol">botol</option><option value="sachet">sachet</option><option value="kaleng">kaleng</option><option value="tabung">tabung (LPG)</option><option value="lembar">lembar</option><option value="roll">roll</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Kategori</label>
                    <select data-testid="item-category" className="form-select" value={itemForm.category} onChange={(e)=>setItemForm({...itemForm, category:e.target.value})}>
                      {Object.entries(ITEM_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    {["OPR","CLN"].includes(itemForm.category) && (
                      <p className="text-xs text-[#D97706] mt-1">Barang non-pengolahan — tidak perlu data gizi. Cukup diinput sebagai stok.</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Par Level</label>
                    <input data-testid="item-par" type="number" className="form-input" value={itemForm.par_level || ""} onChange={(e)=>setItemForm({...itemForm, par_level:parseFloat(e.target.value)||0})}/>
                  </div>
                  <div>
                    <label className="form-label">Harga/Satuan</label>
                    <input data-testid="item-price" type="number" className="form-input" value={itemForm.price_per_unit || ""} onChange={(e)=>setItemForm({...itemForm, price_per_unit:parseFloat(e.target.value)||0})}/>
                  </div>
                </div>
                <div>
                  <label className="form-label">Zona</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                    {ZONES.map(z => (
                      <button type="button" key={z} onClick={()=>setItemForm({...itemForm, zone:z})} className="px-3 py-2 rounded-md border text-sm font-semibold transition"
                        style={itemForm.zone===z?{background:ZONE_COLORS[z], color:"white", borderColor:ZONE_COLORS[z]}:{background:"#F9F6F0", color:ZONE_COLORS[z], borderColor:"#EAE4D8"}}>{ZONE_LABELS[z]}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={()=>setOpenItem(false)} className="btn-ghost">Batal</button>
                <button data-testid="save-item" type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {openOpname && (
          <div className="modal-overlay" onClick={()=>setOpenOpname(null)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={submitOpname} className="modal-panel modal-panel-md">
              <div className="modal-header">
                <h2 className="font-display text-2xl font-bold">Opname Fisik</h2>
                <p className="text-[#5C5C5C] text-sm mt-1">{openOpname.item_name} · kadaluarsa <span className="audit-ts">{openOpname.expiry_date}</span></p>
              </div>
              <div className="modal-body">
                <label className="form-label block">Pilih Zona Penyimpanan (wajib)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                  {ZONES.map(z => (
                    <button data-testid={`opname-zone-${z}`} type="button" key={z} onClick={()=>setOpnameForm(p=>({...p, zone:z}))} className="px-3 py-2 rounded-md border text-sm font-semibold transition"
                      style={opnameForm.zone===z?{background:ZONE_COLORS[z], color:"white", borderColor:ZONE_COLORS[z], boxShadow:`0 0 0 2px white, 0 0 0 4px ${ZONE_COLORS[z]}`}:{background:"#F9F6F0", color:ZONE_COLORS[z], borderColor:"#EAE4D8"}}>{ZONE_LABELS[z]}</button>
                  ))}
                </div>
                <label className="form-label block mt-4">Hitungan fisik aktual ({openOpname.unit})</label>
                <input data-testid="opname-qty" required type="number" step="0.01" className="form-input" value={opnameForm.counted_quantity || ""} onChange={(e)=>setOpnameForm(p=>({...p, counted_quantity:parseFloat(e.target.value)||0}))}/>
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
                    <label className="form-label flex items-center gap-2"><Droplets size={12}/> Kelembapan (%) · ideal &lt; 65%</label>
                    <input data-testid="opname-humidity" type="number" step="0.1" className="form-input" value={opnameForm.humidity_pct} onChange={(e)=>setOpnameForm(p=>({...p, humidity_pct:e.target.value}))}/>
                  </div>
                ) : (
                  <div className="mt-3">
                    <label className="form-label flex items-center gap-2"><Thermometer size={12}/> Suhu (°C) · {opnameForm.zone==="WET"?"target 0–4°C":"target ≤ -18°C"}</label>
                    <input data-testid="opname-temp" type="number" step="0.1" className="form-input" value={opnameForm.temperature_c} onChange={(e)=>setOpnameForm(p=>({...p, temperature_c:e.target.value}))}/>
                    {opnameForm.temperature_c !== "" && (
                      (opnameForm.zone === "WET" && (parseFloat(opnameForm.temperature_c) < 0 || parseFloat(opnameForm.temperature_c) > 4)) ||
                      (opnameForm.zone === "FREEZER" && parseFloat(opnameForm.temperature_c) > -18)
                    ) ? <div className="text-xs text-[#C5533B] mt-1">⚠ Suhu di luar threshold!</div> : null}
                  </div>
                )}
                <label className="form-label block mt-3">Alasan / Catatan</label>
                <input data-testid="opname-reason" className="form-input" placeholder="Spoilage / Routine / Adjustment" value={opnameForm.reason} onChange={(e)=>setOpnameForm(p=>({...p, reason:e.target.value}))}/>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={()=>setOpenOpname(null)} className="btn-ghost">Batal</button>
                <button data-testid="save-opname" type="submit" className="btn-primary">Catat Opname</button>
              </div>
            </form>
          </div>
        )}

        {openTaken && (
          <div className="modal-overlay" onClick={()=>setOpenTaken(null)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={submitTaken} className="modal-panel modal-panel-sm">
              <div className="modal-header">
                <h2 className="font-display text-2xl font-bold">Pengambilan Barang</h2>
                <p className="text-[#5C5C5C] text-sm mt-1">{openTaken.item_name} · stok tersedia: <span className="font-semibold">{openTaken.actual_quantity} {openTaken.unit}</span></p>
              </div>
              <div className="modal-body">
                <label className="form-label block">Jumlah yang diambil ({openTaken.unit})</label>
                <input data-testid="taken-qty" required type="number" step="0.01" min="0.01" max={openTaken.actual_quantity} className="form-input" value={takenForm.quantity || ""} onChange={(e)=>setTakenForm(p=>({...p, quantity:parseFloat(e.target.value)||0}))}/>
                {takenForm.quantity > 0 && (
                  <div className="mt-2 p-2 rounded bg-[#EAE4D8] text-sm">
                    <span className="text-[#5C5C5C]">Sisa setelah diambil: </span>
                    <span className="font-semibold">{openTaken.actual_quantity - takenForm.quantity} {openTaken.unit}</span>
                  </div>
                )}
                <label className="form-label block mt-3">Alasan Pengambilan</label>
                <select data-testid="taken-reason" className="form-select" value={takenForm.reason} onChange={(e)=>setTakenForm(p=>({...p, reason:e.target.value}))}>
                  <option value="COOKING">Masak Hari Ini</option>
                  <option value="PREP">Persiapan</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>
              <div className="modal-footer">
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
