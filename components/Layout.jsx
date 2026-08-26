"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, ROLE_COLORS, ROLE_GROUPS } from "@/lib/format";
import {
  LayoutDashboard, Users, Database, Boxes, ShoppingBasket, CalendarDays,
  ChefHat, BarChart3, FileText, ScrollText, LogOut, Leaf, BadgeCheck,
  Menu, X, Settings as SettingsIcon, MapPin, Truck, Navigation,
  PiggyBank, HelpCircle, Camera, Calculator, ChevronDown, Check
} from "lucide-react";

const ALL_NAV = [
  { to: "/", label: "Dasbor", icon: LayoutDashboard, roles: "*" },
  { to: "/users", label: "Pengguna", icon: Users, roles: ["admin_apps","admin_sppg"] },
  { to: "/settings", label: "Pengaturan SPPG", icon: SettingsIcon, roles: ["admin_apps","admin_sppg"] },
  { divider: true, label: "Konfigurasi Sistem", roles: ["admin_apps"] },
  { to: "/global-config", label: "Konfigurasi Global", icon: SettingsIcon, roles: ["admin_apps"] },
  { divider: true, label: "Master & Persediaan", roles: ["admin_apps","admin_sppg","head_chef","kitchen_head","nutritionist","field_assistant","persiapan","tenaga_masak"] },
  { to: "/master", label: "Master Bahan", icon: Database, roles: ["admin_apps","admin_sppg","head_chef","kitchen_head","nutritionist","field_assistant"] },
  { to: "/item-hierarchy", label: "Hirarki Barang", icon: Database, roles: ["admin_apps","admin_sppg"] },
  { to: "/opening-balances", label: "Saldo Awal Barang", icon: Database, roles: ["admin_apps","admin_sppg"] },
  { to: "/inventory", label: "Stok & Opname", icon: Boxes, roles: ["admin_apps","admin_sppg","field_assistant","kitchen_head","head_chef","persiapan"] },
  { to: "/stock-detail", label: "Stock Detail", icon: Boxes, roles: ["admin_apps","admin_sppg","kitchen_head","head_chef","accountant"] },
  { to: "/stock-rekap", label: "Stock Rekap", icon: Boxes, roles: ["admin_apps","admin_sppg","kitchen_head","head_chef","accountant"] },
  { to: "/procurement", label: "Belanja & Struk", icon: ShoppingBasket, roles: ["admin_apps","admin_sppg","field_assistant","accountant","kitchen_head"] },
  { divider: true, label: "Dapur & Menu", roles: ["admin_apps","admin_sppg","head_chef","kitchen_head","nutritionist","persiapan","tenaga_masak","pemorsian","kebersihan","pencuci"] },
  { to: "/recipes", label: "Resep & Gizi", icon: ChefHat, roles: ["admin_apps","admin_sppg","head_chef","kitchen_head","nutritionist","persiapan","tenaga_masak"] },
  { to: "/menu", label: "Menu & Cetak", icon: CalendarDays, roles: ["admin_apps","admin_sppg","head_chef","kitchen_head","nutritionist","persiapan","tenaga_masak","pemorsian"] },
  { to: "/nutrition-calc", label: "Kalkulator Gizi", icon: Calculator, roles: ["nutritionist"] },
  { to: "/pemorsian", label: "Tugas Harian", icon: Camera, roles: ["pemorsian","persiapan","tenaga_masak","kebersihan","pencuci"] },
  { divider: true, label: "Pengiriman", roles: ["admin_apps","admin_sppg","field_assistant","driver","kitchen_head","head_chef"] },
  { to: "/destinations", label: "Tujuan Antar", icon: MapPin, roles: ["admin_apps","admin_sppg","field_assistant"] },
  { to: "/deliveries", label: "Rencana Antar", icon: Truck, roles: ["admin_apps","admin_sppg","field_assistant","kitchen_head","head_chef"] },
  { to: "/delivery-tracking", label: "Tracking Driver", icon: Navigation, roles: ["admin_apps","admin_sppg","driver","field_assistant"] },
  { divider: true, label: "Keuangan & Pembukuan", roles: ["admin_apps","admin_sppg","accountant","kitchen_head"] },
  { to: "/anggaran", label: "Anggaran", icon: PiggyBank, roles: ["admin_apps","admin_sppg","accountant","kitchen_head"] },
  { to: "/transactions", label: "Transaksi (D/K)", icon: PiggyBank, roles: ["admin_apps","admin_sppg","accountant"] },
  { to: "/bku", label: "BKU", icon: ScrollText, roles: ["admin_apps","admin_sppg","accountant"] },
  { to: "/sub-ledger", label: "Buku Pembantu", icon: ScrollText, roles: ["admin_apps","admin_sppg","accountant"] },
  { divider: true, label: "Laporan & Approval", roles: ["admin_apps","admin_sppg","nutritionist","accountant","kitchen_head","head_chef","field_assistant"] },
  { to: "/approval", label: "Persetujuan Menu", icon: BadgeCheck, roles: ["admin_apps","admin_sppg","kitchen_head","nutritionist"] },
  { to: "/reports", label: "Laporan", icon: FileText, roles: ["admin_apps","admin_sppg","kitchen_head","accountant","field_assistant"] },
  { to: "/audit", label: "Audit Trail", icon: ScrollText, roles: ["admin_apps","admin_sppg","kitchen_head","accountant"] },
  { divider: true, label: "Bantuan", roles: "*" },
  { to: "/panduan", label: "Panduan Penggunaan", icon: HelpCircle, roles: "*" },
];

function RoleDropdown() {
  const { user, activeRole, setActiveRole } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const allowedRoles = user?.role === "admin_apps"
    ? Object.keys(ROLE_LABELS)
    : user?.role === "admin_sppg"
    ? Object.keys(ROLE_LABELS).filter(r => r !== "admin_apps")
    : [user?.role].filter(Boolean);

  const single = allowedRoles.length <= 1;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") close();
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handler);
    };
  }, [open, close]);

  if (single) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: ROLE_COLORS[activeRole] + "1A", color: ROLE_COLORS[activeRole] }}>
        <span className="w-2 h-2 rounded-full" style={{ background: ROLE_COLORS[activeRole] }} />
        <span className="text-xs font-semibold uppercase tracking-wider">{ROLE_LABELS[activeRole]}</span>
      </div>
    );
  }

  const filteredGroups = ROLE_GROUPS
    .map(g => ({ ...g, roles: g.roles.filter(r => allowedRoles.includes(r)) }))
    .filter(g => g.roles.length > 0);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#EAE4D8] bg-white hover:bg-[#F9F6F0] transition-colors"
      >
        <span className="w-2 h-2 rounded-full" style={{ background: ROLE_COLORS[activeRole] }} />
        <span className="text-sm font-semibold truncate max-w-[140px] sm:max-w-none" style={{ color: ROLE_COLORS[activeRole] }}>
          {ROLE_LABELS[activeRole]}
        </span>
        <ChevronDown size={14} className={`text-[#5C5C5C] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl border border-[#EAE4D8] shadow-lg z-50 py-2 max-h-[70vh] overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-[#5C5C5C] font-semibold">Switch Role</div>
          {filteredGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-widest text-[#5C5C5C] font-semibold">{group.label}</div>
              {group.roles.map((r) => {
                const active = activeRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setActiveRole(r); setOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                    style={{
                      background: active ? ROLE_COLORS[r] + "12" : "transparent",
                      color: active ? ROLE_COLORS[r] : "#1F1F1F",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ROLE_COLORS[r] }} />
                    <span className="font-medium flex-1 text-left">{ROLE_LABELS[r]}</span>
                    {active && <Check size={14} style={{ color: ROLE_COLORS[r] }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, activeRole, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = activeRole || user?.role;
  const items = ALL_NAV.filter((n) => {
    if (n.divider) return n.roles === "*" || (role && n.roles.includes(role));
    return n.roles === "*" || (role && n.roles.includes(role));
  });

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F9F6F0] bg-grain">
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setMobileOpen(false)} aria-hidden />
      )}

      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#EAE4D8] flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-6 py-5 border-b border-[#EAE4D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#4A7C59] text-white grid place-items-center"><Leaf size={18} /></div>
            <div>
              <div className="font-display text-lg font-bold leading-none">SPPG · MBG</div>
              <div className="text-[11px] text-[#5C5C5C] tracking-wider uppercase mt-1">Inventory & Procurement</div>
            </div>
          </div>
          <button className="lg:hidden btn-ghost p-1" onClick={() => setMobileOpen(false)} aria-label="Tutup menu"><X size={18} /></button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((it, idx) => {
            if (it.divider) {
              return <div key={`div-${idx}`} className="text-[10px] uppercase tracking-widest text-[#5C5C5C] mt-4 mb-1 px-3">{it.label}</div>;
            }
            const isActive = pathname === it.to || (it.to !== "/" && pathname.startsWith(it.to));
            return (
              <Link
                key={it.to}
                href={it.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-[#4A7C59] text-white shadow-sm" : "text-[#1F1F1F] hover:bg-[#EAE4D8]"
                }`}
              >
                <it.icon size={16} /> {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#EAE4D8]">
          <div className="text-xs text-[#5C5C5C] mb-1">Login sebagai</div>
          <div className="font-display font-semibold leading-tight">{user?.name}</div>
          <div className="text-[11px] text-[#5C5C5C] truncate">{user?.email}</div>
          <button onClick={async () => { await logout(); router.push("/login"); }} className="btn-outline w-full mt-3 text-sm py-1.5">
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      <main className="lg:ml-64">
        <header className="sticky top-0 z-20 bg-[#F9F6F0]/90 backdrop-blur border-b border-[#EAE4D8] px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button className="lg:hidden btn-ghost p-2 -ml-2" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
                <Menu size={20} />
              </button>
              <h1 className="font-display font-bold text-lg sm:text-xl truncate" style={{ color: ROLE_COLORS[role] }}>
                {items.find(n => !n.divider && pathname === n.to)?.label || "Dasbor"}
              </h1>
            </div>
            <RoleDropdown />
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
