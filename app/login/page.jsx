"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Leaf, LogIn, ShieldCheck, Package, Users, ClipboardCheck } from "lucide-react";

export default function LoginPage() {
  const { login, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
              { icon: Users, text: "7 Peran Pengguna" },
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

          <form onSubmit={handleSubmit} className="card-soft p-6 space-y-4">
            <h2 className="font-display font-bold text-xl">Masuk</h2>
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#5C5C5C]">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sppg.id"
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
            <div className="text-[11px] text-[#5C5C5C] text-center pt-2 border-t border-[#EAE4D8]">
              Demo: <strong>admin@sppg.id</strong> / <strong>admin123</strong>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
