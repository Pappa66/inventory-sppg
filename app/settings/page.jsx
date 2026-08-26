"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { getLogo, clearLogoCache } from "@/lib/logo";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Upload, Save, Building2, Truck as TruckIcon, Users, Clock,
  User, CreditCard, Calendar, FileText
} from "lucide-react";

export default function Page() {
  const { user, activeRole } = useAuth();
  const router = useRouter();

  const [logoPreview, setLogoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    sppg_name: "",
    sppg_address: "",
    default_transport_cost: 0,
    price_balita_paud_sd13: 8000,
    price_sd4_smp_sma_bumil_busui: 10000,
    cooking_start_hour: 1,
    distribution_start_hour: 9,
    beneficiaries: "",
    id_sppg: "",
    nama_kepala: "",
    nama_akuntan: "",
    nama_yayasan: "",
    rekening_va: "",
    tahun_anggaran: new Date().getFullYear(),
    periode_start: "",
    periode_end: "",
  });

  useEffect(() => {
    getLogo().then(setLogoPreview);
    api.get("/settings/logo").then(({ data }) => {
      if (data) setSettings(prev => ({ ...prev, ...data }));
    }).catch((err) => {
      console.error("Gagal memuat pengaturan:", err);
      toast.error("Gagal memuat pengaturan");
    });
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Harus berupa file gambar");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setUploading(true);
      try {
        await api.post("/settings/logo", { logo: base64 });
        clearLogoCache();
        setLogoPreview(base64);
        toast.success("Logo berhasil diperbarui");
      } catch (err) {
        toast.error("Gagal upload logo");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.post("/settings/logo", settings);
      toast.success("Pengaturan tersimpan");
    } catch (err) {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  if (!["admin_apps", "admin_sppg"].includes(activeRole)) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-[#5C5C5C]">Akses Dibatasi</h1>
            <p className="text-[#5C5C5C] mt-2">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Pengaturan SPPG</h1>
          <p className="text-[#5C5C5C] mt-1">Konfigurasi data SPPG sesuai Setup Excel</p>
        </div>

        {/* Logo - full width */}
        <div className="card-soft p-4 sm:p-6">
          <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Upload size={18}/> Logo SPPG</h2>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {logoPreview ? (
              <div className="p-4 border border-[#EAE4D8] rounded-lg bg-white">
                <img src={logoPreview} alt="Logo SPPG" className="max-h-20 object-contain" />
              </div>
            ) : (
              <div className="p-6 border-2 border-dashed border-[#EAE4D8] rounded-lg text-center text-[#5C5C5C] text-sm">
                Belum ada logo.
              </div>
            )}
            <div>
              <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
                <Upload size={16} />
                {uploading ? "Mengupload..." : "Upload Logo"}
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
              </label>
              <p className="text-xs text-[#5C5C5C] mt-2">Logo akan tampil di semua laporan PDF.</p>
            </div>
          </div>
        </div>

        {/* Two-column layout for the rest */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informasi SPPG */}
          <div className="card-soft p-4 sm:p-6">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Building2 size={18}/> Informasi SPPG</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Nama SPPG</label>
                <input className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.sppg_name} onChange={(e)=>setSettings(p=>({...p, sppg_name:e.target.value}))} placeholder="Contoh: SPPG Kadudampit"/>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">ID SPPG</label>
                <input className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.id_sppg} onChange={(e)=>setSettings(p=>({...p, id_sppg:e.target.value}))} placeholder="Contoh: SPPG-KDD-001"/>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Alamat</label>
                <textarea rows={2} className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.sppg_address} onChange={(e)=>setSettings(p=>({...p, sppg_address:e.target.value}))} placeholder="Alamat lengkap SPPG"/>
              </div>
            </div>
          </div>

          {/* Struktur Organisasi */}
          <div className="card-soft p-4 sm:p-6">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><User size={18}/> Struktur Organisasi</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kepala SPPG</label>
                <input className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.nama_kepala} onChange={(e)=>setSettings(p=>({...p, nama_kepala:e.target.value}))} placeholder="Nama Kepala SPPG"/>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Akuntan / Pengawas Keuangan</label>
                <input className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.nama_akuntan} onChange={(e)=>setSettings(p=>({...p, nama_akuntan:e.target.value}))} placeholder="Nama Akuntan"/>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Yayasan</label>
                <input className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.nama_yayasan} onChange={(e)=>setSettings(p=>({...p, nama_yayasan:e.target.value}))} placeholder="Nama Yayasan"/>
              </div>
            </div>
          </div>

          {/* Keuangan & Periode */}
          <div className="card-soft p-4 sm:p-6">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><CreditCard size={18}/> Keuangan & Periode</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Rekening / VA</label>
                  <input className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.rekening_va} onChange={(e)=>setSettings(p=>({...p, rekening_va:e.target.value}))} placeholder="Nomor Rekening/VA"/>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Tahun Anggaran</label>
                  <input type="number" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.tahun_anggaran || ""} onChange={(e)=>setSettings(p=>({...p, tahun_anggaran:parseInt(e.target.value)||0}))}/>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Periode Awal</label>
                  <input type="date" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.periode_start} onChange={(e)=>setSettings(p=>({...p, periode_start:e.target.value}))}/>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Periode Akhir</label>
                  <input type="date" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.periode_end} onChange={(e)=>setSettings(p=>({...p, periode_end:e.target.value}))}/>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-2"><TruckIcon size={12}/> Default Biaya Transport (Rp)</label>
                <input type="number" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.default_transport_cost || ""} onChange={(e)=>setSettings(p=>({...p, default_transport_cost:parseInt(e.target.value)||0}))}/>
              </div>
            </div>
          </div>

          {/* Harga & Penerima Manfaat */}
          <div className="card-soft p-4 sm:p-6">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Users size={18}/> Harga Porsi & Penerima Manfaat</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Harga Kel. 1: Balita / PAUD / SD 1-3 (Rp)</label>
                <input type="number" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.price_balita_paud_sd13 || ""} onChange={(e)=>setSettings(p=>({...p, price_balita_paud_sd13:parseInt(e.target.value)||0}))}/>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Harga Kel. 2: SD 4+ / SMP / SMA / Bumil / Busui (Rp)</label>
                <input type="number" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.price_sd4_smp_sma_bumil_busui || ""} onChange={(e)=>setSettings(p=>({...p, price_sd4_smp_sma_bumil_busui:parseInt(e.target.value)||0}))}/>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Jumlah Penerima Manfaat (opsional)</label>
                <textarea rows={2} className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm" value={settings.beneficiaries} onChange={(e)=>setSettings(p=>({...p, beneficiaries:e.target.value}))} placeholder="Contoh: Balita 50, PAUD 200, SD 150"/>
              </div>
            </div>
          </div>

          {/* Jam Operasional */}
          <div className="card-soft p-4 sm:p-6">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Clock size={18}/> Jam Operasional</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Jam Mulai Masak (0-23)</label>
                <input type="number" min="0" max="23" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.cooking_start_hour || ""} onChange={(e)=>setSettings(p=>({...p, cooking_start_hour:parseInt(e.target.value)||0}))}/>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Jam Mulai Distribusi (0-23)</label>
                <input type="number" min="0" max="23" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.distribution_start_hour || ""} onChange={(e)=>setSettings(p=>({...p, distribution_start_hour:parseInt(e.target.value)||0}))}/>
              </div>
            </div>
          </div>
        </div>

        <button onClick={saveSettings} disabled={saving} className="btn-primary"><Save size={14}/> {saving ? "Menyimpan..." : "Simpan Semua Pengaturan"}</button>
      </div>
    </Layout>
  );
}
