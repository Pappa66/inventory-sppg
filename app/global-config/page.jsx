"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Save, Settings, Percent, DollarSign, Users, Clock,
  TrendingUp, Package, Calculator, Info
} from "lucide-react";

const CONFIG_SECTIONS = [
  {
    title: "Harga Satuan Porsi",
    icon: DollarSign,
    color: "#4A7C59",
    fields: [
      { key: "price_group1", label: "Kelompok 1 (Balita, PAUD/TK/RA, SD 1-3)", type: "number", prefix: "Rp " },
      { key: "price_group2", label: "Kelompok 2 (SD 4-6 s.d. Busui)", type: "number", prefix: "Rp " },
    ],
  },
  {
    title: "Porsi & Kapasitas",
    icon: Users,
    color: "#D97706",
    fields: [
      { key: "daily_portion_capacity", label: "Kapasitas Maksimal Porsi/Hari", type: "number" },
      { key: "max_beneficiaries", label: "Maksimal Penerima Manfaat/Hari", type: "number" },
    ],
  },
  {
    title: "Persentase Anggaran",
    icon: Percent,
    color: "#6D28D9",
    fields: [
      { key: "bahan_baku_percentage", label: "Persentase Bahan Baku dari Total Rp15.000", type: "number", suffix: "%" },
      { key: "operational_percentage", label: "Persentase Operasional dari Total Rp15.000", type: "number", suffix: "%" },
      { key: "incentive_percentage", label: "Persentase Insentif Fasilitas dari Total Rp15.000", type: "number", suffix: "%" },
    ],
  },
  {
    title: "Pajak & Insentif",
    icon: Calculator,
    color: "#C5533B",
    fields: [
      { key: "tax_rate_percent", label: "Tarif PPN/PPH", type: "number", suffix: "%" },
      { key: "incentive_per_portion", label: "Insentif Fasilitas per Porsi", type: "number", prefix: "Rp " },
    ],
  },
  {
    title: "Jam Operasional",
    icon: Clock,
    color: "#0891B2",
    fields: [
      { key: "cooking_start_hour", label: "Jam Mulai Masak (0-23)", type: "number", min: 0, max: 23 },
      { key: "distribution_start_hour", label: "Jam Mulai Distribusi (0-23)", type: "number", min: 0, max: 23 },
    ],
  },
];

export default function GlobalConfigPage() {
  const { user, activeRole } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && activeRole !== "admin_apps") {
      router.push("/");
      return;
    }
    fetchConfig();
  }, [user]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/global-config");
      setConfig(data || {});
    } catch (err) {
      toast.error("Gagal memuat konfigurasi");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/global-config", { config });
      toast.success("Konfigurasi global tersimpan");
    } catch (err) {
      toast.error("Gagal menyimpan konfigurasi");
    } finally {
      setSaving(false);
    }
  };

  if (user && activeRole !== "admin_apps") {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Konfigurasi Global</h1>
          <p className="text-[#5C5C5C] mt-1">
            Atur nilai dinamis yang digunakan di seluruh aplikasi
          </p>
        </div>

        {/* Info box */}
        <div className="card-soft p-4 flex items-start gap-3 bg-[#1E40AF]/5 border-[#1E40AF]/20">
          <Info size={18} className="text-[#1E40AF] mt-0.5 shrink-0" />
          <div className="text-sm text-[#1E40AF]">
            <p className="font-semibold">Hanya Admin Aplikasi yang bisa mengubah pengaturan ini.</p>
            <p className="mt-1">Nilai yang diatur di sini akan digunakan di seluruh SPPG: perhitungan anggaran, pajak, insentif relawan, kalkulator gizi, dan laporan.</p>
          </div>
        </div>

        {loading ? (
          <div className="card-soft p-12 text-center text-[#5C5C5C]">
            <div className="animate-spin w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full mx-auto" />
            <p className="mt-3 text-sm">Memuat konfigurasi...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {CONFIG_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.title} className="card-soft overflow-hidden">
                    <div
                      className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold flex items-center gap-2"
                      style={{ color: section.color }}
                    >
                      <Icon size={16} /> {section.title}
                    </div>
                    <div className="p-5 space-y-4">
                      {section.fields.map((field) => (
                        <div key={field.key}>
                          <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">
                            {field.label}
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            {field.prefix && (
                              <span className="text-sm text-[#5C5C5C] font-medium">{field.prefix}</span>
                            )}
                            <input
                              type={field.type}
                              min={field.min}
                              max={field.max}
                              className="flex-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm"
                              value={config[field.key] || ""}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                            />
                            {field.suffix && (
                              <span className="text-sm text-[#5C5C5C] font-medium">{field.suffix}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="card-soft p-5">
              <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <TrendingUp size={14} /> Ringkasan Konfigurasi
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[#5C5C5C]">Harga Kel. 1</span>
                  <p className="font-bold">Rp {Number(config.price_group1 || 8000).toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <span className="text-[#5C5C5C]">Harga Kel. 2</span>
                  <p className="font-bold">Rp {Number(config.price_group2 || 10000).toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <span className="text-[#5C5C5C]">PPN</span>
                  <p className="font-bold">{config.tax_rate_percent || 11}%</p>
                </div>
                <div>
                  <span className="text-[#5C5C5C]">Insentif/Porsi</span>
                  <p className="font-bold">Rp {Number(config.incentive_per_portion || 2000).toLocaleString("id-ID")}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm border-t border-[#EAE4D8] pt-3">
                <div>
                  <span className="text-[#5C5C5C]">Bahan Baku</span>
                  <p className="font-bold">{config.bahan_baku_percentage || 67}%</p>
                </div>
                <div>
                  <span className="text-[#5C5C5C]">Operasional</span>
                  <p className="font-bold">{config.operational_percentage || 20}%</p>
                </div>
                <div>
                  <span className="text-[#5C5C5C]">Insentif Fasilitas</span>
                  <p className="font-bold">{config.incentive_percentage || 13}%</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              <Save size={14} /> {saving ? "Menyimpan..." : "Simpan Konfigurasi"}
            </button>
          </>
        )}
      </div>
    </Layout>
  );
}
