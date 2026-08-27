"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { DAYS, MENU_STATUS, fmtDateTime, AKG_STANDARDS } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Flame, Send } from "lucide-react";

export default function Page() {
  const { user, activeRole } = useAuth();
  const [pending, setPending] = useState([]);
  const [signing, setSigning] = useState(null);
  const [signature, setSignature] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); api.get("/menus/pending").then(({data}) => setPending(data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const submit = async (id) => {
    try { await api.post(`/menus/${id}/submit`); toast.success("Diajukan untuk review"); load(); }
    catch (er) { toast.error(formatErr(er)); }
  };

  const approve = async (approveBool) => {
    try {
      await api.post(`/menus/${signing.id}/approve`, { approve: approveBool, signature: signature || `${user.name} · ${new Date().toISOString()}`, note });
      toast.success(approveBool ? "Menu disetujui" : "Menu ditolak");
      setSigning(null); setSignature(""); setNote(""); load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  if (!["admin_apps","admin_sppg","kitchen_head","nutritionist"].includes(activeRole)) {
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
      <div className="space-y-6" data-testid="approval-page">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Persetujuan Menu</h1>
          <p className="text-[#5C5C5C] mt-1">Review menu yang diajukan Chef. Ahli Gizi memberikan tanda tangan digital untuk validasi nutrisi & alergen.</p>
        </div>

        {loading && <div className="text-center text-[#5C5C5C] py-10">Memuat data...</div>}
        {!loading && <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pending.map(m => {
            const st = MENU_STATUS[m.status||"DRAFT"];
            const dayLabel = DAYS.find(d=>d.key===m.day)?.label || m.day;
            const totals = (m.recipes||[]).reduce((acc, r) => {
              const servings = r.servings || 1;
              return {
                calories_kcal: acc.calories_kcal + ((r.calories_kcal||0) / servings),
                protein_g: acc.protein_g + ((r.protein_g||0) / servings),
                carbs_g: acc.carbs_g + ((r.carbs_g||0) / servings),
                fats_g: acc.fats_g + ((r.fats_g||0) / servings),
                sodium_mg: acc.sodium_mg + ((r.sodium_mg||0) / servings),
              };
            }, { calories_kcal:0, protein_g:0, carbs_g:0, fats_g:0, sodium_mg:0 });
            const allergens = Array.from(new Set((m.recipes||[]).flatMap(r => r.allergens||[])));
            const akgKey = m.menu_category === "BALITA" ? "BALITA" : m.menu_category === "BUMIL_BUSUI" ? "BUMIL" : m.menu_category === "PORTION_SMALL" ? "SD_1_3" : "SD_4_6";
            const akg = AKG_STANDARDS[akgKey] || AKG_STANDARDS.SD_4_6;
            const akgPct = (val, std) => std > 0 ? Math.round((val / std) * 100) : 0;
            const akgColor = (pct) => pct >= 90 ? "#4A7C59" : pct >= 70 ? "#D97706" : "#C5533B";
            const nutrients = [
              { label: "Kkal", val: totals.calories_kcal, std: akg.kkal, unit: "" },
              { label: "Prot", val: totals.protein_g, std: akg.protein, unit: "g" },
              { label: "Karbo", val: totals.carbs_g, std: akg.karbo, unit: "g" },
              { label: "Lemak", val: totals.fats_g, std: akg.lemak, unit: "g" },
              { label: "Na", val: totals.sodium_mg, std: akg.sodium, unit: "mg" },
            ];
            const allGood = nutrients.every(n => akgPct(n.val, n.std) >= 70);
            const nutrientDisplay = nutrients.map(n => ({ ...n, pct: akgPct(n.val, n.std), c: akgColor(akgPct(n.val, n.std)) }));
            return (
              <div key={m.id} className="card-soft p-4" data-testid={`approval-card-${m.id}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display font-bold text-lg">{dayLabel}</div>
                    <div className="text-xs text-[#5C5C5C]">Minggu {m.week_start ? new Date(m.week_start).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}) : "—"} · {m.portions} porsi</div>
                  </div>
                  <span className="role-pill" style={{background:`${st.color}1A`, color:st.color}}>{st.label}</span>
                </div>
                <ul className="mt-3 text-sm space-y-1">
                  {(m.recipes||[]).map(r => <li key={r.id} className="flex justify-between"><span>{r.name}</span><span className="audit-ts text-[#5C5C5C]">{r.calories_kcal||0} kkal</span></li>)}
                  {(m.recipes||[]).length === 0 && <li className="text-[#C5533B] text-xs">⚠ Belum ada resep terpilih</li>}
                </ul>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 mt-3 text-center">
                  {nutrientDisplay.map((n, i) => (
                    <div key={i} className="rounded-md p-1.5" style={{background:`${n.c}10`}}>
                      <div className="font-bold text-sm" style={{color:n.c}}>{Number(n.val).toFixed(0)}</div>
                      <div className="text-[9px] uppercase tracking-wide text-[#5C5C5C]">{n.label}</div>
                      <div className="text-[8px] mt-0.5" style={{color:n.c}}>{n.pct}% AKG</div>
                    </div>
                  ))}
                </div>
                <div className={`mt-2 text-[10px] font-semibold px-2 py-1 rounded-md text-center ${allGood ? "bg-[#4A7C59]/10 text-[#4A7C59]" : "bg-[#D97706]/10 text-[#D97706]"}`}>
                  {allGood ? "Memenuhi standar AKG" : "Perlu perbaikan nutrisi"}
                </div>
                {allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {allergens.map(a => <span key={a} className="tag bg-[#C5533B]/10 text-[#C5533B]">⚠ {a}</span>)}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  {m.status === "DRAFT" && activeRole === "nutritionist" && <div className="flex-1 text-xs text-[#5C5C5C] py-1.5 text-center italic">Menunggu diajukan Chef…</div>}
                  {m.status === "DRAFT" && (activeRole === "head_chef" || activeRole === "kitchen_head" || activeRole === "admin_apps" || activeRole === "admin_sppg") && <button data-testid={`submit-${m.id}`} onClick={()=>submit(m.id)} className="btn-outline flex-1 text-xs py-1.5"><Send size={12}/> Ajukan</button>}
                  {m.status === "PENDING_REVIEW" && (activeRole === "nutritionist" || activeRole === "kitchen_head" || activeRole === "admin_apps" || activeRole === "admin_sppg") && (
                    <button data-testid={`open-sign-${m.id}`} onClick={()=>{setSigning(m); setSignature(`${user.name} · ${user.role === "nutritionist" ? "Ahli Gizi" : "Admin"}`);}} className="btn-primary flex-1 text-xs py-1.5"><CheckCircle2 size={12}/> Review & Tanda Tangan</button>
                  )}
                </div>
              </div>
            );
          })}
          {pending.length === 0 && <div className="col-span-full text-center text-[#5C5C5C] py-10">Tidak ada menu yang menunggu persetujuan.</div>}
        </div>}

        {signing && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={()=>setSigning(null)}>
            <div onClick={(e)=>e.stopPropagation()} className="card-soft p-6 w-full max-w-lg">
              <h2 className="font-display text-2xl font-bold">Tanda Tangan Digital · Ahli Gizi</h2>
              <p className="text-[#5C5C5C] text-sm mt-1">Menu untuk {DAYS.find(d=>d.key===signing.day)?.label}, minggu {signing.week_start}.</p>
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] mt-4 block">Tanda tangan (nama + catatan)</label>
              <input data-testid="signature-input" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] audit-ts" value={signature} onChange={(e)=>setSignature(e.target.value)}/>
              <label className="text-xs uppercase tracking-widest text-[#5C5C5C] mt-3 block">Catatan (opsional, wajib jika ditolak)</label>
              <textarea data-testid="approval-note" rows={2} className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={note} onChange={(e)=>setNote(e.target.value)}/>
              <div className="flex justify-end gap-2 mt-4">
                <button data-testid="reject-menu" onClick={()=>approve(false)} className="btn-outline" style={{borderColor:"#C5533B", color:"#C5533B"}}><XCircle size={14}/> Tolak</button>
                <button data-testid="approve-menu" onClick={()=>approve(true)} className="btn-primary"><CheckCircle2 size={14}/> Setujui & Tanda Tangan</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
