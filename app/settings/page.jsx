"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { getLogo, clearLogoCache } from "@/lib/logo";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Upload } from "lucide-react";

export default function Page() {
  const { user } = useAuth();
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getLogo().then(setLogoPreview);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-bold">Pengaturan</h1>
          <p className="text-[#5C5C5C] mt-1">Upload logo SPPG untuk laporan PDF</p>
        </div>

        <div className="card-soft p-6 max-w-md">
          <h2 className="font-display font-bold text-lg mb-4">Logo SPPG</h2>

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
      </div>
    </Layout>
  );
}
