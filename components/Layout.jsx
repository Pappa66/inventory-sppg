"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/format";
import {
  LayoutDashboard, Users, Database, Boxes, ShoppingBasket, CalendarDays,
  ChefHat, BarChart3, FileText, ScrollText, LogOut, Leaf, BadgeCheck,
  Menu, X, Settings as SettingsIcon, MapPin, Truck, Navigation,
  PiggyBank, HelpCircle, Camera, Calculator
} from "lucide-react";

const ALL_NAV = [
  { to: "/", label: "Dasbor", icon: LayoutDashboard, roles: "*" },
  { to: "/users", label: "Pengguna", icon: Users, roles: ["admin"] },
  { to: "/settings", label: "Pengaturan", icon: SettingsIcon, roles: ["admin"] },
  { divider: true, label: "Master & Persediaan", roles: ["admin","head_chef","kitchen_head","nutritionist","field_assistant","persiapan","tenaga_masak"] },
  { to: "/master", label: "Master Bahan", icon: Database, roles: ["admin","head_chef","kitchen_head","nutritionist","field_assistant"] },
  { to: "/inventory", label: "Stok & Opname", icon: Boxes, roles: ["admin","field_assistant","kitchen_head","head_chef","persiapan"] },
  { to: "/procurement", label: "Belanja & Struk", icon: ShoppingBasket, roles: ["admin","field_assistant","accountant","kitchen_head"] },
  { divider: true, label: "Dapur & Menu", roles: ["admin","head_chef","kitchen_head","nutritionist","persiapan","tenaga_masak","pemorsian","kebersihan","pencuci"] },
  { to: "/recipes", label: "Resep & Gizi", icon: ChefHat, roles: ["admin","head_chef","kitchen_head","nutritionist"] },
  { to: "/menu", label: "Menu & Cetak", icon: CalendarDays, roles: ["admin","head_chef","kitchen_head","nutritionist"] },
  { to: "/nutrition-calc", label: "Kalkulator Gizi", icon: Calculator, roles: ["nutritionist"] },
  { to: "/pemorsian", label: "Tugas Harian", icon: Camera, roles: ["pemorsian","persiapan","tenaga_masak","kebersihan","pencuci"] },
  { divider: true, label: "Pengiriman", roles: ["admin","field_assistant","driver","kitchen_head","head_chef"] },
  { to: "/destinations", label: "Tujuan Antar", icon: MapPin, roles: ["admin","field_assistant"] },
  { to: "/deliveries", label: "Rencana Antar", icon: Truck, roles: ["admin","field_assistant","kitchen_head","head_chef"] },
  { to: "/delivery-tracking", label: "Tracking Driver", icon: Navigation, roles: ["admin","driver","field_assistant"] },
  { divider: true, label: "Keuangan & Akuntansi", roles: ["admin","accountant","kitchen_head"] },
  { to: "/anggaran", label: "Anggaran", icon: PiggyBank, roles: ["admin","accountant","kitchen_head"] },
  { divider: true, label: "Approval & Laporan", roles: ["admin","nutritionist","accountant","kitchen_head","head_chef","field_assistant"] },
  { to: "/approval", label: "Persetujuan Menu", icon: BadgeCheck, roles: ["admin","kitchen_head"] },
  { to: "/reports", label: "Laporan", icon: FileText, roles: ["admin","kitchen_head","accountant"] },
  { to: "/audit", label: "Audit Trail", icon: ScrollText, roles: ["admin","kitchen_head","accountant"] },
  { divider: true, label: "Bantuan", roles: "*" },
  { to: "/panduan", label: "Panduan Penggunaan", icon: HelpCircle, roles: "*" },
];

function RoleSwitcher() {
  const { user, activeRole, setActiveRole } = useAuth();
  const roles = user?.role === "admin" ? Object.keys(ROLE_LABELS) : [user?.role].filter(Boolean);
  const single = roles.length <= 1;

  if (single) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: ROLE_COLORS[activeRole], color: "white" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span className="text-xs font-semibold uppercase tracking-wider">{ROLE_LABELS[activeRole]}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-[#EAE4D8] p-1 rounded-full" role="tablist">
      {roles.map((r) => {
        const active = activeRole === r;
        return (
          <button
            key={r}
            type="button"
            onClick={() => setActiveRole(r)}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
            style={{
              background: active ? ROLE_COLORS[r] : "transparent",
              color: active ? "white" : "#5C5C5C",
              boxShadow: active ? "inset 0 0 0 2px rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.18)" : "none",
              transition: "color 120ms",
            }}
          >
            {ROLE_LABELS[r]}
          </button>
        );
      })}
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
        <header className="sticky top-0 z-20 bg-[#F9F6F0]/90 backdrop-blur border-b border-[#EAE4D8] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden btn-ghost p-2 -ml-2" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
              <Menu size={20} />
            </button>
            <div className="shrink-0 min-w-0">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-[#5C5C5C]">Mode tampilan</div>
              <div className="font-display font-bold text-base sm:text-lg leading-tight truncate" style={{ color: ROLE_COLORS[role] }}>
                {ROLE_LABELS[role]}
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0 flex justify-end overflow-hidden">
            <div className="max-w-full overflow-x-auto no-scrollbar">
              <RoleSwitcher />
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
