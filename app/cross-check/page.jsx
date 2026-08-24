"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { fmtDate, ITEM_CATEGORIES, ZONE_LABELS, ZONE_COLORS } from "@/lib/format";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ClipboardCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SkeletonTable } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";

export default function Page() {
  const { activeRole } = useAuth();
  const [items, setItems] = useState([]);
  const [lots, setLots] = useState([]);
  const [checks, setChecks] = useState([]);
  const [checkDate, setCheckDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/items").then(({ data }) => setItems(data || [])),
      api.get("/stock-lots").then(({ data }) => setLots(data || [])),
      api.get(`/stock-cross-checks?check_date=${checkDate}`).then(({ data }) => setChecks(data || [])),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [checkDate]);

  const crossCheckData = useMemo(() => {
    const lotMap = {};
    lots.forEach(l => {
      if (!lotMap[l.item_id]) {
        lotMap[l.item_id] = { item_id: l.item_id, item_name: l.item_name, unit: l.unit, category: l.category, zone: l.zone, total: 0, actual: 0 };
      }
      lotMap[l.item_id].total += l.actual_quantity || l.quantity;
      lotMap[l.item_id].actual += l.actual_quantity || l.quantity;
    });

    return items.map(it => {
      const lot = lotMap[it.id] || { total: 0, actual: 0 };
      const existing = checks.find(c => c.item_id === it.id);
      return {
        item_id: it.id,
        item_name: it.name,
        unit: it.unit,
        category: it.category,
        zone: it.zone,
        opening_quantity: existing?.opening_quantity ?? lot.total,
        received_quantity: existing?.received_quantity ?? 0,
        used_quantity: existing?.used_quantity ?? 0,
        closing_quantity: existing?.closing_quantity ?? lot.total,
        actual_closing: existing?.actual_closing ?? lot.actual,
        notes: existing?.notes ?? "",
      };
    });
  }, [items, lots, checks]);

  const filtered = crossCheckData;
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const [form, setForm] = useState({});
  useEffect(() => {
    const init = {};
    crossCheckData.forEach(r => {
      init[r.item_id] = { ...r };
    });
    setForm(init);
  }, [crossCheckData]);

  const updateField = (itemId, field, value) => {
    setForm(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const submitChecks = async () => {
    setSaving(true);
    try {
      const checks = Object.values(form).map(f => ({
        item_id: f.item_id,
        opening_quantity: parseFloat(f.opening_quantity) || 0,
        received_quantity: parseFloat(f.received_quantity) || 0,
        used_quantity: parseFloat(f.used_quantity) || 0,
        closing_quantity: parseFloat(f.closing_quantity) || 0,
        actual_closing: f.actual_closing !== "" ? parseFloat(f.actual_closing) : null,
        zone: f.zone || "DRY",
        notes: f.notes || "",
      }));
      await api.post("/stock-cross-checks", { check_date: checkDate, checks });
      toast.success("Cross-check tersimpan");
      load();
    } catch (er) {
      toast.error(formatErr(er));
    } finally {
      setSaving(false);
    }
  };

  const totalSelisih = Object.values(form).reduce((sum, f) => {
    const actual = parseFloat(f.actual_closing) || 0;
    const closing = parseFloat(f.closing_quantity) || 0;
    return sum + Math.abs(actual - closing);
  }, 0);

  return (
    <Layout>
      <div className="space-y-6" data-testid="cross-check-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">Cross-Check Stok Harian</h1>
            <p className="text-[#5C5C5C] mt-1">Cek stok sebelum dan sesudah operasional harian. Membandingkan stok sistem vs aktual.</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={checkDate} onChange={(e) => setCheckDate(e.target.value)} className="card-soft px-3 py-2 text-sm audit-ts" />
            {(activeRole === "admin" || activeRole === "field_assistant" || activeRole === "pemeriksa") && checks.length === 0 && (
              <button onClick={submitChecks} disabled={saving} className="btn-primary">
                <ClipboardCheck size={14} /> {saving ? "Menyimpan..." : "Simpan Cross-Check"}
              </button>
            )}
          </div>
        </div>

        {totalSelisih > 0 && (
          <div className="card-soft p-4 border-l-4 border-[#D97706]">
            <div className="flex items-center gap-2 text-[#D97706]">
              <AlertTriangle size={16} />
              <span className="font-semibold">Total Selisih: {totalSelisih.toFixed(2)} item berbeda</span>
            </div>
          </div>
        )}

        {checks.length > 0 && (
          <div className="card-soft p-4 border-l-4 border-[#4A7C59]">
            <div className="flex items-center gap-2 text-[#4A7C59]">
              <CheckCircle2 size={16} />
              <span className="font-semibold">Cross-check sudah dilakukan oleh {checks[0]?.checked_by_name} ({fmtDate(checks[0]?.created_at)})</span>
            </div>
          </div>
        )}

        {loading ? (
          <SkeletonTable rows={8} cols={8} />
        ) : (
          <>
            <div className="hidden md:block card-soft overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-3 px-4">Bahan</th>
                    <th className="text-left py-3 px-4">Kat.</th>
                    <th className="text-right py-3 px-4">Stok Awal</th>
                    <th className="text-right py-3 px-4">Masuk</th>
                    <th className="text-right py-3 px-4">Keluar</th>
                    <th className="text-right py-3 px-4">Stok Sistem</th>
                    <th className="text-right py-3 px-4">Stok Aktual</th>
                    <th className="text-right py-3 px-4">Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(r => {
                    const f = form[r.item_id] || r;
                    const actual = parseFloat(f.actual_closing) || 0;
                    const closing = parseFloat(f.closing_quantity) || 0;
                    const selisih = actual - closing;
                    const catInfo = ITEM_CATEGORIES[r.category] || ITEM_CATEGORIES.BB;
                    return (
                      <tr key={r.item_id} className="border-b border-[#EAE4D8] last:border-0">
                        <td className="py-3 px-4 font-semibold">{r.item_name}</td>
                        <td className="py-3 px-4"><span className="role-pill text-xs" style={{ background: `${catInfo.color}1A`, color: catInfo.color }}>{catInfo.label}</span></td>
                        <td className="py-3 px-4 text-right">
                          <input type="number" step="0.01" className="w-20 text-right px-2 py-1 rounded border border-[#EAE4D8] bg-[#F9F6F0] text-xs" value={f.opening_quantity} onChange={(e) => updateField(r.item_id, "opening_quantity", e.target.value)} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input type="number" step="0.01" className="w-20 text-right px-2 py-1 rounded border border-[#EAE4D8] bg-[#F9F6F0] text-xs" value={f.received_quantity} onChange={(e) => updateField(r.item_id, "received_quantity", e.target.value)} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input type="number" step="0.01" className="w-20 text-right px-2 py-1 rounded border border-[#EAE4D8] bg-[#F9F6F0] text-xs" value={f.used_quantity} onChange={(e) => updateField(r.item_id, "used_quantity", e.target.value)} />
                        </td>
                        <td className="py-3 px-4 text-right audit-ts font-semibold">{closing} {r.unit}</td>
                        <td className="py-3 px-4 text-right">
                          <input type="number" step="0.01" className="w-20 text-right px-2 py-1 rounded border border-[#EAE4D8] bg-[#F9F6F0] text-xs font-semibold" value={f.actual_closing} onChange={(e) => updateField(r.item_id, "actual_closing", e.target.value)} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${selisih !== 0 ? "text-[#C5533B]" : "text-[#4A7C59]"}`}>
                            {selisih > 0 ? "+" : ""}{selisih.toFixed(2)} {r.unit}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-[#5C5C5C]">Belum ada data stok.</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {paginated.map(r => {
                const f = form[r.item_id] || r;
                const actual = parseFloat(f.actual_closing) || 0;
                const closing = parseFloat(f.closing_quantity) || 0;
                const selisih = actual - closing;
                const catInfo = ITEM_CATEGORIES[r.category] || ITEM_CATEGORIES.BB;
                return (
                  <div key={r.item_id} className="card-soft p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{r.item_name}</span>
                      <span className="role-pill text-xs" style={{ background: `${catInfo.color}1A`, color: catInfo.color }}>{catInfo.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <label className="text-[10px] uppercase text-[#5C5C5C]">Stok Sistem</label>
                        <div className="audit-ts font-semibold">{closing} {r.unit}</div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-[#5C5C5C]">Stok Aktual</label>
                        <input type="number" step="0.01" className="w-full px-2 py-1 rounded border border-[#EAE4D8] bg-[#F9F6F0] text-xs font-semibold" value={f.actual_closing} onChange={(e) => updateField(r.item_id, "actual_closing", e.target.value)} />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold ${selisih !== 0 ? "text-[#C5533B]" : "text-[#4A7C59]"}`}>
                        Selisih: {selisih > 0 ? "+" : ""}{selisih.toFixed(2)} {r.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination page={page} totalPages={Math.ceil(filtered.length / perPage)} onPageChange={setPage} />
          </>
        )}
      </div>
    </Layout>
  );
}
