import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fmtIDR, fmtDate, fmtDateTime, ZONE_LABELS } from "@/lib/format";

const COLOR_GREEN = [74, 124, 89];
const COLOR_INK = [31, 31, 31];
const COLOR_MUTED = [92, 92, 92];

function header(doc, title, subtitle, logo) {
  doc.setFillColor(...COLOR_GREEN);
  doc.rect(0, 0, 210, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  if (logo) {
    const fmt = logo.startsWith("data:image/png") ? "PNG" : "JPEG";
    try { doc.addImage(logo, fmt, 172, 2, 28, 0); } catch { try { doc.addImage(logo, "PNG", 172, 2, 28, 0); } catch {} }
  }
  doc.text("SPPG · MBG", 14, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("LAPORAN PERTANGGUNG JAWABAN BPK · Inventory & Procurement", 14, 18);
  doc.setTextColor(...COLOR_INK);
  let y0 = 32;
  if (logo) y0 = 38;
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, y0);
  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLOR_MUTED);
    doc.text(subtitle, 14, y0 + 6);
    doc.setTextColor(...COLOR_INK);
  }
  return y0;
}

function footer(doc, page, total) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(`Dicetak ${fmtDateTime(new Date().toISOString())}`, 14, h - 8);
  doc.text(`Halaman ${page} / ${total}`, w - 14, h - 8, { align: "right" });
  doc.setTextColor(...COLOR_INK);
}

export async function generateBpkPackage({ user, financial, lowStock, zoneStock, audit, menus, purchases, logo }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const today = new Date().toISOString();

  // ---------- COVER ----------
  doc.setFillColor(...COLOR_GREEN);
  doc.rect(0, 0, 210, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  if (logo) {
    const fmt = logo.startsWith("data:image/png") ? "PNG" : "JPEG";
    try { doc.addImage(logo, fmt, 170, 8, 30, 0); } catch { try { doc.addImage(logo, "PNG", 170, 8, 30, 0); } catch {} }
  }
  doc.text("SPPG · MBG", 14, 20);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN PERTANGGUNG JAWABAN", 14, 50);
  doc.text("BPK", 14, 62);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Inventory & Procurement Makan Bergizi Gratis", 14, 70);

  doc.setTextColor(...COLOR_INK);
  doc.setFontSize(10);
  doc.text(`Tanggal cetak: ${fmtDateTime(today)}`, 14, 95);
  doc.text(`Dicetak oleh: ${user?.name || "-"} (${user?.role || "-"})`, 14, 102);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Isi Paket:", 14, 118);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  [
    "1.  Ringkasan Keuangan",
    "2.  Detail Transaksi & Foto Struk",
    "3.  Stok Aktual per Zona Penyimpanan",
    "4.  Peringatan Stok Menipis",
    "5.  Persetujuan Menu (Tanda Tangan Ahli Gizi)",
    "6.  Audit Trail (50 aktivitas terakhir)",
    "7.  Halaman Tanda Tangan & Pengesahan",
  ].forEach((t, i) => doc.text(t, 18, 128 + i * 7));

  doc.setDrawColor(220, 215, 200);
  doc.line(14, 200, 196, 200);
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_MUTED);
  doc.text("Dokumen ini dihasilkan otomatis dari Sistem Inventory SPPG · MBG. Seluruh transaksi telah tercatat dengan audit second-accurate, tanpa penghapusan; setiap perubahan tersimpan sebagai versi terpisah. Foto struk merupakan bukti pendukung digital atas pembelian.", 14, 208, { maxWidth: 182 });
  doc.setTextColor(...COLOR_INK);

  // Section 1
  doc.addPage();
  const y1 = header(doc, "1. Ringkasan Keuangan", "Total belanja, OPEX, transport, dan validasi akuntan", logo);
  const s = financial?.summary || {};
  autoTable(doc, {
    startY: y1 + 8,
    head: [["Kategori", "Jumlah (Rp)"]],
    body: [
      ["Total STOCK", fmtIDR(s.total_stock || 0)],
      ["Total OPEX", fmtIDR(s.total_opex || 0)],
      ["Total Transport", fmtIDR(s.total_transport || 0)],
      ["GRAND TOTAL", fmtIDR(s.grand_total || 0)],
      ["Tervalidasi Akuntan", `${s.verified_count || 0} dari ${s.total_count || 0} transaksi`],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: COLOR_GREEN, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
  });

  // Section 2
  doc.addPage();
  const y2 = header(doc, "2. Detail Transaksi", `${(financial?.rows || []).length} transaksi`, logo);
  autoTable(doc, {
    startY: y2 + 8,
    head: [["Tanggal", "Kat.", "Deskripsi", "Manual", "Struk", "Transport", "Val."]],
    body: (financial?.rows || []).map(p => [
      fmtDate(p.purchased_at), p.category, (p.description || "").slice(0, 30),
      fmtIDR(p.amount_idr), fmtIDR(p.receipt_total_idr || 0), fmtIDR(p.transport_amount_idr || 0),
      p.verified ? "OK" : "—"
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: COLOR_GREEN },
  });

  // Section 2b: Receipt Photos
  const photoRows = (purchases || []).filter(p => p.receipt_photo);
  for (let i = 0; i < photoRows.length; i++) {
    if (i % 2 === 0) {
      doc.addPage();
      header(doc, "2. Foto Struk (Bukti Pendukung)", `${photoRows.length} struk digital`, logo);
    }
    const p = photoRows[i];
    const yBase = i % 2 === 0 ? 50 : 160;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${p.category} · ${p.description}`, 14, yBase);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(`${fmtDateTime(p.purchased_at)} · oleh ${p.created_by_name || "-"} · Manual ${fmtIDR(p.amount_idr)} · Struk ${fmtIDR(p.receipt_total_idr || 0)}`, 14, yBase + 5);
    doc.setTextColor(...COLOR_INK);
    try {
      doc.addImage(p.receipt_photo, "JPEG", 14, yBase + 8, 80, 90, undefined, "FAST");
    } catch {
      try { doc.addImage(p.receipt_photo, "PNG", 14, yBase + 8, 80, 90, undefined, "FAST"); } catch {}
    }
    doc.setFontSize(8);
    doc.text(`Supplier: ${p.supplier || "-"}`, 100, yBase + 15);
    doc.text(`Validasi: ${p.verified ? `OK oleh ${p.verified_by || "-"}` : "Belum"}`, 100, yBase + 22);
    if (p.verified_at) doc.text(`Pada: ${fmtDateTime(p.verified_at)}`, 100, yBase + 29);
    if (p.verification_note) doc.text(`Catatan: ${p.verification_note}`, 100, yBase + 36, { maxWidth: 96 });
  }

  // Section 3
  doc.addPage();
  let y = header(doc, "3. Stok Aktual per Zona", "Tertib FEFO", logo) + 8;
  for (const zone of ["DRY", "WET", "FREEZER"]) {
    const rows = zoneStock?.by_zone?.[zone] || [];
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${ZONE_LABELS[zone]} (${rows.length} lot)`, 14, y);
    autoTable(doc, {
      startY: y + 3,
      head: [["Bahan", "Kategori", "Aktual", "Satuan", "Kadaluarsa"]],
      body: rows.map(r => [r.item_name, r.category || "-", r.actual_quantity, r.unit, r.expiry_date || "-"]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: COLOR_GREEN },
    });
    y = doc.lastAutoTable.finalY + 10;
    if (y > 250) { doc.addPage(); y = header(doc, "3. Stok Aktual per Zona", "(lanjutan)", logo) + 8; }
  }

  // Section 4
  doc.addPage();
  const y4 = header(doc, "4. Peringatan Stok Menipis", `${(lowStock || []).length} bahan di bawah par-level`, logo);
  autoTable(doc, {
    startY: y4 + 8,
    head: [["Bahan", "Zona", "Sekarang", "Par-Level", "Kekurangan", "Satuan"]],
    body: (lowStock || []).map(l => [l.item_name, l.zone || "DRY", l.current, l.par_level, l.shortage, l.unit]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: COLOR_GREEN },
  });

  // Section 5
  doc.addPage();
  const y5 = header(doc, "5. Persetujuan Menu", "Tanda tangan digital Ahli Gizi", logo);
  const approved = (menus || []).filter(m => m.status === "APPROVED");
  if (approved.length > 0) {
    autoTable(doc, {
      startY: y5 + 8,
      head: [["Minggu", "Hari", "Porsi", "Disetujui Oleh", "Tanggal", "Tanda Tangan"]],
      body: approved.map(m => [m.week_start, m.day, m.portions, m.approved_by_name || m.approved_by || "-", fmtDateTime(m.approved_at), (m.signature || "-").slice(0, 40)]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: COLOR_GREEN },
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_MUTED);
    doc.text("Belum ada menu yang disetujui pada periode ini.", 14, y5 + 16);
    doc.setTextColor(...COLOR_INK);
  }

  // Section 6
  doc.addPage();
  const y6 = header(doc, "6. Audit Trail", `${(audit || []).length} aktivitas terakhir (akurasi detik)`, logo);
  autoTable(doc, {
    startY: y6 + 8,
    head: [["Timestamp", "Actor", "Action", "Entity", "Zona", "Catatan"]],
    body: (audit || []).slice(0, 60).map(r => [
      fmtDateTime(r.timestamp || r.ts),
      (r.actor || r.actor_email || "-").slice(0, 30),
      r.action || "-",
      r.entity || "-",
      r.zone || "-",
      (r.note || "").slice(0, 30),
    ]),
    styles: { fontSize: 7 },
    headStyles: { fillColor: COLOR_GREEN },
  });

  // Section 7
  doc.addPage();
  const y7 = header(doc, "7. Pengesahan", "Tanda tangan basah pejabat berwenang", logo);
  doc.setFontSize(10);
  doc.text("Dengan ini menyatakan bahwa seluruh data, transaksi, foto struk, opname stok, dan persetujuan menu yang tercantum dalam dokumen ini adalah benar adanya, telah melalui proses verifikasi sistem audit otomatis, dan dapat dipertanggungjawabkan kepada Badan Pemeriksa Keuangan (BPK).", 14, y7 + 12, { maxWidth: 182 });

  const sigBoxes = [
    { title: "Kepala Dapur", name: "" },
    { title: "Akuntan", name: "" },
    { title: "Ahli Gizi", name: "" },
    { title: "Mengetahui · Auditor BPK", name: "" },
  ];
  const sy = y7 + 40;
  sigBoxes.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 14 + col * 95;
    const yy = sy + row * 75;
    doc.setDrawColor(220, 215, 200);
    doc.rect(x, yy, 85, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(b.title, x + 3, yy + 7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLOR_MUTED);
    doc.setFontSize(8);
    doc.text("(tanda tangan & nama jelas)", x + 3, yy + 56);
    doc.setTextColor(...COLOR_INK);
  });

  const total = doc.internal.pages.length - 1;
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    footer(doc, p, total);
  }

  doc.save(`SPPG-BPK-${new Date().toISOString().slice(0, 10)}.pdf`);
}
