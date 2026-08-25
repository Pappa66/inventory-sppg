"use client";

import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { fmtIDR, ITEM_CATEGORIES } from "@/lib/format";
import { Package, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getLogo } from "@/lib/logo";
import { getSettings, renderLetterhead, todayIndo } from "@/lib/letterhead";
import { toast } from "sonner";

export default function StockRekapPage() {
  const [lots, setLots] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const rekapByCategory = useMemo(() => {
    const catMap = {};
    for (const [code, info] of Object.entries(ITEM_CATEGORIES)) {
      catMap[code] = { code, label: info.label, color: info.color, items: 0, total_qty: 0, actual_qty: 0, total_value: 0, lot_count: 0 };
    }

    for (const lot of lots) {
      const item = itemMap[lot.item_id];
      if (!item) continue;
      const cat = catMap[item.category];
      if (!cat) continue;
      cat.items += 1;
      cat.total_qty += lot.quantity || 0;
      cat.actual_qty += lot.actual_quantity || lot.quantity || 0;
      cat.total_value += (lot.actual_quantity || lot.quantity || 0) * (item.price_per_unit || 0);
      cat.lot_count += 1;
    }

    return Object.values(catMap).filter(c => c.items > 0);
  }, [lots, itemMap]);

  const grandTotal = useMemo(() => {
    return rekapByCategory.reduce((acc, c) => ({
      items: acc.items + c.items,
      total_qty: acc.total_qty + c.total_qty,
      actual_qty: acc.actual_qty + c.actual_qty,
      total_value: acc.total_value + c.total_value,
    }), { items: 0, total_qty: 0, actual_qty: 0, total_value: 0 });
  }, [rekapByCategory]);

  const exportPDF = async () => {
    const doc = new jsPDF();
    const [logo, settings] = await Promise.all([getLogo(), getSettings()]);
    const titleY = renderLetterhead(doc, settings, logo);
    doc.setFontSize(14);
    doc.text("STOK BARANG (REKAPITULASI)", 14, titleY);
    doc.setFontSize(9);
    doc.text(`Dicetak: ${todayIndo()}`, 14, titleY + 6);

    autoTable(doc, {
      startY: titleY + 12,
      head: [["Kategori", "Jumlah Item", "Total Qty", "Qty Aktual", "Total Nilai"]],
      body: rekapByCategory.map(c => [
        `${c.code} - ${c.label}`, c.items, c.total_qty, c.actual_qty, fmtIDR(c.total_value)
      ]),
      foot: [["TOTAL", grandTotal.items, grandTotal.total_qty, grandTotal.actual_qty, fmtIDR(grandTotal.total_value)]],
    });

    doc.save(`stock-rekap-${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success("PDF berhasil diunduh");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold">Stock Barang (Rekap)</h1>
            <p className="text-[#5C5C5C] mt-1">Stock_Brg (R) - Rekapitulasi per kategori</p>
          </div>
          <button onClick={exportPDF} className="btn-outline flex items-center gap-2"><Download size={14}/> Export PDF</button>
        </div>

        {/* Grand Total */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Item</div>
            <div className="font-display text-2xl font-bold mt-1">{grandTotal.items}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Qty</div>
            <div className="font-display text-2xl font-bold mt-1">{grandTotal.total_qty.toLocaleString("id-ID")}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Qty Aktual</div>
            <div className="font-display text-2xl font-bold mt-1 text-[#4A7C59]">{grandTotal.actual_qty.toLocaleString("id-ID")}</div>
          </div>
          <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Nilai</div>
            <div className="font-display text-2xl font-bold mt-1">{fmtIDR(grandTotal.total_value)}</div>
          </div>
        </div>

        {loading ? (
          <div className="card-soft p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full mx-auto" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rekapByCategory.map(c => (
              <div key={c.code} className="card-soft overflow-hidden">
                <div className="px-5 py-3 border-b border-[#EAE4D8] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={16} style={{ color: c.color }} />
                    <span className="font-display font-bold" style={{ color: c.color }}>{c.code} - {c.label}</span>
                  </div>
                  <span className="text-xs text-[#5C5C5C]">{c.items} item</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C5C5C]">Total Qty</span>
                    <span className="font-semibold">{c.total_qty.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C5C5C]">Qty Aktual</span>
                    <span className="font-semibold text-[#4A7C59]">{c.actual_qty.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C5C5C]">Jumlah Lot</span>
                    <span className="font-semibold">{c.lot_count}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-[#EAE4D8] pt-2">
                    <span className="text-[#5C5C5C]">Total Nilai</span>
                    <span className="font-bold">{fmtIDR(c.total_value)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
