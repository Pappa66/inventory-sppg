"use client";

import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { fmtIDR } from "@/lib/format";
import { Package, Search, Filter, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getLogo } from "@/lib/logo";
import { getSettings, renderLetterhead, todayIndo } from "@/lib/letterhead";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function StockDetailPage() {
  const { activeRole } = useAuth();
  const [lots, setLots] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterZone, setFilterZone] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/stock-lots"),
      api.get("/items"),
    ]).then(([a, b]) => {
      setLots(a.data || []);
      setItems(b.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const itemMap = useMemo(() => {
    const m = {};
    for (const i of items) m[i.id] = i;
    return m;
  }, [items]);

  const stockData = useMemo(() => {
    const map = {};
    for (const lot of lots) {
      const item = itemMap[lot.item_id];
      if (!item) continue;
      const key = lot.item_id;
      if (!map[key]) {
        map[key] = {
          item_id: lot.item_id,
          name: item.name,
          unit: item.unit,
          category: item.category,
          zone: item.zone,
          total_qty: 0,
          actual_qty: 0,
          lots: 0,
          earliest_expiry: null,
          latest_expiry: null,
          total_value: 0,
        };
      }
      map[key].total_qty += lot.quantity || 0;
      map[key].actual_qty += lot.actual_quantity || lot.quantity || 0;
      map[key].lots += 1;
      map[key].total_value += (lot.actual_quantity || lot.quantity || 0) * (item.price_per_unit || 0);
      if (lot.expiry_date) {
        if (!map[key].earliest_expiry || lot.expiry_date < map[key].earliest_expiry) map[key].earliest_expiry = lot.expiry_date;
        if (!map[key].latest_expiry || lot.expiry_date > map[key].latest_expiry) map[key].latest_expiry = lot.expiry_date;
      }
    }
    return Object.values(map);
  }, [lots, itemMap]);

  const filtered = useMemo(() => {
    return stockData.filter(s => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterZone !== "ALL" && s.zone !== filterZone) return false;
      if (filterCategory && s.category !== filterCategory) return false;
      return true;
    });
  }, [stockData, search, filterZone, filterCategory]);

  const totals = useMemo(() => {
    return filtered.reduce((acc, s) => ({
      total_qty: acc.total_qty + s.total_qty,
      actual_qty: acc.actual_qty + s.actual_qty,
      total_value: acc.total_value + s.total_value,
    }), { total_qty: 0, actual_qty: 0, total_value: 0 });
  }, [filtered]);

  const today = new Date();
  const getExpiryStatus = (date) => {
    if (!date) return { label: "—", color: "#5C5C5C" };
    const diff = (new Date(date) - today) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { label: "Expired", color: "#C5533B" };
    if (diff <= 7) return { label: "Hampir Expired", color: "#D97706" };
    return { label: "Aman", color: "#4A7C59" };
  };

  const exportPDF = async () => {
    const doc = new jsPDF("l");
    const [logo, settings] = await Promise.all([getLogo(), getSettings()]);
    const titleY = renderLetterhead(doc, settings, logo);
    doc.setFontSize(14);
    doc.text("STOK BARANG (DETAIL)", 14, titleY);
    doc.setFontSize(9);
    doc.text(`Dicetak: ${todayIndo()}`, 14, titleY + 6);

    autoTable(doc, {
      startY: titleY + 12,
      head: [["Nama Barang", "Kategori", "Satuan", "Zona", "Total Qty", "Aktual Qty", "Nilai", "Earliest Expiry", "Status"]],
      body: filtered.map(s => {
        const status = getExpiryStatus(s.latest_expiry);
        return [s.name, s.category, s.unit, s.zone, s.total_qty, s.actual_qty, fmtIDR(s.total_value), s.earliest_expiry || "—", status.label];
      }),
    });

    doc.save(`stock-detail-${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success("PDF berhasil diunduh");
  };

  if (!["admin_apps", "admin_sppg", "kitchen_head", "head_chef", "accountant"].includes(activeRole)) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Akses Dibatasi</h1>
          <p className="text-[#5C5C5C]">Anda tidak memiliki akses ke halaman ini.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Stock Barang (Detail)</h1>
            <p className="text-[#5C5C5C] mt-1">Stock_Brg (D) - Detail per kode barang</p>
          </div>
          <button onClick={exportPDF} className="btn-outline flex items-center gap-2"><Download size={14}/> Export PDF</button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Qty Sistem</div>
            <div className="font-display text-xl sm:text-2xl font-bold mt-1">{totals.total_qty.toLocaleString("id-ID")}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Qty Aktual</div>
            <div className="font-display text-xl sm:text-2xl font-bold mt-1 text-[#4A7C59]">{totals.actual_qty.toLocaleString("id-ID")}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Nilai</div>
            <div className="font-display text-xl sm:text-2xl font-bold mt-1">{fmtIDR(totals.total_value)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C5C]" />
            <input className="w-full pl-9 pr-4 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm" placeholder="Cari nama barang..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterZone} onChange={e => setFilterZone(e.target.value)} className="px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm">
            <option value="ALL">Semua Zona</option>
            <option value="DRY">DRY</option>
            <option value="WET">WET</option>
            <option value="FREEZER">FREEZER</option>
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm">
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
          <div className="card-soft p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full mx-auto" /></div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="md:hidden space-y-3">
              {filtered.length === 0 && <div className="card-soft p-10 text-center text-[#5C5C5C]">Tidak ada data.</div>}
              {filtered.map(s => {
                const status = getExpiryStatus(s.latest_expiry);
                return (
                  <div key={s.item_id} className="card-soft p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="font-medium text-sm">{s.name}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: status.color + "20", color: status.color }}>{status.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[#5C5C5C] uppercase tracking-wider text-[10px]">Kategori</div>
                        <div><span className="px-2 py-0.5 rounded bg-[#EAE4D8]">{s.category}</span></div>
                      </div>
                      <div>
                        <div className="text-[#5C5C5C] uppercase tracking-wider text-[10px]">Satuan</div>
                        <div>{s.unit}</div>
                      </div>
                      <div>
                        <div className="text-[#5C5C5C] uppercase tracking-wider text-[10px]">Zona</div>
                        <div>{s.zone}</div>
                      </div>
                      <div>
                        <div className="text-[#5C5C5C] uppercase tracking-wider text-[10px]">Lot</div>
                        <div>{s.lots}</div>
                      </div>
                      <div>
                        <div className="text-[#5C5C5C] uppercase tracking-wider text-[10px]">Qty Sistem</div>
                        <div>{s.total_qty}</div>
                      </div>
                      <div>
                        <div className="text-[#5C5C5C] uppercase tracking-wider text-[10px]">Qty Aktual</div>
                        <div className="font-semibold text-[#4A7C59]">{s.actual_qty}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[#5C5C5C] uppercase tracking-wider text-[10px]">Nilai</div>
                        <div className="font-semibold">{fmtIDR(s.total_value)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block card-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-3 px-3">Nama Barang</th>
                    <th className="text-left py-3 px-3">Kategori</th>
                    <th className="text-left py-3 px-3">Satuan</th>
                    <th className="text-left py-3 px-3">Zona</th>
                    <th className="text-right py-3 px-3">Qty Sistem</th>
                    <th className="text-right py-3 px-3">Qty Aktual</th>
                    <th className="text-right py-3 px-3">Nilai</th>
                    <th className="text-left py-3 px-3">Lot</th>
                    <th className="text-left py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const status = getExpiryStatus(s.latest_expiry);
                    return (
                      <tr key={s.item_id} className="border-b border-[#EAE4D8] last:border-0 hover:bg-[#F9F6F0]">
                        <td className="py-3 px-3 font-medium">{s.name}</td>
                        <td className="py-3 px-3"><span className="text-[10px] px-2 py-0.5 rounded bg-[#EAE4D8]">{s.category}</span></td>
                        <td className="py-3 px-3 text-[#5C5C5C]">{s.unit}</td>
                        <td className="py-3 px-3">{s.zone}</td>
                        <td className="py-3 px-3 text-right">{s.total_qty}</td>
                        <td className="py-3 px-3 text-right font-semibold text-[#4A7C59]">{s.actual_qty}</td>
                        <td className="py-3 px-3 text-right">{fmtIDR(s.total_value)}</td>
                        <td className="py-3 px-3 text-center">{s.lots}</td>
                        <td className="py-3 px-3"><span className="text-[10px] px-2 py-0.5 rounded font-semibold" style={{ background: status.color + "20", color: status.color }}>{status.label}</span></td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && <tr><td colSpan={9} className="py-10 text-center text-[#5C5C5C]">Tidak ada data.</td></tr>}
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
