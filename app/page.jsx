"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonCards } from "@/components/Skeleton";
import { fmtIDR, ROLE_LABELS, ROLE_COLORS } from "@/lib/format";
import {
  Package, AlertTriangle, TrendingUp, Wallet, Database,
  ShoppingBasket, ChefHat, CalendarDays, BadgeCheck, ScrollText
} from "lucide-react";

export default function DashboardPage() {
  const { activeRole } = useAuth();
  const [fin, setFin] = useState(null);
  const [low, setLow] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [menus, setMenus] = useState([]);
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const promises = [
      api.get("/reports/financial").then(({ data }) => setFin(data)).catch(() => {}),
      api.get("/reports/low-stock").then(({ data }) => setLow(data)).catch(() => {}),
      api.get("/items").then(({ data }) => setItems(data || [])).catch(() => {}),
      api.get("/recipes").then(({ data }) => setRecipes(data || [])).catch(() => {}),
    ];
    if (activeRole === "nutritionist" || activeRole === "head_chef" || activeRole === "admin") {
      promises.push(api.get("/menus").then(({ data }) => setMenus(data)).catch(() => {}));
    }
    Promise.all(promises).finally(() => setLoading(false));
  }, [activeRole]);

  const s = fin?.summary || {};
  const role = activeRole || "admin";

  const cards = (() => {
    function rp(v) { return { value: v, currency: true }; }
    function ct(v) { return { value: v, currency: false }; }
    switch (role) {
      case "admin":
        return [
          { label: "Total Stok", ...rp(s.total_stock), icon: Package, color: "#4A7C59" },
          { label: "Total OPEX", ...rp(s.total_opex), icon: Wallet, color: "#D97706" },
          { label: "Transport", ...rp(s.total_transport), icon: TrendingUp, color: "#2C4251" },
          { label: "Low Stock", ...ct(low.length), icon: AlertTriangle, color: "#C5533B" },
          { label: "Total Transaksi", ...ct(s.total_count || 0), icon: ShoppingBasket, color: "#6D28D9" },
          { label: "Tervalidasi", ...ct(`${s.verified_count || 0}/${s.total_count || 0}`), icon: BadgeCheck, color: "#4A7C59" },
        ];
      case "accountant":
        return [
          { label: "Total Stok", ...rp(s.total_stock), icon: Package, color: "#2C4251" },
          { label: "Total OPEX", ...rp(s.total_opex), icon: Wallet, color: "#2C4251" },
          { label: "Grand Total", ...rp(s.grand_total), icon: TrendingUp, color: "#2C4251" },
          { label: "Tervalidasi", ...ct(`${s.verified_count || 0}/${s.total_count || 0}`), icon: BadgeCheck, color: "#4A7C59" },
          { label: "Belum Validasi", ...ct((s.total_count || 0) - (s.verified_count || 0)), icon: AlertTriangle, color: "#C5533B" },
        ];
      case "kitchen_head":
      case "head_chef":
        return [
          { label: "Bahan Aktif", ...ct(items.length), icon: Package, color: "#4A7C59" },
          { label: "Low Stock", ...ct(low.length), icon: AlertTriangle, color: "#C5533B" },
          { label: "Menu Aktif", ...ct(menus.filter(m => m.status !== "DRAFT").length), icon: CalendarDays, color: "#D97706" },
          { label: "Resep", ...ct(recipes.length), icon: ChefHat, color: "#4A7C59" },
        ];
      case "field_assistant":
        return [
          { label: "Total Belanja", ...rp(s.grand_total), icon: ShoppingBasket, color: "#C5533B" },
          { label: "Transaksi", ...ct(s.total_count || 0), icon: Wallet, color: "#C5533B" },
          { label: "Belum Validasi", ...ct((s.total_count || 0) - (s.verified_count || 0)), icon: AlertTriangle, color: "#C5533B" },
        ];
      case "field_staff":
        return [
          { label: "Low Stock", ...ct(low.length), icon: AlertTriangle, color: "#8B6F3A" },
          { label: "Total Bahan", ...ct(items.length), icon: Package, color: "#8B6F3A" },
          { label: "Opname Terakhir", ...ct("—"), icon: Database, color: "#8B6F3A" },
        ];
      case "nutritionist":
        return [
          { label: "Menu Disetujui", ...ct(menus.filter(m => m.status === "APPROVED").length), icon: BadgeCheck, color: "#6D28D9" },
          { label: "Menunggu Review", ...ct(menus.filter(m => m.status === "PENDING_REVIEW").length), icon: AlertTriangle, color: "#D97706" },
          { label: "Menu Draft", ...ct(menus.filter(m => m.status === "DRAFT").length), icon: CalendarDays, color: "#6D28D9" },
        ];
      default:
        return [
          { label: "Total Stok", ...rp(s.total_stock), icon: Package, color: "#4A7C59" },
          { label: "Low Stock", ...ct(low.length), icon: AlertTriangle, color: "#C5533B" },
        ];
    }
  })();

  const noData = !fin && low.length === 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-bold">Dasbor</h1>
          <p className="text-[#5C5C5C] mt-1">
            Ringkasan untuk <span className="font-semibold" style={{ color: ROLE_COLORS[role] }}>{ROLE_LABELS[role]}</span>
          </p>
        </div>

        {loading ? (
          <SkeletonCards count={6} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map(({ label, value, currency, icon: Icon, color }) => (
                <div key={label} className="card-soft p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] uppercase tracking-widest text-[#5C5C5C]">{label}</div>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div className="font-display font-bold text-2xl mt-2" style={{ color }}>
                    {currency ? fmtIDR(value) : value}
                  </div>
                </div>
              ))}
            </div>

            {noData && (
              <div className="card-soft p-12 text-center text-[#5C5C5C]">
                <Database size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-display text-lg font-bold">Belum ada data</p>
                <p className="text-sm mt-1">Jalankan file <code className="bg-[#EAE4D8] px-2 py-0.5 rounded text-xs">seed.sql</code> di Supabase SQL Editor.</p>
              </div>
            )}

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
          </>
        )}

        {/* Role-specific quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {role === "admin" && (
            <>
              <QuickLink href="/reports" label="Laporan PDF" icon={ScrollText} />
              <QuickLink href="/procurement" label="Belanja" icon={ShoppingBasket} />
              <QuickLink href="/menu" label="Menu" icon={CalendarDays} />
              <QuickLink href="/audit" label="Audit Trail" icon={ScrollText} />
            </>
          )}
          {role === "accountant" && (
            <>
              <QuickLink href="/reports" label="Laporan" icon={ScrollText} />
              <QuickLink href="/procurement" label="Verifikasi" icon={BadgeCheck} />
              <QuickLink href="/audit" label="Audit" icon={ScrollText} />
            </>
          )}
          {(role === "kitchen_head" || role === "head_chef") && (
            <>
              <QuickLink href="/inventory" label="Stok" icon={Package} />
              <QuickLink href="/menu" label="Menu" icon={CalendarDays} />
              <QuickLink href="/tva" label="TvA" icon={TrendingUp} />
            </>
          )}
          {role === "field_assistant" && (
            <QuickLink href="/procurement" label="Belanja & Struk" icon={ShoppingBasket} />
          )}
          {role === "field_staff" && (
            <QuickLink href="/inventory" label="Stok (FEFO)" icon={Package} />
          )}
          {role === "nutritionist" && (
            <>
              <QuickLink href="/approval" label="Persetujuan" icon={BadgeCheck} />
              <QuickLink href="/recipes" label="Resep & Gizi" icon={ChefHat} />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

function QuickLink({ href, label, icon: Icon }) {
  return (
    <Link href={href} className="card-soft p-4 flex items-center gap-3 hover:bg-[#F9F6F0] transition-colors">
      <div className="w-9 h-9 rounded-lg bg-[#4A7C59]/10 text-[#4A7C59] grid place-items-center">
        <Icon size={16} />
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}
