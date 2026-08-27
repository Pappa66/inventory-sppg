"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { fmtIDR, fmtDate, BENEFICIARY_TYPES, ACCOUNT_CODES } from "@/lib/format";
import {
  FileText, ScrollText, BookOpen, Users, Stamp, FileCheck,
  Calendar, Download, Printer
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType } from "docx";
import { saveAs } from "file-saver";
import Pagination from "@/components/Pagination";
import { getLogo } from "@/lib/logo";
import { getSettings, renderLetterhead, renderLetterTitle, renderSignatureBlock, todayIndo } from "@/lib/letterhead";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_DAFNOM = [
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
  const [globalConfig, setGlobalConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const perPage = 15;

  // DafNom state (read-only from API)
  const [dafnomEntries, setDafnomEntries] = useState([]);

  useEffect(() => {
    api.get("/dafnom").then(r => setDafnomEntries(r.data || DEFAULT_DAFNOM)).catch(() => setDafnomEntries(DEFAULT_DAFNOM));
  }, []);

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
      api.get("/global-config").then(r => setGlobalConfig(r.data || {})).catch(() => setGlobalConfig({})),
    ]).finally(() => setLoading(false));
  }, []);

  const lrData = useMemo(() => {
    let filtered = transaksi;
    if (exportFrom) filtered = filtered.filter(t => t.transaction_date >= exportFrom);
    if (exportTo) filtered = filtered.filter(t => t.transaction_date <= exportTo);
    const pemasukan = filtered.filter(t => ["1300"].includes(t.account_code));
    const pengeluaran = filtered.filter(t => ["2100", "2200", "2300", "3100"].includes(t.account_code));
    const totalPemasukan = pemasukan.reduce((s, t) => s + (t.credit || 0) - (t.debit || 0), 0);
    const totalPengeluaran = pengeluaran.reduce((s, t) => s + (t.credit || 0) - (t.debit || 0), 0);
    return { pemasukan, pengeluaran, totalPemasukan, totalPengeluaran, saldo: totalPemasukan - totalPengeluaran };
  }, [transaksi, exportFrom, exportTo]);

  const paginatedTransaksi = useMemo(() => {
    const filtered = transaksi.filter(t => ["1300", "2100", "2200", "2300", "3100"].includes(t.account_code));
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [transaksi, page, perPage]);

  const lpaData = useMemo(() => {
    if (!selectedPeriod) return lrData;
    const period = periods.find(p => p.id === selectedPeriod);
    if (!period) return lrData;
    const periodTx = transaksi.filter(t => t.transaction_date >= period.start_date && t.transaction_date <= period.end_date);
    const pemasukan = periodTx.filter(t => ["1300"].includes(t.account_code));
    const pengeluaran = periodTx.filter(t => ["2100", "2200", "2300", "3100"].includes(t.account_code));
    const totalPemasukan = pemasukan.reduce((s, t) => s + (t.credit || 0) - (t.debit || 0), 0);
    const totalPengeluaran = pengeluaran.reduce((s, t) => s + (t.credit || 0) - (t.debit || 0), 0);
    return { pemasukan, pengeluaran, totalPemasukan, totalPengeluaran, saldo: totalPemasukan - totalPengeluaran };
  }, [transaksi, selectedPeriod, periods, lrData]);

  const catatanData = useMemo(() => {
    const dailyMap = {};
    let filtered = transaksi.filter(t => ["2100", "2200", "2300"].includes(t.account_code));
    if (exportFrom) filtered = filtered.filter(t => t.transaction_date >= exportFrom);
    if (exportTo) filtered = filtered.filter(t => t.transaction_date <= exportTo);
    for (const t of filtered) {
      const date = t.transaction_date;
      if (!dailyMap[date]) dailyMap[date] = { items: [], total: 0 };
      dailyMap[date].items.push(t);
      dailyMap[date].total += Math.abs((t.credit || 0) - (t.debit || 0));
    }
    return dailyMap;
  }, [transaksi, exportFrom, exportTo]);

  const totalPorsi = deliveryPlans.reduce((sum, dp) => {
    const items = dp.delivery_plan_items || dp.items || [];
    return sum + items.reduce((s, it) => s + (it.portions || 0), 0);
  }, 0);

  // DafNom total
  const dafnomTotal = useMemo(() =>
    dafnomEntries.reduce((s, d) => s + (d.jumlah || 0) * (d.insentif || 0), 0),
    [dafnomEntries]
  );

  // ── Excel Export (multi-sheet: LR, LPA, Catatan, DafNom) ──
  const exportExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: LR
    const lrRows = [
      ["LAPORAN RESUME (LR)"],
      [`Periode: ${exportFrom || "Semua"} s/d ${exportTo || "Semua"}`],
      [],
      ["Keterangan", "Jumlah (Rp)"],
      ["Total Pemasukan", lrData.totalPemasukan],
      ["Total Pengeluaran", lrData.totalPengeluaran],
      ["Saldo", lrData.saldo],
      [],
      ["DETAIL TRANSAKSI"],
      ["Tanggal", "Kode Akun", "Keterangan", "Debet", "Kredit"],
    ];
    for (const t of transaksi) {
      let pass = true;
      if (exportFrom && t.transaction_date < exportFrom) pass = false;
      if (exportTo && t.transaction_date > exportTo) pass = false;
      if (pass) lrRows.push([t.transaction_date, t.account_code, t.description, t.debit || 0, t.credit || 0]);
    }
    const lrSheet = XLSX.utils.aoa_to_sheet(lrRows);
    lrSheet["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 40 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, lrSheet, "LR - Laporan Resume");

    // Sheet 2: LPA
    const lpaRows = [
      ["LAPORAN 2 PEKANAN (LPA)"],
      [`Periode: ${selectedPeriod ? periods.find(p => p.id === selectedPeriod)?.period_name || selectedPeriod : "Pilih periode"}`],
      [],
      ["Keterangan", "Jumlah (Rp)"],
      ["Total Pemasukan", lpaData.totalPemasukan],
      ["Total Pengeluaran", lpaData.totalPengeluaran],
      ["Saldo", lpaData.saldo],
      [],
      ["DETAIL TRANSAKSI"],
      ["Tanggal", "Kode Akun", "Keterangan", "Debet", "Kredit"],
    ];
    for (const t of lpaData.pemasukan || []) {
      lpaRows.push([t.transaction_date, t.account_code, t.description, t.debit || 0, t.credit || 0]);
    }
    for (const t of lpaData.pengeluaran || []) {
      lpaRows.push([t.transaction_date, t.account_code, t.description, t.debit || 0, t.credit || 0]);
    }
    const lpaSheet = XLSX.utils.aoa_to_sheet(lpaRows);
    lpaSheet["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 40 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, lpaSheet, "LPA - Laporan 2 Pekan");

    // Sheet 3: Catatan Harian
    const catRows = [
      ["CATATAN HARIAN"],
      [],
      ["Tanggal", "Kode Akun", "Keterangan", "Jumlah (Rp)"],
    ];
    for (const [date, data] of Object.entries(catatanData).sort(([a], [b]) => b.localeCompare(a))) {
      for (const t of data.items) {
        catRows.push([date, t.account_code, t.description, t.credit || 0]);
      }
      catRows.push([`TOTAL ${date}`, "", "", data.total]);
      catRows.push([]);
    }
    const catSheet = XLSX.utils.aoa_to_sheet(catRows);
    catSheet["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 40 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, catSheet, "Catatan Harian");

    // Sheet 4: DafNom
    const dnRows = [
      ["DAFTAR NOMINATIF (DAFNOM)"],
      ["Insentif Relawan SPPG"],
      [],
      ["No", "Jabatan", "Nama", "Jumlah Orang", "Insentif/Hari (Rp)", "Total (Rp)"],
    ];
    dafnomEntries.forEach((d, i) => {
      dnRows.push([i + 1, d.jabatan, d.nama || "-", d.jumlah, d.insentif, d.jumlah * d.insentif]);
    });
    dnRows.push([]);
    dnRows.push(["", "", "TOTAL", "", "", dafnomTotal]);
    const dnSheet = XLSX.utils.aoa_to_sheet(dnRows);
    dnSheet["!cols"] = [{ wch: 5 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, dnSheet, "DafNom - Insentif Relawan");

    const filename = `Laporan-SPPG-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success("File Excel berhasil diunduh");
  }, [lrData, lpaData, catatanData, dafnomEntries, dafnomTotal, transaksi, exportFrom, exportTo, selectedPeriod, periods]);

  // ── Word Export: SPTJ ──
  const exportSPTJWord = useCallback(async () => {
    const sppgName = settings.sppg_name || "SPPG MBG";
    const kepala = settings.nama_kepala || "___________________";
    const addr = settings.sppg_address || "___________________";

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: [
          // Kop Surat
          new Paragraph({ alignment: AlignmentType.LEFT, children: [
            new TextRun({ text: settings.nama_yayasan || "", font: "Arial", size: 16, color: "7A7A7A" }),
          ]}),
          new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 40 }, children: [
            new TextRun({ text: sppgName, font: "Arial", size: 28, bold: true }),
          ]}),
          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: `ID: ${settings.id_sppg || "-"}  |  ${addr}`, font: "Arial", size: 14, color: "7A7A7A" }),
          ]}),
          // Garis
          new Paragraph({ spacing: { after: 300 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1F1F1F" } }, children: [] }),
          // Title
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [
            new TextRun({ text: "SURAT PERNYATAAN TANGGUNG JAWAB", font: "Arial", size: 24, bold: true }),
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
            new TextRun({ text: "(Lampiran 30j Permenkes)", font: "Arial", size: 16, color: "999999" }),
          ]}),
          // Body
          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: "Yang bertanda tangan di bawah ini:", font: "Arial", size: 20 }),
          ]}),
          new Paragraph({ spacing: { after: 40 }, indent: { left: 720 }, children: [
            new TextRun({ text: "Nama\t\t: ", font: "Arial", size: 20 }),
            new TextRun({ text: kepala, font: "Arial", size: 20, bold: true }),
          ]}),
          new Paragraph({ spacing: { after: 40 }, indent: { left: 720 }, children: [
            new TextRun({ text: "Jabatan\t\t: ", font: "Arial", size: 20 }),
            new TextRun({ text: `Kepala ${sppgName}`, font: "Arial", size: 20, bold: true }),
          ]}),
          new Paragraph({ spacing: { after: 40 }, indent: { left: 720 }, children: [
            new TextRun({ text: "Program\t\t: ", font: "Arial", size: 20 }),
            new TextRun({ text: "Makan Bergizi Gratis (MBG)", font: "Arial", size: 20, bold: true }),
          ]}),
          ...(settings.id_sppg ? [new Paragraph({ spacing: { after: 200 }, indent: { left: 720 }, children: [
            new TextRun({ text: "ID SPPG\t\t: ", font: "Arial", size: 20 }),
            new TextRun({ text: settings.id_sppg, font: "Arial", size: 20, bold: true }),
          ]})] : []),
          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: "Dengan ini menyatakan dengan sesungguhnya bahwa:", font: "Arial", size: 20 }),
          ]}),
          // Numbered declarations
          ...["Dana bantuan pangan yang diterima dari Pemerintah telah digunakan semata-mata untuk kegiatan operasional program Makan Bergizi Gratis sesuai ketentuan yang berlaku;",
            "Penyaluran bantuan pangan telah dilaksanakan kepada penerima manfaat yang berhak sesuai data yang tercatat dalam sistem;",
            "Laporan pertanggungjawaban keuangan dan operasional yang disampaikan adalah benar, lengkap, dan dapat dipertanggungjawabkan secara hukum."
          ].map((text, i) => new Paragraph({ spacing: { after: 120 }, indent: { left: 720 }, children: [
            new TextRun({ text: `${i + 1}. `, font: "Arial", size: 20 }),
            new TextRun({ text, font: "Arial", size: 20 }),
          ]})),
          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: "Demikian Surat Pernyataan Tanggung Jawab ini saya buat dengan sebenar-benarnya dalam keadaan sadar tanpa adanya paksaan dari pihak manapun.", font: "Arial", size: 20 }),
          ]}),
          // Date
          new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 600 }, children: [
            new TextRun({ text: `${addr}, ${todayIndo()}`, font: "Arial", size: 20 }),
          ]}),
          // Signature
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [
            new TextRun({ text: "Kepala SPPG,", font: "Arial", size: 20 }),
          ]}),
          new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.RIGHT, children: [
            new TextRun({ text: kepala, font: "Arial", size: 20, bold: true }),
          ]}),
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [
            new TextRun({ text: `Kepala ${sppgName}`, font: "Arial", size: 16, color: "5C5C5C" }),
          ]}),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `SPTJ-${new Date().toISOString().slice(0, 10)}.docx`);
    toast.success("SPTJ (Word) berhasil diunduh");
  }, [settings]);

  // ── Word Export: BAPSD ──
  const exportBAPSDWord = useCallback(async () => {
    const sppgName = settings.sppg_name || "SPPG MBG";
    const today = new Date().toISOString().slice(0, 10);
    const todayPlans = deliveryPlans.filter(p => p.plan_date === today);
    const bapsdPortions = todayPlans.reduce((sum, p) => sum + (p.delivery_plan_items || []).reduce((s, item) => s + (item.portions || 0), 0), 0);
    const bapsdDestinations = todayPlans.reduce((sum, p) => sum + (p.delivery_plan_items || []).length, 0);
    const driverIds = new Set(todayPlans.map(p => p.delivery_assignments?.[0]?.driver_id).filter(Boolean));

    const makeRow = (no, uraian, ket) => new TableRow({
      children: [
        new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: no, font: "Arial", size: 18 })] })] }),
        new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: uraian, font: "Arial", size: 18 })] })] }),
        new TableCell({ width: { size: 52, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: ket, font: "Arial", size: 18 })] })] }),
      ],
    });

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: [
          new Paragraph({ spacing: { after: 40 }, children: [
            new TextRun({ text: settings.nama_yayasan || "", font: "Arial", size: 16, color: "7A7A7A" }),
          ]}),
          new Paragraph({ spacing: { after: 20 }, children: [
            new TextRun({ text: sppgName, font: "Arial", size: 28, bold: true }),
          ]}),
          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: `ID: ${settings.id_sppg || "-"}  |  ${settings.sppg_address || ""}`, font: "Arial", size: 14, color: "7A7A7A" }),
          ]}),
          new Paragraph({ spacing: { after: 300 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1F1F1F" } }, children: [] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [
            new TextRun({ text: "BERITA ACARA PENYALURAN", font: "Arial", size: 24, bold: true }),
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
            new TextRun({ text: "(Lampiran 30n Permenkes)", font: "Arial", size: 16, color: "999999" }),
          ]}),
          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: `Pada hari ini ${todayIndo()}, telah dilaksanakan penyaluran makanan siap distribusi program Makan Bergizi Gratis di ${sppgName}.`, font: "Arial", size: 20 }),
          ]}),
          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: "I.  Rincian Penyaluran", font: "Arial", size: 20, bold: true }),
          ]}),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [
                new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, shading: { type: ShadingType.SOLID, color: "4A7C59" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })] }),
                new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, shading: { type: ShadingType.SOLID, color: "4A7C59" }, children: [new Paragraph({ children: [new TextRun({ text: "Uraian", font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })] }),
                new TableCell({ width: { size: 52, type: WidthType.PERCENTAGE }, shading: { type: ShadingType.SOLID, color: "4A7C59" }, children: [new Paragraph({ children: [new TextRun({ text: "Keterangan", font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })] }),
              ]}),
              makeRow("1", "Tanggal Penyaluran", todayIndo()),
              makeRow("2", "Lokasi / Tujuan", settings.sppg_address || "___________________"),
              makeRow("3", "Total Porsi Didistribusikan", `${bapsdPortions} porsi`),
              makeRow("4", "Jumlah Tujuan Pengiriman", `${bapsdDestinations} lokasi`),
              makeRow("5", "Jumlah Driver Pengantar", `${driverIds.size} orang`),
              makeRow("6", "Waktu Distribusi", "08:00 — 11:00 WIB"),
            ],
          }),
          new Paragraph({ spacing: { before: 300, after: 200 }, children: [
            new TextRun({ text: "II.  Pernyataan", font: "Arial", size: 20, bold: true }),
          ]}),
          ...["Bahwa penyaluran bantuan pangan di atas telah dilaksanakan sesuai dengan ketentuan yang berlaku;",
            "Bahwa makanan yang disalurkan dalam kondisi baik, aman, dan layak konsumsi;",
            "Bahwa berita acara ini dibuat sebagai dasar pertanggungjawaban penyaluran bantuan pangan program Makan Bergizi Gratis."
          ].map((text, i) => new Paragraph({ spacing: { after: 120 }, indent: { left: 720 }, children: [
            new TextRun({ text: `${i + 1}. `, font: "Arial", size: 20 }),
            new TextRun({ text, font: "Arial", size: 20 }),
          ]})),
          new Paragraph({ spacing: { after: 200 }, children: [
            new TextRun({ text: "Demikian Berita Acara ini dibuat dengan sebenar-benarnya.", font: "Arial", size: 20 }),
          ]}),
          // Dual Signature
          new Paragraph({ spacing: { before: 600 }, children: [
            new TextRun({ text: "Mengetahui,", font: "Arial", size: 20 }),
            new TextRun({ text: "\t\t\t\t\t\t\t" }),
            new TextRun({ text: `Kepala ${sppgName},`, font: "Arial", size: 20 }),
          ]}),
          new Paragraph({ spacing: { before: 800 }, children: [
            new TextRun({ text: settings.nama_akuntan || "___________________", font: "Arial", size: 20, bold: true }),
            new TextRun({ text: "\t\t\t\t" }),
            new TextRun({ text: settings.nama_kepala || "___________________", font: "Arial", size: 20, bold: true }),
          ]}),
          new Paragraph({ children: [
            new TextRun({ text: "Pengawas Gizi", font: "Arial", size: 16, color: "5C5C5C" }),
            new TextRun({ text: "\t\t\t\t\t\t\t\t\t" }),
            new TextRun({ text: `Kepala ${sppgName}`, font: "Arial", size: 16, color: "5C5C5C" }),
          ]}),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `BAPSD-${new Date().toISOString().slice(0, 10)}.docx`);
    toast.success("BAPSD (Word) berhasil diunduh");
  }, [settings, deliveryPlans]);

  // ── PDF Exports (kept for backward compatibility) ──
  const exportPDF = async (tab) => {
    const doc = new jsPDF();
    const [logo, settingsData] = await Promise.all([getLogo(), getSettings()]);
    const titleY = renderLetterhead(doc, settingsData, logo);
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
    const [logo, settingsData] = await Promise.all([getLogo(), getSettings()]);
    const ml = 20, mr = 20, pw = 210;
    const sppgName = settingsData.sppg_name || "SPPG MBG";
    const kepala = settingsData.nama_kepala || "___________________";
    const addr = settingsData.sppg_address || "___________________";

    let y = renderLetterhead(doc, settingsData, logo);
    y = renderLetterTitle(doc, "SURAT PERNYATAAN TANGGUNG JAWAB", "(Lampiran 30j Permenkes)", y, pw, ml, mr);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0x1F, 0x1F, 0x1F);
    doc.text("Yang bertanda tangan di bawah ini:", ml, y);
    y += 8;
    y = pv(doc, "Nama", kepala, ml + 3, y);
    y = pv(doc, "Jabatan", `Kepala ${sppgName}`, ml + 3, y);
    y = pv(doc, "Program", "Makan Bergizi Gratis (MBG)", ml + 3, y);
    if (settingsData.id_sppg) y = pv(doc, "ID SPPG", settingsData.id_sppg, ml + 3, y);
    y += 3;

    doc.setFont("helvetica", "normal");
    doc.text("Dengan ini menyatakan dengan sesungguhnya bahwa:", ml, y);
    y += 8;

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

    doc.setFont("helvetica", "normal");
    const closing = "Demikian Surat Pernyataan Tanggung Jawab ini saya buat dengan sebenar-benarnya dalam keadaan sadar tanpa adanya paksaan dari pihak manapun.";
    const closingLines = doc.splitTextToSize(closing, pw - ml - mr);
    doc.text(closingLines, ml, y);
    y += closingLines.length * 4.5 + 10;

    const dateStr = `${addr}, ${todayIndo()}`;
    doc.text(dateStr, pw - mr, y, { align: "right" });
    y += 14;

    y = renderSignatureBlock(doc, settingsData, y, pw, [
      { label: "Kepala SPPG,", settingsKey: "nama_kepala", jabatan: `Kepala ${sppgName}` },
    ]);

    doc.save(`SPTJ-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("SPTJ berhasil dicetak");
  };

  const cetakBAPSD = async () => {
    const doc = new jsPDF();
    const [logo, settingsData] = await Promise.all([getLogo(), getSettings()]);
    const ml = 20, mr = 20, pw = 210;
    const sppgName = settingsData.sppg_name || "SPPG MBG";

    let filteredPlans = deliveryPlans;
    if (exportFrom) filteredPlans = filteredPlans.filter(p => p.plan_date >= exportFrom);
    if (exportTo) filteredPlans = filteredPlans.filter(p => p.plan_date <= exportTo);
    const today = new Date().toISOString().slice(0, 10);
    const todayPlans = filteredPlans.filter(p => p.plan_date === today);
    const totalPortions = todayPlans.reduce((sum, p) => sum + (p.delivery_plan_items || []).reduce((s, item) => s + (item.portions || 0), 0), 0);
    const totalDestinations = todayPlans.reduce((sum, p) => sum + (p.delivery_plan_items || []).length, 0);
    const driverIds = new Set(todayPlans.map(p => p.delivery_assignments?.[0]?.driver_id).filter(Boolean));

    let y = renderLetterhead(doc, settingsData, logo);
    y = renderLetterTitle(doc, "BERITA ACARA PENYALURAN", "(Lampiran 30n Permenkes)", y, pw, ml, mr);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0x1F, 0x1F, 0x1F);
    doc.text(`Pada hari ini ${todayIndo()}, telah dilaksanakan penyaluran makanan siap distribusi`, ml, y);
    y += 5;
    doc.text(`program Makan Bergizi Gratis di ${sppgName}.`, ml, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("I.  Rincian Penyaluran", ml, y);
    y += 7;

    autoTable(doc, {
      startY: y,
      margin: { left: ml, right: mr },
      head: [["No", "Uraian", "Keterangan"]],
      body: [
        ["1", "Tanggal Penyaluran", todayIndo()],
        ["2", "Lokasi / Tujuan", settingsData.sppg_address || "___________________"],
        ["3", "Total Porsi Didistribusikan", `${totalPortions} porsi`],
        ["4", "Jumlah Tujuan Pengiriman", `${totalDestinations} lokasi`],
        ["5", "Jumlah Driver Pengantar", `${driverIds.size} orang`],
        ["6", "Waktu Distribusi", "08:00 — 11:00 WIB"],
      ],
      theme: "grid",
      headStyles: { fillColor: [0x4A, 0x7C, 0x59], textColor: [0xFF, 0xFF, 0xFF], fontStyle: "bold", fontSize: 9, halign: "center" },
      bodyStyles: { fontSize: 9, textColor: [0x1F, 0x1F, 0x1F] },
      columnStyles: { 0: { halign: "center", cellWidth: 12 }, 1: { cellWidth: 58 }, 2: { cellWidth: "auto" } },
    });

    y = doc.lastAutoTable.finalY + 10;
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

    doc.setFont("helvetica", "normal");
    doc.text("Demikian Berita Acara ini dibuat dengan sebenar-benarnya.", ml, y);
    y += 12;

    y = renderSignatureBlock(doc, settingsData, y, pw, [
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
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Laporan</h1>
          <p className="text-[#5C5C5C] mt-1">LR, LPA, Catatan, DafNom, SPTJ, BAPSD</p>
        </div>

        {/* Date Filter + Export Buttons */}
        <div className="card-soft p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C] font-semibold">Filter Tanggal:</label>
            <input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)} className="px-3 py-1.5 rounded-md border border-[#EAE4D8] bg-white text-sm" />
            <span className="text-[#5C5C5C]">s/d</span>
            <input type="date" value={exportTo} onChange={e => setExportTo(e.target.value)} className="px-3 py-1.5 rounded-md border border-[#EAE4D8] bg-white text-sm" />
            {(exportFrom || exportTo) && (
              <button onClick={() => { setExportFrom(""); setExportTo(""); }} className="btn-ghost text-xs">Reset</button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportExcel} className="btn-primary flex items-center gap-2 text-sm">
              <Download size={14}/> Export Excel (LR + LPA + Catatan + DafNom)
            </button>
            <button onClick={exportSPTJWord} className="btn-outline flex items-center gap-2 text-sm">
              <Download size={14}/> Export SPTJ (Word)
            </button>
            <button onClick={exportBAPSDWord} className="btn-outline flex items-center gap-2 text-sm">
              <Download size={14}/> Export BAPSD (Word)
            </button>
          </div>
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
                    <div className="font-display text-xl sm:text-2xl font-bold mt-1 text-[#4A7C59]">{fmtIDR(lrData.totalPemasukan)}</div>
                  </div>
                  <div className="card-soft p-5">
                    <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Pengeluaran</div>
                    <div className="font-display text-xl sm:text-2xl font-bold mt-1 text-[#C5533B]">{fmtIDR(lrData.totalPengeluaran)}</div>
                  </div>
                  <div className="card-soft p-5">
                    <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Saldo</div>
                    <div className={`font-display text-xl sm:text-2xl font-bold mt-1 ${lrData.saldo >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(lrData.saldo)}</div>
                  </div>
                </div>
                <div className="card-soft overflow-x-auto">
                  <table className="w-full text-sm" style={{ minWidth: "600px" }}>
                    <thead className="bg-[#EAE4D8] text-xs uppercase tracking-wider">
                      <tr><th className="text-left py-3 px-4">Tanggal</th><th className="text-left py-3 px-4">Kode</th><th className="text-left py-3 px-4">Keterangan</th><th className="text-right py-3 px-4">Debet</th><th className="text-right py-3 px-4">Kredit</th></tr>
                    </thead>
                    <tbody>
                      {paginatedTransaksi.map(t => (
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
                <Pagination page={page} totalPages={Math.ceil(transaksi.filter(t => ["1300", "2100", "2200", "2300", "3100"].includes(t.account_code)).length / perPage)} onPageChange={setPage} />
                <button onClick={() => exportPDF("lr")} className="btn-outline flex items-center gap-2"><Download size={14}/> Export PDF</button>
              </div>
            )}

            {/* LPA Tab */}
            {activeTab === "lpa" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="card-soft p-5">
                    <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Pemasukan 2 Pekan</div>
                    <div className="font-display text-xl sm:text-2xl font-bold mt-1 text-[#4A7C59]">{fmtIDR(lpaData.totalPemasukan)}</div>
                  </div>
                  <div className="card-soft p-5">
                    <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Pengeluaran 2 Pekan</div>
                    <div className="font-display text-xl sm:text-2xl font-bold mt-1 text-[#C5533B]">{fmtIDR(lpaData.totalPengeluaran)}</div>
                  </div>
                  <div className="card-soft p-5">
                    <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Saldo 2 Pekan</div>
                    <div className={`font-display text-xl sm:text-2xl font-bold mt-1 ${lpaData.saldo >= 0 ? "text-[#4A7C59]" : "text-[#C5533B]"}`}>{fmtIDR(lpaData.saldo)}</div>
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
                    <table className="w-full text-sm" style={{ minWidth: "400px" }}>
                      <thead>
                        <tr className="border-b border-[#EAE4D8] text-xs uppercase text-[#5C5C5C]">
                          <th className="py-2 px-4 text-left">Kode</th>
                          <th className="py-2 px-4 text-left">Keterangan</th>
                          <th className="py-2 px-4 text-right">Kredit (Rp)</th>
                        </tr>
                      </thead>
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
                <div className="bg-[#6D28D9]/10 text-[#6D28D9] rounded-lg px-4 py-3 text-sm">
                  Data DafNom dikelola di halaman <a href="/dafnom" className="font-bold underline">DafNom Insentif</a>. Tab ini hanya untuk referensi dan export.
                </div>
                <div className="card-soft overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#EAE4D8] bg-[#F9F6F0]">
                    <span className="font-display font-bold">Daftar Nominatif Insentif Staff & Relawan</span>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ minWidth: "600px" }}>
                    <thead className="bg-[#EAE4D8] text-xs uppercase tracking-wider">
                      <tr>
                        <th className="text-left py-3 px-4">No</th>
                        <th className="text-left py-3 px-4">Jabatan</th>
                        <th className="text-left py-3 px-4">Nama</th>
                        <th className="text-right py-3 px-4">Jumlah</th>
                        <th className="text-right py-3 px-4">Insentif/Hari</th>
                        <th className="text-right py-3 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dafnomEntries.map((d, i) => (
                        <tr key={i} className="border-b border-[#EAE4D8] last:border-0 hover:bg-[#F9F6F0]">
                          <td className="py-3 px-4">{i + 1}</td>
                          <td className="py-3 px-4 font-medium">{d.jabatan}</td>
                          <td className="py-3 px-4 text-[#5C5C5C]">{d.nama || "—"}</td>
                          <td className="py-3 px-4 text-right">{d.jumlah}</td>
                          <td className="py-3 px-4 text-right">{fmtIDR(d.insentif)}</td>
                          <td className="py-3 px-4 text-right font-semibold">{fmtIDR((d.jumlah || 0) * (d.insentif || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#EAE4D8] font-bold">
                        <td colSpan={4} className="py-3 px-4 text-right">Total Insentif/Hari:</td>
                        <td className="py-3 px-4 text-right">{dafnomTotal > 0 ? fmtIDR(dafnomTotal) : "—"}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                  </div>
                </div>
              </div>
            )}

            {/* SPTJ Tab */}
            {activeTab === "sptj" && (
              <div className="space-y-4">
                <div className="bg-white border border-[#EAE4D8] rounded-xl shadow-sm max-w-[700px] mx-auto">
                   <div className="p-4 sm:p-8 md:p-12">
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
                    <div className="text-center mt-6 mb-1">
                      <h2 className="font-bold text-base uppercase tracking-wide">Surat Pernyataan Tanggung Jawab</h2>
                      <p className="text-[11px] text-[#999]">(Lampiran 30j Permenkes)</p>
                    </div>
                    <div className="border-t border-[#1F1F1F] mb-6"></div>
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
                      <p className="mt-6 text-right">{settings.sppg_address || "___________________"}, {todayIndo()}</p>
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
                <div className="flex gap-2">
                  <button onClick={cetakSPTJ} className="btn-outline flex items-center gap-2"><Printer size={14}/> Cetak SPTJ (PDF)</button>
                  <button onClick={exportSPTJWord} className="btn-primary flex items-center gap-2"><Download size={14}/> Download SPTJ (Word)</button>
                </div>
              </div>
            )}

            {/* BAPSD Tab */}
            {activeTab === "bapsd" && (() => {
              const today = new Date().toISOString().slice(0, 10);
              const todayPlans = deliveryPlans.filter(p => p.plan_date === today);
              const bapsdPortions = todayPlans.reduce((sum, p) => sum + (p.delivery_plan_items || []).reduce((s, item) => s + (item.portions || 0), 0), 0);
              const bapsdDestinations = todayPlans.reduce((sum, p) => sum + (p.delivery_plan_items || []).length, 0);
              const bapsdDrivers = new Set(todayPlans.map(p => p.delivery_assignments?.[0]?.driver_id).filter(Boolean)).size;
              return (
              <div className="space-y-4">
                <div className="bg-white border border-[#EAE4D8] rounded-xl shadow-sm max-w-[700px] mx-auto">
                   <div className="p-4 sm:p-8 md:p-12">
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
                    <div className="text-center mt-6 mb-1">
                      <h2 className="font-bold text-base uppercase tracking-wide">Berita Acara Penyaluran</h2>
                      <p className="text-[11px] text-[#999]">(Lampiran 30n Permenkes)</p>
                    </div>
                    <div className="border-t border-[#1F1F1F] mb-6"></div>
                    <div className="text-[13px] leading-relaxed space-y-4">
                      <p>Pada hari ini {todayIndo()}, telah dilaksanakan penyaluran makanan siap distribusi program Makan Bergizi Gratis di {settings.sppg_name || "SPPG MBG"}.</p>
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
                            ["3", "Total Porsi Didistribusikan", `${bapsdPortions} porsi`],
                            ["4", "Jumlah Tujuan Pengiriman", `${bapsdDestinations} lokasi`],
                            ["5", "Jumlah Driver Pengantar", `${bapsdDrivers} orang`],
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
                      <p className="font-bold mt-4">II.  Pernyataan</p>
                      <ol className="list-decimal ml-6 space-y-2">
                        <li>Bahwa penyaluran bantuan pangan di atas telah dilaksanakan sesuai dengan ketentuan yang berlaku;</li>
                        <li>Bahwa makanan yang disalurkan dalam kondisi baik, aman, dan layak konsumsi;</li>
                        <li>Bahwa berita acara ini dibuat sebagai dasar pertanggungjawaban penyaluran bantuan pangan program Makan Bergizi Gratis.</li>
                      </ol>
                      <p className="mt-4">Demikian Berita Acara ini dibuat dengan sebenar-benarnya.</p>
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
                <div className="flex gap-2">
                  <button onClick={cetakBAPSD} className="btn-outline flex items-center gap-2"><Printer size={14}/> Cetak BAPSD (PDF)</button>
                  <button onClick={exportBAPSDWord} className="btn-primary flex items-center gap-2"><Download size={14}/> Download BAPSD (Word)</button>
                </div>
              </div>
              );
            })()}
          </>
        )}

      </div>
    </Layout>
  );
}
