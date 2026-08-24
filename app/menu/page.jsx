"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { DAYS, mondayOf, fmtDate, MENU_STATUS, MENU_CATEGORIES } from "@/lib/format";
import { toast } from "sonner";
import { SkeletonCards } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, ChefHat, Share2, Send, CheckCircle2, Printer, Settings } from "lucide-react";

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function Page() {
  const { activeRole } = useAuth();
  const [weekStart, setWeekStart] = useState(mondayOf());
  const [recipes, setRecipes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDays, setTotalDays] = useState(5);
  const [activeDays, setActiveDays] = useState([1,2,3,4,5]);
  const [showConfig, setShowConfig] = useState(false);
  const [catFilter, setCatFilter] = useState("ALL");

  const load = (w = weekStart) => { setLoading(true); Promise.all([api.get("/recipes"), api.get(`/menus?week_start=${w}`)])
    .then(([a,b]) => { setRecipes(a.data); setMenus(b.data);
      if (b.data.length > 0) {
        setTotalDays(b.data[0].total_days || 5);
        setActiveDays(b.data[0].active_days || [1,2,3,4,5]);
      }
    }).finally(() => setLoading(false)); };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [weekStart]);

  const findMenu = (day) => menus.find(m => m.day === day) || { day, recipe_ids: [], portions: 100, week_start: weekStart };

  const save = async (day, recipe_ids, portions) => {
    try {
      const existing = menus.find(m => m.day === day);
      if (existing) {
        await api.patch(`/menus/${existing.id}`, { recipe_ids, portions: portions||100, total_days: totalDays, active_days: activeDays });
      } else {
        await api.post("/menus", { week_start: weekStart, day, recipe_ids, portions: portions||100, total_days: totalDays, active_days: activeDays });
      }
      toast.success("Menu tersimpan");
      load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const toggleRecipe = (day, rid) => {
    const cur = findMenu(day);
    const set = new Set(cur.recipe_ids);
    if (set.has(rid)) set.delete(rid); else set.add(rid);
    save(day, Array.from(set), cur.portions);
  };

  const setPortions = (day, p) => {
    const cur = findMenu(day);
    save(day, cur.recipe_ids, p);
  };

  const submitForReview = async (menu) => {
    if (!menu.id) return toast.error("Simpan menu dulu sebelum submit");
    try {
      await api.post(`/menus/${menu.id}/submit`);
      toast.success("Diajukan ke Ahli Gizi untuk review");
      load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const shareWA = () => {
    const lines = DAYS.slice(0, totalDays).map((d, i) => {
      if (!activeDays.includes(i + 1)) return null;
      const m = findMenu(d.key);
      const names = m.recipe_ids.map(rid => recipes.find(r=>r.id===rid)?.name).filter(Boolean).join(", ") || "—";
      return `*${d.label}*: ${names} (${m.portions||0} porsi)`;
    }).filter(Boolean);
    const txt = `*MENU SPPG · MBG*\nMinggu mulai ${fmtDate(weekStart)}\n\n${lines.join("\n")}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`;
    const win = window.open(url, "_blank");
    if (!win) window.location.href = url;
  };

  const printMenu = () => {
    const lines = DAYS.slice(0, totalDays).map((d, i) => {
      if (!activeDays.includes(i + 1)) return null;
      const m = findMenu(d.key);
      const names = m.recipe_ids.map(rid => recipes.find(r=>r.id===rid)?.name).filter(Boolean).join(", ") || "—";
      return `<tr><td style="font-weight:bold;padding:6px 12px;border:1px solid #ccc">${d.label}</td><td style="padding:6px 12px;border:1px solid #ccc">${names}</td><td style="padding:6px 12px;border:1px solid #ccc;text-align:center">${m.portions||0}</td></tr>`;
    }).filter(Boolean);
    const html = `<html><head><title>Menu SPPG - ${fmtDate(weekStart)}</title><style>body{font-family:sans-serif;padding:40px}table{border-collapse:collapse;width:100%}h1{margin-bottom:4px}p{color:#666}</style></head><body><h1>Menu SPPG MBG</h1><p>Minggu mulai ${fmtDate(weekStart)}</p><table><tr><th style="background:#EAE4D8;padding:6px 12px;border:1px solid #ccc">Hari</th><th style="background:#EAE4D8;padding:6px 12px;border:1px solid #ccc">Menu</th><th style="background:#EAE4D8;padding:6px 12px;border:1px solid #ccc">Porsi</th></tr>${lines.join("")}</table><script>window.print()</script></body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="menu-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">Menu {totalDays}-Hari</h1>
            <p className="text-[#5C5C5C] mt-1">Pilih resep dan jumlah porsi per hari.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setShowConfig(!showConfig)} className="btn-outline text-sm"><Settings size={14}/> Konfigurasi</button>
            <div className="card-soft px-3 py-2 flex items-center gap-2"><Calendar size={14}/><input type="date" value={weekStart} onChange={(e)=>setWeekStart(mondayOf(e.target.value))} className="audit-ts text-sm bg-transparent"/></div>
            <button onClick={printMenu} className="btn-outline text-sm"><Printer size={14}/> Cetak</button>
            <button data-testid="wa-menu" onClick={shareWA} className="btn-outline text-sm"><Share2 size={14}/> Bagikan WA</button>
          </div>
        </div>

        {showConfig && (
          <div className="card-soft p-4">
            <h3 className="font-display font-bold text-sm mb-3">Konfigurasi Minggu Ini</h3>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C] block mb-1">Jumlah Hari Aktif</label>
                <div className="flex gap-1">
                  {[3,4,5,6,7].map(n=>(
                    <button key={n} onClick={()=>{setTotalDays(n); setActiveDays(prev=>prev.filter(d=>d<=n));}} className={`w-8 h-8 rounded-md text-sm font-semibold ${totalDays===n?"bg-[#4A7C59] text-white":"bg-[#EAE4D8] text-[#5C5C5C]"}`}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C] block mb-1">Hari Aktif</label>
                <div className="flex gap-1">
                  {Array.from({length:totalDays}, (_,i)=>i+1).map(d=>(
                    <button key={d} onClick={()=>setActiveDays(prev=>prev.includes(d)?prev.filter(x=>x!==d):[...prev,d])} className={`w-8 h-8 rounded-md text-sm font-semibold ${activeDays.includes(d)?"bg-[#D97706] text-white":"bg-[#EAE4D8] text-[#5C5C5C]"}`}>{DAY_LABELS[d-1]}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={()=>setCatFilter("ALL")} className={`tag ${catFilter==="ALL"?"bg-[#4A7C59] text-white":"bg-[#EAE4D8] text-[#5C5C5C]"}`}>Semua</button>
          {Object.entries(MENU_CATEGORIES).map(([k,v])=>(
            <button key={k} onClick={()=>setCatFilter(k)} className={`tag ${catFilter===k?"text-white":""}`} style={catFilter===k?{background:v.color}:{}}>{v.label}</button>
          ))}
        </div>

        {loading ? (
          <SkeletonCards count={5} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {DAYS.slice(0, totalDays).filter((_,i)=>activeDays.includes(i+1)).map((d) => {
              const m = findMenu(d.key);
              const st = MENU_STATUS[m.status||"DRAFT"];
              return (
                <div key={d.key} className="card-soft p-4" data-testid={`menu-day-${d.key}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-display font-bold text-lg">{d.label}</div>
                    <span className="role-pill" style={{background:`${st.color}1A`, color:st.color}} data-testid={`status-${d.key}`}>{st.label}</span>
                  </div>
                  {m.status === "APPROVED" && m.signature ? (
                    <div className="mt-2 text-[10px] audit-ts text-[#4A7C59] flex items-start gap-1"><CheckCircle2 size={12} className="mt-0.5 flex-shrink-0"/><span>Disetujui: {m.signature}</span></div>
                  ) : null}
                  <label className="block text-[10px] uppercase tracking-widest text-[#5C5C5C] mt-3">Porsi</label>
                  <input type="number" className="w-full mt-1 px-3 py-1.5 text-sm rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={m.portions||0} onChange={(e)=>setPortions(d.key, parseInt(e.target.value)||0)}/>
                  <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
                    {recipes.filter(r => catFilter==="ALL" || r.menu_category===catFilter).map(r => {
                      const catInfo = r.menu_category ? MENU_CATEGORIES[r.menu_category] : null;
                      const active = m.recipe_ids.includes(r.id);
                      return (
                        <button key={r.id} data-testid={`menu-toggle-${d.key}-${r.id}`} onClick={()=>toggleRecipe(d.key, r.id)} className={`w-full text-left text-sm px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between ${active?"bg-[#4A7C59] text-white":"hover:bg-[#EAE4D8]"}`}>
                          <span>{r.name}</span>
                          {catInfo && !active && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{background:`${catInfo.color}20`, color:catInfo.color}}>{catInfo.label}</span>}
                        </button>
                      );
                    })}
                    {recipes.filter(r => catFilter==="ALL" || r.menu_category===catFilter).length === 0 && <div className="text-xs text-[#5C5C5C]">Tidak ada resep untuk kategori ini.</div>}
                  </div>
                  {m.id && m.status==="DRAFT" && m.recipe_ids?.length > 0 && (activeRole === "head_chef" || activeRole === "admin" || activeRole === "kitchen_head") && (
                    <button data-testid={`submit-review-${d.key}`} onClick={()=>submitForReview(m)} className="btn-outline w-full mt-3 text-xs py-1.5"><Send size={12}/> Ajukan ke Ahli Gizi</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
