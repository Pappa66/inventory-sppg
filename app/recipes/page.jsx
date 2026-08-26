"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { COMMON_ALLERGENS, MENU_CATEGORIES } from "@/lib/format";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Flame, Camera, Calculator, Pencil } from "lucide-react";
import { SkeletonCards } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";

const EMPTY = {
  name: "", servings: 100, menu_category: null, ingredients: [], instructions: "",
  calories_kcal: 0, protein_g: 0, carbs_g: 0, fats_g: 0, fiber_g: 0, sodium_mg: 0,
  nutrition_auto: true, allergens: [], photo_url: "",
};

const CAN_EDIT = ["admin_apps", "admin_sppg", "head_chef", "nutritionist", "kitchen_head"];

const NUTRI_KEYS = [
  ["calories_kcal", "Kkal", "#D97706"],
  ["protein_g", "Protein (g)", "#4A7C59"],
  ["carbs_g", "Karbo (g)", "#2C4251"],
  ["fats_g", "Lemak (g)", "#C5533B"],
  ["fiber_g", "Serat (g)", "#0E7490"],
  ["sodium_mg", "Natrium (mg)", "#5C5C5C"],
];

export default function Page() {
  const { activeRole } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/recipes"), api.get("/items")])
      .then(([a, b]) => { setRecipes(a.data); setItems(b.data); setPage(1); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const addRow = () => setForm(p => ({ ...p, ingredients: [...p.ingredients, { item_id: "", quantity: 0, unit: "" }] }));
  const upd = (i, k, v) => setForm(p => {
    const list = [...p.ingredients];
    list[i] = { ...list[i], [k]: v };
    return { ...p, ingredients: list };
  });
  const rm = (i) => setForm(p => ({ ...p, ingredients: p.ingredients.filter((_, idx) => idx !== i) }));

  const autoNutrition = useMemo(() => {
    if (!form.nutrition_auto) return null;
    const totals = { calories_kcal: 0, protein_g: 0, carbs_g: 0, fats_g: 0, fiber_g: 0, sodium_mg: 0 };
    for (const ing of form.ingredients) {
      if (!ing.item_id || !ing.quantity) continue;
      const item = items.find(x => x.id === ing.item_id);
      if (!item?.nutrition_per_100g) continue;
      const n = item.nutrition_per_100g;
      const factor = ing.quantity / 100;
      totals.calories_kcal += (n.calories || 0) * factor;
      totals.protein_g += (n.protein || 0) * factor;
      totals.carbs_g += (n.carbs || 0) * factor;
      totals.fats_g += (n.fats || 0) * factor;
      totals.fiber_g += (n.fiber || 0) * factor;
      totals.sodium_mg += (n.sodium || 0) * factor;
    }
    return totals;
  }, [form.ingredients, form.nutrition_auto, items]);

  useEffect(() => {
    if (form.nutrition_auto && autoNutrition) {
      setForm(p => ({ ...p, ...autoNutrition }));
    }
  }, [autoNutrition, form.nutrition_auto]);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.patch(`/recipes/${editing.id}`, form);
      else await api.post("/recipes", form);
      toast.success("Resep tersimpan");
      setOpen(false); setEditing(null); setForm(EMPTY); setPhotoPreview(null); load();
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
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Resep Standar</h1>
            <p className="text-[#5C5C5C] mt-1">Gizi dihitung otomatis dari bahan (per 100g). Bisa disesuaikan manual.</p>
          </div>
          {CAN_EDIT.includes(activeRole) && (
            <button data-testid="add-recipe-btn" onClick={() => { setEditing(null); setForm(EMPTY); setPhotoPreview(null); setOpen(true); }} className="btn-primary">
              <Plus size={16} /> Resep Baru
            </button>
          )}
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
                      {r.photo_url && <img src={r.photo_url} alt={r.name} className="w-12 h-12 rounded-md object-cover" />}
                      <div>
                        <div className="font-display font-bold text-lg">{r.name}</div>
                        <div className="text-xs text-[#5C5C5C] flex items-center gap-2">
                          {r.servings} porsi
                          {catInfo && <span className="role-pill" style={{ background: `${catInfo.color}1A`, color: catInfo.color }}>{catInfo.label}</span>}
                          {r.nutrition_auto !== false && <span className="tag bg-[#4A7C59]/10 text-[#4A7C59]">Auto</span>}
                        </div>
                      </div>
                    </div>
                    {CAN_EDIT.includes(activeRole) && (
                      <button onClick={() => {
                        setEditing(r);
                        setForm({
                          name: r.name, servings: r.servings, menu_category: r.menu_category || null,
                          ingredients: r.ingredients || [], instructions: r.instructions || "",
                          calories_kcal: r.calories_kcal || 0, protein_g: r.protein_g || 0,
                          carbs_g: r.carbs_g || 0, fats_g: r.fats_g || 0, fiber_g: r.fiber_g || 0,
                          sodium_mg: r.sodium_mg || 0, nutrition_auto: r.nutrition_auto !== false,
                          allergens: r.allergens || [], photo_url: r.photo_url || "",
                        });
                        setPhotoPreview(r.photo_url || null);
                        setOpen(true);
                      }} className="btn-ghost text-xs">Edit</button>
                    )}
                  </div>
                  <div className="grid grid-cols-6 gap-1 mt-3 text-center">
                    {NUTRI_KEYS.map(([k, l, c], i) => (
                      <div key={i} className="rounded-md p-1.5" style={{ background: `${c}10` }}>
                        <div className="font-bold text-sm" style={{ color: c }}>{Number(r[k] || 0).toFixed(0)}</div>
                        <div className="text-[9px] uppercase tracking-wide text-[#5C5C5C]">{l}</div>
                      </div>
                    ))}
                  </div>
                  {(r.allergens || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.allergens.map(a => <span key={a} className="tag bg-[#C5533B]/10 text-[#C5533B]">⚠ {a}</span>)}
                    </div>
                  )}
                  <ul className="mt-3 space-y-1 text-sm border-t border-[#EAE4D8] pt-2">
                    {(r.ingredients || []).map((ing, i) => {
                      const it = items.find(x => x.id === ing.item_id);
                      return (
                        <li key={i} className="flex justify-between">
                          <span>{it?.name || "—"}</span>
                          <span className="text-[#5C5C5C]">{ing.quantity} {ing.unit || it?.unit}</span>
                        </li>
                      );
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
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4 overflow-y-auto" onClick={() => setOpen(false)}>
            <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="card-soft p-4 sm:p-6 w-full max-w-xl my-8">
              <h2 className="font-display text-2xl font-bold">{editing ? "Edit Resep" : "Resep Baru"}</h2>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Nama</label>
                  <input data-testid="recipe-name" required className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Porsi standar</label>
                  <input type="number" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.servings} onChange={(e) => setForm({ ...form, servings: parseInt(e.target.value) || 1 })} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kategori Menu</label>
                  <select className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.menu_category || ""} onChange={(e) => setForm({ ...form, menu_category: e.target.value || null })}>
                    <option value="">— Tanpa kategori —</option>
                    {Object.entries(MENU_CATEGORIES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-2"><Camera size={12} /> Foto Menu</label>
                  <div className="mt-1">
                    <input data-testid="recipe-photo" type="file" accept="image/*" capture="environment" className="hidden" id="recipe-photo-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => { setForm({ ...form, photo_url: ev.target.result }); setPhotoPreview(ev.target.result); };
                        reader.readAsDataURL(file);
                      }} />
                    <label htmlFor="recipe-photo-input" className="flex items-center justify-center gap-2 w-full px-4 py-8 rounded-md border-2 border-dashed border-[#EAE4D8] bg-[#F9F6F0] cursor-pointer hover:border-[#4A7C59] hover:bg-[#4A7C59]/5 transition-colors">
                      {(photoPreview || form.photo_url) ? (
                        <div className="text-center">
                          <img src={photoPreview || form.photo_url} alt="Preview" className="w-32 h-24 rounded-md object-cover mx-auto" />
                          <p className="text-xs text-[#5C5C5C] mt-2">Klik untuk mengganti foto</p>
                        </div>
                      ) : (
                        <>
                          <Camera size={24} className="text-[#4A7C59]" />
                          <span className="text-sm text-[#5C5C5C]">Pilih Foto / Ambil Foto</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mt-2">
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Bahan</label>
                    <button data-testid="add-ing" type="button" onClick={addRow} className="btn-ghost text-xs"><Plus size={12} /> Baris</button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {form.ingredients.map((ing, i) => {
                      const item = items.find(x => x.id === ing.item_id);
                      return (
                        <div key={i}>
                          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                            <select className="col-span-6 px-2 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={ing.item_id} onChange={(e) => upd(i, "item_id", e.target.value)}>
                              <option value="">— bahan —</option>
                              {items.map(it => <option key={it.id} value={it.id}>{it.name} ({it.unit})</option>)}
                            </select>
                            <input placeholder="qty" type="number" step="0.01" className="col-span-3 px-2 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={ing.quantity} onChange={(e) => upd(i, "quantity", parseFloat(e.target.value) || 0)} />
                            <input placeholder="unit" className="col-span-2 px-2 py-2 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={ing.unit} onChange={(e) => upd(i, "unit", e.target.value)} />
                            <button type="button" onClick={() => rm(i)} className="col-span-1 text-[#C5533B] p-1.5">×</button>
                          </div>
                          {item?.nutrition_per_100g && ing.quantity > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1 ml-2">
                              {NUTRI_KEYS.map(([k, l, c]) => {
                                const val = ((item.nutrition_per_100g[k] || 0) * ing.quantity / 100);
                                return val > 0 ? (
                                  <span key={k} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${c}10`, color: c }}>
                                    {l.split(" ")[0]}: {val.toFixed(1)}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Instruksi (opsional)</label>
                  <textarea rows={3} className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
                </div>
                {(activeRole === "nutritionist" || activeRole === "admin_apps" || activeRole === "admin_sppg") && (
                  <div className="col-span-2 border-t border-[#EAE4D8] pt-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
                      <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-2"><Flame size={12} /> Profil Gizi per Porsi</label>
                      <button type="button" onClick={() => setForm(p => {
                        const next = !p.nutrition_auto;
                        if (next && autoNutrition) return { ...p, nutrition_auto: true, ...autoNutrition };
                        return { ...p, nutrition_auto: next };
                      })} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition ${form.nutrition_auto ? "bg-[#4A7C59] text-white" : "bg-[#EAE4D8] text-[#5C5C5C]"}`}>
                        {form.nutrition_auto ? <><Calculator size={12} /> Auto</> : <><Pencil size={12} /> Manual</>}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
                      {NUTRI_KEYS.map(([k, l]) => (
                        <div key={k}>
                          <label className="text-[10px] uppercase text-[#5C5C5C]">{l}</label>
                          <input data-testid={`nutri-${k}`} type="number" step="0.1"
                            disabled={form.nutrition_auto}
                            className={`w-full mt-1 px-2 py-1.5 rounded-md border border-[#EAE4D8] text-sm font-semibold ${form.nutrition_auto ? "bg-[#F0EDE4] text-[#5C5C5C] cursor-not-allowed" : "bg-[#F9F6F0]"}`}
                            value={form[k]} onChange={(e) => setForm({ ...form, [k]: parseFloat(e.target.value) || 0 })} />
                        </div>
                      ))}
                    </div>
                    {form.nutrition_auto && (
                      <p className="text-[10px] text-[#5C5C5C] mt-1 italic">Dihitung otomatis dari bahan. Toggle &quot;Manual&quot; untuk edit.</p>
                    )}
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Alergen yang terkandung</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {COMMON_ALLERGENS.map(a => {
                      const on = form.allergens?.includes(a);
                      return <button data-testid={`recipe-allergen-${a}`} type="button" key={a} onClick={() => setForm(p => ({ ...p, allergens: on ? p.allergens.filter(x => x !== a) : [...(p.allergens || []), a] }))} className={`tag ${on ? "bg-[#C5533B]/15 text-[#C5533B]" : "bg-[#EAE4D8] text-[#5C5C5C]"}`}>{a}</button>;
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Batal</button>
                <button data-testid="save-recipe" type="submit" className="btn-primary">{editing ? "Simpan Versi Baru" : "Simpan"}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
