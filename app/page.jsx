"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { fmtIDR } from "@/lib/format";
import { Package, AlertTriangle, TrendingUp, Wallet, Database } from "lucide-react";

export default function DashboardPage() {
  const [fin, setFin] = useState(null);
  const [low, setLow] = useState([]);

  useEffect(() => {
    api.get("/reports/financial").then(({ data }) => setFin(data));
    api.get("/reports/low-stock").then(({ data }) => setLow(data));
  }, []);

  const s = fin?.summary || {};
  const cards = [
    { label: "Total Stok", value: s.total_stock, icon: Package, color: "#4A7C59" },
    { label: "Total OPEX", value: s.total_opex, icon: Wallet, color: "#D97706" },
    { label: "Transport", value: s.total_transport, icon: TrendingUp, color: "#2C4251" },
    { label: "Peringatan Stok", value: low.length, icon: AlertTriangle, color: "#C5533B" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-bold">Dasbor</h1>
          <p className="text-[#5C5C5C] mt-1">Ringkasan inventory & procurement</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card-soft p-5">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-widest text-[#5C5C5C]">{label}</div>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="font-display font-bold text-2xl mt-2" style={{ color }}>
                {label === "Peringatan Stok" ? value : fmtIDR(value || 0)}
              </div>
            </div>
          ))}
        </div>
        {low.length > 0 && (
          <div className="card-soft overflow-hidden">
            <div className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold flex items-center gap-2 text-[#C5533B]">
              <AlertTriangle size={16} /> Stok Menipis
            </div>
            <div className="divide-y divide-[#EAE4D8]">
              {low.slice(0, 10).map((l) => (
                <div key={l.item_id} className="px-5 py-3 flex justify-between items-center text-sm">
                  <span>{l.item_name}</span>
                  <span className="text-[#C5533B] font-semibold">{l.current} / {l.par_level} {l.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!fin && low.length === 0 && (
          <div className="card-soft p-12 text-center text-[#5C5C5C]">
            <Database size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-display text-lg font-bold">Belum ada data</p>
            <p className="text-sm mt-1">Jalankan file <code className="bg-[#EAE4D8] px-2 py-0.5 rounded text-xs">seed.sql</code> di Supabase SQL Editor untuk mengisi data demo.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
