"use client";

import React, { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { fmtIDR, fmtDate, BENEFICIARY_TYPES } from "@/lib/format";
import {
  FileText, ScrollText, BookOpen, Users, Stamp, FileCheck,
  Calendar, Download, Printer
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getLogo } from "@/lib/logo";
import { getSettings, renderLetterhead, renderLetterTitle, renderSignatureBlock, todayIndo } from "@/lib/letterhead";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Helper for label:value rows in PDF
function pv(doc, label, value, x, y) {
  doc.setFont("helvetica", "normal");
  doc.text(`${label}  :`, x, y);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + 35, y);
  return y + 5.5;
}

const REPORT_TABS = [
  { key: "lr", label: "LR - Laporan Resume", icon: FileText, color: "#4A7C59" },
  { key: "lpa", label: "LPA - Laporan 2 Pekanan", icon: Calendar, color: "#D97706" },
  { key: "catatan", label: "Catatan Harian", icon: ScrollText, color: "#2C4251" },
  { key: "dafnom", label: "DafNom - Insentif Relawan", icon: Users, color: "#6D28D9" },
  { key: "sptj", label: "SPTJ - Pernyataan Tanggung Jawab", icon: Stamp, color: "#C5533B" },
  { key: "bapsd", label: "BAPSD - Berita Acara", icon: FileCheck, color: "#0891B2" },
];

export default function ReportsPage() {
  const { user, activeRole } = useAuth();

  const [activeTab, setActiveTab] = useState("lr");
  const [transaksi, setTransaksi] = useState([]);
  const [anggaran, setAnggaran] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [settings, setSettings] = useState({});
  const [deliveryPlans, setDeliveryPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/transactions").then(r => setTransaksi(r.data || [])),
      api.get("/anggaran-periods").then(r => setAnggaran(r.data || [])),
      api.get("/biweekly-periods").then(r => {
        setPeriods(r.data || []);
        if (r.data?.length) setSelectedPeriod(r.data[0].id);
      }),
      api.get("/settings/logo").then(r => setSettings(r.data || {})).catch(() => setSettings({})),
      api.get("/delivery-plans").then(r => setDeliveryPlans(r.data || [])).catch(() => setDeliveryPlans([])),
    ]).finally(() => setLoading(false));
  }, []);

  // LR Data: group transactions by account type
  const lrData = useMemo(() => {
    const pemasukan = transaksi.filter(t => ["1300"].includes(t.account_code));
    const pengeluaran = transaksi.filter(t => ["2100", "2200", "2300", "3100"].includes(t.account_code));
    const totalPemasukan = pemasukan.reduce((s, t) => s + (t.debit || 0) - (t.credit || 0), 0);
    const totalPengeluaran = pengeluaran.reduce((s, t) => s + (t.credit || 0) - (t.debit || 0), 0);
    return { pemasukan, pengeluaran, totalPemasukan, totalPengeluaran, saldo: totalPemasukan - totalPengeluaran };
  }, [transaksi]);

  // LPA Data: same as LR but filtered by period
  const lpaData = useMemo(() => {
    if (!selectedPeriod) return lrData;
    const period = periods.find(p => p.id === selectedPeriod);
    if (!period) return lrData;
    const periodTx = transaksi.filter(t => t.transaction_date >= period.start_date && t.transaction_date <= period.end_date);
    const pemasukan = periodTx.filter(t => ["1300"].includes(t.account_code));
    const pengeluaran = periodTx.filter(t => ["2100", "2200", "2300", "3100"].includes(t.account_code));
    const totalPemasukan = pemasukan.reduce((s, t) => s + (t.debit || 0) - (t.credit || 0), 0);
    const totalPengeluaran = pengeluaran.reduce((s, t) => s + (t.credit || 0) - (t.debit || 0), 0);
    return { pemasukan, pengeluaran, totalPemasukan, totalPengeluaran, saldo: totalPemasukan - totalPengeluaran };
  }, [transaksi, selectedPeriod, periods, lrData]);

  // Catatan: daily expenses
  const catatanData = useMemo(() => {
    const dailyMap = {};
    for (const t of transaksi.filter(t => ["2100", "2200", "2300"].includes(t.account_code))) {
      const date = t.transaction_date;
      if (!dailyMap[date]) dailyMap[date] = { items: [], total: 0 };
      dailyMap[date].items.push(t);
      dailyMap[date].total += (t.credit || 0) - (t.debit || 0);
    }
    return dailyMap;
  }, [transaksi]);

  // DafNom: volunteer incentives
  const dafnomData = [
    { jabatan: "Kepala SPPG", jumlah: 1, insentif: 0 },
    { jabatan: "Pengawas Gizi", jumlah: 1, insentif: 0 },
    { jabatan: "Pengawas Keuangan", jumlah: 1, insentif: 0 },
    { jabatan: "Asisten Lapangan", jumlah: 1, insentif: 0 },
    { jabatan: "Tenaga Persiapan", jumlah: 2, insentif: 0 },
    { jabatan: "Tenaga Masak", jumlah: 4, insentif: 0 },
    { jabatan: "Tenaga Pemorsian", jumlah: 2, insentif: 0 },
    { jabatan: "Petugas Kebersihan", jumlah: 2, insentif: 0 },
    { jabatan: "Pencuci Ompreng", jumlah: 2, insentif: 0 },
    { jabatan: "Driver", jumlah: 2, insentif: 0 },
    { jabatan: "Kader Gizi", jumlah: 5, insentif: 0 },
  ];

  const exportPDF = async (tab) => {
    const doc = new jsPDF();
    const [logo, settings] = await Promise.all([getLogo(), getSettings()]);
    const titleY = renderLetterhead(doc, settings, logo);
    doc.setFontSize(14);
    doc.text(`LAPORAN ${REPORT_TABS.find(t => t.key === tab)?.label || ""}`, 14, titleY);
    doc.setFontSize(9);
    doc.text(`Dicetak: ${todayIndo()}`, 14, titleY + 6);

    if (tab === "lr" || tab === "lpa") {
      const data = tab === "lr" ? lrData : lpaData;
      autoTable(doc, {
        startY: titleY + 12,
        head: [["Keterangan", "Jumlah"]],
        body: [
          ["Total Pemasukan", fmtIDR(data.totalPemasukan)],
          ["Total Pengeluaran", fmtIDR(data.totalPengeluaran)],
          ["Saldo", fmtIDR(data.saldo)],
        ],
      });
    }

    doc.save(`laporan-${tab}-${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success("PDF berhasil diunduh");
  };

  const cetakSPTJ = async () => {
    const doc = new jsPDF();
    const [logo, settings] = await Promise.all([getLogo(), getSettings()]);
    const ml = 20, mr = 20, pw = 210;
    const sppgName = settings.sppg_name || "SPPG MBG";
    const kepala = settings.nama_kepala || "___________________";
    const addr = settings.sppg_address || "___________________";

    let y = renderLetterhead(doc, settings, logo);
    y = renderLetterTitle(doc, "SURAT PERNYATAAN TANGGUNG JAWAB", "(Lampiran 30j Permenkes)", y, pw, ml, mr);

    // ── Opening ──
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0x1F, 0x1F, 0x1F);
    doc.text("Yang bertanda tangan di bawah ini:", ml, y);
    y += 8;

    // ── Identity block ──
    y = pv(doc, "Nama", kepala, ml + 3, y);
    y = pv(doc, "Jabatan", `Kepala ${sppgName}`, ml + 3, y);
    y = pv(doc, "Program", "Makan Bergizi Gratis (MBG)", ml + 3, y);
    if (settings.id_sppg) y = pv(doc, "ID SPPG", settings.id_sppg, ml + 3, y);
    y += 3;

    // ── Declaration intro ──
    doc.setFont("helvetica", "normal");
    doc.text("Dengan ini menyatakan dengan sesungguhnya bahwa:", ml, y);
    y += 8;

    // ── Numbered declarations ──
    const decls = [
      "Dana bantuan pangan yang diterima dari Pemerintah telah digunakan semata-mata untuk kegiatan operasional program Makan Bergizi Gratis sesuai ketentuan yang berlaku;",
      "Penyaluran bantuan pangan telah dilaksanakan kepada penerima manfaat yang berhak sesuai data yang tercatat dalam sistem;",
      "Laporan pertanggungjawaban keuangan dan operasional yang disampaikan adalah benar, lengkap, dan dapat dipertanggungjawabkan secara hukum.",
    ];
    decls.forEach((text, i) => {
      doc.setFont("helvetica", "normal");
      doc.text(`${i + 1}.`, ml + 3, y);
      const lines = doc.splitTextToSize(text, pw - ml - mr - 12);
      doc.text(lines, ml + 10, y);
      y += lines.length * 4.5 + 3;
    });

    y += 3;

    // ── Closing ──
    doc.setFont("helvetica", "normal");
    const closing = "Demikian Surat Pernyataan Tanggung Jawab ini saya buat dengan sebenar-benarnya dalam keadaan sadar tanpa adanya paksaan dari pihak manapun.";
    const closingLines = doc.splitTextToSize(closing, pw - ml - mr);
    doc.text(closingLines, ml, y);
    y += closingLines.length * 4.5 + 10;

    // ── Date (right-aligned) ──
    const dateStr = `${addr}, ${todayIndo()}`;
    const dateW = doc.getStringUnitWidth(dateStr) * 10 / doc.internal.scaleFactor;
    doc.text(dateStr, pw - mr, y, { align: "right" });
    y += 14;

    // ── Signature (no line, just name + jabatan) ──
    y = renderSignatureBlock(doc, settings, y, pw, [
      { label: "Kepala SPPG,", settingsKey: "nama_kepala", jabatan: `Kepala ${sppgName}` },
    ]);

    doc.save(`SPTJ-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("SPTJ berhasil dicetak");
  };

  const cetakBAPSD = async () => {
    const doc = new jsPDF();
    const [logo, settings] = await Promise.all([getLogo(), getSettings()]);
    const ml = 20, mr = 20, pw = 210;
    const sppgName = settings.sppg_name || "SPPG MBG";

    const today = new Date().toISOString().slice(0, 10);
    const todayPlans = deliveryPlans.filter(p => p.plan_date === today);
    const totalPortions = todayPlans.reduce((sum, p) => sum + (p.delivery_plan_items || []).reduce((s, item) => s + (item.portions || 0), 0), 0);
    const totalDestinations = todayPlans.reduce((sum, p) => sum + (p.delivery_plan_items || []).length, 0);
    const driverIds = new Set(todayPlans.map(p => p.delivery_assignments?.[0]?.driver_id).filter(Boolean));

    let y = renderLetterhead(doc, settings, logo);
    y = renderLetterTitle(doc, "BERITA ACARA PENYALURAN", "(Lampiran 30n Permenkes)", y, pw, ml, mr);

    // ── Opening ──
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0x1F, 0x1F, 0x1F);
    doc.text(`Pada hari ini ${todayIndo()}, telah dilaksanakan penyaluran makanan siap distribusi`, ml, y);
    y += 5;
    doc.text(`program Makan Bergizi Gratis di ${sppgName}.`, ml, y);
    y += 10;

    // ── Section I ──
    doc.setFont("helvetica", "bold");
    doc.text("I.  Rincian Penyaluran", ml, y);
    y += 7;

    autoTable(doc, {
      startY: y,
      margin: { left: ml, right: mr },
      head: [["No", "Uraian", "Keterangan"]],
      body: [
        ["1", "Tanggal Penyaluran", todayIndo()],
        ["2", "Lokasi / Tujuan", settings.sppg_address || todayPlans[0]?.delivery_plan_items?.[0]?.destinations?.name || "___________________"],
        ["3", "Total Porsi Didistribusikan", `${totalPortions} porsi`],
        ["4", "Jumlah Tujuan Pengiriman", `${totalDestinations} lokasi`],
        ["5", "Jumlah Driver Pengantar", `${driverIds.size} orang`],
        ["6", "Waktu Distribusi", "08:00 — 11:00 WIB"],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [0x4A, 0x7C, 0x59],
        textColor: [0xFF, 0xFF, 0xFF],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
        lineColor: [0x1F, 0x1F, 0x1F],
        lineWidth: 0.3,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0x1F, 0x1F, 0x1F],
        lineColor: [0x1F, 0x1F, 0x1F],
        lineWidth: 0.15,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { cellWidth: 58 },
        2: { cellWidth: "auto" },
      },
      alternateRowStyles: { fillColor: [0xF9, 0xF6, 0xF0] },
    });

    y = doc.lastAutoTable.finalY + 10;

    // ── Section II ──
    doc.setFont("helvetica", "bold");
    doc.text("II.  Pernyataan", ml, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    const stmts = [
      "Bahwa penyaluran bantuan pangan di atas telah dilaksanakan sesuai dengan ketentuan yang berlaku;",
      "Bahwa makanan yang disalurkan dalam kondisi baik, aman, dan layak konsumsi;",
      "Bahwa berita acara ini dibuat sebagai dasar pertanggungjawaban penyaluran bantuan pangan program Makan Bergizi Gratis.",
    ];
    stmts.forEach((text, i) => {
      doc.text(`${i + 1}.`, ml + 3, y);
      const lines = doc.splitTextToSize(text, pw - ml - mr - 12);
      doc.text(lines, ml + 10, y);
      y += lines.length * 4.5 + 3;
    });

    y += 4;

    // ── Closing ──
    doc.setFont("helvetica", "normal");
    doc.text("Demikian Berita Acara ini dibuat dengan sebenar-benarnya.", ml, y);
    y += 12;

    // ── Dual signature (no lines) ──
    y = renderSignatureBlock(doc, settings, y, pw, [
      { label: "Pengawas Gizi,", settingsKey: "nama_akuntan", jabatan: "Pengawas Gizi" },
      { label: `Kepala ${sppgName},`, settingsKey: "nama_kepala", jabatan: `Kepala ${sppgName}` },
    ]);

    doc.save(`BAPSD-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("BAPSD berhasil dicetak");
  };

  if (!["admin_apps", "admin_sppg", "accountant", "kitchen_head"].includes(activeRole)) {
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
          <h1 className="font-display text-4xl font-bold">Laporan</h1>
          <p className="text-[#5C5C5C] mt-1">LR, LPA, Catatan, DafNom, SPTJ, BAPSD</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {REPORT_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "text-white shadow-md"
                    : "bg-white text-[#5C5C5C] hover:bg-[#F9F6F0] border border-[#EAE4D8]"
                }`}
                style={activeTab === tab.key ? { background: tab.color } : {}}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Period Selector for LPA */}
        {activeTab === "lpa" && (
          <div className="card-soft p-4 flex items-center gap-4">
            <label className="text-sm font-medium">Periode:</label>
            <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm">
              {periods.map(p => <option key={p.id} value={p.id}>{p.period_name}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className="card-soft p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full mx-auto" /></div>
        ) : (
          <>
            {/* LR Tab */}
            {activeTab === "lr" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="card-soft p-5">
                    <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Pemasukan</div>
                    <div className="font-display text-2xl font-bold mt-1 text-[#4A7C59]">{fmtIDR(lrData.totalPemasukan)}</div>
                  </div>
                  <div className="card-soft p-5">
                    <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Pengeluaran</div>
                    <div className="font-display text-2xl font-bold mt-1 text-[#C5533B]">{fmtIDR(lrData.totalPengeluaran)}</div>
                  </div>
                  <div className="card-soft p-5">
                    <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Saldo</div>
                    <div className={`font-display text-2xl font-bold mt-1 ${lrData.saldo >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(lrData.saldo)}</div>
                  </div>
                </div>
                <div className="card-soft overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#EAE4D8] text-xs uppercase tracking-wider">
                      <tr><th className="text-left py-3 px-4">Tanggal</th><th className="text-left py-3 px-4">Kode</th><th className="text-left py-3 px-4">Keterangan</th><th className="text-right py-3 px-4">Debet</th><th className="text-right py-3 px-4">Kredit</th></tr>
                    </thead>
                    <tbody>
                      {transaksi.slice(0, 20).map(t => (
                        <tr key={t.id} className="border-b border-[#EAE4D8] hover:bg-[#F9F6F0]">
                          <td className="py-2 px-4">{t.transaction_date}</td>
                          <td className="py-2 px-4"><span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAE4D8]">{t.account_code}</span></td>
                          <td className="py-2 px-4 max-w-[200px] truncate">{t.description}</td>
                          <td className="py-2 px-4 text-right text-[#4A7C59]">{t.debit ? fmtIDR(t.debit) : "—"}</td>
                          <td className="py-2 px-4 text-right text-[#C5533B]">{t.credit ? fmtIDR(t.credit) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={() => exportPDF("lr")} className="btn-outline flex items-center gap-2"><Download size={14}/> Export PDF</button>
              </div>
            )}

            {/* LPA Tab */}
            {activeTab === "lpa" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="card-soft p-5">
                    <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Pemasukan 2 Pekan</div>
                    <div className="font-display text-2xl font-bold mt-1 text-[#4A7C59]">{fmtIDR(lpaData.totalPemasukan)}</div>
                  </div>
                  <div className="card-soft p-5">
                    <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Pengeluaran 2 Pekan</div>
                    <div className="font-display text-2xl font-bold mt-1 text-[#C5533B]">{fmtIDR(lpaData.totalPengeluaran)}</div>
                  </div>
                  <div className="card-soft p-5">
                    <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Saldo 2 Pekan</div>
                    <div className={`font-display text-2xl font-bold mt-1 ${lpaData.saldo >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(lpaData.saldo)}</div>
                  </div>
                </div>
                <button onClick={() => exportPDF("lpa")} className="btn-outline flex items-center gap-2"><Download size={14}/> Export PDF</button>
              </div>
            )}

            {/* Catatan Tab */}
            {activeTab === "catatan" && (
              <div className="space-y-4">
                {Object.entries(catatanData).sort(([a],[b]) => b.localeCompare(a)).map(([date, data]) => (
                  <div key={date} className="card-soft overflow-hidden">
                    <div className="px-5 py-3 border-b border-[#EAE4D8] bg-[#F9F6F0] flex justify-between">
                      <span className="font-display font-bold">{new Date(date).toLocaleDateString("id-ID", { dateStyle: "full" })}</span>
                      <span className="font-bold">Total: {fmtIDR(data.total)}</span>
                    </div>
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        {data.items.map(t => (
                          <tr key={t.id} className="border-b border-[#EAE4D8] last:border-0">
                            <td className="py-2 px-4"><span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAE4D8]">{t.account_code}</span></td>
                            <td className="py-2 px-4 flex-1">{t.description}</td>
                            <td className="py-2 px-4 text-right text-[#C5533B] font-semibold">{fmtIDR(t.credit || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                ))}
                <button onClick={() => exportPDF("catatan")} className="btn-outline flex items-center gap-2"><Download size={14}/> Export PDF</button>
              </div>
            )}

            {/* DafNom Tab */}
            {activeTab === "dafnom" && (
              <div className="space-y-4">
                <div className="card-soft overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#EAE4D8] bg-[#F9F6F0] font-display font-bold">
                    Daftar Nominatif Insentif Relawan
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#EAE4D8] text-xs uppercase tracking-wider">
                      <tr><th className="text-left py-3 px-4">No</th><th className="text-left py-3 px-4">Jabatan</th><th className="text-right py-3 px-4">Jumlah Orang</th><th className="text-right py-3 px-4">Insentif/Hari</th><th className="text-right py-3 px-4">Total</th></tr>
                    </thead>
                    <tbody>
                      {dafnomData.map((d, i) => (
                        <tr key={i} className="border-b border-[#EAE4D8] last:border-0 hover:bg-[#F9F6F0]">
                          <td className="py-3 px-4">{i + 1}</td>
                          <td className="py-3 px-4 font-medium">{d.jabatan}</td>
                          <td className="py-3 px-4 text-right">{d.jumlah}</td>
                          <td className="py-3 px-4 text-right">{fmtIDR(d.insentif)}</td>
                          <td className="py-3 px-4 text-right font-semibold">{fmtIDR(d.jumlah * d.insentif)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
                <button onClick={() => exportPDF("dafnom")} className="btn-outline flex items-center gap-2"><Download size={14}/> Export PDF</button>
              </div>
            )}

            {/* SPTJ Tab */}
            {activeTab === "sptj" && (
              <div className="space-y-4">
                <div className="bg-white border border-[#EAE4D8] rounded-xl shadow-sm max-w-[700px] mx-auto">
                  {/* Paper */}
                  <div className="p-8 sm:p-12">
                    {/* Kop Surat */}
                    <div className="flex items-start gap-4 pb-4 border-b-2 border-[#1F1F1F]">
                      <div className="w-14 h-14 rounded-lg bg-[#4A7C59] text-white grid place-items-center shrink-0 text-xl font-bold">S</div>
                      <div>
                        {settings.nama_yayasan && <div className="text-[10px] text-[#5C5C5C]">{settings.nama_yayasan}</div>}
                        <div className="font-display font-bold text-lg">{settings.sppg_name || "SPPG MBG"}</div>
                        <div className="text-[10px] text-[#5C5C5C]">
                          {settings.sppg_address || "Alamat SPPG"}
                          {settings.id_sppg && `  |  ID: ${settings.id_sppg}`}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mt-6 mb-1">
                      <h2 className="font-bold text-base uppercase tracking-wide">Surat Pernyataan Tanggung Jawab</h2>
                      <p className="text-[11px] text-[#999]">(Lampiran 30j Permenkes)</p>
                    </div>
                    <div className="border-t border-[#1F1F1F] mb-6"></div>

                    {/* Body */}
                    <div className="text-[13px] leading-relaxed space-y-4">
                      <p>Yang bertanda tangan di bawah ini:</p>

                      <table className="text-[13px] ml-4">
                        <tbody>
                          <tr><td className="pr-2 text-[#5C5C5C]">Nama</td><td className="pr-2">:</td><td className="font-bold">{settings.nama_kepala || "___________________"}</td></tr>
                          <tr><td className="pr-2 text-[#5C5C5C]">Jabatan</td><td className="pr-2">:</td><td className="font-bold">Kepala {settings.sppg_name || "SPPG"}</td></tr>
                          <tr><td className="pr-2 text-[#5C5C5C]">Program</td><td className="pr-2">:</td><td className="font-bold">Makan Bergizi Gratis (MBG)</td></tr>
                          {settings.id_sppg && <tr><td className="pr-2 text-[#5C5C5C]">ID SPPG</td><td className="pr-2">:</td><td className="font-bold">{settings.id_sppg}</td></tr>}
                        </tbody>
                      </table>

                      <p>Dengan ini menyatakan dengan sesungguhnya bahwa:</p>

                      <ol className="list-decimal ml-6 space-y-2">
                        <li>Dana bantuan pangan yang diterima dari Pemerintah telah digunakan semata-mata untuk kegiatan operasional program Makan Bergizi Gratis sesuai ketentuan yang berlaku;</li>
                        <li>Penyaluran bantuan pangan telah dilaksanakan kepada penerima manfaat yang berhak sesuai data yang tercatat dalam sistem;</li>
                        <li>Laporan pertanggungjawaban keuangan dan operasional yang disampaikan adalah benar, lengkap, dan dapat dipertanggungjawabkan secara hukum.</li>
                      </ol>

                      <p>Demikian Surat Pernyataan Tanggung Jawab ini saya buat dengan sebenar-benarnya dalam keadaan sadar tanpa adanya paksaan dari pihak manapun.</p>

                      {/* Date */}
                      <p className="mt-6 text-right">{settings.sppg_address || "___________________"}, {todayIndo()}</p>

                      {/* Signature */}
                      <div className="flex justify-end mt-2">
                        <div className="text-center w-48">
                          <div className="text-[13px]">Kepala SPPG,</div>
                          <div className="h-16"></div>
                          <div className="font-bold text-[13px] mt-1">{settings.nama_kepala || "___________________"}</div>
                          <div className="text-[11px] text-[#5C5C5C]">Kepala {settings.sppg_name || "SPPG"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={cetakSPTJ} className="btn-outline flex items-center gap-2"><Printer size={14}/> Cetak SPTJ (PDF)</button>
              </div>
            )}

            {/* BAPSD Tab */}
            {activeTab === "bapsd" && (
              <div className="space-y-4">
                <div className="bg-white border border-[#EAE4D8] rounded-xl shadow-sm max-w-[700px] mx-auto">
                  <div className="p-8 sm:p-12">
                    {/* Kop Surat */}
                    <div className="flex items-start gap-4 pb-4 border-b-2 border-[#1F1F1F]">
                      <div className="w-14 h-14 rounded-lg bg-[#4A7C59] text-white grid place-items-center shrink-0 text-xl font-bold">S</div>
                      <div>
                        {settings.nama_yayasan && <div className="text-[10px] text-[#5C5C5C]">{settings.nama_yayasan}</div>}
                        <div className="font-display font-bold text-lg">{settings.sppg_name || "SPPG MBG"}</div>
                        <div className="text-[10px] text-[#5C5C5C]">
                          {settings.sppg_address || "Alamat SPPG"}
                          {settings.id_sppg && `  |  ID: ${settings.id_sppg}`}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mt-6 mb-1">
                      <h2 className="font-bold text-base uppercase tracking-wide">Berita Acara Penyaluran</h2>
                      <p className="text-[11px] text-[#999]">(Lampiran 30n Permenkes)</p>
                    </div>
                    <div className="border-t border-[#1F1F1F] mb-6"></div>

                    {/* Body */}
                    <div className="text-[13px] leading-relaxed space-y-4">
                      <p>Pada hari ini {todayIndo()}, telah dilaksanakan penyaluran makanan siap distribusi program Makan Bergizi Gratis di {settings.sppg_name || "SPPG MBG"}.</p>

                      {/* Section I */}
                      <p className="font-bold mt-4">I.  Rincian Penyaluran</p>
                      <table className="w-full text-[12px] border border-[#1F1F1F]">
                        <thead>
                          <tr className="bg-[#4A7C59] text-white">
                            <th className="border border-[#1F1F1F] px-3 py-1.5 text-center w-10">No</th>
                            <th className="border border-[#1F1F1F] px-3 py-1.5 text-left">Uraian</th>
                            <th className="border border-[#1F1F1F] px-3 py-1.5 text-left">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ["1", "Tanggal Penyaluran", todayIndo()],
                            ["2", "Lokasi / Tujuan", settings.sppg_address || "___________________"],
                            ["3", "Total Porsi Didistribusikan", "________ porsi"],
                            ["4", "Jumlah Tujuan Pengiriman", "________ lokasi"],
                            ["5", "Jumlah Driver Pengantar", "________ orang"],
                            ["6", "Waktu Distribusi", "08:00 — 11:00 WIB"],
                          ].map(([no, uraian, ket], i) => (
                            <tr key={i} className={i % 2 === 1 ? "bg-[#F9F6F0]" : ""}>
                              <td className="border border-[#1F1F1F] px-3 py-1.5 text-center">{no}</td>
                              <td className="border border-[#1F1F1F] px-3 py-1.5">{uraian}</td>
                              <td className="border border-[#1F1F1F] px-3 py-1.5">{ket}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Section II */}
                      <p className="font-bold mt-4">II.  Pernyataan</p>
                      <ol className="list-decimal ml-6 space-y-2">
                        <li>Bahwa penyaluran bantuan pangan di atas telah dilaksanakan sesuai dengan ketentuan yang berlaku;</li>
                        <li>Bahwa makanan yang disalurkan dalam kondisi baik, aman, dan layak konsumsi;</li>
                        <li>Bahwa berita acara ini dibuat sebagai dasar pertanggungjawaban penyaluran bantuan pangan program Makan Bergizi Gratis.</li>
                      </ol>

                      <p className="mt-4">Demikian Berita Acara ini dibuat dengan sebenar-benarnya.</p>

                      {/* Dual Signature */}
                      <div className="flex justify-between mt-8">
                        <div className="text-center w-48">
                          <div className="text-[13px]">Mengetahui,</div>
                          <div className="h-16"></div>
                          <div className="font-bold text-[13px] mt-1">{settings.nama_akuntan || "___________________"}</div>
                          <div className="text-[11px] text-[#5C5C5C]">Pengawas Gizi</div>
                        </div>
                        <div className="text-center w-48">
                          <div className="text-[13px]">Kepala {settings.sppg_name || "SPPG"},</div>
                          <div className="h-16"></div>
                          <div className="font-bold text-[13px] mt-1">{settings.nama_kepala || "___________________"}</div>
                          <div className="text-[11px] text-[#5C5C5C]">Kepala {settings.sppg_name || "SPPG"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={cetakBAPSD} className="btn-outline flex items-center gap-2"><Printer size={14}/> Cetak BAPSD (PDF)</button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
