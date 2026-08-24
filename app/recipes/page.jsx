"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { COMMON_ALLERGENS, MENU_CATEGORIES } from "@/lib/format";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Flame, Camera } from "lucide-react";
import { SkeletonCards } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";

const EMPTY = { name: "", servings: 100, menu_category: null, ingredients: [], instructions: "",
  calories_kcal: 0, protein_g: 0, carbs_g: 0, fats_g: 0, sodium_mg: 0, allergens: [], photo_url: "" };

const CAN_EDIT = ["admin", "head_chef", "nutritionist", "kitchen_head"];

export default function Page() {
  const { activeRole } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const load = () => { setLoading(true); Promise.all([api.get("/recipes"), api.get("/items")]).then(([a,b]) => { setRecipes(a.data); setItems(b.data); setPage(1); }).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const addRow = () => setForm(p=>({...p, ingredients:[...p.ingredients, {item_id:"", quantity:0, unit:""}]}));
  const upd = (i,k,v) => setForm(p=>{ const list=[...p.ingredients]; list[i]={...list[i],[k]:v}; return {...p, ingredients:list}; });
  const rm = (i) => setForm(p=>({...p, ingredients:p.ingredients.filter((_,idx)=>idx!==i)}));

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.patch(`/recipes/${editing.id}`, form);
      else await api.post("/recipes", form);
      toast.success("Resep tersimpan");
      setOpen(false); setEditing(null); setForm(EMPTY); load();
    } catch (er) { toast.error(formatErr(er)); }
  };

  const paginatedRecipes = useMemo(() => {
    const start = (page - 1) * perPage;
    return recipes.slice(start, start + perPage);
  }, [recipes, page]);

  return (
    <Layout>
      <div className="space-y-6" data-testid="recipes-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold">Resep Standar</h1>
            <p className="text-[#5C5C5C] mt-1">Resep menjadi dasar perhitungan kebutuhan teoritis bahan.</p>
          </div>
          {CAN_EDIT.includes(activeRole) && <button data-testid="add-recipe-btn" onClick={()=>{setEditing(null); setForm(EMPTY); setOpen(true);}} className="btn-primary"><Plus size={16}/> Resep Baru</button>}
        </div>

        {loading ? (
          <SkeletonCards count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedRecipes.map(r => {
              const catInfo = r.menu_category ? MENU_CATEGORIES[r.menu_category] : null;
              return (
                <div key={r.id} className="card-soft p-4" data-testid={`recipe-${r.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {r.photo_url && <img src={r.photo_url} alt={r.name} className="w-12 h-12 rounded-md object-cover"/>}
                      <div>
                        <div className="font-display font-bold text-lg">{r.name}</div>
                        <div className="text-xs audit-ts text-[#5C5C5C] flex items-center gap-2">
                          {r.servings} porsi
                          {catInfo && <span className="role-pill" style={{background:`${catInfo.color}1A`, color:catInfo.color}}>{catInfo.label}</span>}
                        </div>
                      </div>
                    </div>
                    {CAN_EDIT.includes(activeRole) && <button onClick={()=>{setEditing(r); setForm({name:r.name, servings:r.servings, menu_category:r.menu_category||null, ingredients:r.ingredients||[], instructions:r.instructions||"", calories_kcal:r.calories_kcal||0, protein_g:r.protein_g||0, carbs_g:r.carbs_g||0, fats_g:r.fats_g||0, sodium_mg:r.sodium_mg||0, allergens:r.allergens||[], photo_url:r.photo_url||""}); setOpen(true);}} className="btn-ghost text-xs">Edit</button>}
                  </div>
                <div className="grid grid-cols-5 gap-1 mt-3 text-center">
                  {[["Kkal", r.calories_kcal, "#D97706"],["Prot", r.protein_g, "#4A7C59"],["Karbo", r.carbs_g, "#2C4251"],["Lemak", r.fats_g, "#C5533B"],["Na (mg)", r.sodium_mg, "#5C5C5C"]].map(([l,v,c],i)=>(
                    <div key={i} className="rounded-md p-1.5" style={{background:`${c}10`}}>
                      <div className="audit-ts font-bold text-sm" style={{color:c}}>{Number(v||0).toFixed(0)}</div>
                      <div className="text-[9px] uppercase tracking-wide text-[#5C5C5C]">{l}</div>
                    </div>
                  ))}
                </div>
                {(r.allergens||[]).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.allergens.map(a => <span key={a} className="tag bg-[#C5533B]/10 text-[#C5533B]">⚠ {a}</span>)}
                  </div>
                )}
                <ul className="mt-3 space-y-1 text-sm border-t border-[#EAE4D8] pt-2">
                  {(r.ingredients||[]).map((ing, i) => {
                    const it = items.find(x=>x.id===ing.item_id);
                    return <li key={i} className="flex justify-between"><span>{it?.name || "—"}</span><span className="audit-ts text-[#5C5C5C]">{ing.quantity} {ing.unit || it?.unit}</span></li>;
                  })}
                </ul>
                </div>
              );
            })}
            {recipes.length === 0 && <div className="col-span-full text-center text-[#5C5C5C] py-10">Belum ada resep. Buat resep pertama.</div>}
          </div>
        )}
        <Pagination page={page} totalPages={Math.ceil(recipes.length / perPage)} onPageChange={setPage} />

        {open && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4 overflow-y-auto" onClick={()=>setOpen(false)}>
            <form onClick={(e)=>e.stopPropagation()} onSubmit={save} className="card-soft p-6 w-full max-w-xl my-8">
              <h2 className="font-display text-2xl font-bold">{editing?"Edit Resep":"Resep Baru"}</h2>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Nama</label>
                  <input data-testid="recipe-name" required className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Porsi standar</label>
                  <input type="number" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.servings} onChange={(e)=>setForm({...form, servings:parseInt(e.target.value)||1})}/>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kategori Menu</label>
                  <select className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.menu_category||""} onChange={(e)=>setForm({...form, menu_category:e.target.value||null})}>
                    <option value="">— Tanpa kategori —</option>
                    {Object.entries(MENU_CATEGORIES).map(([k,v])=>(
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-2"><Camera size={12}/> Foto Menu (URL)</label>
                  <input data-testid="recipe-photo" type="url" placeholder="https://..." className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.photo_url||""} onChange={(e)=>setForm({...form, photo_url:e.target.value})}/>
                  {form.photo_url && <img src={form.photo_url} alt="Preview" className="mt-2 w-32 h-24 rounded-md object-cover"/>}
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mt-2">
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Bahan</label>
                    <button data-testid="add-ing" type="button" onClick={addRow} className="btn-ghost text-xs"><Plus size={12}/> Baris</button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {form.ingredients.map((ing, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2">
                        <select className="col-span-6 px-2 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={ing.item_id} onChange={(e)=>upd(i,"item_id",e.target.value)}>
                          <option value="">— bahan —</option>
                          {items.map(it => <option key={it.id} value={it.id}>{it.name} ({it.unit})</option>)}
                        </select>
                        <input placeholder="qty" type="number" step="0.01" className="col-span-3 px-2 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={ing.quantity} onChange={(e)=>upd(i,"quantity",parseFloat(e.target.value)||0)}/>
                        <input placeholder="unit" className="col-span-2 px-2 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={ing.unit} onChange={(e)=>upd(i,"unit",e.target.value)}/>
                        <button type="button" onClick={()=>rm(i)} className="col-span-1 text-[#C5533B]">×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Instruksi (opsional)</label>
                  <textarea rows={3} className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.instructions} onChange={(e)=>setForm({...form, instructions:e.target.value})}/>
                </div>
                {activeRole === "nutritionist" || activeRole === "admin" ? (
                  <div className="col-span-2 border-t border-[#EAE4D8] pt-3">
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-2"><Flame size={12}/> Profil Gizi per Porsi</label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {[["calories_kcal","Kkal"],["protein_g","Protein (g)"],["carbs_g","Karbo (g)"],["fats_g","Lemak (g)"],["sodium_mg","Sodium (mg)"]].map(([k,l])=>(
                        <div key={k}>
                          <label className="text-[10px] uppercase text-[#5C5C5C]">{l}</label>
                          <input data-testid={`nutri-${k}`} type="number" step="0.1" className="w-full mt-1 px-2 py-1.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm audit-ts" value={form[k]} onChange={(e)=>setForm({...form, [k]:parseFloat(e.target.value)||0})}/>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Alergen yang terkandung</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {COMMON_ALLERGENS.map(a => {
                      const on = form.allergens?.includes(a);
                      return <button data-testid={`recipe-allergen-${a}`} type="button" key={a} onClick={()=>setForm(p=>({...p, allergens: on?p.allergens.filter(x=>x!==a):[...(p.allergens||[]), a]}))} className={`tag ${on?"bg-[#C5533B]/15 text-[#C5533B]":"bg-[#EAE4D8] text-[#5C5C5C]"}`}>{a}</button>;
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={()=>setOpen(false)} className="btn-ghost">Batal</button>
                <button data-testid="save-recipe" type="submit" className="btn-primary">{editing?"Simpan Versi Baru":"Simpan"}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
