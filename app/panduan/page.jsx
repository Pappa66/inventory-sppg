"use client";

import React from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  HelpCircle, Package, ChefHat, CalendarDays, Truck, ShoppingBasket,
  BadgeCheck, FileText, ScrollText, Users, Settings as SettingsIcon,
  Navigation, MapPin, Camera, Calculator, PiggyBank, Database,
  ClipboardList, UtensilsCrossed, HandPlatter, ClipboardCheck, Scale,
} from "lucide-react";
import Link from "next/link";

const GUIDES = {
  admin: {
    title: "Panduan Administrator",
    color: "#2C4251",
    sections: [
      { icon: Users, label: "Manajemen Pengguna", desc: "Kelola akun pengguna, atur role dan hak akses setiap anggota tim SPPG." },
      { icon: SettingsIcon, label: "Pengaturan Sistem", desc: "Atur nama dapur, logo, harga porsi, jam operasional, dan jumlah penerima manfaat." },
      { icon: Database, label: "Master Data Bahan", desc: "Tambah, edit, dan hapus data bahan makanan beserta zona penyimpanan, par-level, dan harga." },
      { icon: Package, label: "Stok & Opname", desc: "Pantau stok bahan, lakukan opname, dan lacak pengambilan barang oleh tim." },
      { icon: ShoppingBasket, label: "Belanja & Verifikasi", desc: "Lihat semua pembelian, verifikasi struk, dan pantau pengeluaran." },
      { icon: FileText, label: "Laporan", desc: "Export laporan keuangan, stok, dan pengiriman dalam format PDF, Excel, atau WhatsApp." },
      { icon: ScrollText, label: "Audit Trail", desc: "Pantau semua aktivitas perubahan data di sistem untuk transparansi." },
      { icon: PiggyBank, label: "Anggaran", desc: "Atur dan pantau anggaran harian berdasarkan jumlah porsi dan harga." },
    ],
    tips: [
      "Pastikan semua pengguna sudah memiliki akun dengan role yang sesuai.",
      "Periksa pengaturan harga porsi sesuai Juknis BGN terbaru.",
      "Lakukan verifikasi pembelian secara berkala.",
      "Pantau audit trail untuk memastikan tidak ada aktivitas mencurigakan.",
    ],
  },
  accountant: {
    title: "Panduan Akuntan",
    color: "#D97706",
    sections: [
      { icon: ShoppingBasket, label: "Verifikasi Pembelian", desc: "Verifikasi struk dan bukti pembelian dari asisten lapangan." },
      { icon: FileText, label: "Laporan Keuangan", desc: "Export laporan BKU, laba/rugi, dan ringkasan keuangan." },
      { icon: ScrollText, label: "Audit Trail", desc: "Pantau semua transaksi keuangan yang tercatat di sistem." },
      { icon: PiggyBank, label: "Anggaran", desc: "Input dan pantau RAB harian berdasarkan jumlah porsi aktual." },
    ],
    tips: [
      "Verifikasi pembelian setiap hari sebelum akhir jam kerja.",
      "Pastikan semua struk memiliki bukti fisik yang sesuai.",
      "Export laporan mingguan untuk arsip keuangan.",
      "Gunakan anggaran sebagai referensi pengeluaran harian.",
    ],
  },
  kitchen_head: {
    title: "Panduan Kepala SPPG",
    color: "#4A7C59",
    sections: [
      { icon: Package, label: "Pantau Stok", desc: "Lihat kondisi stok bahan dan pastikan ketersediaan untuk operasional." },
      { icon: ChefHat, label: "Kelola Resep", desc: "Pantau resep yang dibuat oleh head chef dan pastikan sesuai standar gizi." },
      { icon: CalendarDays, label: "Menu Mingguan", desc: "Pantau status menu mingguan dan pastikan sudah disetujui ahli gizi." },
      { icon: BadgeCheck, label: "Persetujuan Menu", desc: "Review dan setujui menu yang diajukan untuk memastikan kelayakan." },
      { icon: HandPlatter, label: "Pengambilan Barang", desc: "Pantau pengambilan bahan dari gudang oleh tim dapur." },
    ],
    tips: [
      "Pastikan menu mingguan sudah disetujui sebelum hari H.",
      "Periksa stok bahan setiap pagi sebelum operasional dimulai.",
      "Koordinasikan dengan head chef tentang menu yang akan dimasak.",
      "Pantau pengambilan barang untuk memastikan tidak ada pemborosan.",
    ],
  },
  head_chef: {
    title: "Panduan Head Chef",
    color: "#EA580C",
    sections: [
      { icon: ChefHat, label: "Buat Resep", desc: "Buat dan edit resep masakan dengan profil gizi yang akurat." },
      { icon: CalendarDays, label: "Rencana Menu", desc: "Susun menu mingguan untuk setiap hari dan tentukan porsi." },
      { icon: Package, label: "Pantau Stok", desc: "Lihat ketersediaan bahan sebelum membuat menu." },
      { icon: HandPlatter, label: "Pengambilan Bahan", desc: "Catat bahan yang diambil dari gudang untuk memasak." },
    ],
    tips: [
      "Isi profil gizi setiap resep dengan akurat (kalori, protein, karbo, lemak).",
      "Buat menu yang bervariasi dan sesuai dengan stok bahan yang tersedia.",
      "Submit menu ke ahli gizi untuk review sebelum hari H.",
      "Pastikan jumlah porsi sesuai dengan kebutuhan penerima manfaat.",
    ],
  },
  field_assistant: {
    title: "Panduan Asisten Lapangan",
    color: "#0891B2",
    sections: [
      { icon: Package, label: "Stok & Opname", desc: "Lakukan opname stok dan pantau kondisi bahan di gudang." },
      { icon: ShoppingBasket, label: "Pembelian", desc: "Input pembelian bahan beserta struk dan bukti fisik." },
      { icon: MapPin, label: "Tujuan Antar", desc: "Kelola data tujuan pengiriman (sekolah, posyandu, dll)." },
      { icon: Truck, label: "Rencana Antar", desc: "Buat rencana pengiriman harian ke setiap tujuan." },
      { icon: Navigation, label: "Pantau Driver", desc: "Pantau status pengiriman dari setiap driver." },
    ],
    tips: [
      "Lakukan opname stok minimal sekali sehari.",
      "Pastikan semua pembelian memiliki struk yang jelas.",
      "Update status pengiriman secara real-time.",
      "Laporkan stok menipis kepada kepala SPPG.",
    ],
  },
  nutritionist: {
    title: "Panduan Ahli Gizi",
    color: "#6D28D9",
    sections: [
      { icon: ChefHat, label: "Review Resep", desc: "Periksa profil gizi setiap resep dan pastikan sesuai standar." },
      { icon: BadgeCheck, label: "Persetujuan Menu", desc: "Review dan setujui menu mingguan yang diajukan head chef." },
      { icon: Calculator, label: "Kalkulator Gizi", desc: "Hitung pemenuhan AKG untuk setiap menu dan kelompok sasaran." },
      { icon: FileText, label: "Laporan Gizi", desc: "Pantau asupan gizi penerima manfaat dari laporan harian." },
    ],
    tips: [
      "Periksa menu menggunakan kalkulator gizi sebelum menyetujui.",
      "Pastikan setiap menu memenuhi minimal 70% AKG untuk kelompok sasaran.",
      "Berikan saran perbaikan jika menu belum memenuhi standar gizi.",
      "Dokumentasikan semua persetujuan menu untuk audit.",
    ],
  },
  driver: {
    title: "Panduan Driver",
    color: "#0891B2",
    sections: [
      { icon: Navigation, label: "Tracking Pengiriman", desc: "Lihat daftar tujuan pengiriman dan update status pengantaran." },
      { icon: Camera, label: "Foto Bukti", desc: "Ambil foto bukti pengiriman di setiap tujuan." },
      { icon: MapPin, label: "Status Tujuan", desc: "Update status pengiriman: terkirim, dalam perjalanan, atau belum." },
    ],
    tips: [
      "Pastikan semua makanan dalam kondisi baik sebelum berangkat.",
      "Ambil foto bukti di setiap tujuan pengiriman.",
      "Update status pengiriman secara real-time.",
      "Laporkan kendala pengiriman kepada asisten lapangan.",
    ],
  },
  persiapan: {
    title: "Panduan Tenaga Persiapan",
    color: "#16A34A",
    sections: [
      { icon: Package, label: "Ambil Bahan", desc: "Ambil bahan dari gudang sesuai kebutuhan menu hari ini." },
      { icon: ChefHat, label: "Lihat Resep", desc: "Lihat resep dan bahan yang diperlukan untuk persiapan." },
      { icon: CalendarDays, label: "Menu Hari Ini", desc: "Lihat menu yang akan dimasak hari ini." },
      { icon: ClipboardList, label: "Input Tugas", desc: "Catat tugas harian: persiapan bahan yang sudah dilakukan." },
    ],
    tips: [
      "Ambil bahan sesuai resep, jangan berlebihan.",
      "Periksa kualitas bahan sebelum diambil.",
      "Cuci dan potong bahan sesuai standar kebersihan.",
      "Catat semua bahan yang diambil di aplikasi.",
    ],
  },
  tenaga_masak: {
    title: "Panduan Tenaga Masak",
    color: "#EA580C",
    sections: [
      { icon: ChefHat, label: "Masak Sesuai Resep", desc: "Ikuti resep yang sudah ditentukan untuk setiap menu." },
      { icon: UtensilsCrossed, label: "Porsi", desc: "Pastikan jumlah porsi sesuai dengan yang direncanakan." },
      { icon: ClipboardList, label: "Input Tugas", desc: "Catat aktivitas memasak harian: menu, porsi, dan status." },
    ],
    tips: [
      "Ikuti resep dengan tepat untuk menjaga konsistensi rasa dan gizi.",
      "Jaga kebersihan selama proses memasak.",
      "Pastikan makanan matang sempurna dan aman dikonsumsi.",
      "Catat semua aktivitas memasak di aplikasi.",
    ],
  },
  pemorsian: {
    title: "Panduan Tenaga Pemorsian",
    color: "#7C3AED",
    sections: [
      { icon: UtensilsCrossed, label: "Isi Ompreng", desc: "Bagi makanan ke dalam ompreng sesuai porsi yang ditentukan." },
      { icon: Camera, label: "Foto Ompreng", desc: "Ambil foto ompreng yang sudah diisi sebagai bukti." },
      { icon: ClipboardList, label: "Input Tugas", desc: "Catat jumlah porsi yang sudah diisi per kategori." },
    ],
    tips: [
      "Pastikan setiap ompreng terisi sesuai porsi standar.",
      "Ambil foto setelah semua ompreng terisi.",
      "Pisahkan ompreng berdasarkan kategori (Balita, SD, SMP, dll).",
      "Laporkan jika ada ketidaksesuaian jumlah porsi.",
    ],
  },
  kebersihan: {
    title: "Panduan Petugas Kebersihan",
    color: "#059669",
    sections: [
      { icon: ClipboardCheck, label: "Kebersihan Dapur", desc: "Pastikan area dapur bersih dan higienis setelah operasional." },
      { icon: ClipboardList, label: "Input Tugas", desc: "Catat aktivitas kebersihan yang sudah dilakukan hari ini." },
    ],
    tips: [
      "Bersihkan semua permukaan kerja setelah digunakan.",
      "Pastikan area kompor dan wastafel bersih dari sisa makanan.",
      "Gunakan cairan pembersih yang aman untuk makanan.",
      "Catat semua aktivitas kebersihan di aplikasi.",
    ],
  },
  pencuci: {
    title: "Panduan Pencuci Ompreng",
    color: "#0284C7",
    sections: [
      { icon: UtensilsCrossed, label: "Cuci Ompreng", desc: "Cuci dan sterilkan semua ompreng setelah pengiriman." },
      { icon: ClipboardList, label: "Input Tugas", desc: "Catat jumlah ompreng yang sudah dicuci hari ini." },
    ],
    tips: [
      "Cuci ompreng dengan sabun dan air mengalir.",
      "Sterilkan ompreng dengan air panas atau desinfektan.",
      "Keringkan ompreng sebelum disimpan.",
      "Pastikan tidak ada sisa makanan di ompreng.",
    ],
  },
};

export default function PanduanPage() {
  const { activeRole } = useAuth();
  const role = activeRole || "admin_sppg";
  const guide = GUIDES[role] || GUIDES.admin;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <HelpCircle size={28} style={{ color: guide.color }} />
            {guide.title}
          </h1>
          <p className="text-[#5C5C5C] mt-1">
            Panduan penggunaan sistem untuk role {guide.title.replace("Panduan ", "")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guide.sections.map((sec) => (
            <div key={sec.label} className="card-soft p-5">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg grid place-items-center shrink-0"
                  style={{ backgroundColor: `${guide.color}1A`, color: guide.color }}
                >
                  <sec.icon size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold">{sec.label}</h3>
                  <p className="text-sm text-[#5C5C5C] mt-1">{sec.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-soft p-5">
          <h2 className="font-display font-bold text-lg mb-3" style={{ color: guide.color }}>
            Tips Penting
          </h2>
          <ul className="space-y-2">
            {guide.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="font-bold shrink-0" style={{ color: guide.color }}>{i + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-soft p-5 bg-[#F9F6F0]">
          <h2 className="font-display font-bold text-lg mb-3">Istilah dalam Sistem</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><span className="font-semibold">SPPG</span> — Sasaran Pangan Pendamping Gizi</div>
            <div><span className="font-semibold">MBG</span> — Makan Bergizi Gratis</div>
            <div><span className="font-semibold">AKG</span> — Angka Kecukupan Gizi</div>
            <div><span className="font-semibold">Ompreng</span> — Wadah makanan untuk distribusi</div>
            <div><span className="font-semibold">Par-Level</span> — Stok minimum yang harus tersedia</div>
            <div><span className="font-semibold">Opname</span> — Penghitungan stok fisik</div>
            <div><span className="font-semibold">BKU</span> — Buku Kas Umum</div>
            <div><span className="font-semibold">RAB</span> — Rencana Anggaran Biaya</div>
            <div><span className="font-semibold">Juknis</span> — Petunjuk Teknis</div>
            <div><span className="font-semibold">BGN</span> — Badan Gizi Nasional</div>
          </div>
        </div>

        <div className="card-soft p-5">
          <h2 className="font-display font-bold text-lg mb-3">Harga Porsi (Juknis BGN 2026)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#4A7C59]/10 border border-[#4A7C59]/20">
              <div className="text-sm text-[#5C5C5C]">Balita / PAUD / SD 1-3</div>
              <div className="font-display font-bold text-2xl text-[#4A7C59]">Rp 13.000</div>
              <div className="text-xs text-[#5C5C5C] mt-1">per porsi per hari</div>
            </div>
            <div className="p-4 rounded-lg bg-[#D97706]/10 border border-[#D97706]/20">
              <div className="text-sm text-[#5C5C5C]">SD 4-6 / SMP / SMA / Bumil / Busui</div>
              <div className="font-display font-bold text-2xl text-[#D97706]">Rp 15.000</div>
              <div className="text-xs text-[#5C5C5C] mt-1">per porsi per hari</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
