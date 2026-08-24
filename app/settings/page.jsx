"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { getLogo, clearLogoCache } from "@/lib/logo";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, Save, Building2, Truck as TruckIcon } from "lucide-react";

export default function Page() {
  const { user } = useAuth();
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    sppg_name: "",
    sppg_address: "",
    default_transport_cost: 0,
  });

  useEffect(() => {
    getLogo().then(setLogoPreview);
    api.get("/settings/logo").then(({ data }) => {
      if (data?.sppg_name) setSettings(prev => ({ ...prev, sppg_name: data.sppg_name }));
      if (data?.sppg_address) setSettings(prev => ({ ...prev, sppg_address: data.sppg_address }));
      if (data?.default_transport_cost) setSettings(prev => ({ ...prev, default_transport_cost: data.default_transport_cost }));
    }).catch(() => {});
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-bold">Pengaturan</h1>
          <p className="text-[#5C5C5C] mt-1">Konfigurasi umum aplikasi SPPG</p>
        </div>

        <div className="card-soft p-6 max-w-md">
          <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Upload size={18}/> Logo SPPG</h2>
          {logoPreview && (
            <div className="mb-4 p-4 border border-[#EAE4D8] rounded-lg bg-white">
              <img src={logoPreview} alt="Logo SPPG" className="max-h-24 object-contain" />
            </div>
          )}
          {!logoPreview && (
            <div className="mb-4 p-8 border-2 border-dashed border-[#EAE4D8] rounded-lg text-center text-[#5C5C5C] text-sm">
              Belum ada logo. Upload logo SPPG.
            </div>
          )}
          <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
            <Upload size={16} />
            {uploading ? "Mengupload..." : "Upload Logo"}
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
          </label>
          <p className="text-xs text-[#5C5C5C] mt-3">
            Logo akan tampil di semua laporan PDF (Keuangan, Stok per Zona, Paket BPK).
          </p>
        </div>

        <div className="card-soft p-6 max-w-md">
          <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Building2 size={18}/> Informasi SPPG</h2>
          <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Nama SPPG</label>
          <input className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.sppg_name} onChange={(e)=>setSettings(p=>({...p, sppg_name:e.target.value}))} placeholder="Contoh: SPPG Kadudampit"/>
          <label className="text-xs uppercase tracking-widest text-[#5C5C5C] mt-3 block">Alamat</label>
          <textarea rows={2} className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.sppg_address} onChange={(e)=>setSettings(p=>({...p, sppg_address:e.target.value}))} placeholder="Alamat lengkap SPPG"/>
          <label className="text-xs uppercase tracking-widest text-[#5C5C5C] mt-3 block flex items-center gap-2"><TruckIcon size={12}/> Default Biaya Transport (Rp)</label>
          <input type="number" className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]" value={settings.default_transport_cost} onChange={(e)=>setSettings(p=>({...p, default_transport_cost:parseInt(e.target.value)||0}))}/>
          <button onClick={saveSettings} disabled={saving} className="btn-primary mt-4"><Save size={14}/> {saving ? "Menyimpan..." : "Simpan Pengaturan"}</button>
        </div>
      </div>
    </Layout>
  );
}
