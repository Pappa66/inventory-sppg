"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Leaf, LogIn, ShieldCheck, Package, Users, ClipboardCheck,
  AlertTriangle, ChevronDown, ChevronRight, User,
} from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/format";

const DEMO_ACCOUNTS = [
  { role: "admin_apps", email: "admin@sppg.id", label: "Admin Aplikasi", desc: "Akses penuh ke seluruh sistem" },
  { role: "admin_sppg", email: "admin-sppg@sppg.id", label: "Admin SPPG", desc: "Kelola operasional satu SPPG" },
  { role: "accountant", email: "akuntan@sppg.id", label: "Akuntan", desc: "Pembukuan & verifikasi" },
  { role: "kitchen_head", email: "kepala@sppg.id", label: "Kepala SPPG", desc: "Pengawasan dapur & menu" },
  { role: "head_chef", email: "chef@sppg.id", label: "Head Chef", desc: "Buat resep & susun menu" },
  { role: "field_assistant", email: "asisten@sppg.id", label: "Asisten Lapangan", desc: "Pembelian & pengiriman" },
  { role: "nutritionist", email: "ahligizi@sppg.id", label: "Ahli Gizi", desc: "Review gizi & setujui menu" },
  { role: "driver", email: "driver@sppg.id", label: "Driver", desc: "Antar makanan ke tujuan" },
  { role: "persiapan", email: "persiapan@sppg.id", label: "Tenaga Persiapan", desc: "Siapkan bahan sebelum masak" },
  { role: "tenaga_masak", email: "masak@sppg.id", label: "Tenaga Masak", desc: "Masak sesuai resep" },
  { role: "pemorsian", email: "pemorsian@sppg.id", label: "Tenaga Pemorsian", desc: "Bagi makanan ke ompreng" },
  { role: "kebersihan", email: "kebersihan@sppg.id", label: "Petugas Kebersihan", desc: "Jaga kebersihan dapur" },
  { role: "pencuci", email: "pencuci@sppg.id", label: "Pencuci Ompreng", desc: "Cuci & steril ompreng" },
];

const QUICK_ROLES = [
  { role: "admin_apps", icon: ShieldCheck },
  { role: "kitchen_head", icon: Users },
  { role: "head_chef", icon: Users },
  { role: "accountant", icon: Users },
  { role: "nutritionist", icon: Users },
  { role: "field_assistant", icon: Users },
];

export default function LoginPage() {
  const { login, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const loginAsRole = async (demoEmail) => {
    setLoading(true);
    try {
      await login(demoEmail, "admin123");
      router.push("/");
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4A7C59] via-[#3D6B4B] to-[#2D5A3B] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/5" />
        </div>
        <div className="relative z-10 text-center text-white px-12">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur text-white grid place-items-center mx-auto mb-6">
            <Leaf size={40} />
          </div>
          <h1 className="font-display text-4xl font-bold mb-3">SPPG · MBG</h1>
          <p className="text-lg text-white/80 mb-8">Inventory & Procurement<br/>Makan Bergizi Gratis</p>
          <div className="space-y-4 max-w-xs mx-auto">
            {[
              { icon: Package, text: "Manajemen Stok & Inventaris" },
              { icon: ClipboardCheck, text: "Audit Trail Akurat-Detik" },
              { icon: Users, text: "14 Peran Pengguna" },
              { icon: ShieldCheck, text: "Laporan Siap BPK" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/70 text-sm">
                <Icon size={16} className="shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="w-full lg:w-1/2 bg-[#F9F6F0] bg-grain flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#4A7C59] text-white grid place-items-center mx-auto mb-4">
              <Leaf size={28} />
            </div>
            <h1 className="font-display text-3xl font-bold">SPPG · MBG</h1>
            <p className="text-[#5C5C5C] mt-1 text-sm">Inventory & Procurement</p>
          </div>

          {/* Quick Role Login */}
          <div className="card-soft p-4 mb-4">
            <button
              onClick={() => setShowRoles(!showRoles)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#D97706]/10 grid place-items-center">
                  <AlertTriangle size={16} className="text-[#D97706]" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Masuk Sebagai Role</div>
                  <div className="text-[11px] text-[#5C5C5C]">Pilih role untuk demo cepat</div>
                </div>
              </div>
              {showRoles ? <ChevronDown size={16} className="text-[#5C5C5C]" /> : <ChevronRight size={16} className="text-[#5C5C5C]" />}
            </button>

            {showRoles && (
              <div className="mt-3 space-y-1.5 max-h-[320px] overflow-y-auto">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    onClick={() => loginAsRole(acc.email)}
                    disabled={loading}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-[#F9F6F0] transition-colors group"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: ROLE_COLORS[acc.role] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{acc.label}</div>
                      <div className="text-[10px] text-[#5C5C5C] truncate">{acc.desc}</div>
                    </div>
                    <ChevronRight size={12} className="text-[#5C5C5C] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manual Login */}
          <form onSubmit={handleSubmit} className="card-soft p-6 space-y-4">
            <div className="flex items-center gap-2">
              <User size={16} className="text-[#5C5C5C]" />
              <h2 className="font-display font-bold text-lg">Login Manual</h2>
            </div>
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#5C5C5C]">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full mt-1 px-3 py-2.5 border border-[#EAE4D8] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#5C5C5C]">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-1 px-3 py-2.5 border border-[#EAE4D8] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 text-sm" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              <LogIn size={16} /> {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
