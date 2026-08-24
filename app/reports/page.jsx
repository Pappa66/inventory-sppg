"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { fmtIDR, fmtDate, fmtDateTime, ZONE_COLORS, ZONE_LABELS, MENU_CATEGORIES, DELIVERY_STATUSES } from "@/lib/format";
import { FileDown, FileSpreadsheet, Share2, FileArchive, Truck } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { generateBpkPackage } from "@/lib/bpk-export";
import { SkeletonCards } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { getLogo } from "@/lib/logo";
import { toast } from "sonner";

export default function Page() {
  const { user } = useAuth();
  const [fin, setFin] = useState(null);
  const [low, setLow] = useState([]);
  const [zoneStock, setZoneStock] = useState({ rows: [], by_zone: {} });
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/reports/financial").then(({data}) => setFin(data)),
      api.get("/reports/low-stock").then(({data}) => setLow(data)),
      api.get("/reports/stock-by-zone").then(({data}) => setZoneStock(data)),
      api.get("/reports/delivery-status").then(({data}) => setDeliveryStatus(data)).catch(()=>{}),
    ]).finally(() => setLoading(false));
  }, []);

  const exportBpkPackage = async () => {
    setGenerating(true);
    try {
      const [purchasesR, auditR, menusR] = await Promise.all([
        api.get("/purchases"),
        api.get("/audit?limit=100").catch(() => ({ data: [] })),
        api.get("/menus"),
      ]);
      const logo = await getLogo();
      await generateBpkPackage({
        user,
        financial: fin,
        lowStock: low,
        zoneStock,
        audit: auditR.data,
        menus: menusR.data,
        purchases: purchasesR.data,
        logo,
      });
      toast.success("Paket BPK berhasil dihasilkan");
    } catch (e) {
      toast.error("Gagal generate paket BPK: " + (e?.message || "unknown"));
    } finally {
      setGenerating(false);
    }
  };

  const exportPDF = async () => {
    const doc = new jsPDF();
    const logo = await getLogo();
    let titleY = 18;
    if (logo) {
      titleY = 36;
      const fmt = logo.startsWith("data:image/png") ? "PNG" : "JPEG";
      try { doc.addImage(logo, fmt, 14, 8, 40, 0); } catch { try { doc.addImage(logo, "PNG", 14, 8, 40, 0); } catch {} }
    }
    doc.setFontSize(16);
    doc.text("LAPORAN KEUANGAN · SPPG MBG", 14, titleY);

    doc.setFontSize(10);
    doc.text(`Tanggal cetak: ${fmtDateTime(new Date().toISOString())}`, 14, titleY + 6);
    const s = fin?.summary || {};
    const sy = titleY + 12;
    doc.text(`Total STOCK: ${fmtIDR(s.total_stock)}   |   OPEX: ${fmtIDR(s.total_opex)}   |   Transport: ${fmtIDR(s.total_transport)}`, 14, sy);
    doc.text(`Grand Total: ${fmtIDR(s.grand_total)}   |   Tervalidasi: ${s.verified_count}/${s.total_count}`, 14, sy + 6);
    autoTable(doc, {
      startY: sy + 12,
      head: [["Tanggal","Kategori","Deskripsi","Manual","Struk","Transport","Validasi"]],
      body: (fin?.rows||[]).map(p => [
        fmtDate(p.purchased_at), p.category, p.description,
        fmtIDR(p.amount_idr), fmtIDR(p.receipt_total_idr||0), fmtIDR(p.transport_amount_idr||0),
        p.verified ? "OK" : "—"
      ]),
      styles: { fontSize: 8 }, headStyles: { fillColor: [74,124,89] },
    });
    doc.save(`SPPG-Keuangan-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const exportXLSX = () => {
    const rows = (fin?.rows||[]).map(p => ({
      Tanggal: fmtDate(p.purchased_at),
      Kategori: p.category,
      Deskripsi: p.description,
      Supplier: p.supplier || "",
      "Manual (Rp)": p.amount_idr,
      "Struk (Rp)": p.receipt_total_idr || 0,
      "Transport (Rp)": p.transport_amount_idr || 0,
      Validasi: p.verified ? "OK" : "—",
      "Dibuat oleh": p.created_by_name,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Keuangan");
    if (low.length) {
      const ws2 = XLSX.utils.json_to_sheet(low);
      XLSX.utils.book_append_sheet(wb, ws2, "Low-Stock");
    }
    if (zoneStock.rows?.length) {
      const ws3 = XLSX.utils.json_to_sheet(zoneStock.rows);
      XLSX.utils.book_append_sheet(wb, ws3, "Stok-by-Zone");
    }
    XLSX.writeFile(wb, `SPPG-Laporan-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportBKU = async () => {
    const purchasesR = await api.get("/purchases");
    const purchases = purchasesR.data || [];
    const rows = [];
    let running = 0;
    rows.push(["","","","","SALDO AWAL BULAN BERJALAN", fin?.summary?.grand_total || 0, 0, fin?.summary?.grand_total || 0]);
    purchases.forEach(p => {
      const total = (p.amount_idr || 0) + (p.transport_amount_idr || 0);
      running += total;
      rows.push(["", fmtDate(p.purchased_at), p.description, p.category, p.supplier || "", total, 0, running]);
    });
    const ws = XLSX.utils.aoa_to_sheet([
      ["","","","","BUKU KAS UMUM (BKU)"],
      [""],
      ["","Nama SPPG",": SPPG Kadudampit"],
      ["","Periode",`: ${fmtDate(new Date().toISOString())}`],
      [""],
      ["","Bulan","Tgl","No. Bukti","Uraian Transaksi","Debet","Kredit","Saldo"],
      ...rows
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BKU");
    XLSX.writeFile(wb, `SPPG-BKU-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportStockDetail = async () => {
    const lotsR = await api.get("/stock-lots");
    const lots = lotsR.data || [];
    const itemsR = await api.get("/items");
    const items = itemsR.data || [];
    const rows = [];
    const grouped = {};
    lots.forEach(l => {
      if (!grouped[l.item_id]) grouped[l.item_id] = { name: l.item_name, unit: l.unit, category: l.category, incoming: 0, outgoing: 0, current: 0 };
      grouped[l.item_id].incoming += l.quantity;
      grouped[l.item_id].current += l.actual_quantity || l.quantity;
    });
    Object.values(grouped).forEach(g => {
      rows.push([g.category, g.name, g.unit, 0, g.incoming, g.incoming - g.current, g.current, 0, 0]);
    });
    const ws = XLSX.utils.aoa_to_sheet([
      ["LAPORAN STOCK BARANG (DETIL)"],
      [""],
      ["Periode",`: ${fmtDate(new Date().toISOString())}`],
      [""],
      ["Kode Brg","Nama Barang","Satuan","Saldo Awal","Masuk","Keluar","Saldo Akhir","Harga Beli Akhir","Jumlah"],
      ...rows
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock Detail");
    XLSX.writeFile(wb, `SPPG-Stok-Detil-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportAnggaran = async () => {
    const plansR = await api.get("/delivery-plans");
    const plans = plansR.data || [];
    const rows = [];
    plans.forEach(p => {
      (p.delivery_plan_items || []).forEach(item => {
        rows.push([fmtDate(p.plan_date), item.portions, item.category, item.portions * 8000, 0, 0, ""]);
      });
    });
    const ws = XLSX.utils.aoa_to_sheet([
      ["","","ANGGARAN BAHAN MAKANAN"],
      [""],
      ["","Hari/Tanggal","Jumlah Paket","Kategori","Harga Satuan","RAB","Aktual","Selisih","Keterangan"],
      ...rows
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Anggaran");
    XLSX.writeFile(wb, `SPPG-Anggaran-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportLR = async () => {
    const s = fin?.summary || {};
    const ws = XLSX.utils.aoa_to_sheet([
      ["LAPORAN/RESUME PENERIMAAN DAN PENGELUARAN"],
      [""],
      ["Periode",`: ${fmtDate(new Date().toISOString())}`],
      [""],
      ["URAIAN","Jumlah"],
      ["PENERIMAAN", ""],
      ["Dana Bantuan Pemerintah", s.total_stock || 0],
      ["TOTAL PENERIMAAN", s.total_stock || 0],
      [""],
      ["PENGELUARAN", ""],
      ["Biaya Bahan Baku", s.total_stock || 0],
      ["Biaya Operasional", s.total_opex || 0],
      ["Biaya Transport", s.total_transport || 0],
      ["TOTAL PENGELUARAN", s.grand_total || 0],
      [""],
      ["SURPLUS / (DEFISIT)", (s.total_stock || 0) - (s.grand_total || 0)],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laba Rugi");
    XLSX.writeFile(wb, `SPPG-Laba-Rugi-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportZonePDF = async () => {
    const doc = new jsPDF();
    const logo = await getLogo();
    let titleY = 18;
    if (logo) {
      titleY = 36;
      const fmt = logo.startsWith("data:image/png") ? "PNG" : "JPEG";
      try { doc.addImage(logo, fmt, 14, 8, 40, 0); } catch { try { doc.addImage(logo, "PNG", 14, 8, 40, 0); } catch {} }
    }
    doc.setFontSize(16);
    doc.text("LAPORAN STOK PER ZONA · SPPG MBG", 14, titleY);
    doc.setFontSize(10);
    doc.text(`Tanggal cetak: ${fmtDateTime(new Date().toISOString())}`, 14, titleY + 6);
    let y = titleY + 14;
    Object.entries(zoneStock.by_zone || {}).forEach(([zone, rows]) => {
      doc.setFontSize(12);
      doc.text(`Zona: ${ZONE_LABELS[zone] || zone}`, 14, y);
      autoTable(doc, {
        startY: y + 2,
        head: [["Bahan","Kategori","Aktual","Satuan","Kadaluarsa"]],
        body: rows.map(r => [r.item_name, r.category, r.actual_quantity, r.unit, r.expiry_date || "—"]),
        styles: { fontSize: 8 }, headStyles: { fillColor: [74,124,89] },
      });
      y = doc.lastAutoTable.finalY + 8;
    });
    doc.save(`SPPG-Stok-Zona-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const shareWA = () => {
    const s = fin?.summary || {};
    let detail = "";
    if (low.length > 0) {
      detail = "\n\n*⚠ STOK MENIPIS:*\n" + low.slice(0, 10).map(l =>
        `• ${l.item_name}: ${l.current}/${l.par_level} ${l.unit} (kurang ${l.shortage})`
      ).join("\n");
      if (low.length > 10) detail += `\n...dan ${low.length - 10} bahan lainnya`;
    }
    const txt = `*LAPORAN SPPG · MBG*\n${fmtDate(new Date().toISOString())}\n\nSTOCK: ${fmtIDR(s.total_stock)}\nOPEX: ${fmtIDR(s.total_opex)}\nTransport: ${fmtIDR(s.total_transport)}\n*Total: ${fmtIDR(s.grand_total)}*\nValidasi: ${s.verified_count}/${s.total_count}\nLow-Stok: ${low.length} bahan${detail}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`;
    const win = window.open(waUrl, "_blank");
    if (!win) window.location.href = waUrl;
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="reports-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">Laporan</h1>
            <p className="text-[#5C5C5C] mt-1">Ringkasan keuangan & stok rendah. Ekspor PDF/Excel siap cetak.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button data-testid="export-pdf" onClick={exportPDF} className="btn-outline"><FileDown size={14}/> PDF</button>
            <button data-testid="export-xlsx" onClick={exportXLSX} className="btn-outline"><FileSpreadsheet size={14}/> Excel</button>
            <button data-testid="export-bku" onClick={exportBKU} className="btn-outline"><FileSpreadsheet size={14}/> BKU</button>
            <button data-testid="export-stock-detail" onClick={exportStockDetail} className="btn-outline"><FileSpreadsheet size={14}/> Stok Detail</button>
            <button data-testid="export-anggaran" onClick={exportAnggaran} className="btn-outline"><FileSpreadsheet size={14}/> Anggaran</button>
            <button data-testid="export-lr" onClick={exportLR} className="btn-outline"><FileSpreadsheet size={14}/> Laba Rugi</button>
            <button data-testid="share-wa" onClick={shareWA} className="btn-outline"><Share2 size={14}/> WA</button>
            <button data-testid="export-bpk" onClick={exportBpkPackage} disabled={generating} className="btn-primary" style={{background:"#2C4251"}}>
              <FileArchive size={14}/> {generating ? "Membuat..." : "Paket BPK · 1-Klik"}
            </button>
          </div>
        </div>

        {loading ? (
          <SkeletonCards count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              ["STOCK", fin?.summary?.total_stock, "#4A7C59"],
              ["OPEX", fin?.summary?.total_opex, "#D97706"],
              ["Transport", fin?.summary?.total_transport, "#2C4251"],
              ["Grand Total", fin?.summary?.grand_total, "#1F1F1F"],
            ].map(([l,v,c]) => (
              <div key={l} className="card-soft p-5">
                <div className="text-[11px] uppercase tracking-widest text-[#5C5C5C]">{l}</div>
                <div className="font-display font-bold text-2xl mt-2 audit-ts" style={{color:c}}>{fmtIDR(v||0)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="card-soft overflow-hidden">
          <div className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold flex items-center justify-between">
            <span>Stok per Zona Penyimpanan</span>
            <button data-testid="export-zone-pdf" onClick={exportZonePDF} className="btn-ghost text-xs"><FileDown size={12}/> PDF Zona</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#EAE4D8]">
            {["DRY","WET","FREEZER"].map(z => {
              const rows = zoneStock.by_zone?.[z] || [];
              return (
                <div key={z} className="p-4" data-testid={`zone-card-${z}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-display font-bold" style={{color:ZONE_COLORS[z]}}>{ZONE_LABELS[z]}</div>
                    <span className="audit-ts text-xs text-[#5C5C5C]">{rows.length} lot</span>
                  </div>
                  <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
                    {rows.map(r => (
                      <div key={r.lot_id} className="text-sm flex justify-between border-b border-[#EAE4D8] py-1.5 last:border-0">
                        <span>{r.item_name}</span>
                        <span className="audit-ts text-[#5C5C5C]">{r.actual_quantity} {r.unit}</span>
                      </div>
                    ))}
                    {rows.length === 0 && <div className="text-xs text-[#5C5C5C]">Belum ada stok di zona ini.</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-soft overflow-hidden">
          <div className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold flex items-center justify-between">
            <span className="flex items-center gap-2"><Truck size={16}/> Status Pengiriman</span>
          </div>
          {deliveryStatus?.summary ? (
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  ["Total Rencana", deliveryStatus.summary.total_plans, "#2C4251"],
                  ["Terkirim", deliveryStatus.summary.delivered, "#4A7C59"],
                  ["Dalam Perjalanan", deliveryStatus.summary.in_transit, "#D97706"],
                  ["Belum Dikirim", deliveryStatus.summary.not_delivered + deliveryStatus.summary.pending, "#C5533B"],
                ].map(([l,v,c]) => (
                  <div key={l} className="rounded-md p-3" style={{background:`${c}10`}}>
                    <div className="text-[10px] uppercase tracking-widest text-[#5C5C5C]">{l}</div>
                    <div className="font-display font-bold text-xl mt-1" style={{color:c}}>{v}</div>
                  </div>
                ))}
              </div>
              {Object.keys(deliveryStatus.summary.by_category).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(deliveryStatus.summary.by_category).map(([cat, info]) => {
                    const catInfo = MENU_CATEGORIES[cat];
                    return catInfo ? (
                      <span key={cat} className="role-pill" style={{background:`${catInfo.color}1A`, color:catInfo.color}}>{catInfo.label}: {info.total_portions} porsi</span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 text-center text-[#5C5C5C] text-sm">Belum ada data pengiriman.</div>
          )}
        </div>

        <div className="card-soft overflow-hidden">
          <div className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold">Detail Transaksi</div>
          <table className="w-full text-sm">
            <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
              <tr><th className="text-left py-3 px-4">Tanggal</th><th className="text-left py-3 px-4">Kat.</th><th className="text-left py-3 px-4">Deskripsi</th><th className="text-right py-3 px-4">Manual</th><th className="text-right py-3 px-4">Struk</th><th className="text-right py-3 px-4">Transport</th><th className="text-left py-3 px-4">Validasi</th></tr>
            </thead>
            <tbody>
              {(fin?.rows||[]).map(p => (
                <tr key={p.id} className="border-b border-[#EAE4D8] last:border-0">
                  <td className="py-3 px-4 audit-ts text-xs">{fmtDate(p.purchased_at)}</td>
                  <td className="py-3 px-4"><span className="tag" style={{background: p.category==="STOCK"?"#4A7C59"+"1A":"#D97706"+"1A", color: p.category==="STOCK"?"#4A7C59":"#D97706"}}>{p.category}</span></td>
                  <td className="py-3 px-4">{p.description}</td>
                  <td className="py-3 px-4 text-right audit-ts">{fmtIDR(p.amount_idr)}</td>
                  <td className="py-3 px-4 text-right audit-ts">{fmtIDR(p.receipt_total_idr||0)}</td>
                  <td className="py-3 px-4 text-right audit-ts">{fmtIDR(p.transport_amount_idr||0)}</td>
                  <td className="py-3 px-4">{p.verified ? <span className="tag bg-[#2C4251]/10 text-[#2C4251]">OK</span> : <span className="text-[#5C5C5C] text-xs">menunggu</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
