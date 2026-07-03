"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { DAYS, mondayOf, fmtDate, MENU_STATUS } from "@/lib/format";
import { toast } from "sonner";
import { SkeletonCards } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, ChefHat, Share2, Send, CheckCircle2 } from "lucide-react";

export default function Page() {
  const { activeRole } = useAuth();
  const [weekStart, setWeekStart] = useState(mondayOf());
  const [recipes, setRecipes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = (w = weekStart) => { setLoading(true); Promise.all([api.get("/recipes"), api.get(`/menus?week_start=${w}`)])
    .then(([a,b]) => { setRecipes(a.data); setMenus(b.data); }).finally(() => setLoading(false)); };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [weekStart]);

  const findMenu = (day) => menus.find(m => m.day === day) || { day, recipe_ids: [], portions: 100, week_start: weekStart };

  const save = async (day, recipe_ids, portions) => {
    try {
      await api.post("/menus", { week_start: weekStart, day, recipe_ids, portions: portions||100 });
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
    const lines = DAYS.map(d => {
      const m = findMenu(d.key);
      const names = m.recipe_ids.map(rid => recipes.find(r=>r.id===rid)?.name).filter(Boolean).join(", ") || "—";
      return `*${d.label}*: ${names} (${m.portions||0} porsi)`;
    });
    const txt = `*MENU SPPG · MBG*\nMinggu mulai ${fmtDate(weekStart)}\n\n${lines.join("\n")}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="menu-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">Menu 5-Hari</h1>
            <p className="text-[#5C5C5C] mt-1">Senin – Jumat · Pilih resep dan jumlah porsi per hari.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="card-soft px-3 py-2 flex items-center gap-2"><Calendar size={14}/><input type="date" value={weekStart} onChange={(e)=>setWeekStart(mondayOf(e.target.value))} className="audit-ts text-sm bg-transparent"/></div>
            <button data-testid="wa-menu" onClick={shareWA} className="btn-outline text-sm"><Share2 size={14}/> Bagikan WA</button>
          </div>
        </div>

        {loading ? (
          <SkeletonCards count={5} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {DAYS.map((d) => {
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
                    {recipes.map(r => {
                      const active = m.recipe_ids.includes(r.id);
                      return (
                        <button key={r.id} data-testid={`menu-toggle-${d.key}-${r.id}`} onClick={()=>toggleRecipe(d.key, r.id)} className={`w-full text-left text-sm px-2.5 py-1.5 rounded-md transition-colors ${active?"bg-[#4A7C59] text-white":"hover:bg-[#EAE4D8]"}`}>{r.name}</button>
                      );
                    })}
                    {recipes.length === 0 && <div className="text-xs text-[#5C5C5C]">Buat resep dulu di halaman Resep.</div>}
                  </div>
                  {m.id && (m.status==="DRAFT" || !m.status) && m.recipe_ids?.length > 0 && (activeRole === "head_chef" || activeRole === "admin" || activeRole === "kitchen_head") && (
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
