"use client";

import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { Calculator, CheckCircle2, AlertTriangle, ChefHat, Scale, HeartPulse, Leaf } from "lucide-react";
import { AKG_STANDARDS } from "@/lib/format";

function NutrientBar({ label, value, unit, standard, color }) {
  const pct = standard > 0 ? Math.min((value / standard) * 100, 120) : 0;
  const status = pct >= 80 ? "ok" : pct >= 50 ? "warn" : "low";
  const statusColor = status === "ok" ? "#4A7C59" : status === "warn" ? "#D97706" : "#C5533B";

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-semibold" style={{ color: statusColor }}>
          {value.toFixed(1)} {unit} / {standard} {unit} ({pct.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full h-3 bg-[#EAE4D8] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: statusColor }} />
      </div>
    </div>
  );
}

const NUTRI_COLS = [
  ["calories", "Kalori", "kkal", "#D97706"],
  ["protein", "Protein", "g", "#4A7C59"],
  ["carbs", "Karbo", "g", "#2C4251"],
  ["fats", "Lemak", "g", "#C5533B"],
  ["fiber", "Serat", "g", "#0E7490"],
  ["sodium", "Natrium", "mg", "#6D28D9"],
];

export default function NutritionCalcPage() {
  const [recipes, setRecipes] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedAkg, setSelectedAkg] = useState("BALITA");

  useEffect(() => {
    Promise.all([api.get("/recipes"), api.get("/items")])
      .then(([r, i]) => { setRecipes(r.data || []); setItems(i.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const perPortion = useMemo(() => {
    if (!selectedRecipe) return null;
    const s = selectedRecipe.servings || 1;
    return {
      calories: (selectedRecipe.calories_kcal || 0) / s,
      protein: (selectedRecipe.protein_g || 0) / s,
      carbs: (selectedRecipe.carbs_g || 0) / s,
      fats: (selectedRecipe.fats_g || 0) / s,
      sodium: (selectedRecipe.sodium_mg || 0) / s,
      fiber: (selectedRecipe.fiber_g || 0) / s,
    };
  }, [selectedRecipe]);

  const ingredientBreakdown = useMemo(() => {
    if (!selectedRecipe) return [];
    const rows = [];
    for (const ing of (selectedRecipe.ingredients || [])) {
      const item = items.find(x => x.id === ing.item_id);
      if (!item) continue;
      const n = item.nutrition_per_100g || {};
      const factor = (ing.quantity || 0) / 100;
      rows.push({
        name: item.name,
        quantity: ing.quantity,
        unit: ing.unit || item.unit,
        calories: (n.calories || 0) * factor,
        protein: (n.protein || 0) * factor,
        carbs: (n.carbs || 0) * factor,
        fats: (n.fats || 0) * factor,
        fiber: (n.fiber || 0) * factor,
        sodium: (n.sodium || 0) * factor,
      });
    }
    return rows;
  }, [selectedRecipe, items]);

  const akg = AKG_STANDARDS[selectedAkg];

  const verdict = useMemo(() => {
    if (!perPortion || !akg) return null;
    const checks = [
      { pct: (perPortion.calories / akg.kkal) * 100 },
      { pct: (perPortion.protein / akg.protein) * 100 },
      { pct: (perPortion.carbs / akg.karbo) * 100 },
      { pct: (perPortion.fats / akg.lemak) * 100 },
    ];
    const avgPct = checks.reduce((s, c) => s + c.pct, 0) / checks.length;
    const allGood = checks.every((c) => c.pct >= 70);
    return { avgPct, allGood };
  }, [perPortion, akg]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-bold">Kalkulator Gizi</h1>
          <p className="text-[#5C5C5C] mt-1">Gizi dihitung dari bahan per 100g. Rincian per bahan tersedia.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <div className="card-soft p-4">
              <h2 className="font-display font-bold flex items-center gap-2 mb-3">
                <ChefHat size={16} /> Daftar Resep
              </h2>
              {loading ? (
                <p className="text-sm text-[#5C5C5C]">Memuat...</p>
              ) : recipes.length === 0 ? (
                <p className="text-sm text-[#5C5C5C]">Belum ada resep.</p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {recipes.map((r) => (
                    <button key={r.id} onClick={() => setSelectedRecipe(r)}
                      className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${selectedRecipe?.id === r.id ? "border-[#4A7C59] bg-[#4A7C59]/10" : "border-[#EAE4D8] hover:bg-[#F9F6F0]"}`}>
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-[#5C5C5C] mt-1">
                        {r.calories_kcal || 0}kkal | {r.protein_g || 0}g protein | {(r.ingredients || []).length} bahan
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="card-soft p-4">
              <div className="flex items-center gap-2 mb-3">
                <Scale size={16} />
                <label className="text-sm font-semibold">Kelompok Sasaran</label>
              </div>
              <select value={selectedAkg} onChange={(e) => setSelectedAkg(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm">
                {Object.entries(AKG_STANDARDS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {!selectedRecipe ? (
              <div className="card-soft p-12 text-center text-[#5C5C5C]">
                <Calculator size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-display text-lg font-bold">Pilih resep untuk dihitung</p>
                <p className="text-sm mt-1">Klik salah satu resep di panel kiri.</p>
              </div>
            ) : perPortion && akg ? (
              <>
                <div className="card-soft p-5">
                  <h3 className="font-display font-bold text-lg mb-1">{selectedRecipe.name}</h3>
                  <p className="text-xs text-[#5C5C5C]">{selectedRecipe.servings} porsi | Per porsi:</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-3">
                    {[
                      { label: "Kalori", val: perPortion.calories, unit: "kkal", color: "#D97706" },
                      { label: "Protein", val: perPortion.protein, unit: "g", color: "#4A7C59" },
                      { label: "Karbo", val: perPortion.carbs, unit: "g", color: "#2C4251" },
                      { label: "Lemak", val: perPortion.fats, unit: "g", color: "#C5533B" },
                      { label: "Serat", val: perPortion.fiber, unit: "g", color: "#0E7490" },
                      { label: "Natrium", val: perPortion.sodium, unit: "mg", color: "#6D28D9" },
                    ].map((n) => (
                      <div key={n.label} className="text-center p-3 rounded-lg bg-[#F9F6F0]">
                        <div className="text-[10px] uppercase tracking-widest text-[#5C5C5C]">{n.label}</div>
                        <div className="font-display font-bold text-lg mt-1" style={{ color: n.color }}>{n.val.toFixed(1)}</div>
                        <div className="text-[10px] text-[#5C5C5C]">{n.unit}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {ingredientBreakdown.length > 0 && (
                  <div className="card-soft p-5">
                    <h3 className="font-display font-bold flex items-center gap-2 mb-3">
                      <Leaf size={16} /> Rincian per Bahan
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#EAE4D8]">
                            <th className="text-left py-2 px-2 text-xs uppercase text-[#5C5C5C]">Bahan</th>
                            <th className="text-right py-2 px-2 text-xs uppercase text-[#5C5C5C]">Qty</th>
                            {NUTRI_COLS.map(([k, l]) => (
                              <th key={k} className="text-right py-2 px-2 text-xs uppercase text-[#5C5C5C]">{l}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ingredientBreakdown.map((row, i) => (
                            <tr key={i} className="border-b border-[#EAE4D8] last:border-0">
                              <td className="py-2 px-2 font-medium">{row.name}</td>
                              <td className="py-2 px-2 text-right text-[#5C5C5C]">{row.quantity} {row.unit}</td>
                              {NUTRI_COLS.map(([k, , unit]) => (
                                <td key={k} className="py-2 px-2 text-right font-semibold">{row[k].toFixed(1)}<span className="text-[10px] text-[#5C5C5C] ml-0.5">{unit}</span></td>
                              ))}
                            </tr>
                          ))}
                          <tr className="font-bold bg-[#F9F6F0]">
                            <td className="py-2 px-2">Total / Porsi</td>
                            <td className="py-2 px-2 text-right">—</td>
                            {NUTRI_COLS.map(([k, , unit]) => {
                              const total = ingredientBreakdown.reduce((s, r) => s + r[k], 0) / (selectedRecipe.servings || 1);
                              return <td key={k} className="py-2 px-2 text-right">{total.toFixed(1)}<span className="text-[10px] text-[#5C5C5C] ml-0.5">{unit}</span></td>;
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="card-soft p-5 space-y-4">
                  <h3 className="font-display font-bold flex items-center gap-2">
                    <HeartPulse size={16} /> Pemenuhan AKG - {akg.label}
                  </h3>
                  <NutrientBar label="Kalori" value={perPortion.calories} unit="kkal" standard={akg.kkal} color="#D97706" />
                  <NutrientBar label="Protein" value={perPortion.protein} unit="g" standard={akg.protein} color="#4A7C59" />
                  <NutrientBar label="Karbohidrat" value={perPortion.carbs} unit="g" standard={akg.karbo} color="#2C4251" />
                  <NutrientBar label="Lemak" value={perPortion.fats} unit="g" standard={akg.lemak} color="#C5533B" />
                  <NutrientBar label="Serat" value={perPortion.fiber} unit="g" standard={akg.serat} color="#0E7490" />
                  <NutrientBar label="Natrium" value={perPortion.sodium} unit="mg" standard={akg.sodium} color="#6D28D9" />
                </div>

                {verdict && (
                  <div className={`card-soft p-5 ${verdict.allGood ? "border-l-4 border-[#4A7C59]" : "border-l-4 border-[#C5533B]"}`}>
                    <div className="flex items-center gap-3">
                      {verdict.allGood ? <CheckCircle2 size={24} className="text-[#4A7C59]" /> : <AlertTriangle size={24} className="text-[#C5533B]" />}
                      <div>
                        <p className={`font-display font-bold text-lg ${verdict.allGood ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>
                          {verdict.allGood ? "Memenuhi Standar AKG" : "Perlu Perbaikan Gizi"}
                        </p>
                        <p className="text-sm text-[#5C5C5C] mt-1">
                          Rata-rata pemenuhan: {verdict.avgPct.toFixed(0)}%
                          {!verdict.allGood && <span> — Pertimbangkan tambah porsi protein atau sayuran untuk kelompok {akg.label}.</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
}
