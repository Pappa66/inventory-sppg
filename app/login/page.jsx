"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Leaf, LogIn } from "lucide-react";

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
    <div className="min-h-screen bg-[#F9F6F0] bg-grain flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#4A7C59] text-white grid place-items-center mx-auto mb-4">
            <Leaf size={28} />
          </div>
          <h1 className="font-display text-3xl font-bold">SPPG · MBG</h1>
          <p className="text-[#5C5C5C] mt-1 text-sm">Inventory & Procurement</p>
        </div>
        <form onSubmit={handleSubmit} className="card-soft p-6 space-y-4">
          <h2 className="font-display font-bold text-lg">Masuk</h2>
          {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#5C5C5C]">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-[#EAE4D8] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#5C5C5C]">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-[#EAE4D8] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 text-sm" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            <LogIn size={16} /> {loading ? "Memproses..." : "Masuk"}
          </button>
          <div className="text-[11px] text-[#5C5C5C] text-center pt-2 border-t border-[#EAE4D8]">
            Demo: admin@sppg.id / admin123
          </div>
        </form>
      </div>
    </div>
  );
}
