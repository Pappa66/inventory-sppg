"use client";

import React, { useEffect, useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { fmtIDR } from "@/lib/format";
import { Plus, Trash2, Save, Download, RotateCcw } from "lucide-react";
import * as XLSX from "xlsx";

const DEFAULT_ENTRIES = [
  { jabatan: "Kepala SPPG", jumlah: 1, insentif: 2000, nama: "" },
  { jabatan: "Pengawas Gizi", jumlah: 1, insentif: 2000, nama: "" },
  { jabatan: "Pengawas Keuangan", jumlah: 1, insentif: 2000, nama: "" },
  { jabatan: "Asisten Lapangan", jumlah: 1, insentif: 2000, nama: "" },
  { jabatan: "Tenaga Persiapan", jumlah: 2, insentif: 2000, nama: "" },
  { jabatan: "Tenaga Masak", jumlah: 4, insentif: 2000, nama: "" },
  { jabatan: "Tenaga Pemorsian", jumlah: 2, insentif: 2000, nama: "" },
  { jabatan: "Petugas Kebersihan", jumlah: 2, insentif: 2000, nama: "" },
  { jabatan: "Pencuci Ompreng", jumlah: 2, insentif: 2000, nama: "" },
  { jabatan: "Driver", jumlah: 2, insentif: 2000, nama: "" },
  { jabatan: "Kader Gizi", jumlah: 5, insentif: 2000, nama: "" },
];

const EMPTY_ROW = { jabatan: "", jumlah: 1, insentif: 2000, nama: "" };

export default function DafNomPage() {
  const { activeRole } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const canEdit = ["admin_apps", "admin_sppg", "kitchen_head", "accountant"].includes(activeRole);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/dafnom")
      .then(r => setEntries(r.data || DEFAULT_ENTRIES))
      .catch(() => setEntries(DEFAULT_ENTRIES))
      .finally(() => { setLoading(false); setDirty(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = (idx, field, value) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
    setDirty(true);
  };

  const addRow = () => {
    setEntries(prev => [...prev, { ...EMPTY_ROW }]);
    setDirty(true);
  };

  const addRows = (n) => {
    const rows = Array.from({ length: n }, () => ({ ...EMPTY_ROW }));
    setEntries(prev => [...prev, ...rows]);
    setDirty(true);
  };

  const removeRow = (idx) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
    setDirty(true);
  };

  const resetToDefault = () => {
    if (!confirm("Reset ke data default? Semua perubahan akan hilang.")) return;
    setEntries(DEFAULT_ENTRIES);
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/dafnom", { entries });
      toast.success("DafNom tersimpan");
      setDirty(false);
    } catch (er) {
      toast.error(formatErr(er));
    } finally {
      setSaving(false);
    }
  };

  const totalInsentif = entries.reduce((s, e) => s + (e.jumlah || 0) * (e.insentif || 0), 0);
  const totalOrang = entries.reduce((s, e) => s + (e.jumlah || 0), 0);

  const exportExcel = () => {
    const rows = [
      ["DAFTAR NOMINATIF (DAFNOM)"],
      ["Insentif Relawan & Staff SPPG"],
      [],
      ["No", "Jabatan", "Nama", "Jumlah Orang", "Insentif/Hari (Rp)", "Total (Rp)"],
    ];
    entries.forEach((d, i) => {
      rows.push([i + 1, d.jabatan, d.nama || "-", d.jumlah, d.insentif, (d.jumlah || 0) * (d.insentif || 0)]);
    });
    rows.push([]);
    rows.push(["", "", "TOTAL", totalOrang, "", totalInsentif]);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 5 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DafNom");
    XLSX.writeFile(wb, `DafNom-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Excel berhasil diunduh");
  };

  if (!canEdit) {
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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">DafNom</h1>
            <p className="text-[#5C5C5C] mt-1">Daftar Nominatif Insentif Staff & Relawan</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportExcel} className="btn-outline text-sm"><Download size={14} /> Export Excel</button>
            {canEdit && (
              <button onClick={save} disabled={!dirty || saving} className="btn-primary text-sm" style={{ opacity: !dirty || saving ? 0.5 : 1 }}>
                <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card-soft p-4 border-l-4 border-l-[#6D28D9]">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Staff & Relawan</div>
            <div className="font-display text-2xl font-bold mt-1 text-[#6D28D9]">{totalOrang} orang</div>
          </div>
          <div className="card-soft p-4 border-l-4 border-l-[#D97706]">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Jenis Jabatan</div>
            <div className="font-display text-2xl font-bold mt-1 text-[#D97706]">{entries.length}</div>
          </div>
          <div className="card-soft p-4 border-l-4 border-l-[#4A7C59]">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Insentif/Hari</div>
            <div className="font-display text-2xl font-bold mt-1 text-[#4A7C59]">{fmtIDR(totalInsentif)}</div>
          </div>
        </div>

        {/* Inline editable table */}
        {loading ? (
          <div className="card-soft p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="card-soft overflow-hidden">
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-center py-3 px-3 w-10">No</th>
                    <th className="text-left py-3 px-3">Jabatan</th>
                    <th className="text-left py-3 px-3">Nama</th>
                    <th className="text-right py-3 px-3 w-24">Jumlah</th>
                    <th className="text-right py-3 px-3 w-36">Insentif/Hari</th>
                    <th className="text-right py-3 px-3 w-36">Total</th>
                    {canEdit && <th className="text-right py-3 px-3 w-16">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => {
                    const rowTotal = (entry.jumlah || 0) * (entry.insentif || 0);
                    return (
                      <tr key={idx} className="border-b border-[#EAE4D8] last:border-0 hover:bg-[#F9F6F0]/50">
                        <td className="py-2 px-3 text-center text-[#5C5C5C]">{idx + 1}</td>
                        <td className="py-1 px-1">
                          <input
                            className="w-full px-2 py-1.5 rounded border border-transparent hover:border-[#EAE4D8] focus:border-[#4A7C59] focus:outline-none bg-transparent text-sm font-medium transition-colors"
                            value={entry.jabatan}
                            onChange={e => update(idx, "jabatan", e.target.value)}
                            placeholder="Contoh: Kepala SPPG"
                          />
                        </td>
                        <td className="py-1 px-1">
                          <input
                            className="w-full px-2 py-1.5 rounded border border-transparent hover:border-[#EAE4D8] focus:border-[#4A7C59] focus:outline-none bg-transparent text-sm text-[#5C5C5C] transition-colors"
                            value={entry.nama}
                            onChange={e => update(idx, "nama", e.target.value)}
                            placeholder="Nama lengkap"
                          />
                        </td>
                        <td className="py-1 px-1">
                          <input
                            type="number"
                            min="0"
                            className="w-full px-2 py-1.5 rounded border border-transparent hover:border-[#EAE4D8] focus:border-[#4A7C59] focus:outline-none bg-transparent text-sm text-right audit-ts transition-colors"
                            value={entry.jumlah || ""}
                            onChange={e => update(idx, "jumlah", parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td className="py-1 px-1">
                          <input
                            type="number"
                            min="0"
                            step="500"
                            className="w-full px-2 py-1.5 rounded border border-transparent hover:border-[#EAE4D8] focus:border-[#4A7C59] focus:outline-none bg-transparent text-sm text-right audit-ts transition-colors"
                            value={entry.insentif || ""}
                            onChange={e => update(idx, "insentif", parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[#4A7C59] audit-ts">
                          {fmtIDR(rowTotal)}
                        </td>
                        {canEdit && (
                          <td className="py-2 px-3 text-right">
                            <button onClick={() => removeRow(idx)} className="btn-ghost text-xs text-[#C5533B] p-1" title="Hapus baris">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#EAE4D8] font-bold">
                    <td colSpan={3} className="py-3 px-4 text-right">Total</td>
                    <td className="py-3 px-4 text-right audit-ts">{totalOrang}</td>
                    <td></td>
                    <td className="py-3 px-4 text-right audit-ts text-[#4A7C59]">{fmtIDR(totalInsentif)}</td>
                    {canEdit && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3 p-3">
              {entries.map((entry, idx) => {
                const rowTotal = (entry.jumlah || 0) * (entry.insentif || 0);
                return (
                  <div key={idx} className="bg-white rounded-xl border border-[#EAE4D8] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#5C5C5C] font-semibold">#{idx + 1}</span>
                      {canEdit && (
                        <button onClick={() => removeRow(idx)} className="btn-ghost text-xs text-[#C5533B] p-1"><Trash2 size={12} /></button>
                      )}
                    </div>
                    <input
                      className="form-input w-full font-medium"
                      value={entry.jabatan}
                      onChange={e => update(idx, "jabatan", e.target.value)}
                      placeholder="Jabatan"
                    />
                    <input
                      className="form-input w-full"
                      value={entry.nama}
                      onChange={e => update(idx, "nama", e.target.value)}
                      placeholder="Nama lengkap"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase text-[#5C5C5C]">Jumlah</label>
                        <input type="number" min="0"
                          className="form-input w-full mt-0.5 text-right"
                          value={entry.jumlah || ""}
                          onChange={e => update(idx, "jumlah", parseInt(e.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-[#5C5C5C]">Insentif/Hari</label>
                        <input type="number" min="0" step="500"
                          className="form-input w-full mt-0.5 text-right"
                          value={entry.insentif || ""}
                          onChange={e => update(idx, "insentif", parseInt(e.target.value) || 0)} />
                      </div>
                    </div>
                    <div className="text-right text-sm font-bold text-[#4A7C59]">{fmtIDR(rowTotal)}</div>
                  </div>
                );
              })}
            </div>

            {/* Add row buttons */}
            {canEdit && (
              <div className="px-4 py-3 border-t border-[#EAE4D8] flex flex-wrap gap-2">
                <button onClick={addRow} className="btn-ghost text-xs"><Plus size={14} /> Tambah 1 Baris</button>
                <button onClick={() => addRows(5)} className="btn-ghost text-xs"><Plus size={14} /> Tambah 5 Baris</button>
                <button onClick={resetToDefault} className="btn-ghost text-xs text-[#D97706]"><RotateCcw size={14} /> Reset Default</button>
              </div>
            )}
          </div>
        )}

        {/* Hint */}
        <div className="text-xs text-[#5C5C5C] bg-[#F9F6F0] rounded-lg px-4 py-3">
          <strong>Cara pakai:</strong> Klik langsung pada sel untuk mengedit nama, jabatan, jumlah, atau nominal insentif. 
          Total per baris dihitung otomatis. Jangan lupa klik <strong>Simpan</strong> setelah selesai.
        </div>
      </div>
    </Layout>
  );
}
