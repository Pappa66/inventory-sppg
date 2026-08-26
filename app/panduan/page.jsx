"use client";

import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  HelpCircle, Package, ChefHat, CalendarDays, Truck, ShoppingBasket,
  BadgeCheck, FileText, ScrollText, Users, Settings as SettingsIcon,
  Navigation, MapPin, Camera, Calculator, PiggyBank, Database,
  ClipboardList, UtensilsCrossed, HandPlatter, ClipboardCheck, Scale, BookOpen,
  ChevronDown, ChevronRight, Box, Warehouse, Eye, Edit2,
} from "lucide-react";
import Link from "next/link";

const GUIDES = {
  admin_apps: {
    title: "Panduan Admin Aplikasi",
    color: "#1E40AF",
    overview: "Admin Aplikasi memiliki akses penuh ke seluruh sistem. Mengelola konfigurasi global, pengguna, master data, hirarki barang, dan memantau operasional semua SPPG. Role ini setara superuser.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan data semua SPPG dalam satu tampilan." },
      { label: "Pengguna", desc: "Buat, edit, aktifkan/nonaktifkan akun pengguna semua role." },
      { label: "Pengaturan SPPG", desc: "Atur data SPPG: nama, alamat, logo, kepala, akuntan, yayasan, rekening, periode anggaran." },
      { label: "Konfigurasi Global", desc: "Atur harga satuan porsi, persentase anggaran, pajak, insentif, kapasitas, jam operasional — berlaku untuk semua SPPG." },
      { label: "Master Bahan", desc: "Kelola daftar bahan baku: nama, kategori, satuan, harga." },
      { label: "Hirarki Barang", desc: "Kelola struktur 3 level: Kelompok (KH/PH/PN/SY/BU/BB) → Sub-Kelompok → Barang, dengan zona penyimpanan." },
      { label: "Saldo Awal Barang", desc: "Input saldo awal qty dan nilai rupiah per item per periode 2 pekan." },
      { label: "Stok & Opname", desc: "Kelola stok lot FEFO, lakukan opname fisik, catat pengambilan bahan." },
      { label: "Stock Detail / Rekap", desc: "Lihat detail dan rekapitulasi stok per kategori. Export PDF." },
      { label: "Belanja & Struk", desc: "Pantau pembelian dari asisten lapangan, verifikasi atau review." },
      { label: "Resep & Gizi", desc: "Kelola resep masakan, profil gizi, alergen, kategori menu." },
      { label: "Menu & Cetak", desc: "Susun menu mingguan, alokasi resep per hari, cetak kartu menu." },
      { label: "Tujuan Antar", desc: "Kelola data tujuan pengiriman: sekolah, posyandu, dll." },
      { label: "Rencana Antar", desc: "Buat rencana pengiriman harian, alokasi driver, set porsi per tujuan." },
      { label: "Tracking Driver", desc: "Pantau status pengiriman real-time dari setiap driver." },
      { label: "Anggaran", desc: "Input anggaran 3 section: Bahan Makanan (11 kelompok), Operasional, Insentif Fasilitas." },
      { label: "Transaksi (D/K)", desc: "Input transaksi Debet/Kredit dengan 8 kode akun dan buku pembantu." },
      { label: "BKU / Buku Pembantu", desc: "Lihat Buku Kas Umum dan 6 buku pembantu secara read-only." },
      { label: "Laporan", desc: "Export LR, LPA, Catatan Harian, DafNom, SPTJ, BAPSD dengan kop surat otomatis." },
      { label: "Audit Trail", desc: "Pantau semua aktivitas perubahan data di seluruh sistem." },
    ],
    sections: [
      {
        icon: SettingsIcon,
        label: "Konfigurasi Global",
        link: "/global-config",
        desc: "Hanya Admin Aplikasi yang bisa mengubah konfigurasi ini. Berlaku untuk semua SPPG.",
        details: [
          {
            title: "Harga Satuan Porsi",
            content: "Harga default per porsi untuk 2 kelompok penerima manfaat. Kelompok 1 (Balita, PAUD/TK/RA, SD 1–3) default Rp 8.000. Kelompok 2 (SD 4–6, SMP, SMA/SLB, Santri, Penduduk Umum, Bumil, Busui) default Rp 10.000. Total alokasi per porsi: Rp 15.000 (Bahan Baku + Operasional + Insentif Fasilitas).",
          },
          {
            title: "Persentase Anggaran",
            content: "Komposisi alokasi dari Rp 15.000: Bahan Baku 67% (Rp 10.000), Operasional 20% (Rp 3.000), Insentif Fasilitas 13% (Rp 2.000). Persentase ini menentukan RAB pada saat input anggaran.",
          },
          {
            title: "Pajak & Insentif",
            content: "Tarif PPN default 11%. Insentif per porsi default Rp 2.000 untuk perhitungan DafNom (Daftar Nominatif Insentif Relawan).",
          },
          {
            title: "Kapasitas & Jam Operasional",
            content: "daily_portion_capacity: batas maksimal porsi per hari. max_beneficiaries: jumlah maksimal penerima manfaat. Jam mulai masak dan distribusi mempengaruhi jadwal operasional harian.",
          },
        ],
        workflow: [
          "Buka menu Konfigurasi Global dari sidebar.",
          "Ubah nilai pada field yang ingin diubah. Setiap field memiliki satuan (Rp, %, jam).",
          "Klik 'Simpan Konfigurasi'. Semua nilai tersimpan sekaligus.",
          "Nilai baru langsung berlaku: anggaran otomatis menggunakan persentase baru, nutrition calculator menggunakan harga baru.",
        ],
      },
      {
        icon: Users,
        label: "Manajemen Pengguna",
        link: "/users",
        desc: "Kelola akun pengguna untuk semua role di semua SPPG.",
        details: [
          {
            title: "Form Tambah Pengguna",
            content: "Isi Nama (wajib), Email (wajib, unik), Peran (pilih dari 14 role), Password Awal (minimal 6 karakter). Klik 'Simpan' untuk membuat akun baru.",
          },
          {
            title: "Aktifkan / Nonaktifkan",
            content: "Gunakan toggle switch di tabel untuk mengaktifkan atau menonaktifkan akun. Akun yang dinonaktifkan tidak bisa login. Akun admin@sppg.id TIDAK bisa dinonaktifkan.",
          },
          {
            title: "Penting",
            content: "Tidak ada fitur hapus pengguna. Penghapusan tidak diizinkan untuk menjaga integritas audit trail.",
          },
        ],
        workflow: [
          "Buka menu Pengguna dari sidebar.",
          "Klik 'Tambah Pengguna'. Isi form: Nama, Email, Pilih Peran, Masukkan Password Awal (min 6 karakter).",
          "Klik 'Simpan'. Pengguna baru bisa langsung login dengan email dan password yang dibuat.",
          "Untuk menonaktifkan: klik toggle 'Aktif' di baris pengguna yang bersangkutan.",
          "Untuk mengaktifkan kembali: klik toggle yang sama.",
        ],
      },
      {
        icon: Database,
        label: "Hirarki Barang",
        link: "/item-hierarchy",
        desc: "Kelola struktur barang 3 level: Kelompok → Sub-Kelompok → Barang.",
        details: [
          {
            title: "Struktur Hirarki",
            content: "Level 1 — Kelompok: kode KH (Kebutuhan Hidup), PH (Pangan Hewani), PN (Pangan Nabati), SY (Sayuran), BU (Buah), BB (Bahan Bumbu). Level 2 — Sub-Kelompok: anak dari kelompok. Level 3 — Barang: item individu dengan satuan dan zona penyimpanan (DRY/WET/FREEZER).",
          },
          {
            title: "Zona Penyimpanan",
            content: "Hanya item Level 3 yang memiliki zona. DRY = bahan kering (tepung, bumbu kering). WET = bahan basah (daging, ikan, sayuran). FREEZER = bahan beku (es krim, frozen food).",
          },
          {
            title: "Form Tambah/Edit",
            content: "Kode: format KH-01-001 (kelompok-subbarang-item). Nama: nama item. Level: pilih 1/2/3. Kode Induk: pilih parent (untuk level 2 dan 3). Kategori: pilih KH/PH/PN/SY/BU/BB. Satuan: kg, liter, ikat, dll. Zona: DRY/WET/FREEZER (hanya untuk Level 3).",
          },
        ],
        workflow: [
          "Buka menu Hirarki Barang dari sidebar.",
          "Gunakan dropdown filter untuk menampilkan level tertentu (semua, level 1, 2, atau 3).",
          "Klik panah (▶) untuk expand tree dan melihat child items.",
          "Klik 'Tambah Item' → isi form → 'Simpan'.",
          "Untuk edit: hover item → klik ikon pensil → ubah data → 'Simpan'.",
          "Untuk nonaktifkan: hover item → klik ikon tempat sampah → konfirmasi. Item tidak dihapus permanen, hanya dinonaktifkan.",
        ],
      },
      {
        icon: Box,
        label: "Stok & Opname (Inventory)",
        link: "/inventory",
        desc: "Kelola stok lot FEFO, lakukan opname fisik, dan catat pengambilan bahan.",
        details: [
          {
            title: "FEFO (First Expired First Out)",
            content: "Sistem menggunakan metode FEFO: bahan dengan tanggal kadaluarsa paling depan harus digunakan terlebih dahulu. Stok ditampilkan berdasarkan urutan kadaluarsa.",
          },
          {
            title: "Tambah Lot Stok",
            content: "Klik 'Tambah Lot'. Pilih Bahan (dari daftar item Level 3 hirarki barang). Masukkan Jumlah (qty awal) dan Tanggal Kadaluarsa. Klik 'Simpan'.",
          },
          {
            title: "Opname Fisik (Stock Opname)",
            content: "Klik 'Opname' pada lot. Pilih Zona (DRY/WET/FREEZER). Masukkan Hitungan Fisik Aktual. Sistem otomatis menampilkan Selisih (stok sistem vs fisik). Untuk DRY: isi Kelembapan (%) — ideal < 65%. Untuk WET: isi Suhu (°C) — target 0–4°C. Untuk FREEZER: isi Suhu (°C) — target ≤ -18°C. Pilih Alasan: Spoilage/Routine/Adjustment. Klik 'Catat Opname'.",
          },
          {
            title: "Pengambilan Barang",
            content: "Klik 'Ambil' pada lot. Masukkan Jumlah yang diambil (maks = stok tersedia). Sistem menampilkan sisa stok setelah pengambilan. Pilih Alasan: Masak Hari Ini/Persiapan/Lainnya. Klik 'Ambil Barang'.",
          },
          {
            title: "Filter Zona",
            content: "Gunakan tombol toggle ALL/DRY/WET/FREEZER di bagian atas untuk filter berdasarkan zona penyimpanan.",
          },
        ],
        workflow: [
          "Buka menu Stok & Opname dari sidebar.",
          "Setiap pagi: periksa stok yang akan kadaluarsa hari ini (status 'Kadaluarsa' berwarna merah).",
          "Saat bahan masuk: klik 'Tambah Lot' → pilih bahan → masukkan qty & kadaluarsa → 'Simpan'.",
          "Saat ada selisih: klik 'Opname' → pilih zona → masukkan hitungan fisik → masukkan suhu/kelembapan → 'Catat Opname'.",
          "Saat bahan diambil untuk masak: klik 'Ambil' → masukkan jumlah → 'Ambil Barang'.",
        ],
      },
      {
        icon: FileText,
        label: "Laporan",
        link: "/reports",
        desc: "Export berbagai laporan keuangan dan operasional dengan kop surat otomatis.",
        details: [
          {
            title: "Laporan yang Tersedia",
            content: "LR (Laporan Resume): ringkasan pemasukan, pengeluaran, saldo. LPA (Laporan 2 Pekanan): laporan keuangan per periode 2 pekan. Catatan Harian: rincian pengeluaran per hari. DafNom: daftar nominatif insentif relawan. SPTJ: Surat Pernyataan Tanggung Jawab (Lampiran 30j). BAPSD: Berita Acara Penyaluran Siap Distribusi (Lampiran 30n).",
          },
          {
            title: "Cara Export",
            content: "Pilih tab laporan yang diinginkan. Untuk LPA, pilih periode 2 pekan. Klik 'Export PDF' atau 'Cetak SPTJ/BAPSD'. PDF otomatis memiliki kop surat (logo, nama SPPG, alamat) dari data Pengaturan SPPG.",
          },
          {
            title: "Penting",
            content: "Pastikan data Pengaturan SPPG sudah lengkap (nama, alamat, logo) sebelum mencetak laporan. Kop surat diambil dari Pengaturan SPPG.",
          },
        ],
        workflow: [
          "Buka menu Laporan dari sidebar.",
          "Pilih tab laporan yang diinginkan (LR, LPA, Catatan Harian, DafNom, SPTJ, BAPSD).",
          "Untuk LPA: pilih periode 2 pekan dari dropdown.",
          "Klik 'Export PDF' untuk LR/LPA/Catatan/DafNom. Klik 'Cetak SPTJ' atau 'Cetak BAPSD' untuk surat formal.",
          "PDF akan otomatis diunduh dengan kop surat dan tanda tangan.",
        ],
      },
    ],
    tips: [
      "Atur Konfigurasi Global SEBELUM SPPG mulai beroperasi — harga, persentase, dan kapasitas menentukan seluruh perhitungan.",
      "Pastikan Pengaturan SPPG sudah lengkap (logo, nama, alamat) sebelum export laporan.",
      "Pantau Audit Trail secara berkala untuk memastikan tidak ada perubahan mencurigakan.",
      "Jangan nonaktifkan akun admin@sppg.id — ini adalah akun utama yang tidak bisa dinonaktifkan.",
      "Pastikan hirarki barang sudah lengkap sebelum input saldo awal dan operasional dimulai.",
    ],
  },
  admin_sppg: {
    title: "Panduan Admin SPPG",
    color: "#2D2D2D",
    overview: "Admin SPPG mengelola operasional satu SPPG: pengaturan data, pengguna, master data, stok, anggaran, dan laporan. Mirip Admin Apps namun terbatas untuk satu SPPG.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan data SPPG yang dikelola." },
      { label: "Pengguna", desc: "Kelola akun pengguna di SPPG ini." },
      { label: "Pengaturan SPPG", desc: "Atur data SPPG: nama, alamat, logo, struktur organisasi, rekening, periode." },
      { label: "Master Bahan", desc: "Kelola daftar bahan baku." },
      { label: "Hirarki Barang", desc: "Kelola struktur 3 level hirarki barang." },
      { label: "Saldo Awal Barang", desc: "Input saldo awal per item per periode." },
      { label: "Stok & Opname", desc: "Kelola stok lot, opname, pengambilan bahan." },
      { label: "Stock Detail / Rekap", desc: "Lihat detail dan rekapitulasi stok. Export PDF." },
      { label: "Belanja & Struk", desc: "Catat pembelian, upload struk, atau review pembelian yang sudah diverifikasi." },
      { label: "Resep & Gizi", desc: "Kelola resep dan profil gizi." },
      { label: "Menu & Cetak", desc: "Susun menu mingguan, cetak kartu menu." },
      { label: "Tujuan Antar", desc: "Kelola data tujuan pengiriman." },
      { label: "Rencana Antar", desc: "Buat rencana pengiriman harian." },
      { label: "Tracking Driver", desc: "Pantau status pengiriman." },
      { label: "Anggaran", desc: "Input anggaran 3 section." },
      { label: "Transaksi (D/K)", desc: "Input transaksi pembukuan." },
      { label: "BKU / Buku Pembantu", desc: "Lihat buku kas umum dan pembantu." },
      { label: "Laporan", desc: "Export laporan keuangan dan operasional." },
      { label: "Audit Trail", desc: "Pantau aktivitas perubahan data." },
    ],
    sections: [
      {
        icon: SettingsIcon,
        label: "Pengaturan SPPG",
        link: "/settings",
        desc: "Atur data identitas SPPG yang akan muncul di kop surat laporan dan dokumen.",
        details: [
          {
            title: "Informasi SPPG",
            content: "Nama SPPG: nama lengkap. ID SPPG: kode identifikasi. Alamat: alamat lengkap SPPG.",
          },
          {
            title: "Struktur Organisasi",
            content: "Kepala SPPG: nama kepala (muncul di SPTJ). Akuntan/Pengawas Keuangan: nama akuntan (muncul di BAPSD). Yayasan: nama yayasan pengelola.",
          },
          {
            title: "Keuangan & Periode",
            content: "Rekening/VA: nomor rekening atau Virtual Account. Tahun Anggaran: tahun berjalan. Periode Awal/Akhir: rentang periode anggaran. Default Biaya Transport: biaya transport default per pengiriman.",
          },
          {
            title: "Logo",
            content: "Klik 'Upload Logo' untuk mengganti logo. Logo muncul di kop surat semua laporan PDF. Format: JPG/PNG, maks 2MB.",
          },
        ],
        workflow: [
          "Buka menu Pengaturan SPPG dari sidebar.",
          "Isi semua field: nama, alamat, kepala, akuntan, yayasan, rekening, periode.",
          "Upload logo baru jika diperlukan (klik tombol upload, pilih file gambar).",
          "Klik 'Simpan Semua Pengaturan'.",
          "Verifikasi: buka Laporan → cetak SPTJ → pastikan data di kop surat sudah benar.",
        ],
      },
      {
        icon: Database,
        label: "Saldo Awal Barang",
        link: "/opening-balances",
        desc: "Input saldo awal qty dan nilai rupiah untuk setiap item barang di awal periode.",
        details: [
          {
            title: "Periode 2 Pekan",
            content: "Saldo awal diinput per periode 2 pekan. Pilih periode dari dropdown. Sistem otomatis menghitung total nilai saldo.",
          },
          {
            title: "Input Inline",
            content: "Setiap baris item memiliki field Saldo Qty dan Saldo Nilai (Rp) yang bisa diedit langsung di tabel. Tidak perlu buka modal terpisah.",
          },
          {
            title: "Validasi",
            content: "Saldo Qty harus angka positif. Saldo Nilai harus angka positif. Klik 'Simpan Saldo Awal' untuk menyimpan semua item sekaligus.",
          },
        ],
        workflow: [
          "Buka menu Saldo Awal Barang dari sidebar.",
          "Pilih periode 2 pekan dari dropdown.",
          "Gunakan pencarian dan filter kategori untuk menemukan item yang diinginkan.",
          "Edit kolom Saldo Qty dan Saldo Nilai (Rp) langsung di tabel.",
          "Klik 'Simpan Saldo Awal' setelah selesai mengisi semua item.",
        ],
      },
      {
        icon: PiggyBank,
        label: "Anggaran",
        link: "/anggaran",
        desc: "Input anggaran 3 section: Bahan Makanan (11 kelompok penerima), Operasional, Insentif Fasilitas.",
        details: [
          {
            title: "Section 1 — Bahan Makanan",
            content: "Isi jumlah porsi untuk 11 kelompok: Balita, PAUD/TK/RA, SD 1–3, SD 4–6, SMP/MTs, SMA/MA/SMK, SLB, Santri, Penduduk Umum/TK, Bumil, Busui. Harga satuan otomatis dari Konfigurasi Global (Kelompok 1: Rp 8.000, Kelompok 2: Rp 10.000). Total RAB Bahan = total porsi × harga satuan. Isi Biaya Aktual Bahan dari realisasi.",
          },
          {
            title: "Section 2 — Operasional",
            content: "Isi Jumlah Paket dan Harga Satuan (default Rp 3.000 dari Konfigurasi Global). RAB Operasional = jumlah paket × harga satuan. Isi Biaya Aktual Operasional dari realisasi.",
          },
          {
            title: "Section 3 — Insentif Fasilitas",
            content: "Isi Jumlah Paket dan Harga Satuan (default Rp 2.000 dari Konfigurasi Global). RAB Insentif = jumlah paket × harga satuan. Isi Biaya Aktual Insentif dari realisasi.",
          },
          {
            title: "Total & Selisih",
            content: "Total RAB = RAB Bahan + RAB Operasional + RAB Insentif. Selisih = Total RAB − Total Aktual. Selisih positif (hijau) = surplus. Selisih negatif (merah) = defisit. Isi Catatan untuk penjelasan selisih.",
          },
        ],
        workflow: [
          "Buka menu Anggaran dari sidebar.",
          "Klik 'Tambah Anggaran' untuk membuat anggaran baru.",
          "Isi tanggal anggaran (periode 2 pekan).",
          "Section 1: isi jumlah porsi per kelompok. RAB Bahan otomatis terhitung. Masukkan Biaya Aktual.",
          "Section 2: isi Jumlah Paket dan Harga Satuan. RAB Operasional otomatis terhitung. Masukkan Biaya Aktual.",
          "Section 3: isi Jumlah Paket dan Harga Satuan. RAB Insentif otomatis terhitung. Masukkan Biaya Aktual.",
          "Periksa Total RAB, Total Aktual, dan Selisih. Isi Catatan jika ada selisih.",
          "Klik 'Simpan'. Anggaran baru muncul di tabel.",
        ],
      },
      {
        icon: FileText,
        label: "Laporan",
        link: "/reports",
        desc: "Export laporan keuangan dan operasional. Semua laporan memiliki kop surat otomatis dari Pengaturan SPPG.",
        details: [
          {
            title: "SPTJ (Surat Pernyataan Tanggung Jawab)",
            content: "Surat formal Lampiran 30j. Nama Kepala SPPG diambil otomatis dari Pengaturan SPPG. Cukup klik 'Cetak SPTJ (PDF)' — semua field terisi otomatis.",
          },
          {
            title: "BAPSD (Berita Acara Penyaluran)",
            content: "Surat formal Lampiran 30n untuk penyaluran siap distribusi. Menampilkan tabel distribusi dan 2 tanda tangan (Pengawas Gizi + Kepala SPPG). Klik 'Cetak BAPSD (PDF)'.",
          },
        ],
        workflow: [
          "Buka menu Laporan dari sidebar.",
          "Pilih tab laporan. Untuk LPA, pilih periode 2 pekan.",
          "Klik 'Export PDF' atau 'Cetak SPTJ'/'Cetak BAPSD'.",
          "PDF otomatis diunduh dengan kop surat dan data yang sudah terisi.",
        ],
      },
    ],
    tips: [
      "Isi Pengaturan SPPG SEBELUM export laporan — data di sini menentukan isi kop surat dan tanda tangan.",
      "Input saldo awal barang di awal setiap periode 2 pekan.",
      "Pastikan anggaran sudah diinput sebelum akhir periode untuk laporan LPA yang akurat.",
      "Export SPTJ dan BAPSD tepat waktu untuk pertanggungjawaban ke Dinas Kesehatan.",
    ],
  },
  accountant: {
    title: "Panduan Akuntan",
    color: "#D97706",
    overview: "Akuntan bertanggung jawab atas pembukuan: verifikasi pembelian, input transaksi D/K, memantau BKU dan buku pembantu, serta export laporan keuangan.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan keuangan SPPG." },
      { label: "Stok Detail / Rekap", desc: "Lihat detail dan rekapitulasi stok (read-only)." },
      { label: "Belanja & Struk", desc: "Verifikasi pembelian dari asisten lapangan: setujui atau tolak." },
      { label: "Anggaran", desc: "Edit anggaran yang sudah dibuat (hanya field aktual)." },
      { label: "Transaksi (D/K)", desc: "Input transaksi Debet/Kredit dengan kode akun dan buku pembantu." },
      { label: "BKU", desc: "Lihat Buku Kas Umum (read-only, grouped by akun)." },
      { label: "Buku Pembantu", desc: "Lihat 6 buku pembantu: BANK, PETTY_CASH, BAHAN_BAKU, OPERASIONAL, FASILITAS, PAJAK." },
      { label: "Laporan", desc: "Export LR, LPA, Catatan Harian, DafNom, SPTJ, BAPSD." },
      { label: "Audit Trail", desc: "Pantau aktivitas perubahan data." },
    ],
    sections: [
      {
        icon: ShoppingBasket,
        label: "Verifikasi Pembelian (Belanja & Struk)",
        link: "/procurement",
        desc: "Verifikasi pembelian yang dicatat oleh asisten lapangan. Setujui atau tolak berdasarkan struk dan bukti.",
        details: [
          {
            title: "Melihat Pembelian",
            content: "Semua pembelian dari asisten lapangan muncul di halaman ini. Setiap kartu menampilkan: kategori (STOCK/OPERASIONAL), deskripsi, jumlah manual, total struk (dari foto OCR), transport, dan status verifikasi.",
          },
          {
            title: "Proses Verifikasi",
            content: "Klik 'Validasi Akuntan' pada kartu yang belum diverifikasi. Tinjau: deskripsi pembelian, perbandingan jumlah manual vs total struk, foto struk asli. Isi Catatan (opsional). Klik 'Setujui' jika sesuai atau 'Tolak' jika ada ketidaksesuaian.",
          },
          {
            title: "Penting",
            content: "Perhatikan jika jumlah manual ≠ total struk — ada indikator perbedaan. Struk foto bersifat wajib dan tidak bisa diubah setelah verifikasi.",
          },
        ],
        workflow: [
          "Buka menu Belanja & Struk dari sidebar.",
          "Lihat daftar pembelian. Kartu dengan border kuning/abu menunggu verifikasi.",
          "Klik 'Validasi Akuntan' pada kartu yang akan diverifikasi.",
          "Tinjau detail: deskripsi, jumlah, foto struk.",
          "Isi catatan jika perlu (contoh: 'Struk sesuai, transport wajar').",
          "Klik 'Setujui' atau 'Tolak'. Status berubah menjadi Verified/Tolak.",
        ],
      },
      {
        icon: PiggyBank,
        label: "Transaksi (D/K)",
        link: "/transactions",
        desc: "Input transaksi pembukuan Debet/Kredit dengan 8 kode akun dan 6 buku pembantu.",
        details: [
          {
            title: "8 Kode Akun",
            content: "1000 — BUKU KAS UMUM (penerimaan kas). 1100 — Petty Cash (kas kecil). 1200 — Kas di Bank (transfer/VA). 1300 — Dana Bantuan Pemerintah (pemasukan dari pemerintah). 2100 — Biaya Bahan Baku (pengeluaran bahan). 2200 — Biaya Operasional (pengeluaran operasional). 2300 — Biaya Insentif Fasilitas (insentif relawan). 3100 — PPN (pajak pertambahan nilai).",
          },
          {
            title: "6 Buku Pembantu",
            content: "BANK — transaksi rekening bank. PETTY_CASH — kas kecil. BAHAN_BAKU — pengeluaran bahan baku. OPERASIONAL — biaya operasional. FASILITAS — insentif fasilitas. PAJAK — pajak. Buku pembantu bersifat opsional tapi sangat disarankan untuk pelacakan.",
          },
          {
            title: "Form Transaksi",
            content: "Tanggal: wajib, format YYYY-MM-DD. Kode Akun: pilih dari 8 kode. Keterangan: wajib, deskripsi transaksi. Debet: jumlah masuk (Rp, min 0). Kredit: jumlah keluar (Rp, min 0). Catatan: opsional, keterangan tambahan.",
          },
          {
            title: "Aturan Debet/Kredit",
            content: "Setiap transaksi harus memiliki minimal Debet ATAU Kredit (tidak keduanya). Jika Debet diisi, Kredit harus 0, dan sebaliknya. BKU dan Buku Pembantu dihitung otomatis dari transaksi ini.",
          },
        ],
        workflow: [
          "Buka menu Transaksi (D/K) dari sidebar.",
          "Klik 'Tambah Transaksi'.",
          "Isi: Tanggal, Kode Akun, Keterangan, jumlah Debet atau Kredit (salah satu saja), Buku Pembantu (opsional), Catatan (opsional).",
          "Klik 'Simpan'. Transaksi langsung mempengaruhi BKU dan Buku Pembantu.",
          "Untuk edit: klik ikon pensil → ubah data → 'Simpan'.",
          "Untuk hapus: klik ikon tempat sampah → konfirmasi.",
        ],
      },
      {
        icon: ScrollText,
        label: "BKU (Buku Kas Umum)",
        link: "/bku",
        desc: "Lihat Buku Kas Umum — ringkasan semua transaksi yang dikelompokkan berdasarkan kode akun.",
        details: [
          {
            title: "Tampilan",
            content: "Transaksi dikelompokkan berdasarkan kode akun (1000, 1100, 1200, dst). Setiap kelompok memiliki header dengan subtotal Debet, Kredit, dan Saldo. Di bawah header ada tabel detail transaksi.",
          },
          {
            title: "Filter",
            content: "Filter berdasarkan Kode Akun (dropdown) dan rentang tanggal (Dari — Sampai).",
          },
          {
            title: "Read-Only",
            content: "Halaman ini hanya bisa dilihat, tidak bisa diedit. Perubahan dilakukan melalui halaman Transaksi.",
          },
        ],
        workflow: [
          "Buka menu BKU dari sidebar.",
          "Gunakan filter untuk mempersempit data: pilih kode akun atau rentang tanggal.",
          "Review total Debet, Kredit, dan Saldo di kartu ringkasan.",
          "Scroll untuk melihat detail transaksi per kode akun.",
        ],
      },
      {
        icon: BookOpen,
        label: "Buku Pembantu",
        link: "/sub-ledger",
        desc: "Lihat 6 buku pembantu: BANK, PETTY_CASH, BAHAN_BAKU, OPERASIONAL, FASILITAS, PAJAK.",
        details: [
          {
            title: "Cara Kerja",
            content: "Klik kartu buku pembantu untuk melihat transaksi yang terkait. Setiap kartu menampilkan jumlah transaksi, total debit, dan total kredit. Tabel detail menampilkan: Tanggal, Kode Akun, Keterangan, Debet, Kredit.",
          },
          {
            title: "Read-Only",
            content: "Halaman ini hanya bisa dilihat. Perubahan dilakukan melalui halaman Transaksi.",
          },
        ],
        workflow: [
          "Buka menu Buku Pembantu dari sidebar.",
          "Klik salah satu dari 6 kartu buku pembantu.",
          "Tabel detail di bawah akan menampilkan transaksi yang sesuai.",
          "Review total debit dan kredit untuk buku pembantu tersebut.",
        ],
      },
      {
        icon: PiggyBank,
        label: "Anggaran (Edit Aktual)",
        link: "/anggaran",
        desc: "Edit field aktual pada anggaran yang sudah dibuat oleh admin.",
        details: [
          {
            title: "Yang Bisa Diedit",
            content: "Field Biaya Aktual pada Section 1 (Bahan), Section 2 (Operasional), dan Section 3 (Insentif). Field RAB tidak bisa diedit oleh akuntan — RAB ditentukan saat anggaran dibuat.",
          },
          {
            title: "Validasi",
            content: "Biaya Aktual harus angka positif. Selisih otomatis terhitung: RAB − Aktual. Selisih positif = surplus (hijau), negatif = defisit (merah).",
          },
        ],
        workflow: [
          "Buka menu Anggaran dari sidebar.",
          "Klik ikon pensil pada baris anggaran yang akan diedit.",
          "Ubah field Biaya Aktual pada setiap section.",
          "Klik 'Simpan'. Selisih otomatis diperbarui.",
        ],
      },
    ],
    tips: [
      "Input transaksi SETIAP HARI sebelum akhir jam kerja agar BKU selalu up-to-date.",
      "Selalu isi Buku Pembantu — ini memudahkan pelacakan dan audit.",
      "Verifikasi pembelian SEGERA setelah asisten lapangan mengirim struk.",
      "Export LPA tepat waktu (setiap 2 pekan) untuk pertanggungjawaban.",
      "Jika jumlah manual ≠ total struk, beri catatan yang jelas saat verifikasi.",
    ],
  },
  kitchen_head: {
    title: "Panduan Kepala SPPG",
    color: "#4A7C59",
    overview: "Kepala SPPG mengawasi operasional dapur: memantau stok, mengelola resep, menyetujui menu mingguan, input anggaran, dan memantau laporan.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan operasional SPPG." },
      { label: "Stok & Opname", desc: "Pantau stok bahan, lakukan opname, catat pengambilan." },
      { label: "Stock Detail / Rekap", desc: "Lihat detail dan rekapitulasi stok. Export PDF." },
      { label: "Belanja & Struk", desc: "Pantau pembelian dari asisten lapangan." },
      { label: "Resep & Gizi", desc: "Pantau resep yang dibuat head chef. Tambah/edit resep." },
      { label: "Menu & Cetak", desc: "Pantau menu mingguan, cetak kartu menu." },
      { label: "Tujuan Antar", desc: "Pantau data tujuan pengiriman." },
      { label: "Rencana Antar", desc: "Pantau rencana pengiriman harian." },
      { label: "Anggaran", desc: "Input dan edit anggaran 3 section." },
      { label: "Persetujuan Menu", desc: "Review dan setujui menu yang diajukan head chef." },
      { label: "Laporan", desc: "Export laporan keuangan dan operasional." },
      { label: "Audit Trail", desc: "Pantau aktivitas perubahan data." },
    ],
    sections: [
      {
        icon: BadgeCheck,
        label: "Persetujuan Menu",
        link: "/approval",
        desc: "Review dan setujui menu mingguan yang diajukan oleh Head Chef.",
        details: [
          {
            title: "Melihat Menu yang Diajukan",
            content: "Menu dengan status 'DIAJUKAN' (SUBMITTED) muncul di halaman ini. Setiap kartu menampilkan: hari, daftar resep dengan detail gizi (kalori, protein, karbo, lemak, natrium), daftar alergen, dan jumlah porsi.",
          },
          {
            title: "Proses Review",
            content: "Klik 'Review' pada kartu menu. Tinjau: resep yang dipilih, profil gizi per resep, total gizi per hari, alergen. Isi Catatan (opsional). Klik 'Setujui' atau 'Tolak'. Tanda tangan digital otomatis terisi.",
          },
          {
            title: "Penting",
            content: "Menu harus disetujui SEBELUM hari H distribusi. Menu yang ditolak akan kembali ke status DRAFT untuk perbaikan oleh Head Chef.",
          },
        ],
        workflow: [
          "Buka menu Persetujuan Menu dari sidebar.",
          "Lihat daftar menu yang menunggu persetujuan (status DIAJUKAN).",
          "Klik 'Review' pada menu yang akan direview.",
          "Tinjau: resep, profil gizi, alergen, porsi.",
          "Isi catatan jika ada saran perbaikan.",
          "Klik 'Setujui' untuk menyetujui atau 'Tolak' untuk mengembalikan ke Head Chef.",
        ],
      },
      {
        icon: Package,
        label: "Stok & Opname",
        link: "/inventory",
        desc: "Pantau stok bahan dan lakukan opname untuk memastikan akurasi stok.",
        details: [
          {
            title: "Pantau Stok",
            content: "Lihat status stok: Aman (hijau), Hampir Kadaluarsa (kuning, < 3 hari), Kadaluarsa (merah). Filter berdasarkan zona: ALL/DRY/WET/FREEZER.",
          },
          {
            title: "Opname Fisik",
            content: "Klik 'Opname' pada lot. Masukkan hitungan fisik aktual. Sistem menampilkan selisih. Isi suhu/kelembapan sesuai zona. Pilih alasan opname.",
          },
          {
            title: "Pengambilan Bahan",
            content: "Klik 'Ambil' pada lot. Masukkan jumlah yang diambil (untuk masak hari ini atau persiapan). Sistem mengurangi stok otomatis.",
          },
        ],
        workflow: [
          "Setiap pagi: buka Stok & Opname, periksa bahan yang akan kadaluarsa.",
          "Saat ada selisih stok: klik 'Opname' → masukkan hitungan fisik → 'Catat Opname'.",
          "Saat bahan diambil untuk masak: klik 'Ambil' → masukkan jumlah → 'Ambil Barang'.",
        ],
      },
      {
        icon: ChefHat,
        label: "Resep & Gizi",
        link: "/recipes",
        desc: "Pantau dan kelola resep masakan. Tambah resep baru atau edit yang sudah ada.",
        details: [
          {
            title: "Melihat Resep",
            content: "Semua resep ditampilkan dalam bentuk kartu. Setiap kartu menampilkan: foto, nama, porsi standar, kategori menu (Balita/Porsi Kecil/Porsi Besar/Bumil & Busui), profil gizi, alergen, dan daftar bahan.",
          },
          {
            title: "Membuat Resep Baru",
            content: "Klik 'Resep Baru'. Isi: Nama (wajib), Porsi Standar (default 100), Kategori Menu, Foto Menu (URL). Tambah bahan: klik '+ Baris' → pilih item → masukkan jumlah & satuan. Isi profil gizi (kalori, protein, karbo, lemak, natrium). Pilih alergen dari daftar.",
          },
        ],
        workflow: [
          "Buka menu Resep & Gizi dari sidebar.",
          "Klik 'Resep Baru' untuk membuat resep baru.",
          "Isi nama, porsi, kategori menu.",
          "Tambah bahan: klik '+ Baris' → pilih bahan dari dropdown → masukkan jumlah & satuan.",
          "Isi profil gizi (kalori, protein, karbo, lemak, natrium).",
          "Pilih alergen jika ada.",
          "Klik 'Simpan'.",
        ],
      },
      {
        icon: PiggyBank,
        label: "Anggaran",
        link: "/anggaran",
        desc: "Input anggaran 3 section: Bahan Makanan, Operasional, Insentif Fasilitas.",
        details: [
          {
            title: "Cara Input",
            content: "Klik 'Tambah Anggaran'. Isi tanggal. Section 1: isi porsi per kelompok. RAB otomatis terhitung. Section 2: isi jumlah paket & harga satuan. Section 3: isi jumlah paket & harga satuan. Isi biaya aktual per section.",
          },
        ],
        workflow: [
          "Buka menu Anggaran dari sidebar.",
          "Klik 'Tambah Anggaran'.",
          "Isi tanggal periode.",
          "Section 1: isi porsi per kelompok penerima. RAB Bahan otomatis.",
          "Section 2: isi jumlah paket & harga satuan. RAB Operasional otomatis.",
          "Section 3: isi jumlah paket & harga satuan. RAB Insentif otomatis.",
          "Isi Biaya Aktual per section.",
          "Klik 'Simpan'.",
        ],
      },
    ],
    tips: [
      "Setujui menu SEBELUM hari H — jika terlambat, distribusi makanan terhambat.",
      "Periksa stok bahan setiap pagi sebelum operasional dimulai.",
      "Koordinasikan dengan Head Chef tentang menu yang akan dimasak berdasarkan stok tersedia.",
      "Pantau pengambilan barang agar tidak ada pemborosan.",
      "Review profil gizi resep sebelum menyetujui menu.",
    ],
  },
  head_chef: {
    title: "Panduan Head Chef",
    color: "#EA580C",
    overview: "Head Chef membuat resep masakan, menyusun menu mingguan, dan mengelola pengambilan bahan dari gudang untuk proses memasak.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan operasional dapur." },
      { label: "Stok & Opname", desc: "Pantau ketersediaan bahan sebelum membuat menu." },
      { label: "Resep & Gizi", desc: "Buat dan edit resep masakan dengan profil gizi." },
      { label: "Menu & Cetak", desc: "Susun menu mingguan: alokasi resep per hari, set porsi, cetak kartu menu." },
      { label: "Rencana Antar", desc: "Pantau rencana pengiriman." },
    ],
    sections: [
      {
        icon: ChefHat,
        label: "Buat Resep",
        link: "/recipes",
        desc: "Buat resep masakan baru dengan profil gizi yang akurat.",
        details: [
          {
            title: "Form Resep",
            content: "Nama Resep: nama masakan (wajib). Porsi Standar: jumlah porsi default (default 100). Kategori Menu: pilih Balita/Portion Small/Portion Large/Bumil & Busui. Foto Menu: URL gambar (opsional). Instruksi: langkah-langkah memasak (opsional).",
          },
          {
            title: "Menambah Bahan",
            content: "Klik '+ Baris' untuk menambah baris bahan. Pilih bahan dari dropdown (daftar item Level 3 dari Hirarki Barang). Masukkan Jumlah (angka) dan Satuan (kg, liter, ikat, dll). Bisa ditambah sebanyak yang diperlukan.",
          },
          {
            title: "Profil Gizi",
            content: "Isi per porsi: Kalori (kkal), Protein (g), Karbohidrat (g), Lemak (g), Natrium (mg). Profil gizi ini digunakan oleh Ahli Gizi untuk review dan oleh Kalkulator Gizi untuk cek AKG.",
          },
          {
            title: "Alergen",
            content: "Pilih alergen dari daftar: Gluten, Susu, Kacang, Kedelai, Ikan, Kerang, Telur, Seledri. Alergen ditampilkan di kartu resep dan di menu mingguan.",
          },
        ],
        workflow: [
          "Buka menu Resep & Gizi dari sidebar.",
          "Klik 'Resep Baru'.",
          "Isi nama, porsi standar, kategori menu.",
          "Tambah bahan: klik '+ Baris' → pilih bahan → masukkan jumlah & satuan.",
          "Isi profil gizi: kalori, protein, karbo, lemak, natrium (per porsi).",
          "Pilih alergen jika ada.",
          "Klik 'Simpan'.",
          "Resep baru langsung tersedia untuk disisipkan ke menu mingguan.",
        ],
      },
      {
        icon: CalendarDays,
        label: "Menu Mingguan",
        link: "/menu",
        desc: "Susun menu untuk setiap hari dalam seminggu. Alokasikan resep dan set jumlah porsi.",
        details: [
          {
            title: "Tampilan",
            content: "Kalender mingguan dengan 5–7 hari (Senin–Minggu). Setiap hari menampilkan resep yang dialokasikan. Di samping kalender ada daftar resep yang bisa dipilih.",
          },
          {
            title: "Mengalokasikan Resep",
            content: "Klik resep dari daftar di sebelah kanan. Resep akan ditambahkan ke hari yang dipilih. Klik lagi untuk menghapus alokasi. Setiap hari bisa memiliki beberapa resep.",
          },
          {
            title: "Set Porsi",
            content: "Masukkan jumlah porsi per hari. Jumlah ini menentukan berapa banyak bahan yang diambil dan berapa porsi makanan yang didistribusikan.",
          },
          {
            title: "Submit untuk Review",
            content: "Setelah semua hari terisi, klik 'Submit untuk Review'. Status berubah dari DRAFT ke DIAJUKAN (SUBMITTED). Menu akan muncul di halaman Persetujuan Menu untuk Kepala SPPG atau Ahli Gizi.",
          },
          {
            title: "Cetak Kartu Menu",
            content: "Klik 'Cetak Menu' untuk mencetak kartu menu per hari dalam format PDF. Kartu menu berisi: daftar resep, jumlah porsi, profil gizi ringkas.",
          },
        ],
        workflow: [
          "Buka menu Menu & Cetak dari sidebar.",
          "Pilih minggu yang akan diatur (gunakan navigasi minggu).",
          "Untuk setiap hari: pilih resep dari daftar di sebelah kanan. Klik resep untuk menambahkan/menghapus.",
          "Masukkan jumlah porsi per hari.",
          "Ulangi untuk semua hari dalam minggu.",
          "Klik 'Submit untuk Review' untuk mengajukan ke Kepala SPPG/Ahli Gizi.",
          "Setelah disetujui, klik 'Cetak Menu' untuk mencetak kartu menu.",
        ],
      },
      {
        icon: HandPlatter,
        label: "Pengambilan Bahan",
        link: "/inventory",
        desc: "Catat bahan yang diambil dari gudang untuk proses memasak.",
        details: [
          {
            title: "Cara Pengambilan",
            content: "Di halaman Stok & Opname, cari bahan yang akan diambil. Klik 'Ambil' pada baris bahan yang sesuai. Masukkan jumlah yang diambil. Pilih alasan: Masak Hari Ini / Persiapan / Lainnya. Klik 'Ambil Barang'.",
          },
          {
            title: "FEFO",
            content: "Sistem menggunakan metode FEFO: bahan dengan tanggal kadaluarsa paling depan akan diambil terlebih dahulu. Pastikan memeriksa tanggal kadaluarsa sebelum mengambil.",
          },
        ],
        workflow: [
          "Buka menu Stok & Opname dari sidebar.",
          "Cari bahan yang dibutuhkan (gunakan pencarian atau filter zona).",
          "Klik 'Ambil' pada lot yang sesuai.",
          "Masukkan jumlah yang diambil.",
          "Pilih alasan pengambilan.",
          "Klik 'Ambil Barang'. Stok otomatis berkurang.",
        ],
      },
    ],
    tips: [
      "Selalu cek stok sebelum membuat menu — jangan alokasikan resep dengan bahan yang tidak tersedia.",
      "Isi profil gizi dengan akurat — ini menentukan apakah menu memenuhi standar AKG.",
      "Submit menu untuk review minimal 1 hari sebelum hari H distribusi.",
      "Variasi menu setiap hari untuk menghindari kejenuhan penerima manfaat.",
      "Perhatikan alergen — jangan alokasikan menu dengan alergen ke kelompok yang memiliki alergi.",
    ],
  },
  field_assistant: {
    title: "Panduan Asisten Lapangan",
    color: "#0891B2",
    overview: "Asisten Lapangan mengelola pengadaan bahan: mencatat pembelian dengan struk, membuat rencana pengiriman, mengelola tujuan antar, dan memantau pengiriman driver.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan aktivitas lapangan." },
      { label: "Stok & Opname", desc: "Lakukan opname stok dan pantau kondisi bahan di gudang." },
      { label: "Belanja & Struk", desc: "Catat pembelian bahan beserta struk dan bukti fisik." },
      { label: "Tujuan Antar", desc: "Kelola data tujuan pengiriman: sekolah, posyandu, dll." },
      { label: "Rencana Antar", desc: "Buat rencana pengiriman harian ke setiap tujuan." },
      { label: "Tracking Driver", desc: "Pantau status pengiriman dari setiap driver." },
    ],
    sections: [
      {
        icon: ShoppingBasket,
        label: "Catat Pembelian (Belanja & Struk)",
        link: "/procurement",
        desc: "Input pembelian bahan beserta struk fisik untuk diverifikasi oleh akuntan.",
        details: [
          {
            title: "Form Pembelian",
            content: "Kategori: pilih STOCK (bahan baku) atau OPERASIONAL (perlengkapan). Deskripsi: keterangan pembelian (wajib). Jumlah Manual: jumlah yang Anda bayarkan (Rp, wajib). Total Struk: jumlah tertulis di struk (Rp, bisa dari OCR). Supplier: nama toko/pemasok (opsional). Transport/BBM: biaya transport (Rp, opsional).",
          },
          {
            title: "Rincian Bahan (untuk kategori STOCK)",
            content: "Klik '+ Baris' untuk menambah item. Pilih Bahan dari dropdown. Masukkan Jumlah dan Harga Satuan. Sistem otomatis menghitung subtotal.",
          },
          {
            title: "Foto Struk (WAJIB)",
            content: "Klik area upload foto. Pilih foto struk dari galeri atau ambil foto langsung. Format: JPG/PNG, maks 5MB. Foto akan memiliki watermark otomatis (SPPG + timestamp + role). Tanpa foto struk, pembelian TIDAK bisa disimpan.",
          },
        ],
        workflow: [
          "Buka menu Belanja & Struk dari sidebar.",
          "Klik 'Catat Belanja'.",
          "Pilih kategori: STOCK atau OPERASIONAL.",
          "Isi deskripsi, jumlah manual, total struk, supplier, transport.",
          "Untuk STOCK: tambahkan rincian bahan (klik '+ Baris' → pilih bahan → jumlah & harga).",
          "Upload foto struk (wajib).",
          "Klik 'Simpan'. Pembelian akan menunggu verifikasi akuntan.",
        ],
      },
      {
        icon: MapPin,
        label: "Tujuan Antar",
        link: "/destinations",
        desc: "Kelola data tujuan pengiriman: sekolah, posyandu, panti asuhan, dll.",
        details: [
          {
            title: "Form Tujuan",
            content: "Nama: nama tujuan (wajib). Alamat: alamat lengkap. Kontak Person: nama PIC di tujuan. Telepon: nomor telepon. Catatan: informasi tambahan. Aktif: toggle untuk mengaktifkan/menonaktifkan tujuan.",
          },
          {
            title: "Penting",
            content: "Hanya tujuan yang AKTIF yang bisa dipilih saat membuat rencana antar. Nonaktifkan tujuan yang sudah tidak beroperasi.",
          },
        ],
        workflow: [
          "Buka menu Tujuan Antar dari sidebar.",
          "Klik '+ Tambah Tujuan' untuk menambah tujuan baru.",
          "Isi: Nama, Alamat, Kontak Person, Telepon, Catatan.",
          "Klik 'Simpan'.",
          "Untuk edit: klik ikon pensil pada baris tujuan.",
          "Untuk nonaktifkan: klik toggle 'Aktif'.",
        ],
      },
      {
        icon: Truck,
        label: "Rencana Antar",
        link: "/deliveries",
        desc: "Buat rencana pengiriman harian: pilih driver, tujuan, dan set porsi per kategori.",
        details: [
          {
            title: "Form Rencana",
            content: "Tanggal Antar: wajib, tanggal pengiriman. Driver: pilih dari daftar driver aktif. Catatan: keterangan tambahan (opsional).",
          },
          {
            title: "Pilih Tujuan & Set Porsi",
            content: "Centang tujuan yang akan dikirim. Setelah dicentang, 4 field porsi muncul: Balita, Porsi Kecil, Porsi Besar, Bumil & Busui. Isi jumlah porsi per kategori per tujuan.",
          },
          {
            title: "Edit Rencana",
            content: "Gunakan dropdown Driver pada baris rencana untuk mengganti driver. Klik ikon expand (▶) untuk melihat detail tujuan dan porsi.",
          },
        ],
        workflow: [
          "Buka menu Rencana Antar dari sidebar.",
          "Klik 'Buat Rencana'.",
          "Pilih tanggal antar dan driver.",
          "Centang tujuan yang akan dikirim.",
          "Isi jumlah porsi per kategori (Balita, Porsi Kecil, Porsi Besar, Bumil & Busui) untuk setiap tujuan.",
          "Klik 'Simpan Rencana'.",
          "Rencana akan muncul di halaman Tracking Driver untuk driver yang ditugaskan.",
        ],
      },
      {
        icon: Package,
        label: "Stok & Opname",
        link: "/inventory",
        desc: "Lakukan opname stok fisik dan pantau kondisi bahan di gudang.",
        details: [
          {
            title: "Opname Fisik",
            content: "Klik 'Opname' pada lot. Pilih zona. Masukkan hitungan fisik aktual. Isi suhu/kelembapan sesuai zona. Pilih alasan. Klik 'Catat Opname'.",
          },
          {
            title: "Tambah Lot",
            content: "Klik 'Tambah Lot'. Pilih bahan. Masukkan jumlah dan tanggal kadaluarsa. Klik 'Simpan'.",
          },
        ],
        workflow: [
          "Buka menu Stok & Opname dari sidebar.",
          "Lakukan opname minimal sekali sehari.",
          "Catat semua pembelian baru (Tambah Lot).",
          "Laporkan stok menipis kepada Kepala SPPG.",
        ],
      },
    ],
    tips: [
      "WAJIB upload foto struk untuk setiap pembelian — tanpa foto, akuntan tidak bisa memverifikasi.",
      "Pastikan jumlah manual = total struk. Jika berbeda, beri keterangan yang jelas.",
      "Update status pengiriman secara real-time melalui halaman Tracking Driver.",
      "Laporkan stok menipis kepada Kepala SPPG SEBELUM stok habis.",
      "Periksa kualitas bahan saat opname — laporkan bahan yang rusak atau kadaluarsa.",
    ],
  },
  nutritionist: {
    title: "Panduan Ahli Gizi",
    color: "#6D28D9",
    overview: "Ahli Gizi memastikan setiap menu memenuhi standar gizi (Permenkes 28/2019). Review resep, setujui menu mingguan, dan gunakan kalkulator gizi untuk validasi AKG.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan data gizi SPPG." },
      { label: "Resep & Gizi", desc: "Review profil gizi setiap resep. Edit data gizi jika perlu." },
      { label: "Menu & Cetak", desc: "Pantau menu mingguan yang diajukan head chef." },
      { label: "Kalkulator Gizi", desc: "Hitung pemenuhan AKG untuk setiap menu dan kelompok sasaran." },
      { label: "Persetujuan Menu", desc: "Review dan setujui/tolak menu mingguan dengan tanda tangan digital." },
    ],
    sections: [
      {
        icon: Calculator,
        label: "Kalkulator Gizi",
        link: "/nutrition-calc",
        desc: "Hitung dan verifikasi pemenuhan Angka Kecukupan Gizi (AKG) untuk setiap resep.",
        details: [
          {
            title: "Cara Penggunaan",
            content: "Panel kiri: pilih resep dari daftar. Panel kanan: tampilan otomatis menampilkan profil gizi per porsi dan grafik pemenuhan AKG.",
          },
          {
            title: "Kelompok Sasaran",
            content: "Pilih kelompok sasaran: Balita, PAUD/TK, SD 1–3, SD 4–6, SMP, SMA/SLB, Tenaga Kependidikan, Ibu Hamil, Ibu Menyusui. Setiap kelompok memiliki standar AKG yang berbeda.",
          },
          {
            title: "Grafik AKG",
            content: "5 bar progress: Kalori, Protein, Karbohidrat, Lemak, Natrium. Warna hijau ≥ 80% (memenuhi), kuning ≥ 50% (kurang), merah < 50% (sangat kurang).",
          },
          {
            title: "Verdict",
            content: "Hijau ✓ 'Memenuhi Standar AKG' — rata-rata pemenuhan ≥ 70%. Merah ✗ 'Perlu Perbaikan Gizi' — rata-rata pemenuhan < 70%. Suggestion: rekomendasi perbaikan gizi.",
          },
        ],
        workflow: [
          "Buka menu Kalkulator Gizi dari sidebar.",
          "Pilih resep dari panel kiri.",
          "Pilih kelompok sasaran dari dropdown.",
          "Periksa grafik pemenuhan AKG.",
          "Jika hijau ≥ 70%: resep memenuhi standar.",
          "Jika merah < 70%: resep perlu perbaikan — kurangi/tingkatkan bahan tertentu.",
        ],
      },
      {
        icon: ChefHat,
        label: "Review Resep",
        link: "/recipes",
        desc: "Periksa profil gizi setiap resep dan pastikan sesuai standar.",
        details: [
          {
            title: "Yang Diperiksa",
            content: "Profil gizi per porsi: kalori, protein, karbo, lemak, natrium. Pastikan sesuai dengan kelompok penerima manfaat. Periksa alergen — pastikan tercantum dengan benar.",
          },
          {
            title: "Edit Profil Gizi",
            content: "Ahli Gizi bisa mengedit data gizi langsung di form resep. Klik 'Edit' pada kartu resep → ubah nilai gizi → 'Simpan'.",
          },
        ],
        workflow: [
          "Buka menu Resep & Gizi dari sidebar.",
          "Klik 'Edit' pada resep yang akan direview.",
          "Periksa profil gizi: apakah kalori, protein, karbo, lemak, natrium sesuai standar?",
          "Jika tidak sesuai: ubah nilai gizi atau sarankan perubahan bahan.",
          "Klik 'Simpan'.",
          "Gunakan Kalkulator Gizi untuk validasi ulang.",
        ],
      },
      {
        icon: BadgeCheck,
        label: "Persetujuan Menu",
        link: "/approval",
        desc: "Review dan setujui/tolak menu mingguan dengan tanda tangan digital.",
        details: [
          {
            title: "Proses Review",
            content: "Klik 'Review' pada menu yang diajukan. Tinjau: resep yang dipilih, total gizi per hari, alergen. Isi Catatan (opsional). Klik 'Setujui' atau 'Tolak'. Tanda tangan digital otomatis terisi dengan nama dan timestamp.",
          },
          {
            title: "Standar yang Harus Dipenuhi",
            content: "Menu harus memenuhi minimal 70% AKG untuk kelompok sasaran. Tidak ada alergen yang tidak terdaftar. Variasi menu bervariasi (tidak sama setiap hari).",
          },
          {
            title: "Jika Ditolak",
            content: "Menu kembali ke status DRAFT. Head Chef harus memperbaiki resep/menu dan mengajukan ulang.",
          },
        ],
        workflow: [
          "Buka menu Persetujuan Menu dari sidebar.",
          "Lihat daftar menu yang diajukan (status DIAJUKAN).",
          "Klik 'Review'.",
          "Tinjau: resep, profil gizi total, alergen.",
          "Gunakan Kalkulator Gizi untuk validasi gizi per resep.",
          "Isi catatan jika ada saran.",
          "Klik 'Setujui' atau 'Tolak'.",
        ],
      },
    ],
    tips: [
      "Gunakan Kalkulator Gizi untuk SETIAP resep baru sebelum menyetujui menu.",
      "Pastikan rata-rata pemenuhan AKG ≥ 70% untuk semua menu yang disetujui.",
      "Perhatikan alergen — pastikan tercantum dengan benar di setiap resep.",
      "Dokumentasikan semua persetujuan menu untuk keperluan audit.",
      "Berikan saran perbaikan yang spesifik jika menu ditolak (contoh: 'Tambah 20g protein dari ikan').",
    ],
  },
  driver: {
    title: "Panduan Driver",
    color: "#0891B2",
    overview: "Driver mengantarkan makanan ke tujuan pengiriman. Update status pengiriman, ambil foto bukti, dan laporkan kendala.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan tugas pengiriman hari ini." },
      { label: "Tracking Driver", desc: "Lihat daftar tujuan pengiriman dan update status." },
    ],
    sections: [
      {
        icon: Navigation,
        label: "Tracking Pengiriman",
        link: "/delivery-tracking",
        desc: "Lihat daftar tujuan, update status pengiriman, dan unggah foto bukti.",
        details: [
          {
            title: "Tampilan",
            content: "Daftar tujuan pengiriman untuk hari ini. Setiap tujuan menampilkan: nama tujuan, alamat, jumlah porsi per kategori (Balita/Porsi Kecil/Porsi Besar/Bumil & Busui), status saat ini.",
          },
          {
            title: "Status Pengiriman",
            content: "3 status: Belum Diantar (abu-abu) → Sedang Diantar (biru) → Selesai Diantar (hijau). Status diupdate secara bertahap.",
          },
          {
            title: "Foto Bukti",
            content: "Untuk setiap tujuan, unggah foto bukti pengiriman. Klik area foto → pilih dari galeri atau ambil foto langsung. Foto bukti wajib untuk menandai pengiriman sebagai selesai.",
          },
          {
            title: "Catatan",
            content: "Isi catatan jika ada kendala (contoh: 'Tujuan tutup', 'Penerima tidak ada', 'Jalan rusak').",
          },
        ],
        workflow: [
          "Buka menu Tracking Driver dari sidebar.",
          "Lihat daftar tujuan pengiriman hari ini.",
          "Mulai pengiriman: ubah status ke 'Sedang Diantar'.",
          "Sampai di tujuan: unggah foto bukti.",
          "Isi catatan jika ada kendala.",
          "Ubah status ke 'Selesai Diantar'.",
          "Ulangi untuk setiap tujuan berikutnya.",
        ],
      },
    ],
    tips: [
      "Pastikan semua makanan dalam kondisi baik sebelum berangkat.",
      "Ambil foto bukti di SETIAP tujuan pengiriman — ini bukti formal bahwa makanan sudah sampai.",
      "Update status pengiriman secara real-time agar asisten lapangan bisa memantau.",
      "Laporkan kendala pengiriman kepada asisten lapangan SEGERA.",
      "Jangan mengubah jumlah porsi yang dikirim — sesuai rencana antar.",
    ],
  },
  persiapan: {
    title: "Panduan Tenaga Persiapan",
    color: "#16A34A",
    overview: "Tenaga Persiapan menyiapkan bahan sebelum proses memasak: mengambil bahan dari gudang, mencuci, memotong, dan mencatat tugas harian.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan tugas harian." },
      { label: "Stok & Opname", desc: "Ambil bahan dari gudang sesuai kebutuhan menu hari ini." },
      { label: "Resep & Gizi", desc: "Lihat resep dan bahan yang diperlukan." },
      { label: "Menu & Cetak", desc: "Lihat menu yang akan dimasak hari ini." },
      { label: "Tugas Harian", desc: "Catat aktivitas persiapan: bahan yang sudah disiapkan, foto bukti." },
    ],
    sections: [
      {
        icon: Package,
        label: "Ambil Bahan dari Gudang",
        link: "/inventory",
        desc: "Ambil bahan yang diperlukan untuk persiapan hari ini.",
        details: [
          {
            title: "Cara Mengambil",
            content: "Buka Stok & Opname. Cari bahan yang dibutuhkan (gunakan pencarian). Klik 'Ambil' pada lot yang sesuai. Masukkan jumlah yang diambil. Pilih alasan: 'Persiapan'. Klik 'Ambil Barang'.",
          },
          {
            title: "Tips",
            content: "Ambil sesuai kebutuhan resep — jangan berlebihan. Periksa kualitas bahan sebelum diambil (bau, warna, tekstur). Gunakan metode FEFO: ambil bahan dengan kadaluarsa paling depan.",
          },
        ],
        workflow: [
          "Buka menu Resep & Gizi untuk melihat bahan yang dibutuhkan hari ini.",
          "Buka menu Stok & Opname.",
          "Cari bahan satu per satu.",
          "Klik 'Ambil' → masukkan jumlah → pilih alasan 'Persiapan' → 'Ambil Barang'.",
          "Ulangi untuk semua bahan yang dibutuhkan.",
        ],
      },
      {
        icon: ClipboardList,
        label: "Input Tugas Harian",
        link: "/pemorsian",
        desc: "Catat aktivitas persiapan yang sudah dilakukan hari ini.",
        details: [
          {
            title: "Form Tugas",
            content: "Tanggal: otomatis hari ini (bisa diubah). Foto Persiapan: unggah foto bahan yang sudah disiapkan (cuci, potong, dll). Catatan: keterangan tambahan (opsional).",
          },
          {
            title: "Foto",
            content: "Unggah minimal 1 foto yang menunjukkan bahan yang sudah disiapkan. Format: JPG/PNG, maks 5MB.",
          },
        ],
        workflow: [
          "Buka menu Tugas Harian dari sidebar.",
          "Klik 'Input Tugas'.",
          "Isi tanggal (default hari ini).",
          "Unggah foto persiapan (wajib).",
          "Isi catatan jika perlu.",
          "Klik 'Simpan Tugas'.",
        ],
      },
    ],
    tips: [
      "Ambil bahan SESUAI resep — jangan berlebihan agar tidak ada pemborosan.",
      "Periksa kualitas bahan: bau, warna, tekstur. Jangan gunakan bahan yang mencurigakan.",
      "Cuci dan potong bahan sesuai standar kebersihan.",
      "Selalu unggah foto bukti persiapan sebagai dokumentasi.",
      "Laporkan bahan yang rusak/kadaluarsa kepada Kepala SPPG.",
    ],
  },
  tenaga_masak: {
    title: "Panduan Tenaga Masak",
    color: "#EA580C",
    overview: "Tenaga Masak bertanggung jawab atas proses memasak: mengikuti resep, menjaga porsi, menjaga kebersihan, dan mencatat aktivitas harian.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan tugas memasak hari ini." },
      { label: "Resep & Gizi", desc: "Lihat resep dan langkah-langkah memasak." },
      { label: "Menu & Cetak", desc: "Lihat menu hari ini dan resep yang harus dimasak." },
      { label: "Tugas Harian", desc: "Catat aktivitas memasak: menu yang dimasak, porsi, foto bukti." },
    ],
    sections: [
      {
        icon: ChefHat,
        label: "Masak Sesuai Resep",
        link: "/recipes",
        desc: "Ikuti resep yang sudah ditentukan untuk setiap menu.",
        details: [
          {
            title: "Melihat Resep",
            content: "Buka Resep & Gizi. Lihat resep yang sudah dibuat oleh Head Chef. Perhatikan: daftar bahan dan jumlah, langkah-langkah memasak (instruksi), porsi standar.",
          },
          {
            title: "Penting",
            content: "IKUTI RESEP DENGAN TEPAT untuk menjaga konsistensi rasa dan gizi. Jangan mengurangi atau menambah bahan tanpa izin Head Chef.",
          },
        ],
        workflow: [
          "Buka menu Resep & Gizi dari sidebar.",
          "Cari resep yang harus dimasak hari ini.",
          "Perhatikan daftar bahan dan langkah-langkah.",
          "Masak sesuai resep.",
        ],
      },
      {
        icon: ClipboardList,
        label: "Input Tugas Harian",
        link: "/pemorsian",
        desc: "Catat aktivitas memasak yang sudah dilakukan hari ini.",
        details: [
          {
            title: "Form Tugas",
            content: "Tanggal: otomatis hari ini. Foto Masak: unggah foto proses memasak atau hasil masakan. Catatan: keterangan tambahan (opsional).",
          },
        ],
        workflow: [
          "Buka menu Tugas Harian dari sidebar.",
          "Klik 'Input Tugas'.",
          "Isi tanggal.",
          "Unggah foto masakan (wajib).",
          "Isi catatan jika perlu.",
          "Klik 'Simpan Tugas'.",
        ],
      },
    ],
    tips: [
      "Ikuti resep dengan TEPAT untuk menjaga konsistensi rasa dan gizi.",
      "Jaga kebersihan selama proses memasak: cuci tangan, gunakan sarung tangan, bersihkan peralatan.",
      "Pastikan makanan matang sempurna dan aman dikonsumsi.",
      "Pantau waktu memasak — jangan terlalu lama atau terlalu singkat.",
      "Selalu unggah foto bukti masakan sebagai dokumentasi.",
    ],
  },
  pemorsian: {
    title: "Panduan Tenaga Pemorsian",
    color: "#7C3AED",
    overview: "Tenaga Pemorsian membagi makanan ke dalam ompreng sesuai porsi yang ditentukan. Mencatat jumlah porsi per kategori dan mengunggah foto bukti.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan tugas pemorsian hari ini." },
      { label: "Tugas Harian", desc: "Catat aktivitas pemorsian: isi ompreng, foto bukti, jumlah porsi." },
    ],
    sections: [
      {
        icon: UtensilsCrossed,
        label: "Isi Ompreng",
        desc: "Bagi makanan ke dalam ompreng sesuai porsi yang ditentukan.",
        details: [
          {
            title: "Porsi per Kategori",
            content: "4 kategori porsi: BALITA (porsi kecil, tekstur lembut), PORTION_SMALL (porsi kecil untuk SD), PORTION_LARGE (porsi besar untuk SMP/SMA), BUMIL_BUSUI (porsi khusus ibu hamil/menyusui). Isi ompreng sesuai kategori yang ditentukan.",
          },
          {
            title: "Foto Ompreng",
            content: "Unggah foto ompreng yang sudah terisi sebagai bukti. Foto menunjukkan: jumlah ompreng, isi per ompreng, kategori yang terisi.",
          },
          {
            title: "Input Jumlah Porsi",
            content: "Isi jumlah porsi yang sudah diisi per kategori di form Tugas Harian. Sistem otomatis menghitung total porsi.",
          },
        ],
        workflow: [
          "Periksa menu hari ini di halaman Menu & Cetak.",
          "Siapkan ompreng sesuai jumlah porsi.",
          "Bagi makanan ke dalam ompreng sesuai kategori.",
          "Ambil foto ompreng yang sudah terisi.",
          "Buka menu Tugas Harian dari sidebar.",
          "Klik 'Input Tugas'.",
          "Pilih kategori: Balita/Porsi Kecil/Porsi Besar/Bumil & Busui.",
          "Isi jumlah porsi.",
          "Unggah foto ompreng.",
          "Klik 'Simpan Tugas'.",
          "Ulangi untuk setiap kategori.",
        ],
      },
    ],
    tips: [
      "Pastikan setiap ompreng terisi sesuai porsi standar — jangan kurang atau berlebihan.",
      "Pisahkan ompreng berdasarkan kategori (warna/wadah berbeda per kategori).",
      "Ambil foto SETELAH semua ompreng terisi sebagai bukti.",
      "Laporkan jika ada ketidaksesuaian jumlah porsi kepada Kepala SPPG.",
      "Jaga kebersihan saat mengisi ompreng — gunakan sarung tangan.",
    ],
  },
  kebersihan: {
    title: "Panduan Petugas Kebersihan",
    color: "#059669",
    overview: "Petugas Kebersihan memastikan area dapur bersih dan higienis setelah operasional. Mencatat aktivitas kebersihan dan mengunggah foto bukti.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan tugas kebersihan hari ini." },
      { label: "Tugas Harian", desc: "Catat aktivitas kebersihan: 4 area yang harus dibersihkan, foto bukti per area." },
    ],
    sections: [
      {
        icon: ClipboardCheck,
        label: "Kebersihan Dapur",
        desc: "Pastikan 4 area dapur bersih dan higienis setelah operasional.",
        details: [
          {
            title: "4 Area yang Harus Dibersihkan",
            content: "1. Area Memasak: kompor, oven, peralatan masak, permukaan kerja. 2. Area Cuci: wastafel,tempat cuci piring, saluran air. 3. Area Penyimpanan: lemari es, rak penyimpanan, kontainer. 4. Lantai & Drainase: lantai dapur, saluran pembuangan, tempat sampah.",
          },
          {
            title: "Foto per Area",
            content: "Sistem membutuhkan 4 foto (satu per area) sebagai bukti kebersihan. Format: JPG/PNG, maks 5MB per foto.",
          },
          {
            title: "Standar Kebersihan",
            content: "Bersihkan semua permukaan kerja dengan cairan pembersih yang aman untuk makanan. Pastikan area kompor dan wastafel bersih dari sisa makanan. Buang sampah dan bersihkan tempat sampah. Pastikan lantai kering dan bersih.",
          },
        ],
        workflow: [
          "Bersihkan Area Memasak: kompor, peralatan, permukaan kerja.",
          "Bersihkan Area Cuci: wastafel, tempat cuci piring.",
          "Bersihkan Area Penyimpanan: lemari es, rak.",
          "Bersihkan Lantai & Drainase: pel lantai, buang sampah.",
          "Buka menu Tugas Harian dari sidebar.",
          "Klik 'Input Tugas'.",
          "Unggah 4 foto (satu per area).",
          "Isi catatan jika perlu.",
          "Klik 'Simpan Tugas'.",
        ],
      },
    ],
    tips: [
      "Bersihkan SEMUA area, bukan hanya area yang terlihat kotor.",
      "Gunakan cairan pembersih yang AMAN untuk makanan (food-grade).",
      "Pastikan tidak ada sisa makanan yang menempel di permukaan.",
      "Bersihkan SETIAP HARI setelah operasional selesai.",
      "Laporkan peralatan yang rusak kepada Kepala SPPG.",
    ],
  },
  pencuci: {
    title: "Panduan Pencuci Ompreng",
    color: "#0284C7",
    overview: "Pencuci Ompreng mencuci dan mensterilkan semua ompreng setelah pengiriman. Mencatat jumlah ompreng yang sudah dicuci dan mengunggah foto bukti.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan tugas pencucian hari ini." },
      { label: "Tugas Harian", desc: "Catat aktivitas pencucian: jumlah ompreng dicuci, foto bukti." },
    ],
    sections: [
      {
        icon: UtensilsCrossed,
        label: "Cuci Ompreng",
        desc: "Cuci dan sterilkan semua ompreng setelah dikembalikan dari distribusi.",
        details: [
          {
            title: "3 Tahap Pencucian",
            content: "1. Ompreng Bersih: cuci dengan sabun dan air mengalir, buang sisa makanan. 2. Penanggulangan Limbah: pisahkan sisa makanan, buang ke tempat sampah organik, pastikan saluran pembuangan tidak tersumbat. 3. Kebersihan Area: bersihkan area pencucian, keringkan lantai, pastikan area steril.",
          },
          {
            title: "Foto per Tahap",
            content: "Sistem membutuhkan 3 foto (satu per tahap) sebagai bukti. Format: JPG/PNG, maks 5MB per foto.",
          },
          {
            title: "Standar Sterilisasi",
            content: "Setelah dicuci, sterilkan ompreng dengan air panas (≥ 82°C selama minimal 15 detik) atau desinfektan food-grade. Keringkan ompreng sebelum disimpan.",
          },
        ],
        workflow: [
          "Kumpulkan semua ompreng yang sudah dikembalikan.",
          "Tahap 1 — Ompreng Bersih: cuci dengan sabun dan air mengalir.",
          "Tahap 2 — Penanggulangan Limbah: buang sisa makanan, bersihkan saluran.",
          "Tahap 3 — Kebersihan Area: bersihkan area pencucian.",
          "Sterilkan ompreng dengan air panas atau desinfektan.",
          "Keringkan ompreng sebelum disimpan.",
          "Buka menu Tugas Harian dari sidebar.",
          "Klik 'Input Tugas'.",
          "Unggah 3 foto (satu per tahap).",
          "Isi jumlah ompreng yang sudah dicuci.",
          "Klik 'Simpan Tugas'.",
        ],
      },
    ],
    tips: [
      "Cuci ompreng dengan SABUN dan AIR MENGALIR — jangan hanya dibilas.",
      "Sterilkan dengan AIR PANAS (≥ 82°C) atau desinfektan food-grade.",
      "Keringkan ompreng SEBELUM disimpan agar tidak berkembang jamur.",
      "Pastikan tidak ada sisa makanan di ompreng sebelum dicuci.",
      "Bersihkan area pencucian setelah selesai.",
    ],
  },
};

function SectionDetail({ section, color }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card-soft p-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 text-left"
      >
        <div
          className="w-10 h-10 rounded-lg grid place-items-center shrink-0"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          <section.icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold">{section.label}</h3>
            {section.link && (
              <Link href={section.link} className="text-xs underline" style={{ color }}>
                Buka →
              </Link>
            )}
          </div>
          <p className="text-sm text-[#5C5C5C] mt-1">{section.desc}</p>
        </div>
        <div className="shrink-0 mt-1">
          {open ? <ChevronDown size={16} className="text-[#5C5C5C]" /> : <ChevronRight size={16} className="text-[#5C5C5C]" />}
        </div>
      </button>

      {open && (
        <div className="mt-4 ml-[52px] space-y-4">
          {section.details?.map((d, i) => (
            <div key={i}>
              <h4 className="font-semibold text-sm mb-1">{d.title}</h4>
              <p className="text-sm text-[#5C5C5C] leading-relaxed">{d.content}</p>
            </div>
          ))}

          {section.workflow && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Langkah-langkah:</h4>
              <ol className="space-y-1.5">
                {section.workflow.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      className="font-bold shrink-0 w-5 h-5 rounded-full grid place-items-center text-[10px] text-white"
                      style={{ backgroundColor: color }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[#5C5C5C]">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PanduanPage() {
  const { activeRole } = useAuth();
  const role = activeRole || "admin_sppg";
  const guide = GUIDES[role] || GUIDES.admin_sppg;
  const [showMenus, setShowMenus] = useState(false);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-3">
            <HelpCircle size={28} style={{ color: guide.color }} />
            {guide.title}
          </h1>
          <p className="text-[#5C5C5C] mt-1 max-w-3xl">
            {guide.overview}
          </p>
        </div>

        {/* Menu yang Tersedia */}
        <div className="card-soft p-5">
          <button
            onClick={() => setShowMenus(!showMenus)}
            className="w-full flex items-center justify-between"
          >
            <h2 className="font-display font-bold text-lg" style={{ color: guide.color }}>
              Menu yang Tersedia di Sidebar ({guide.menus.length} menu)
            </h2>
            {showMenus ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {showMenus && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {guide.menus.map((m, i) => (
                <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg hover:bg-[#F9F6F0]">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: `${guide.color}1A`, color: guide.color }}>
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-semibold">{m.label}</span>
                    <span className="text-[#5C5C5C] ml-1">— {m.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panduan Detail per Fitur */}
        <div>
          <h2 className="font-display font-bold text-lg mb-4" style={{ color: guide.color }}>
            Panduan Detail per Fitur
          </h2>
          <div className="space-y-3">
            {guide.sections.map((sec) => (
              <SectionDetail key={sec.label} section={sec} color={guide.color} />
            ))}
          </div>
        </div>

        {/* Tips Penting */}
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

        {/* Istilah dalam Sistem */}
        <div className="card-soft p-5 bg-[#F9F6F0]">
          <h2 className="font-display font-bold text-lg mb-3">Istilah dalam Sistem</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><span className="font-semibold">SPPG</span> — Sasaran Pangan Pendamping Gizi</div>
            <div><span className="font-semibold">MBG</span> — Makan Bergizi Gratis</div>
            <div><span className="font-semibold">AKG</span> — Angka Kecukupan Gizi (standar gizi harian)</div>
            <div><span className="font-semibold">Ompreng</span> — Wadah makanan untuk distribusi</div>
            <div><span className="font-semibold">FEFO</span> — First Expired First Out (stok kadaluarsa duluan dipakai)</div>
            <div><span className="font-semibold">Par-Level</span> — Stok minimum yang harus tersedia</div>
            <div><span className="font-semibold">Opname</span> — Penghitungan stok fisik (bandingkan stok sistem vs aktual)</div>
            <div><span className="font-semibold">BKU</span> — Buku Kas Umum (rekap semua transaksi keuangan)</div>
            <div><span className="font-semibold">D/K</span> — Debet / Kredit (sistem pembukuan)</div>
            <div><span className="font-semibold">RAB</span> — Rencana Anggaran Biaya</div>
            <div><span className="font-semibold">LR</span> — Laporan Resume Penerimaan & Pengeluaran</div>
            <div><span className="font-semibold">LPA</span> — Laporan Dua Pekanan Penggunaan Dana</div>
            <div><span className="font-semibold">DafNom</span> — Daftar Nominatif Insentif Relawan</div>
            <div><span className="font-semibold">SPTJ</span> — Surat Pernyataan Tanggung Jawab (Lampiran 30j)</div>
            <div><span className="font-semibold">BAPSD</span> — Berita Acara Penyaluran Siap Distribusi (Lampiran 30n)</div>
            <div><span className="font-semibold">Juknis</span> — Petunjuk Teknis BGN</div>
            <div><span className="font-semibold">BGN</span> — Badan Gizi Nasional</div>
            <div><span className="font-semibold">Permenkes 28/2019</span> — Standar gizi untuk program MBG</div>
          </div>
        </div>

        {/* Harga Satuan Porsi */}
        <div className="card-soft p-5">
          <h2 className="font-display font-bold text-lg mb-3">Harga Satuan Porsi (Juknis BGN SK 401.1/2025)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#4A7C59]/10 border border-[#4A7C59]/20">
              <div className="text-sm text-[#5C5C5C]">Kelompok 1: Balita / PAUD / TK / RA / SD 1-3</div>
              <div className="font-display font-bold text-2xl text-[#4A7C59]">Rp 8.000</div>
              <div className="text-xs text-[#5C5C5C] mt-1">per porsi per hari</div>
            </div>
            <div className="p-4 rounded-lg bg-[#D97706]/10 border border-[#D97706]/20">
              <div className="text-sm text-[#5C5C5C]">Kelompok 2: SD 4-6 / SMP / SMA / SLB / Santri / Pend / Bumil / Busui</div>
              <div className="font-display font-bold text-2xl text-[#D97706]">Rp 10.000</div>
              <div className="text-xs text-[#5C5C5C] mt-1">per porsi per hari</div>
            </div>
          </div>
          <p className="text-xs text-[#5C5C5C] mt-3">Total alokasi per porsi: Rp 15.000 (Bahan Baku + Operasional + Insentif Fasilitas)</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded bg-[#4A7C59]/5 text-center">
              <div className="font-semibold text-[#4A7C59]">Bahan Baku</div>
              <div>67% = Rp 10.000</div>
            </div>
            <div className="p-2 rounded bg-[#D97706]/5 text-center">
              <div className="font-semibold text-[#D97706]">Operasional</div>
              <div>20% = Rp 3.000</div>
            </div>
            <div className="p-2 rounded bg-[#6D28D9]/5 text-center">
              <div className="font-semibold text-[#6D28D9]">Insentif</div>
              <div>13% = Rp 2.000</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
