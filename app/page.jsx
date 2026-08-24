"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonCards } from "@/components/Skeleton";
import { fmtIDR, ROLE_LABELS, ROLE_COLORS, mondayOf } from "@/lib/format";
import {
  Package, AlertTriangle, TrendingUp, Wallet, Database,
  ShoppingBasket, ChefHat, CalendarDays, BadgeCheck, ScrollText,
  MapPin, Truck, Navigation, Users, ClipboardList, Camera,
  UtensilsCrossed, Scale, FileCheck, CircleDollarSign, Calculator,
  CheckCircle2, Clock, ReceiptText, Stamp,
  HandPlatter, CalendarCheck, HeartPulse, ClipboardCheck, FileText, HelpCircle,
  Settings as SettingsIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function dateToday() {
  return new Date();
}

/** Return ISO date string for this Monday */
function thisMonday() {
  return mondayOf(dateToday());
}

/* ------------------------------------------------------------------ */
/*  Role-specific data fetching                                       */
/* ------------------------------------------------------------------ */

function useDashboardData(activeRole) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData({});
    const role = activeRole || "admin_sppg";
    const weekStart = thisMonday();
    const today = todayStr();

    const fetches = [];

    /* ---- Admin Aplikasi ---- */
    if (role === "admin_apps") {
      fetches.push(
        api.get("/reports/financial")
          .then(({ data }) => setData(d => ({ ...d, fin: data })))
          .catch(() => {}),
        api.get("/reports/low-stock")
          .then(({ data }) => setData(d => ({ ...d, low: data || [] })))
          .catch(() => {}),
        api.get("/users")
          .then(({ data }) => setData(d => ({ ...d, users: data || [] })))
          .catch(() => {}),
        api.get("/purchases")
          .then(({ data }) => setData(d => ({ ...d, purchases: data || [] })))
          .catch(() => {}),
        api.get(`/delivery-plans?plan_date=${today}`)
          .then(({ data }) => setData(d => ({ ...d, deliveryPlans: data || [] })))
          .catch(() => {}),
      );
    }

    /* ---- Admin SPPG ---- */
    if (role === "admin_sppg") {
      fetches.push(
        api.get("/reports/financial")
          .then(({ data }) => setData(d => ({ ...d, fin: data })))
          .catch(() => {}),
        api.get("/reports/low-stock")
          .then(({ data }) => setData(d => ({ ...d, low: data || [] })))
          .catch(() => {}),
        api.get("/users")
          .then(({ data }) => setData(d => ({ ...d, users: data || [] })))
          .catch(() => {}),
        api.get("/purchases")
          .then(({ data }) => setData(d => ({ ...d, purchases: data || [] })))
          .catch(() => {}),
        api.get(`/delivery-plans?plan_date=${today}`)
          .then(({ data }) => setData(d => ({ ...d, deliveryPlans: data || [] })))
          .catch(() => {}),
      );
    }

    /* ---- Akuntan ---- */
    if (role === "accountant") {
      fetches.push(
        api.get("/reports/financial")
          .then(({ data }) => setData(d => ({ ...d, fin: data })))
          .catch(() => {}),
        api.get("/purchases")
          .then(({ data }) => setData(d => ({ ...d, purchases: data || [] })))
          .catch(() => {}),
      );
    }

    /* ---- Kepala Dapur ---- */
    if (role === "kitchen_head") {
      fetches.push(
        api.get("/stock-lots")
          .then(({ data }) => setData(d => ({ ...d, lots: data || [] })))
          .catch(() => {}),
        api.get(`/menus?week_start=${weekStart}`)
          .then(({ data }) => setData(d => ({ ...d, menus: data || [] })))
          .catch(() => {}),
        api.get("/stock-taken")
          .then(({ data }) => setData(d => ({ ...d, stockTaken: data || [] })))
          .catch(() => {}),
        api.get("/recipes")
          .then(({ data }) => setData(d => ({ ...d, recipes: data || [] })))
          .catch(() => {}),
      );
    }

    /* ---- Chef Utama ---- */
    if (role === "head_chef") {
      fetches.push(
        api.get("/recipes")
          .then(({ data }) => setData(d => ({ ...d, recipes: data || [] })))
          .catch(() => {}),
        api.get(`/menus?week_start=${weekStart}`)
          .then(({ data }) => setData(d => ({ ...d, menus: data || [] })))
          .catch(() => {}),
        api.get("/stock-taken")
          .then(({ data }) => setData(d => ({ ...d, stockTaken: data || [] })))
          .catch(() => {}),
        api.get("/stock-lots")
          .then(({ data }) => setData(d => ({ ...d, lots: data || [] })))
          .catch(() => {}),
      );
    }

    /* ---- Aslap (Field Assistant) ---- */
    if (role === "field_assistant") {
      fetches.push(
        api.get("/reports/low-stock")
          .then(({ data }) => setData(d => ({ ...d, low: data || [] })))
          .catch(() => {}),
        api.get(`/delivery-plans?plan_date=${today}`)
          .then(({ data }) => setData(d => ({ ...d, deliveryPlans: data || [] })))
          .catch(() => {}),
        api.get("/purchases")
          .then(({ data }) => setData(d => ({ ...d, purchases: data || [] })))
          .catch(() => {}),
        api.get("/reports/delivery-status")
          .then(({ data }) => setData(d => ({ ...d, deliveryStatus: data })))
          .catch(() => {}),
      );
    }

    /* ---- Ahli Gizi ---- */
    if (role === "nutritionist") {
      fetches.push(
        api.get("/menus/pending")
          .then(({ data }) => setData(d => ({ ...d, menusPending: data || [] })))
          .catch(() => {}),
        api.get("/menus")
          .then(({ data }) => setData(d => ({ ...d, menusAll: data || [] })))
          .catch(() => {}),
        api.get("/recipes")
          .then(({ data }) => setData(d => ({ ...d, recipes: data || [] })))
          .catch(() => {}),
        api.get("/reports/financial")
          .then(({ data }) => setData(d => ({ ...d, fin: data })))
          .catch(() => {}),
      );
    }

    /* ---- Driver ---- */
    if (role === "driver") {
      fetches.push(
        api.get(`/delivery-plans?plan_date=${today}`)
          .then(({ data }) => setData(d => ({ ...d, deliveryPlans: data || [] })))
          .catch(() => {}),
        api.get(`/reports/delivery-status?plan_date=${today}`)
          .then(({ data }) => setData(d => ({ ...d, deliveryStatus: data })))
          .catch(() => {}),
      );
    }

    /* ---- Persiapan ---- */
    if (role === "persiapan") {
      fetches.push(
        api.get("/stock-lots")
          .then(({ data }) => setData(d => ({ ...d, lots: data || [] })))
          .catch(() => {}),
        api.get("/stock-taken")
          .then(({ data }) => setData(d => ({ ...d, stockTaken: data || [] })))
          .catch(() => {}),
        api.get(`/menus?week_start=${weekStart}`)
          .then(({ data }) => setData(d => ({ ...d, menus: data || [] })))
          .catch(() => {}),
      );
    }

    /* ---- Tenaga Masak ---- */
    if (role === "tenaga_masak") {
      fetches.push(
        api.get("/recipes")
          .then(({ data }) => setData(d => ({ ...d, recipes: data || [] })))
          .catch(() => {}),
        api.get("/stock-taken")
          .then(({ data }) => setData(d => ({ ...d, stockTaken: data || [] })))
          .catch(() => {}),
        api.get(`/menus?week_start=${weekStart}`)
          .then(({ data }) => setData(d => ({ ...d, menus: data || [] })))
          .catch(() => {}),
      );
    }

    /* ---- Pemorsian ---- */
    if (role === "pemorsian") {
      fetches.push(
        api.get(`/menus?week_start=${weekStart}`)
          .then(({ data }) => setData(d => ({ ...d, menus: data || [] })))
          .catch(() => {}),
        api.get("/stock-taken")
          .then(({ data }) => setData(d => ({ ...d, stockTaken: data || [] })))
          .catch(() => {}),
      );
    }

    /* ---- Kebersihan ---- */
    if (role === "kebersihan") {
      fetches.push(
        api.get("/stock-lots")
          .then(({ data }) => setData(d => ({ ...d, lots: data || [] })))
          .catch(() => {}),
      );
    }

    /* ---- Pencuci ---- */
    if (role === "pencuci") {
      fetches.push(
        api.get("/stock-lots")
          .then(({ data }) => setData(d => ({ ...d, lots: data || [] })))
          .catch(() => {}),
      );
    }

    Promise.all(fetches).finally(() => setLoading(false));
  }, [activeRole]);

  return { data, loading };
}

/* ------------------------------------------------------------------ */
/*  Cards builder per role                                            */
/* ------------------------------------------------------------------ */

function buildCards(role, d) {
  const s = d.fin?.summary || {};
  const today = todayStr();

  /** Helper: count purchases made today */
  const todayPurchases = (d.purchases || []).filter(
    p => (p.purchased_at || "").slice(0, 10) === today
  );
  /** Helper: total amount of today's purchases */
  const todaySpend = todayPurchases.reduce(
    (sum, p) => sum + (p.amount_idr || 0) + (p.transport_amount_idr || 0),
    0
  );

  switch (role) {
    /* ---------- ADMIN APLIKASI ---------- */
    case "admin_apps": {
      const totalStock = (d.purchases || [])
        .filter(p => p.category === "STOCK")
        .reduce((sum, p) => sum + (p.amount_idr || 0), 0);
      const activeUsers = (d.users || []).filter(u => u.is_active !== false);
      const pendingDeliveries = (d.deliveryPlans || []).reduce(
        (sum, plan) => sum + (plan.delivery_plan_items || []).length, 0
      );

      return [
        { label: "Total Stok", value: totalStock, icon: Package, color: "#1E40AF", currency: true },
        { label: "Total Anggaran", value: s.grand_total || 0, icon: CircleDollarSign, color: "#1E40AF", currency: true },
        { label: "Transaksi Hari Ini", value: todayPurchases.length, icon: ReceiptText, color: "#D97706", currency: false, suffix: " transaksi" },
        { label: "Pengiriman Pending", value: pendingDeliveries, icon: Truck, color: "#C5533B", currency: false },
        { label: "Low Stock", value: (d.low || []).length, icon: AlertTriangle, color: "#C5533B", currency: false },
        { label: "User Aktif", value: activeUsers.length, icon: Users, color: "#1E40AF", currency: false, suffix: ` / ${d.users?.length || 0}` },
      ];
    }

    /* ---------- ADMIN SPPG ---------- */
    case "admin_sppg": {
      const totalStock = (d.purchases || [])
        .filter(p => p.category === "STOCK")
        .reduce((sum, p) => sum + (p.amount_idr || 0), 0);
      const activeUsers = (d.users || []).filter(u => u.is_active !== false);
      const pendingDeliveries = (d.deliveryPlans || []).reduce(
        (sum, plan) => sum + (plan.delivery_plan_items || []).length, 0
      );

      return [
        { label: "Total Stok", value: totalStock, icon: Package, color: "#2D2D2D", currency: true },
        { label: "Total Anggaran", value: s.grand_total || 0, icon: CircleDollarSign, color: "#2D2D2D", currency: true },
        { label: "Transaksi Hari Ini", value: todayPurchases.length, icon: ReceiptText, color: "#D97706", currency: false, suffix: " transaksi" },
        { label: "Pengiriman Pending", value: pendingDeliveries, icon: Truck, color: "#C5533B", currency: false },
        { label: "Low Stock", value: (d.low || []).length, icon: AlertTriangle, color: "#C5533B", currency: false },
        { label: "User Aktif", value: activeUsers.length, icon: Users, color: "#2D2D2D", currency: false, suffix: ` / ${d.users?.length || 0}` },
      ];
    }

    /* ---------- AKUNTAN ---------- */
    case "accountant": {
      const debit = (d.purchases || [])
        .filter(p => p.category === "STOCK")
        .reduce((sum, p) => sum + (p.amount_idr || 0), 0);
      const kredit = (d.purchases || [])
        .filter(p => p.category === "OPERATIONAL")
        .reduce((sum, p) => sum + (p.amount_idr || 0), 0);
      const totalTransport = (d.purchases || [])
        .reduce((sum, p) => sum + (p.transport_amount_idr || 0), 0);
      const unverified = (d.purchases || []).filter(p => !p.verified);
      const todayUnverified = todayPurchases.filter(p => !p.verified);

      return [
        { label: "Transaksi Hari Ini", value: todayPurchases.length, icon: ReceiptText, color: "#2C4251", currency: false, suffix: ` (${fmtIDR(todaySpend)})` },
        { label: "Total Debit (Stock)", value: debit, icon: TrendingUp, color: "#4A7C59", currency: true },
        { label: "Total Kredit (OPEX)", value: kredit, icon: Wallet, color: "#D97706", currency: true },
        { label: "Sisa Anggaran", value: (s.grand_total || 0), icon: Scale, color: "#2C4251", currency: true },
        { label: "Verifikasi Pending", value: unverified.length, icon: FileCheck, color: "#C5533B", currency: false, suffix: unverified.length > 0 ? ` (${todayUnverified.length} hari ini)` : "" },
        { label: "BKU Saldo", value: debit - kredit - totalTransport, icon: Stamp, color: "#6D28D9", currency: true },
      ];
    }

    /* ---------- KEPALA DAPUR ---------- */
    case "kitchen_head": {
      const totalLots = (d.lots || []).length;
      const menusThisWeek = d.menus || [];
      const activeMenus = menusThisWeek.filter(m => m.status !== "DRAFT").length;
      const todayTaken = (d.stockTaken || []).filter(
        t => (t.taken_at || "").slice(0, 10) === today
      );
      const recipeCount = (d.recipes || []).length;

      return [
        { label: "Stok Hari Ini", value: totalLots, icon: Package, color: "#4A7C59", currency: false, suffix: " lot" },
        { label: "Menu Aktif Minggu Ini", value: activeMenus, icon: CalendarCheck, color: "#D97706", currency: false },
        { label: "Pengambilan Barang", value: todayTaken.length, icon: HandPlatter, color: "#C5533B", currency: false, suffix: " hari ini" },
        { label: "Resep Tersedia", value: recipeCount, icon: ChefHat, color: "#4A7C59", currency: false },
      ];
    }

    /* ---------- CHEF UTAMA ---------- */
    case "head_chef": {
      const recipeCount = (d.recipes || []).length;
      const menusThisWeek = d.menus || [];
      const totalMenuDays = menusThisWeek.length;
      const todayTaken = (d.stockTaken || []).filter(
        t => (t.taken_at || "").slice(0, 10) === today
      );
      const cookingLots = (d.lots || []).filter(l => !l.taken_by).length;

      return [
        { label: "Resep Tersedia", value: recipeCount, icon: ChefHat, color: "#D97706", currency: false },
        { label: "Menu Minggu Ini", value: totalMenuDays, icon: CalendarDays, color: "#4A7C59", currency: false, suffix: " hari" },
        { label: "Pengambilan Barang", value: todayTaken.length, icon: HandPlatter, color: "#C5533B", currency: false, suffix: " hari ini" },
        { label: "Stok Bahan Masak", value: cookingLots, icon: UtensilsCrossed, color: "#2C4251", currency: false, suffix: " lot tersedia" },
      ];
    }

    /* ---------- ASLAP ---------- */
    case "field_assistant": {
      const lowStock = (d.low || []).length;
      const deliveryPlans = d.deliveryPlans || [];
      const pendingDeliveryCount = deliveryPlans.reduce(
        (sum, plan) => sum + (plan.delivery_plan_items || []).length, 0
      );
      const unverifiedPurchases = (d.purchases || []).filter(p => !p.verified);
      const delStatus = d.deliveryStatus?.summary || {};

      return [
        { label: "Stok Menipis", value: lowStock, icon: AlertTriangle, color: "#C5533B", currency: false, suffix: " item" },
        { label: "Rencana Antar Hari Ini", value: pendingDeliveryCount, icon: Truck, color: "#D97706", currency: false, suffix: ` (${deliveryPlans.length} rencana)` },
        { label: "Belanja Pending", value: unverifiedPurchases.length, icon: ClipboardList, color: "#C5533B", currency: false },
        { label: "Pengiriman Terkirim", value: delStatus.delivered || 0, icon: CheckCircle2, color: "#4A7C59", currency: false, suffix: ` / ${delStatus.total_destinations || 0}` },
      ];
    }

    /* ---------- AHLI GIZI ---------- */
    case "nutritionist": {
      const menusPending = (d.menusPending || []);
      const allMenus = d.menusAll || [];
      const approvedMenus = allMenus.filter(m => m.status === "APPROVED");
      const recipesWithPhoto = (d.recipes || []).filter(r => r.photo_url);
      const totalPortionsThisWeek = approvedMenus.reduce(
        (sum, m) => sum + (m.portions || 0), 0
      );

      return [
        { label: "Menu Pending Review", value: menusPending.length, icon: Clock, color: "#D97706", currency: false },
        { label: "Menu Disetujui", value: approvedMenus.length, icon: CheckCircle2, color: "#4A7C59", currency: false },
        { label: "Resep dengan Foto", value: recipesWithPhoto.length, icon: Camera, color: "#6D28D9", currency: false, suffix: ` / ${d.recipes?.length || 0}` },
        { label: "Porsi Minggu Ini", value: totalPortionsThisWeek, icon: HeartPulse, color: "#2C4251", currency: false, suffix: " porsi" },
      ];
    }

    /* ---------- DRIVER ---------- */
    case "driver": {
      const plans = d.deliveryPlans || [];
      const totalDests = plans.reduce(
        (sum, plan) => sum + (plan.delivery_plan_items || []).length, 0
      );
      const delSummary = d.deliveryStatus?.summary || {};
      const photosSent = (d.deliveryStatus?.plans || []).reduce((count, plan) => {
        for (const assignment of plan.delivery_assignments || []) {
          for (const log of assignment.delivery_logs || []) {
            if (log.photo_url) count++;
          }
        }
        return count;
      }, 0);

      return [
        { label: "Pengiriman Hari Ini", value: totalDests, icon: Truck, color: "#0891B2", currency: false, suffix: " tujuan" },
        { label: "Status Per Tujuan", value: `${delSummary.delivered || 0}/${delSummary.total_destinations || 0}`, icon: MapPin, color: "#4A7C59", currency: false, suffix: ` terkirim` },
        { label: "Foto Terkirim", value: photosSent, icon: Camera, color: "#D97706", currency: false, suffix: " foto" },
      ];
    }

    /* ---------- PERSIAPAN ---------- */
    case "persiapan": {
      const totalLots = (d.lots || []).length;
      const todayTaken = (d.stockTaken || []).filter(
        t => (t.taken_at || "").slice(0, 10) === today
      );
      const menusToday = (d.menus || []).filter(m => m.day === ["mon","tue","wed","thu","fri"][new Date().getDay() - 1]);
      const totalPortions = menusToday.reduce((sum, m) => sum + (m.portions || 0), 0);

      return [
        { label: "Bahan Tersedia", value: totalLots, icon: Package, color: "#16A34A", currency: false, suffix: " lot" },
        { label: "Pengambilan Hari Ini", value: todayTaken.length, icon: HandPlatter, color: "#D97706", currency: false, suffix: " item diambil" },
        { label: "Menu Hari Ini", value: menusToday.length, icon: CalendarDays, color: "#16A34A", currency: false },
        { label: "Total Porsi", value: totalPortions, icon: UtensilsCrossed, color: "#2C4251", currency: false, suffix: " porsi" },
      ];
    }

    /* ---------- TENAGA MASAK ---------- */
    case "tenaga_masak": {
      const recipeCount = (d.recipes || []).length;
      const todayTaken = (d.stockTaken || []).filter(
        t => (t.taken_at || "").slice(0, 10) === today
      );
      const menusToday = (d.menus || []).filter(m => m.day === ["mon","tue","wed","thu","fri"][new Date().getDay() - 1]);
      const totalPortions = menusToday.reduce((sum, m) => sum + (m.portions || 0), 0);

      return [
        { label: "Resep Tersedia", value: recipeCount, icon: ChefHat, color: "#EA580C", currency: false },
        { label: "Bahan Diambil", value: todayTaken.length, icon: HandPlatter, color: "#D97706", currency: false, suffix: " item" },
        { label: "Menu Hari Ini", value: menusToday.length, icon: CalendarDays, color: "#EA580C", currency: false },
        { label: "Target Porsi", value: totalPortions, icon: UtensilsCrossed, color: "#2C4251", currency: false, suffix: " porsi" },
      ];
    }

    /* ---------- PEMORSIAN ---------- */
    case "pemorsian": {
      const menusToday = (d.menus || []).filter(m => m.day === ["mon","tue","wed","thu","fri"][new Date().getDay() - 1]);
      const totalPortions = menusToday.reduce((sum, m) => sum + (m.portions || 0), 0);

      return [
        { label: "Menu Hari Ini", value: menusToday.length, icon: CalendarDays, color: "#7C3AED", currency: false },
        { label: "Total Porsi", value: totalPortions, icon: UtensilsCrossed, color: "#7C3AED", currency: false, suffix: " porsi" },
        { label: "Target Selesai", value: "0/" + totalPortions, icon: CheckCircle2, color: "#5C5C5C", currency: false, suffix: " ompreng" },
      ];
    }

    /* ---------- KEBERSIHAN ---------- */
    case "kebersihan": {
      return [
        { label: "Status Kebersihan", value: "Harian", icon: CheckCircle2, color: "#059669", currency: false },
        { label: "Area Dapur", value: "Siap", icon: ClipboardCheck, color: "#059669", currency: false },
      ];
    }

    /* ---------- PENCUCI ---------- */
    case "pencuci": {
      return [
        { label: "Status Pencucian", value: "Harian", icon: CheckCircle2, color: "#0284C7", currency: false },
        { label: "Ompreng Hari Ini", value: "0", icon: UtensilsCrossed, color: "#0284C7", currency: false, suffix: " buah" },
      ];
    }

    default:
      return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Low stock list (shared)                                           */
/* ------------------------------------------------------------------ */

function LowStockList({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="card-soft overflow-hidden">
      <div className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold flex items-center gap-2 text-[#C5533B]">
        <AlertTriangle size={16} /> Stok Menipis
      </div>
      <div className="divide-y divide-[#EAE4D8]">
        {items.slice(0, 8).map((l) => (
          <div key={l.item_id} className="px-5 py-3 flex justify-between items-center text-sm">
            <span className="font-medium">{l.item_name}</span>
            <span className="text-[#C5533B] font-semibold audit-ts">
              {l.current} / {l.par_level} {l.unit}
            </span>
          </div>
        ))}
        {items.length > 8 && (
          <div className="px-5 py-2 text-xs text-[#5C5C5C] text-center">
            +{items.length - 8} item lainnya
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Delivery status detail (shared for Aslap)                         */
/* ------------------------------------------------------------------ */

function DeliveryStatusDetail({ deliveryStatus, deliveryPlans }) {
  const plans = deliveryPlans || [];
  if (plans.length === 0) return null;

  const summary = deliveryStatus?.summary || {};
  const today = todayStr();

  return (
    <div className="card-soft overflow-hidden">
      <div className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold flex items-center gap-2 text-[#2C4251]">
        <Truck size={16} /> Status Pengiriman Hari Ini
      </div>
      <div className="divide-y divide-[#EAE4D8]">
        {plans.slice(0, 5).map((plan) => {
          const items = plan.delivery_plan_items || [];
          return items.slice(0, 3).map((item, idx) => {
            const destName = item.destinations?.name || "Tujuan";
            return (
              <div key={`${plan.id}-${idx}`} className="px-5 py-3 flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <MapPin size={12} className="text-[#4A7C59]" />
                  {destName}
                  <span className="tag text-[10px]" style={{ background: "#C5533B1A", color: "#C5533B" }}>
                    {item.category}
                  </span>
                </span>
                <span className="font-semibold audit-ts text-[#5C5C5C]">{item.portions} porsi</span>
              </div>
            );
          });
        })}
      </div>
      {/* Summary bar */}
      {summary.total_destinations > 0 && (
        <div className="px-5 py-3 border-t border-[#EAE4D8] bg-[#F9F6F0] flex gap-4 text-xs">
          <span className="text-[#4A7C59] font-semibold">Terkirim: {summary.delivered || 0}</span>
          <span className="text-[#D97706] font-semibold">Dalam Perjalanan: {summary.in_transit || 0}</span>
          <span className="text-[#C5533B] font-semibold">Belum: {summary.not_delivered || 0}</span>
          <span className="text-[#5C5C5C] font-semibold">Pending: {summary.pending || 0}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Link                                                        */
/* ------------------------------------------------------------------ */

function QuickLink({ href, label, icon: Icon }) {
  return (
    <Link
      href={href}
      className="card-soft p-4 flex items-center gap-3 hover:bg-[#F9F6F0] transition-colors group"
    >
      <div className="w-9 h-9 rounded-lg bg-[#4A7C59]/10 text-[#4A7C59] grid place-items-center group-hover:bg-[#4A7C59]/20 transition-colors">
        <Icon size={16} />
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick links per role                                              */
/* ------------------------------------------------------------------ */

function QuickLinks({ role }) {
  const links = (() => {
    switch (role) {
      case "admin_apps":
        return [
          { href: "/global-config", label: "Konfigurasi Global", icon: SettingsIcon },
          { href: "/users", label: "Pengguna", icon: Users },
          { href: "/reports", label: "Laporan", icon: ScrollText },
          { href: "/audit", label: "Audit Trail", icon: ClipboardList },
        ];
      case "admin_sppg":
        return [
          { href: "/settings", label: "Pengaturan SPPG", icon: SettingsIcon },
          { href: "/users", label: "Pengguna", icon: Users },
          { href: "/item-hierarchy", label: "Hirarki Barang", icon: Database },
          { href: "/reports", label: "Laporan", icon: ScrollText },
        ];
      case "accountant":
        return [
          { href: "/procurement", label: "Belanja & Verifikasi", icon: ShoppingBasket },
          { href: "/reports", label: "Laporan", icon: ScrollText },
          { href: "/audit", label: "Audit Trail", icon: ClipboardList },
        ];
      case "kitchen_head":
        return [
          { href: "/inventory", label: "Stok & Opname", icon: Package },
          { href: "/recipes", label: "Resep", icon: ChefHat },
          { href: "/menu", label: "Menu", icon: CalendarDays },
        ];
      case "head_chef":
        return [
          { href: "/recipes", label: "Resep", icon: ChefHat },
          { href: "/menu", label: "Menu", icon: CalendarDays },
          { href: "/inventory", label: "Stok", icon: Package },
        ];
      case "field_assistant":
        return [
          { href: "/inventory", label: "Stok & Opname", icon: Package },
          { href: "/procurement", label: "Belanja & Struk", icon: ShoppingBasket },
          { href: "/destinations", label: "Tujuan Antar", icon: MapPin },
          { href: "/deliveries", label: "Rencana Antar", icon: Truck },
          { href: "/reports", label: "Laporan", icon: ScrollText },
        ];
      case "nutritionist":
        return [
          { href: "/recipes", label: "Resep & Gizi", icon: ChefHat },
          { href: "/menu", label: "Menu", icon: CalendarDays },
          { href: "/approval", label: "Persetujuan", icon: BadgeCheck },
          { href: "/nutrition-calc", label: "Kalkulator Gizi", icon: Calculator },
        ];
      case "driver":
        return [
          { href: "/delivery-tracking", label: "Tracking Pengantaran", icon: Navigation },
        ];
      case "persiapan":
        return [
          { href: "/inventory", label: "Stok & Pengambilan", icon: Package },
          { href: "/recipes", label: "Resep", icon: ChefHat },
          { href: "/menu", label: "Menu Hari Ini", icon: CalendarDays },
        ];
      case "tenaga_masak":
        return [
          { href: "/recipes", label: "Resep & Gizi", icon: ChefHat },
          { href: "/menu", label: "Menu & Porsi", icon: CalendarDays },
          { href: "/inventory", label: "Stok Bahan", icon: Package },
        ];
      case "pemorsian":
        return [
          { href: "/pemorsian", label: "Tugas Harian", icon: Camera },
          { href: "/menu", label: "Menu Hari Ini", icon: CalendarDays },
          { href: "/inventory", label: "Stok & Pengambilan", icon: Package },
        ];
      case "kebersihan":
        return [
          { href: "/pemorsian", label: "Tugas Harian", icon: Camera },
          { href: "/inventory", label: "Stok & Opname", icon: Package },
        ];
      case "pencuci":
        return [
          { href: "/pemorsian", label: "Tugas Harian", icon: Camera },
          { href: "/inventory", label: "Stok & Opname", icon: Package },
        ];
      default:
        return [];
    }
  })();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {links.map((link) => (
        <QuickLink key={link.href} {...link} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { activeRole } = useAuth();
  const role = activeRole || "admin";
  const { data, loading } = useDashboardData(activeRole);

  const cards = useMemo(() => buildCards(role, data), [role, data]);
  const roleColor = ROLE_COLORS[role] || "#2D2D2D";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-4xl font-bold">Dasbor</h1>
          <p className="text-[#5C5C5C] mt-1">
            Ringkasan untuk{" "}
            <span className="font-semibold" style={{ color: roleColor }}>
              {ROLE_LABELS[role]}
            </span>
          </p>
        </div>

        {loading ? (
          <SkeletonCards count={cards.length || 6} />
        ) : (
          <>
            {/* Stat Cards */}
            {cards.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map(({ label, value, currency, icon: Icon, color, suffix }) => (
                  <div key={label} className="card-soft p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] uppercase tracking-widest text-[#5C5C5C]">
                        {label}
                      </div>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div
                      className="font-display font-bold text-2xl mt-2"
                      style={{ color }}
                    >
                      {currency ? fmtIDR(value) : value}
                      {suffix ? (
                        <span className="text-sm font-medium ml-1">{suffix}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {cards.length === 0 && (
              <div className="card-soft p-12 text-center text-[#5C5C5C]">
                <Database size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-display text-lg font-bold">Belum ada data</p>
                <p className="text-sm mt-1">
                  Jalankan file{" "}
                  <code className="bg-[#EAE4D8] px-2 py-0.5 rounded text-xs">
                    seed.sql
                  </code>{" "}
                  di Supabase SQL Editor.
                </p>
              </div>
            )}

            {/* Role-specific detail sections */}
            {(role === "admin_apps" || role === "admin_sppg") && (data.low || []).length > 0 && (
              <LowStockList items={data.low} />
            )}

            {role === "field_assistant" && (data.low || []).length > 0 && (
              <LowStockList items={data.low} />
            )}

            {role === "field_assistant" && (
              <DeliveryStatusDetail
                deliveryStatus={data.deliveryStatus}
                deliveryPlans={data.deliveryPlans}
              />
            )}

            {role === "nutritionist" && (data.menusPending || []).length > 0 && (
              <div className="card-soft overflow-hidden">
                <div className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold flex items-center gap-2 text-[#D97706]">
                  <Clock size={16} /> Menu Menunggu Review
                </div>
                <div className="divide-y divide-[#EAE4D8]">
                  {data.menusPending.slice(0, 5).map((m) => (
                    <div key={m.id} className="px-5 py-3 flex justify-between items-center text-sm">
                      <div>
                        <span className="font-semibold">{m.day}</span>
                        <span className="text-[#5C5C5C] ml-2">minggu {m.week_start}</span>
                      </div>
                      <span className="font-semibold audit-ts text-[#D97706]">{m.portions} porsi</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {role === "driver" && (data.deliveryPlans || []).length === 0 && (
              <div className="card-soft p-8 text-center text-[#5C5C5C]">
                <Navigation size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-display text-lg font-bold">Tidak ada pengiriman hari ini</p>
                <p className="text-sm mt-1">Anda belum ditugaskan untuk hari ini.</p>
              </div>
            )}

            {role === "driver" && (data.deliveryPlans || []).length > 0 && (
              <div className="card-soft overflow-hidden">
                <div className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold flex items-center gap-2 text-[#0891B2]">
                  <Truck size={16} /> Pengiriman Hari Ini
                </div>
                <div className="divide-y divide-[#EAE4D8]">
                  {data.deliveryPlans.slice(0, 5).map((plan) => {
                    const items = plan.delivery_plan_items || [];
                    return items.map((item, idx) => (
                      <div key={`${plan.id}-${idx}`} className="px-5 py-3 flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <MapPin size={12} className="text-[#4A7C59]" />
                          {item.destinations?.name || "Tujuan"}
                        </span>
                        <span className="tag text-xs" style={{ background: "#0891B21A", color: "#0891B2" }}>
                          {item.portions} porsi
                        </span>
                      </div>
                    ));
                  })}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <QuickLinks role={role} />
          </>
        )}
      </div>
    </Layout>
  );
}
