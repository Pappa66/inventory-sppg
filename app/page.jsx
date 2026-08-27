"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonCards } from "@/components/Skeleton";
import { fmtIDR, ROLE_LABELS, ROLE_COLORS, mondayOf, DAYS } from "@/lib/format";
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

function getTodayKey() {
  const di = new Date().getDay();
  if (di >= 1 && di <= 5) return DAYS[di - 1].key;
  return null;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat Pagi";
  if (h < 15) return "Selamat Siang";
  if (h < 18) return "Selamat Sore";
  return "Selamat Malam";
}

function formatDateID() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Role-specific data fetching                                       */
/* ------------------------------------------------------------------ */

function useDashboardData(activeRole) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchErrors, setFetchErrors] = useState(0);

  useEffect(() => {
    if (!activeRole) return;
    setLoading(true);
    setData({});
    setFetchErrors(0);
    const role = activeRole;
    const weekStart = mondayOf(new Date());
    const today = todayStr();

    const fetches = [];

    /* ---- Admin Aplikasi & SPPG (shared) ---- */
    if (role === "admin_apps" || role === "admin_sppg") {
      fetches.push(
        api.get("/reports/financial")
          .then(({ data }) => setData(d => ({ ...d, fin: data })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/reports/low-stock")
          .then(({ data }) => setData(d => ({ ...d, low: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/users")
          .then(({ data }) => setData(d => ({ ...d, users: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/purchases")
          .then(({ data }) => setData(d => ({ ...d, purchases: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get(`/delivery-plans?plan_date=${today}`)
          .then(({ data }) => setData(d => ({ ...d, deliveryPlans: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
      );
    }

    /* ---- Akuntan ---- */
    if (role === "accountant") {
      fetches.push(
        api.get("/reports/financial")
          .then(({ data }) => setData(d => ({ ...d, fin: data })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/purchases")
          .then(({ data }) => setData(d => ({ ...d, purchases: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
      );
    }

    /* ---- Kepala Dapur ---- */
    if (role === "kitchen_head") {
      fetches.push(
        api.get("/stock-lots")
          .then(({ data }) => setData(d => ({ ...d, lots: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get(`/menus?week_start=${weekStart}`)
          .then(({ data }) => setData(d => ({ ...d, menus: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/stock-taken")
          .then(({ data }) => setData(d => ({ ...d, stockTaken: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/recipes")
          .then(({ data }) => setData(d => ({ ...d, recipes: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get(`/daily-tasks?task_date=${today}`)
          .then(({ data }) => setData(d => ({ ...d, dailyReports: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/purchases")
          .then(({ data }) => setData(d => ({ ...d, purchases: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
      );
    }

    /* ---- Chef Utama ---- */
    if (role === "head_chef") {
      fetches.push(
        api.get("/recipes")
          .then(({ data }) => setData(d => ({ ...d, recipes: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get(`/menus?week_start=${weekStart}`)
          .then(({ data }) => setData(d => ({ ...d, menus: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/stock-taken")
          .then(({ data }) => setData(d => ({ ...d, stockTaken: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/stock-lots")
          .then(({ data }) => setData(d => ({ ...d, lots: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
      );
    }

    /* ---- Aslap ---- */
    if (role === "field_assistant") {
      fetches.push(
        api.get("/reports/low-stock")
          .then(({ data }) => setData(d => ({ ...d, low: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get(`/delivery-plans?plan_date=${today}`)
          .then(({ data }) => setData(d => ({ ...d, deliveryPlans: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/purchases")
          .then(({ data }) => setData(d => ({ ...d, purchases: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/reports/delivery-status")
          .then(({ data }) => setData(d => ({ ...d, deliveryStatus: data })))
          .catch(() => setFetchErrors(e => e + 1)),
      );
    }

    /* ---- Ahli Gizi ---- */
    if (role === "nutritionist") {
      fetches.push(
        api.get("/menus/pending")
          .then(({ data }) => setData(d => ({ ...d, menusPending: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/menus")
          .then(({ data }) => setData(d => ({ ...d, menusAll: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/recipes")
          .then(({ data }) => setData(d => ({ ...d, recipes: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/reports/financial")
          .then(({ data }) => setData(d => ({ ...d, fin: data })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/items")
          .then(({ data }) => setData(d => ({ ...d, items: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
      );
    }

    /* ---- Driver ---- */
    if (role === "driver") {
      fetches.push(
        api.get(`/delivery-plans?plan_date=${today}`)
          .then(({ data }) => setData(d => ({ ...d, deliveryPlans: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get(`/reports/delivery-status?plan_date=${today}`)
          .then(({ data }) => setData(d => ({ ...d, deliveryStatus: data })))
          .catch(() => setFetchErrors(e => e + 1)),
      );
    }

    /* ---- Persiapan ---- */
    if (role === "persiapan") {
      fetches.push(
        api.get("/stock-lots")
          .then(({ data }) => setData(d => ({ ...d, lots: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/stock-taken")
          .then(({ data }) => setData(d => ({ ...d, stockTaken: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get(`/menus?week_start=${weekStart}`)
          .then(({ data }) => setData(d => ({ ...d, menus: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/recipes")
          .then(({ data }) => setData(d => ({ ...d, recipes: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/items")
          .then(({ data }) => setData(d => ({ ...d, items: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
      );
    }

    /* ---- Tenaga Masak ---- */
    if (role === "tenaga_masak") {
      fetches.push(
        api.get("/recipes")
          .then(({ data }) => setData(d => ({ ...d, recipes: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/stock-taken")
          .then(({ data }) => setData(d => ({ ...d, stockTaken: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get(`/menus?week_start=${weekStart}`)
          .then(({ data }) => setData(d => ({ ...d, menus: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/items")
          .then(({ data }) => setData(d => ({ ...d, items: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
      );
    }

    /* ---- Pemorsian ---- */
    if (role === "pemorsian") {
      fetches.push(
        api.get(`/menus?week_start=${weekStart}`)
          .then(({ data }) => setData(d => ({ ...d, menus: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get("/stock-taken")
          .then(({ data }) => setData(d => ({ ...d, stockTaken: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
      );
    }

    /* ---- Kebersihan ---- */
    if (role === "kebersihan") {
      fetches.push(
        api.get(`/daily-tasks?task_date=${today}&role=kebersihan`)
          .then(({ data }) => setData(d => ({ ...d, todayTasks: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get(`/menus?week_start=${weekStart}`)
          .then(({ data }) => setData(d => ({ ...d, menus: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
      );
    }

    /* ---- Pencuci ---- */
    if (role === "pencuci") {
      fetches.push(
        api.get(`/daily-tasks?task_date=${today}&role=pencuci`)
          .then(({ data }) => setData(d => ({ ...d, todayTasks: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
        api.get(`/delivery-plans?plan_date=${today}`)
          .then(({ data }) => setData(d => ({ ...d, deliveryPlans: data || [] })))
          .catch(() => setFetchErrors(e => e + 1)),
      );
    }

    Promise.all(fetches).finally(() => setLoading(false));
  }, [activeRole]);

  return { data, loading, fetchErrors };
}

/* ------------------------------------------------------------------ */
/*  Cards builder per role                                            */
/* ------------------------------------------------------------------ */

function buildCards(role, d) {
  const s = d.fin?.summary || {};
  const today = todayStr();
  const todayKey = getTodayKey();

  const todayPurchases = (d.purchases || []).filter(
    p => (p.purchased_at || "").slice(0, 10) === today
  );
  const todaySpend = todayPurchases.reduce(
    (sum, p) => sum + (p.amount_idr || 0) + (p.transport_amount_idr || 0), 0
  );

  switch (role) {
    /* ---------- ADMIN APLIKASI ---------- */
    case "admin_apps": {
      const totalStock = (d.purchases || []).filter(p => p.category === "STOCK").reduce((sum, p) => sum + (p.amount_idr || 0), 0);
      const activeUsers = (d.users || []).filter(u => u.is_active !== false);
      const pendingDeliveries = (d.deliveryPlans || []).reduce((sum, plan) => sum + (plan.delivery_plan_items || []).length, 0);

      return [
        { label: "Total Anggaran", value: s.grand_total || 0, icon: CircleDollarSign, color: "#1E40AF", currency: true, primary: true },
        { label: "Stok Dibeli", value: totalStock, icon: Package, color: "#2D2D2D", currency: true },
        { label: "Transaksi Hari Ini", value: todayPurchases.length, icon: ReceiptText, color: "#D97706", suffix: " trx" },
        { label: "Pengiriman Pending", value: pendingDeliveries, icon: Truck, color: "#C5533B" },
        { label: "Stok Menipis", value: (d.low || []).length, icon: AlertTriangle, color: "#C5533B" },
        { label: "User Aktif", value: activeUsers.length, icon: Users, color: "#1E40AF", suffix: `/${d.users?.length || 0}` },
      ];
    }

    /* ---------- ADMIN SPPG ---------- */
    case "admin_sppg": {
      const totalStock = (d.purchases || []).filter(p => p.category === "STOCK").reduce((sum, p) => sum + (p.amount_idr || 0), 0);
      const activeUsers = (d.users || []).filter(u => u.is_active !== false);
      const pendingDeliveries = (d.deliveryPlans || []).reduce((sum, plan) => sum + (plan.delivery_plan_items || []).length, 0);

      return [
        { label: "Total Anggaran", value: s.grand_total || 0, icon: CircleDollarSign, color: "#2D2D2D", currency: true, primary: true },
        { label: "Stok Dibeli", value: totalStock, icon: Package, color: "#2D2D2D", currency: true },
        { label: "Transaksi Hari Ini", value: todayPurchases.length, icon: ReceiptText, color: "#D97706", suffix: " trx" },
        { label: "Pengiriman Pending", value: pendingDeliveries, icon: Truck, color: "#C5533B" },
        { label: "Stok Menipis", value: (d.low || []).length, icon: AlertTriangle, color: "#C5533B" },
        { label: "User Aktif", value: activeUsers.length, icon: Users, color: "#2D2D2D", suffix: `/${d.users?.length || 0}` },
      ];
    }

    /* ---------- AKUNTAN ---------- */
    case "accountant": {
      const debit = (d.purchases || []).filter(p => p.category === "STOCK").reduce((sum, p) => sum + (p.amount_idr || 0), 0);
      const kredit = (d.purchases || []).filter(p => p.category === "OPERATIONAL").reduce((sum, p) => sum + (p.amount_idr || 0), 0);
      const totalTransport = (d.purchases || []).reduce((sum, p) => sum + (p.transport_amount_idr || 0), 0);
      const unverified = (d.purchases || []).filter(p => !p.verified);

      return [
        { label: "Anggaran", value: s.grand_total || 0, icon: Scale, color: "#2C4251", currency: true, primary: true },
        { label: "Bahan Baku", value: debit, icon: TrendingUp, color: "#4A7C59", currency: true },
        { label: "Operasional", value: kredit, icon: Wallet, color: "#D97706", currency: true },
        { label: "Verifikasi Pending", value: unverified.length, icon: FileCheck, color: "#C5533B" },
        { label: "Transaksi Hari Ini", value: todayPurchases.length, icon: ReceiptText, color: "#2C4251", suffix: fmtIDR(todaySpend) },
        { label: "BKU Saldo Kas", value: debit - kredit - totalTransport, icon: Stamp, color: "#6D28D9", currency: true },
      ];
    }

    /* ---------- KEPALA DAPUR ---------- */
    case "kitchen_head": {
      const totalLots = (d.lots || []).length;
      const menusThisWeek = d.menus || [];
      const activeMenus = menusThisWeek.filter(m => m.status !== "DRAFT").length;
      const todayTaken = (d.stockTaken || []).filter(t => (t.taken_at || "").slice(0, 10) === today);
      const dailyReports = d.dailyReports || [];
      const completedReports = dailyReports.filter(t => t.status === "SELESAI").length;
      const recipeCount = (d.recipes || []).length;

      return [
        { label: "Laporan Staf", value: `${completedReports}/${dailyReports.length}`, icon: ClipboardList, color: "#4A7C59", primary: true },
        { label: "Stok Tersedia", value: totalLots, icon: Package, color: "#2C4251", suffix: " lot" },
        { label: "Menu Aktif", value: activeMenus, icon: CalendarCheck, color: "#D97706" },
        { label: "Pengambilan", value: todayTaken.length, icon: HandPlatter, color: "#C5533B", suffix: " hari ini" },
        { label: "Resep", value: recipeCount, icon: ChefHat, color: "#0E7490" },
      ];
    }

    /* ---------- CHEF UTAMA ---------- */
    case "head_chef": {
      const recipeCount = (d.recipes || []).length;
      const menusThisWeek = d.menus || [];
      const todayTaken = (d.stockTaken || []).filter(t => (t.taken_at || "").slice(0, 10) === today);
      const cookingLots = (d.lots || []).filter(l => !l.taken_by).length;

      return [
        { label: "Resep", value: recipeCount, icon: ChefHat, color: "#D97706", primary: true },
        { label: "Menu Minggu Ini", value: menusThisWeek.length, icon: CalendarDays, color: "#4A7C59", suffix: " hari" },
        { label: "Pengambilan", value: todayTaken.length, icon: HandPlatter, color: "#C5533B", suffix: " hari ini" },
        { label: "Stok Bahan", value: cookingLots, icon: UtensilsCrossed, color: "#2C4251", suffix: " lot" },
      ];
    }

    /* ---------- ASLAP ---------- */
    case "field_assistant": {
      const lowStock = (d.low || []).length;
      const deliveryPlans = d.deliveryPlans || [];
      const pendingDeliveryCount = deliveryPlans.reduce((sum, plan) => sum + (plan.delivery_plan_items || []).length, 0);
      const unverifiedPurchases = (d.purchases || []).filter(p => !p.verified);
      const delStatus = d.deliveryStatus?.summary || {};

      return [
        { label: "Pengiriman Terkirim", value: `${delStatus.delivered || 0}/${delStatus.total_destinations || 0}`, icon: CheckCircle2, color: "#4A7C59", primary: true },
        { label: "Rencana Antar", value: pendingDeliveryCount, icon: Truck, color: "#D97706", suffix: `${deliveryPlans.length} rencana` },
        { label: "Stok Menipis", value: lowStock, icon: AlertTriangle, color: "#C5533B", suffix: " item" },
        { label: "Belanja Pending", value: unverifiedPurchases.length, icon: ClipboardList, color: "#C5533B" },
      ];
    }

    /* ---------- AHLI GIZI ---------- */
    case "nutritionist": {
      const menusPending = d.menusPending || [];
      const allMenus = d.menusAll || [];
      const approvedMenus = allMenus.filter(m => m.status === "APPROVED");
      const totalPortionsThisWeek = approvedMenus.reduce((sum, m) => sum + (m.portions || 0), 0);
      const allItems = d.items || [];
      const foodCategories = ["KH", "PH", "PN", "SY", "BU", "BB"];
      const foodItems = allItems.filter(i => foodCategories.includes(i.category));
      const missingNutrition = foodItems.filter(i => {
        const n = i.nutrition_per_100g;
        return !n || (!n.calories && !n.protein && !n.carbs && !n.fats);
      });

      return [
        { label: "Menu Pending", value: menusPending.length, icon: Clock, color: "#D97706", primary: true },
        { label: "Menu Disetujui", value: approvedMenus.length, icon: CheckCircle2, color: "#4A7C59" },
        { label: "Tanpa Data Gizi", value: missingNutrition.length, icon: AlertTriangle, color: missingNutrition.length > 0 ? "#C5533B" : "#4A7C59", suffix: `/${foodItems.length} bahan` },
        { label: "Porsi Minggu Ini", value: totalPortionsThisWeek, icon: HeartPulse, color: "#2C4251", suffix: " porsi" },
      ];
    }

    /* ---------- DRIVER ---------- */
    case "driver": {
      const plans = d.deliveryPlans || [];
      const totalDests = plans.reduce((sum, plan) => sum + (plan.delivery_plan_items || []).length, 0);
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
        { label: "Terkirim", value: `${delSummary.delivered || 0}/${delSummary.total_destinations || 0}`, icon: CheckCircle2, color: "#4A7C59", primary: true },
        { label: "Tujuan Hari Ini", value: totalDests, icon: Truck, color: "#0891B2", suffix: " lokasi" },
        { label: "Foto Terkirim", value: photosSent, icon: Camera, color: "#D97706" },
      ];
    }

    /* ---------- PERSIAPAN ---------- */
    case "persiapan": {
      const totalLots = (d.lots || []).length;
      const todayTaken = (d.stockTaken || []).filter(t => (t.taken_at || "").slice(0, 10) === today);
      const menusToday = (d.menus || []).filter(m => m.day === todayKey);
      const totalPortions = menusToday.reduce((sum, m) => sum + (m.portions || 0), 0);

      return [
        { label: "Total Porsi", value: totalPortions, icon: UtensilsCrossed, color: "#2C4251", primary: true, suffix: " porsi" },
        { label: "Bahan Tersedia", value: totalLots, icon: Package, color: "#16A34A", suffix: " lot" },
        { label: "Pengambilan", value: todayTaken.length, icon: HandPlatter, color: "#D97706", suffix: " item" },
        { label: "Menu Hari Ini", value: menusToday.length, icon: CalendarDays, color: "#16A34A" },
      ];
    }

    /* ---------- TENAGA MASAK ---------- */
    case "tenaga_masak": {
      const recipeCount = (d.recipes || []).length;
      const todayTaken = (d.stockTaken || []).filter(t => (t.taken_at || "").slice(0, 10) === today);
      const menusToday = (d.menus || []).filter(m => m.day === todayKey);
      const totalPortions = menusToday.reduce((sum, m) => sum + (m.portions || 0), 0);

      return [
        { label: "Target Porsi", value: totalPortions, icon: UtensilsCrossed, color: "#2C4251", primary: true, suffix: " porsi" },
        { label: "Resep", value: recipeCount, icon: ChefHat, color: "#EA580C" },
        { label: "Bahan Diambil", value: todayTaken.length, icon: HandPlatter, color: "#D97706", suffix: " item" },
        { label: "Menu Hari Ini", value: menusToday.length, icon: CalendarDays, color: "#EA580C" },
      ];
    }

    /* ---------- PEMORSIAN ---------- */
    case "pemorsian": {
      const menusToday = (d.menus || []).filter(m => m.day === todayKey);
      const totalPortions = menusToday.reduce((sum, m) => sum + (m.portions || 0), 0);
      const pemorsianTasks = (d.stockTaken || []).filter(t => t.taken_reason === "PORTIONING" || t.taken_at?.slice(0, 10) === today);
      const portionedCount = pemorsianTasks.length;

      return [
        { label: "Target Porsi", value: totalPortions, icon: UtensilsCrossed, color: "#7C3AED", primary: true, suffix: " porsi" },
        { label: "Menu Hari Ini", value: menusToday.length, icon: CalendarDays, color: "#7C3AED" },
        { label: "Status", value: portionedCount > 0 ? "Dikerjakan" : "Mulai", icon: portionedCount > 0 ? Clock : AlertTriangle, color: portionedCount > 0 ? "#D97706" : "#C5533B" },
      ];
    }

    /* ---------- KEBERSIHAN ---------- */
    case "kebersihan": {
      const tasks = d.todayTasks || [];
      const completed = tasks.filter(t => t.status === "SELESAI").length;
      const totalSlots = 4;

      return [
        { label: "Area Selesai", value: `${completed}/${totalSlots}`, icon: CheckCircle2, color: completed >= totalSlots ? "#4A7C59" : "#D97706", primary: true, suffix: " area" },
        { label: "Foto", value: tasks.filter(t => t.photo_url).length, icon: Camera, color: "#059669" },
        { label: "Status", value: completed >= totalSlots ? "Selesai" : "Dikerjakan", icon: completed >= totalSlots ? CheckCircle2 : Clock, color: completed >= totalSlots ? "#4A7C59" : "#D97706" },
      ];
    }

    /* ---------- PENCUCI ---------- */
    case "pencuci": {
      const tasks = d.todayTasks || [];
      const completed = tasks.filter(t => t.status === "SELESAI").length;
      const totalSlots = 3;
      const plans = d.deliveryPlans || [];
      const totalDistributed = plans.reduce((sum, plan) => {
        return sum + (plan.delivery_plan_items || []).reduce((s, item) => s + (item.portions || 0), 0);
      }, 0);

      return [
        { label: "Ompreng Distribusi", value: totalDistributed, icon: UtensilsCrossed, color: "#0284C7", primary: true, suffix: " porsi" },
        { label: "Area Dicuci", value: `${completed}/${totalSlots}`, icon: CheckCircle2, color: completed >= totalSlots ? "#4A7C59" : "#D97706", suffix: " area" },
        { label: "Status", value: completed >= totalSlots ? "Selesai" : "Dikerjakan", icon: completed >= totalSlots ? CheckCircle2 : Clock, color: completed >= totalSlots ? "#4A7C59" : "#D97706" },
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
/*  Ingredient calculator (shared for persiapan & tenaga_masak)        */
/* ------------------------------------------------------------------ */

function IngredientCalculator({ menus, recipes, items }) {
  const todayKey = getTodayKey();
  const menusToday = (menus || []).filter(m => m.day === todayKey);
  if (menusToday.length === 0 || !recipes || !items) return null;

  const ingredientMap = {};
  for (const menu of menusToday) {
    const portions = menu.portions || 0;
    const menuRecipes = recipes.filter(r => (menu.recipe_ids || []).includes(r.id));
    for (const recipe of menuRecipes) {
      const servings = recipe.servings || 100;
      const multiplier = portions / servings;
      for (const ing of (recipe.ingredients || [])) {
        if (!ing.item_id) continue;
        const item = items.find(x => x.id === ing.item_id);
        const key = ing.item_id;
        if (!ingredientMap[key]) {
          ingredientMap[key] = { name: item?.name || "Unknown", unit: item?.unit || "", total: 0 };
        }
        ingredientMap[key].total += (ing.quantity || 0) * multiplier;
      }
    }
  }

  const ingredients = Object.values(ingredientMap).sort((a, b) => b.total - a.total);
  if (ingredients.length === 0) return null;

  return (
    <div className="card-soft overflow-hidden">
      <div className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold flex items-center gap-2 text-[#4A7C59]">
        <Package size={16} /> Kebutuhan Bahan Hari Ini ({menusToday.length} menu, {menusToday.reduce((s, m) => s + (m.portions || 0), 0)} porsi)
      </div>
      <div className="px-5 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {ingredients.map((ing, i) => (
          <div key={i} className="flex justify-between items-center text-sm bg-[#F9F6F0] rounded-lg px-3 py-2">
            <span className="font-medium">{ing.name}</span>
            <span className="font-bold text-[#4A7C59]">{ing.total.toFixed(1)} {ing.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Daily readiness checklist (shared for kitchen_head)               */
/* ------------------------------------------------------------------ */

function DailyReadiness({ menus, recipes, lots, dailyReports, purchases }) {
  const todayKey = getTodayKey();
  const menusToday = (menus || []).filter(m => m.day === todayKey);
  const totalPortions = menusToday.reduce((s, m) => s + (m.portions || 0), 0);

  const hasMenus = menusToday.length > 0;
  const hasRecipes = menusToday.every(m => (m.recipe_ids || []).length > 0);
  const lowStockItems = (lots || []).filter(l => l.actual_quantity <= (l.par_level || 0) * 0.5);
  const hasStock = lowStockItems.length === 0;
  const pendingPurchases = (purchases || []).filter(p => !p.verified);
  const hasNoPendingPurchase = pendingPurchases.length === 0;
  const reportsToday = (dailyReports || []).filter(t => t.status === "SELESAI");
  const staffRoles = ["persiapan", "tenaga_masak", "pemorsian", "kebersihan", "pencuci"];
  const staffReported = staffRoles.filter(r => reportsToday.some(t => t.role === r));

  const checks = [
    { label: "Menu hari ini sudah diset", ok: hasMenus, detail: hasMenus ? `${menusToday.length} menu, ${totalPortions} porsi` : "Belum ada menu" },
    { label: "Semua menu punya resep", ok: hasRecipes, detail: hasRecipes ? "Lengkap" : "Ada menu tanpa resep" },
    { label: "Stok bahan mencukupi", ok: hasStock, detail: hasStock ? "Semua stok aman" : `${lowStockItems.length} bahan menipis` },
    { label: "Tidak ada belanja pending", ok: hasNoPendingPurchase, detail: hasNoPendingPurchase ? "Semua verified" : `${pendingPurchases.length} menunggu verifikasi` },
    { label: `Laporan staf (${staffReported.length}/${staffRoles.length})`, ok: staffReported.length >= 3, detail: staffReported.length >= 3 ? `${staffReported.length} staf sudah lapor` : `${staffRoles.length - staffReported.length} staf belum lapor` },
  ];

  const completedChecks = checks.filter(c => c.ok).length;
  const allReady = completedChecks === checks.length;

  return (
    <div className={`card-soft overflow-hidden ${allReady ? "border border-[#4A7C59]/30" : "border border-[#D97706]/30"}`}>
      <div className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold flex items-center gap-2" style={{ color: allReady ? "#4A7C59" : "#D97706" }}>
        {allReady ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
        Kesiapan Distribusi Hari Ini ({completedChecks}/{checks.length})
      </div>
      <div className="divide-y divide-[#EAE4D8]">
        {checks.map((c, i) => (
          <div key={i} className="px-5 py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded-full grid place-items-center text-[10px] text-white ${c.ok ? "bg-[#4A7C59]" : "bg-[#D97706]"}`}>
                {c.ok ? "✓" : "!"}
              </span>
              <span className="font-medium">{c.label}</span>
            </div>
            <span className={`text-xs ${c.ok ? "text-[#4A7C59]" : "text-[#D97706]"}`}>{c.detail}</span>
          </div>
        ))}
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
  const { user, activeRole } = useAuth();
  const role = activeRole || "admin_sppg";
  const { data, loading, fetchErrors } = useDashboardData(activeRole);

  const cards = useMemo(() => buildCards(role, data), [role, data]);
  const roleColor = ROLE_COLORS[role] || "#2D2D2D";

  const primaryCard = cards.find(c => c.primary);
  const secondaryCards = cards.filter(c => !c.primary);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with greeting */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">
              {getGreeting()}, {user?.name?.split(" ")[0] || "Admin"}
            </h1>
            <p className="text-[#5C5C5C] mt-1">
              {formatDateID()}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: roleColor + "1A", color: roleColor }}>
            <span className="w-2 h-2 rounded-full" style={{ background: roleColor }} />
            <span className="text-xs font-semibold uppercase tracking-wider">{ROLE_LABELS[role]}</span>
          </div>
        </div>

        {/* Fetch error warning banner */}
        {fetchErrors > 0 && (
          <div className="bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertTriangle size={16} className="flex-shrink-0" />
            <span>Beberapa data gagal dimuat. Menampilkan data yang tersedia.</span>
          </div>
        )}

        {loading ? (
          <SkeletonCards count={cards.length || 6} />
        ) : (
          <>
            {/* Primary stat card */}
            {primaryCard && (
              <div className="rounded-xl border border-[#EAE4D8] shadow-sm p-6 sm:p-8"
                style={{ background: `linear-gradient(135deg, ${primaryCard.color}08 0%, ${primaryCard.color}15 100%)` }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl grid place-items-center" style={{ background: primaryCard.color + "1A" }}>
                    <primaryCard.icon size={22} style={{ color: primaryCard.color }} />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-widest" style={{ color: primaryCard.color + "CC" }}>{primaryCard.label}</div>
                    <div className="font-display font-bold text-2xl sm:text-3xl mt-0.5" style={{ color: primaryCard.color }}>
                      {primaryCard.currency ? fmtIDR(primaryCard.value) : primaryCard.value}
                      {primaryCard.suffix && <span className="text-sm font-medium ml-1 opacity-70">{primaryCard.suffix}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Secondary stat cards */}
            {secondaryCards.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {secondaryCards.map(({ label, value, currency, icon: Icon, color, suffix }) => (
                  <div key={label} className="card-soft p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full rounded-r" style={{ background: color }} />
                    <div className="flex items-center justify-between pl-2">
                      <div className="text-[10px] uppercase tracking-widest text-[#5C5C5C] leading-tight">{label}</div>
                      <Icon size={14} style={{ color }} className="opacity-60" />
                    </div>
                    <div className="font-display font-bold text-lg mt-1 pl-2" style={{ color }}>
                      {currency ? fmtIDR(value) : value}
                      {suffix && <span className="text-[11px] font-medium ml-0.5 opacity-70">{suffix}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {cards.length === 0 && (
              <div className="card-soft p-6 sm:p-12 text-center text-[#5C5C5C]">
                <Database size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-display text-lg font-bold">Belum ada data</p>
                <p className="text-sm mt-1">
                  Belum ada data tersedia. Silakan hubungi administrator untuk pengaturan awal.
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

            {(role === "persiapan" || role === "tenaga_masak") && (
              <IngredientCalculator
                menus={data.menus}
                recipes={data.recipes}
                items={data.items}
              />
            )}

            {role === "kitchen_head" && (
              <DailyReadiness
                menus={data.menus}
                recipes={data.recipes}
                lots={data.lots}
                dailyReports={data.dailyReports}
                purchases={data.purchases}
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

            {role === "nutritionist" && (() => {
              const allItems = data.items || [];
              const foodCategories = ["KH", "PH", "PN", "SY", "BU", "BB"];
              const foodItems = allItems.filter(i => foodCategories.includes(i.category));
              const missing = foodItems.filter(i => {
                const n = i.nutrition_per_100g;
                return !n || (!n.calories && !n.protein && !n.carbs && !n.fats);
              });
              if (missing.length === 0) return null;
              return (
                <div className="card-soft overflow-hidden border border-[#C5533B]/20">
                  <div className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold flex items-center gap-2 text-[#C5533B]">
                    <AlertTriangle size={16} /> Bahan Perlu Input Data Gizi ({missing.length})
                  </div>
                  <div className="px-5 py-3 text-sm text-[#5C5C5C]">
                    Bahan makanan berikut belum punya data gizi per 100g. Resep yang menggunakan bahan ini tidak bisa dihitung AKG-nya.
                  </div>
                  <div className="divide-y divide-[#EAE4D8]">
                    {missing.slice(0, 10).map((it) => (
                      <div key={it.id} className="px-5 py-3 flex justify-between items-center text-sm">
                        <div>
                          <span className="font-semibold">{it.name}</span>
                          <span className="text-[#5C5C5C] ml-2 text-xs">({it.unit})</span>
                        </div>
                        <Link href="/master" className="text-xs font-semibold underline" style={{ color: "#C5533B" }}>Isi Gizi →</Link>
                      </div>
                    ))}
                  </div>
                  {missing.length > 10 && (
                    <div className="px-5 py-2 text-xs text-[#5C5C5C] border-t border-[#EAE4D8]">
                      +{missing.length - 10} bahan lainnya. Lihat semua di Master Bahan.
                    </div>
                  )}
                </div>
              );
            })()}

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

            {/* Kitchen Head - Laporan Masuk */}
            {role === "kitchen_head" && (data.dailyReports || []).length > 0 && (
              <div className="card-soft overflow-hidden">
                <div className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold flex items-center gap-2 text-[#4A7C59]">
                  <ClipboardList size={16} /> Laporan Masuk Hari Ini
                </div>
                <div className="divide-y divide-[#EAE4D8]">
                  {(() => {
                    const ROLE_LABELS_MAP = {
                      persiapan: "Persiapan", tenaga_masak: "Masak", pemorsian: "Pemorsian",
                      kebersihan: "Kebersihan", pencuci: "Pencuci", driver: "Driver",
                    };
                    const ROLE_COLORS_MAP = {
                      persiapan: "#16A34A", tenaga_masak: "#EA580C", pemorsian: "#7C3AED",
                      kebersihan: "#059669", pencuci: "#0284C7", driver: "#0891B2",
                    };
                    const CAT_LABELS = {
                      BALITA: "Balita", PORTION_SMALL: "Porsi Kecil", PORTION_LARGE: "Porsi Besar", BUMIL_BUSUI: "Bumil/Busui",
                    };
                    return data.dailyReports.slice(0, 10).map((t) => (
                      <div key={t.id} className="px-5 py-3 flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <span className="tag text-xs" style={{ background: `${ROLE_COLORS_MAP[t.role] || "#5C5C5C"}1A`, color: ROLE_COLORS_MAP[t.role] || "#5C5C5C" }}>
                            {ROLE_LABELS_MAP[t.role] || t.role}
                          </span>
                          <span className="font-semibold capitalize">{t.task_type}</span>
                          {t.category && <span className="text-xs text-[#5C5C5C]">({CAT_LABELS[t.category] || t.category})</span>}
                          {t.portions > 0 && <span className="text-xs audit-ts">{t.portions} ompreng</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {t.photo_url && <img src={t.photo_url} alt="" className="w-8 h-8 rounded object-cover" />}
                          <span className="tag text-xs" style={{ background: t.status === "SELESAI" ? "#4A7C591A" : "#D977061A", color: t.status === "SELESAI" ? "#4A7C59" : "#D97706" }}>
                            {t.status === "SELESAI" ? "Selesai" : "Proses"}
                          </span>
                        </div>
                      </div>
                    ));
                  })()}
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
