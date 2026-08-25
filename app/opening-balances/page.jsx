"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Save, Package, Search, Filter } from "lucide-react";

export default function OpeningBalancesPage() {
  const { user, activeRole } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [balances, setBalances] = useState({});
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");

  const canWrite = activeRole === "admin_apps" || activeRole === "admin_sppg";

  useEffect(() => {
    fetchPeriods();
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedPeriod) fetchBalances();
  }, [selectedPeriod]);

  const fetchPeriods = async () => {
    try {
      const { data } = await api.get("/biweekly-periods");
      setPeriods(data || []);
      if (data?.length) setSelectedPeriod(data[0].id);
    } catch (err) {}
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/item-hierarchies?level=3");
      setItems(data || []);
    } catch (err) {
      toast.error("Gagal memuat data barang");
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async () => {
    try {
      const { data } = await api.get(`/opening-balances?period_id=${selectedPeriod}`);
      const map = {};
      for (const b of (data || [])) {
        map[b.item_code] = { quantity: b.opening_quantity, value: b.opening_value };
      }
      setBalances(map);
    } catch (err) {}
  };

  const handleChange = (code, field, val) => {
    setBalances(prev => ({
      ...prev,
      [code]: { ...prev[code], [field]: parseFloat(val) || 0 },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const itemsToSave = Object.entries(balances).map(([code, v]) => ({
        item_code: code,
        opening_quantity: v.quantity || 0,
        opening_value: v.value || 0,
      }));
      await api.post("/opening-balances", { items: itemsToSave, period_id: selectedPeriod });
      toast.success("Saldo awal tersimpan");
    } catch (err) {
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat && i.category !== filterCat) return false;
    return true;
  });

  const totalValue = filtered.reduce((sum, i) => sum + (balances[i.code]?.value || 0), 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold">Saldo Awal Barang</h1>
            <p className="text-[#5C5C5C] mt-1">Atur saldo awal per kode barang per periode</p>
          </div>
          {canWrite && (
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save size={14}/> {saving ? "Menyimpan..." : "Simpan Saldo Awal"}
            </button>
          )}
        </div>

        {/* Period Selector */}
        <div className="card-soft p-4 flex items-center gap-4">
          <label className="text-sm font-medium">Periode:</label>
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm"
          >
            {periods.map(p => (
              <option key={p.id} value={p.id}>{p.period_name}</option>
            ))}
          </select>
          <div className="flex-1" />
          <div className="text-sm text-[#5C5C5C]">
            Total: <span className="font-bold">Rp {totalValue.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C5C]" />
            <input
              className="w-full pl-9 pr-4 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm"
              placeholder="Cari kode atau nama barang..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm">
            <option value="">Semua Kategori</option>
            <option value="KH">KH - Karbohidrat</option>
            <option value="PH">PH - Protein Hewani</option>
            <option value="PN">PN - Protein Nabati</option>
            <option value="SY">SY - Sayuran</option>
            <option value="BU">BU - Buah-buahan</option>
            <option value="BB">BB - Bahan Baku Lain</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="card-soft p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="card-soft p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-[#5C5C5C]">{item.code}</span>
                    <h3 className="font-medium">{item.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#EAE4D8]">{item.category}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#EAE4D8]">{item.zone}</span>
                  </div>
                </div>
                <div className="text-xs text-[#5C5C5C]">
                  Satuan: <span className="font-medium text-black">{item.unit}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#5C5C5C] block mb-1">Saldo Qty</label>
                    {canWrite ? (
                      <input
                        type="number"
                        className="w-full px-2 py-1.5 rounded border border-[#EAE4D8] bg-white text-sm text-right"
                        value={balances[item.code]?.quantity || ""}
                        onChange={e => handleChange(item.code, "quantity", e.target.value)}
                      />
                    ) : (
                      <span className="block text-right font-medium">{balances[item.code]?.quantity || 0}</span>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#5C5C5C] block mb-1">Saldo Nilai (Rp)</label>
                    {canWrite ? (
                      <input
                        type="number"
                        className="w-full px-2 py-1.5 rounded border border-[#EAE4D8] bg-white text-sm text-right"
                        value={balances[item.code]?.value || ""}
                        onChange={e => handleChange(item.code, "value", e.target.value)}
                      />
                    ) : (
                      <span className="block text-right font-medium">Rp {(balances[item.code]?.value || 0).toLocaleString("id-ID")}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="card-soft p-8 text-center text-[#5C5C5C]">Tidak ada data</div>
            )}
          </div>

          {/* Table (Desktop) */}
          <div className="hidden md:block card-soft overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EAE4D8] bg-[#F9F6F0]">
                  <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-[#5C5C5C]">Kode</th>
                  <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-[#5C5C5C]">Nama Barang</th>
                  <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-[#5C5C5C]">Kategori</th>
                  <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-[#5C5C5C]">Satuan</th>
                  <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-[#5C5C5C]">Zona</th>
                  <th className="px-4 py-3 text-right font-display text-xs uppercase tracking-wider text-[#5C5C5C]">Saldo Qty</th>
                  <th className="px-4 py-3 text-right font-display text-xs uppercase tracking-wider text-[#5C5C5C]">Saldo Nilai (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-[#EAE4D8] hover:bg-[#F9F6F0]">
                    <td className="px-4 py-2 font-mono text-xs">{item.code}</td>
                    <td className="px-4 py-2 font-medium">{item.name}</td>
                    <td className="px-4 py-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#EAE4D8]">{item.category}</span>
                    </td>
                    <td className="px-4 py-2 text-[#5C5C5C]">{item.unit}</td>
                    <td className="px-4 py-2 text-[#5C5C5C]">{item.zone}</td>
                    <td className="px-4 py-2 text-right">
                      {canWrite ? (
                        <input
                          type="number"
                          className="w-24 text-right px-2 py-1 rounded border border-[#EAE4D8] bg-white text-sm"
                          value={balances[item.code]?.quantity || ""}
                          onChange={e => handleChange(item.code, "quantity", e.target.value)}
                        />
                      ) : (
                        <span>{balances[item.code]?.quantity || 0}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {canWrite ? (
                        <input
                          type="number"
                          className="w-32 text-right px-2 py-1 rounded border border-[#EAE4D8] bg-white text-sm"
                          value={balances[item.code]?.value || ""}
                          onChange={e => handleChange(item.code, "value", e.target.value)}
                        />
                      ) : (
                        <span>Rp {(balances[item.code]?.value || 0).toLocaleString("id-ID")}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#5C5C5C]">Tidak ada data</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
          </>
        )}
      </div>
    </Layout>
  );
}
