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
    overview: "Akuntan bertanggung jawab penuh atas siklus pembukuan SPPG: verifikasi bukti pembelian dari asisten lapangan, input transaksi debet/kredit dengan kode akun yang benar, memantau Buku Kas Umum (BKU) dan 6 buku pembantu, serta menyusun laporan keuangan (LR, LPA, Catatan Harian, DafNom, SPTJ, BAPSD). Semua data yang Anda input akan otomatis mengalir ke BKU, buku pembantu, dan laporan — sehingga ketepatan di tahap awal sangat krusial.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan keuangan SPPG: total pemasukan, pengeluaran, saldo kas, dan grafik aliran dana." },
      { label: "Stok Detail / Rekap", desc: "Lihat detail dan rekapitulasi stok (read-only). Berguna untuk mencocokkan jumlah bahan yang dibeli dengan stok aktual." },
      { label: "Belanja & Struk", desc: "Verifikasi pembelian dari asisten lapangan: cocokkan struk foto, jumlah manual, dan transport. Setujui atau tolak." },
      { label: "Anggaran", desc: "Edit field Biaya Aktual pada anggaran yang sudah dibuat admin (Section 1–3). RAB tidak bisa diubah." },
      { label: "Transaksi (D/K)", desc: "Input transaksi Debet/Kredit dengan 8 kode akun dan 6 buku pembantu. Ini adalah menu utama harian Anda." },
      { label: "BKU", desc: "Lihat Buku Kas Umum (read-only, grouped by kode akun). Gunakan untuk verifikasi saldo dan audit internal." },
      { label: "Buku Pembantu", desc: "Lihat 6 buku pembantu: BANK, PETTY_CASH, BAHAN_BAKU, OPERASIONAL, FASILITAS, PAJAK. Cross-reference dengan BKU." },
      { label: "Laporan", desc: "Export LR, LPA, Catatan Harian, DafNom, SPTJ, BAPSD. Filter berdasarkan periode tanggal." },
      { label: "Audit Trail", desc: "Pantau aktivitas perubahan data oleh semua pengguna. Gunakan untuk investigasi jika ada ketidaksesuaian." },
    ],
    sections: [
      {
        icon: ShoppingBasket,
        label: "Verifikasi Pembelian (Belanja & Struk)",
        link: "/procurement",
        desc: "Verifikasi pembelian yang dicatat oleh asisten lapangan. Cocokkan struk foto, jumlah manual, dan transport sebelum menyetujui atau menolak.",
        details: [
          {
            title: "Memahami Kartu Pembelian",
            content: "Setiap kartu pembelian menampilkan: (1) Kategori — STOCK untuk bahan baku, OPERASIONAL untuk biaya operasional. (2) Deskripsi — misalnya 'Beli bahan baku sayuran'. (3) Jumlah Manual — angka yang diketik manual oleh asisten lapangan (Rp 450.000). (4) Total Struk — hasil OCR dari foto struk yang diunggah (Rp 448.000). (5) Transport — biaya pengiriman jika ada. (6) Status — Pending (kuning), Verified (hijau), Tolak (merah).",
          },
          {
            title: "Contoh Skenario Verifikasi",
            content: "Contoh 1 — Sesuai: Asisten membeli sayuran, menulis Rp 450.000, struk foto OCR Rp 448.000. Selisih Rp 2.000 wajar (pembulatan). Klik Setujui, isi catatan: 'Selisih Rp 2.000 wajar, struk jelas'. Contoh 2 — Selisih besar: Asisten menulis Rp 500.000, struk foto Rp 350.000. Selisih Rp 150.000 terlalu besar. Klik Tolak, isi catatan: 'Selisih Rp 150.000, mohon klarifikasi. Lampirkan struk asli.' Contoh 3 — Struk buram: Foto struk tidak terbaca OCR. Klik Tolak, isi catatan: 'Struk tidak terbaca, mohon unggah ulang foto yang lebih jelas'.",
          },
          {
            title: "Checklist Sebelum Menyetujui",
            content: "Sebelum klik 'Setujui', pastikan: ✅ Deskripsi pembelian masuk akal untuk kategori yang dipilih. ✅ Selisih jumlah manual vs total struk wajar (selisih < 5% dari total). ✅ Foto struk terlihat jelas dan lengkap (tanggal, nama item, total). ✅ Transport wajar (tidak melebihi 10% dari total belanja). ✅ Jika ada catatan khusus dari asisten, sudah dibaca dan dipahami.",
          },
          {
            title: "Yang Terjadi Setelah Verifikasi",
            content: "Setelah disetujui: status berubah menjadi 'Verified', data pembelian otomatis tersedia di modul Stok (untuk kategori STOCK). Transaksi ini belum otomatis masuk BKU — Anda harus input manual di menu Transaksi (D/K). Setelah ditolak: status berubah menjadi 'Tolak', asisten lapangan akan melihat penolakan dan bisa mengirim ulang dengan perbaikan.",
          },
        ],
        workflow: [
          "Buka menu Belanja & Struk dari sidebar.",
          "Lihat daftar pembelian. Kartu dengan border kuning menunggu verifikasi, hijau sudah verified, merah ditolak.",
          "Klik 'Validasi Akuntan' pada kartu yang akan diverifikasi.",
          "Perhatikan angka: bandingkan jumlah manual (tulisan asisten) vs total struk (hasil OCR foto).",
          "Klik foto struk untuk memperbesar. Pastikan struk terbaca jelas: tanggal, nama item, jumlah, total.",
          "Jika selisih wajar (< 5%): isi catatan lalu klik 'Setujui'.",
          "Jika selisih besar atau struk buram: klik 'Tolak', isi catatan penjelasan, asisten akan mengirim ulang.",
          "Setelah verifikasi, catat di buku catatan harian: tanggal, nama asisten, jumlah, status.",
        ],
      },
      {
        icon: PiggyBank,
        label: "Transaksi (D/K)",
        link: "/transactions",
        desc: "Input transaksi pembukuan Debet/Kredit dengan 8 kode akun dan 6 buku pembantu. Ini adalah menu kerja harian utama Anda.",
        details: [
          {
            title: "8 Kode Akun — Kapan Digunakan",
            content: [
              { code: "1000", name: "BUKU KAS UMUM", use: "Penerimaan kas tunai yang tidak masuk kategori lain. Contoh: uang kembalian dari pembelian, setoran tunai.", type: "Debet = kas masuk, Kredit = kas keluar" },
              { code: "1100", name: "PETTY CASH", use: "Kas kecil untuk pengeluaran harian ringan: belanja sayuran pasar, beli tisu, bayar parkir.", type: "Debet = isi ulang kas kecil, Kredit = pengeluaran dari kas kecil" },
              { code: "1200", name: "KAS DI BANK", use: "Transaksi non-tunai: transfer, Virtual Account (VA), pembayaran kartu debit.", type: "Debet = penerimaan transfer, Kredit = pengeluaran transfer" },
              { code: "1300", name: "DANA BANTUAN PEMERINTAH", use: "Pemasukan dana bantuan dari pemerintah pusat/daerah. Dana ini adalah sumber utama operasional SPPG.", type: "Debet = dana diterima dari pemerintah, Kredit = jarang dipakai" },
              { code: "2100", name: "BIAYA BAHAN BAKU", use: "Pengeluaran untuk pembelian bahan baku masakan: sayuran, daging, bumbu, beras, minyak, dll.", type: "Hampir selalu Kredit (pengeluaran)" },
              { code: "2200", name: "BIAYA OPERASIONAL", use: "Pengeluaran operasional harian: transport driver, beli gas, bayar parkir, beli alat kecil, listrik.", type: "Hampir selalu Kredit (pengeluaran)" },
              { code: "2300", name: "BIAYA INSENTIF FASILITAS", use: "Pembayaran insentif/tunjangan untuk relawan dan petugas fasilitas.", type: "Hampir selalu Kredit (pengeluaran)" },
              { code: "3100", name: "PPN", use: "Pajak Pertambahan Nilai yang melekat pada pembelian. Dicatat terpisah untuk keperluan pelaporan pajak.", type: "Kredit = PPN yang harus dibayar/dipotong" },
            ],
          },
          {
            title: "Contoh Transaksi Nyata — Step by Step",
            content: "Skenario 1: Dana bantuan pemerintah masuk Rp 50.000.000 via transfer. Form: Tanggal=2026-08-01, Kode Akun=1300, Keterangan='Dana bantuan pemerintah bulan Agustus', Debet=50000000, Kredit=0, Buku Pembantu=BANK. Skenario 2: Beli bahan baku sayuran bayar tunai Rp 500.000. Form: Tanggal=2026-08-02, Kode Akun=2100, Keterangan='Beli sayuran pasar Pagi', Debet=0, Kredit=500000, Buku Pembantu=BAHAN_BAKU. Skenario 3: Bayar transport driver pengiriman Rp 150.000. Form: Tanggal=2026-08-02, Kode Akun=2200, Keterangan='Transport driver Pak Budi', Debet=0, Kredit=150000, Buku Pembantu=OPERASIONAL. Skenario 4: Penerimaan PPN dari supplier Rp 50.000. Form: Tanggal=2026-08-03, Kode Akun=3100, Keterangan='PPN pembelian bumbu supplier X', Debet=0, Kredit=50000, Buku Pembantu=PAJAK. Skenario 5: Isi ulang kas kecil dari bank Rp 2.000.000. Form: Tanggal=2026-08-01, Kode Akun=1100, Keterangan='Isi ulang kas kecil mingguan', Debet=2000000, Kredit=0, Buku Pembantu=PETTY_CASH. Skenario 6: Bayar insentif relawan Rp 1.500.000. Form: Tanggal=2026-08-05, Kode Akun=2300, Keterangan='Insentif 5 relawan Rp 300.000', Debet=0, Kredit=1500000, Buku Pembantu=FASILITAS.",
          },
          {
            title: "6 Buku Pembantu — Kapan Dipilih",
            content: [
              { code: "BANK", use: "Untuk semua transaksi via transfer bank, VA, atau kartu debit. Selalu pilih ini jika uang tidak berpindah secara fisik." },
              { code: "PETTY_CASH", use: "Untuk pengeluaran dari kas kecil: belanja pasar harian, bayar parkir, beli tisu, dll." },
              { code: "BAHAN_BAKU", use: "Untuk pembelian bahan baku masakan. Jika beli sayuran Rp 500.000, pilih buku ini." },
              { code: "OPERASIONAL", use: "Untuk biaya operasional non-bahan: transport, gas, listrik, alat kecil." },
              { code: "FASILITAS", use: "Untuk insentif relawan dan petugas fasilitas." },
              { code: "PAJAK", use: "Untuk pencatatan PPN dan pajak lainnya." },
            ],
          },
          {
            title: "Aturan Penting Debet/Kredit",
            content: "RULE 1: Setiap transaksi HARUS memiliki Debet ATAU Kredit (salah satu saja, tidak boleh keduanya). Jika Anda isi Debet Rp 500.000, maka Kredit HARUS Rp 0 (dan sebaliknya). RULE 2: Kode Akun menentukan arah aliran uang. Kode 1xxx (kas) = Debet = uang masuk, Kredit = uang keluar. Kode 2xxx (biaya) = Kredit = pengeluaran, Debet = koreksi/penyesuaian. Kode 3xxx (PPN) = Kredit = PPN yang melekat pada pengeluaran. RULE 3: Buku Pembantu bersifat opsional tapi SANGAT disarankan. Tanpa buku pembantu, pelacakan per kategori menjadi sulit saat audit.",
          },
          {
            title: "Kesalahan Umum yang Harus Dihindari",
            content: "❌ MENGISI Debet DAN Kredit sekaligus — sistem akan menolak atau menghasilkan saldo aneh. ❌ Salah kode akun: memasukkan belanja bahan baku ke kode 2200 (operasional) padahal harusnya 2100 (bahan baku). ❌ Lupa isi buku pembantu — transaksi tetap tersimpan tapi sulit dilacak nanti. ❌ Tanggal transaksi salah — memasukkan tanggal besok atau bulan lalu. Selalu gunakan tanggal transaksi aktual. ❌ Keterangan kosong atau tidak jelas — 'Belanja' saja tidak cukup, tulis 'Beli bahan baku sayuran pasar Pagi'.",
          },
        ],
        workflow: [
          "Buka menu Transaksi (D/K) dari sidebar.",
          "Klik 'Tambah Transaksi'.",
          "Isi Tanggal: gunakan tanggal transaksi aktual (YYYY-MM-DD).",
          "Pilih Kode Akun: tentukan apakah ini pemasukan (1xxx) atau pengeluaran (2xxx/3xxx).",
          "Isi Keterangan: deskripsi jelas dan spesifik (misalnya 'Beli sayuran pasar Pagi').",
          "Isi Debet ATAU Kredit: salah satu saja, yang lain biarkan 0.",
          "Pilih Buku Pembantu (opsional tapi disarankan): BANK, PETTY_CASH, BAHAN_BAKU, OPERASIONAL, FASILITAS, atau PAJAK.",
          "Isi Catatan (opsional): informasi tambahan untuk audit trail.",
          "Klik 'Simpan'. Transaksi langsung mempengaruhi BKU dan Buku Pembantu.",
          "Untuk edit: klik ikon pensil → ubah data → 'Simpan'. Perhatikan audit trail tercatat.",
          "Untuk hapus: klik ikon tempat sampah → konfirmasi. Hapus hanya jika benar-benar salah input.",
        ],
      },
      {
        icon: ScrollText,
        label: "BKU (Buku Kas Umum)",
        link: "/bku",
        desc: "Lihat Buku Kas Umum — ringkasan semua transaksi yang dikelompokkan berdasarkan kode akun. Halaman ini read-only.",
        details: [
          {
            title: "Cara Membaca BKU",
            content: "BKU menampilkan transaksi yang dikelompokkan per kode akun. Setiap kelompok memiliki: Header — kode akun, nama akun. Subtotal Debet — total semua transaksi debet di akun ini. Subtotal Kredit — total semua transaksi kredit di akun ini. Saldo — perhitungan otomatis: Total Debet − Total Kredit (untuk akun kas) atau sebaliknya (untuk akun biaya). Tabel Detail — daftar setiap transaksi: tanggal, keterangan, debet, kredit, dan saldo berjalan.",
          },
          {
            title: "Memahami Saldo per Akun",
            content: "Akun Kas (1000, 1100, 1200, 1300): Saldo = Total Debet − Total Kredit. Saldo positif = masih ada uang. Saldo negatif = kelebihan pengeluaran (ERROR — segera cari penyebab). Akun Biaya (2100, 2200, 2300): Saldo = Total Kredit − Total Debet. Semakin besar saldo = semakin besar pengeluaran. Akun PPN (3100): Saldo = Total Kredit. Ini adalah total PPN yang melekat pada pengeluaran. Contoh: kode 1100 (Petty Cash) Debet Rp 2.000.000, Kredit Rp 1.500.000 → Saldo = Rp 500.000 (kas kecil tersisa).",
          },
          {
            title: "Verifikasi BKU dengan Transaksi Anda",
            content: "Setelah input transaksi, selalu cek BKU untuk memastikan: (1) Transaksi muncul di kode akun yang benar. (2) Debet/Kredit sesuai dengan yang Anda input. (3) Saldo akun kas tidak negatif. (4) Tidak ada transaksi duplikat. Jika ada ketidaksesuaian, kembali ke menu Transaksi dan periksa input Anda. Jika sudah benar tapi BKU masih salah, laporkan ke admin.",
          },
          {
            title: "Filter dan Pencarian",
            content: "Gunakan filter untuk mempersempit data: Filter Kode Akun — pilih satu akun untuk melihat transaksi spesifik (misalnya hanya 2100 untuk cek pengeluaran bahan baku). Filter Tanggal — pilih rentang tanggal 'Dari' dan 'Sampai' untuk laporan periode tertentu. Kombinasi filter — gunakan kedua filter sekaligus untuk pencarian paling spesifik.",
          },
        ],
        workflow: [
          "Buka menu BKU dari sidebar.",
          "Lihat kartu ringkasan di bagian atas: total keseluruhan Debet, Kredit, dan Saldo.",
          "Gunakan filter Kode Akun jika ingin fokus pada satu akun tertentu.",
          "Gunakan filter Tanggal untuk rentang periode (misalnya 1–15 Agustus 2026).",
          "Scroll ke bawah untuk melihat detail transaksi per kelompok akun.",
          "Perhatikan saldo: pastikan akun kas (1000, 1100, 1200, 1300) tidak negatif.",
          "Jika ada saldo aneh, klik transaksi terkait untuk melihat detailnya.",
          "Catat hasil verifikasi di buku catatan harian Anda.",
        ],
      },
      {
        icon: BookOpen,
        label: "Buku Pembantu",
        link: "/sub-ledger",
        desc: "Lihat 6 buku pembantu: BANK, PETTY_CASH, BAHAN_BAKU, OPERASIONAL, FASILITAS, PAJAK. Cross-reference dengan BKU.",
        details: [
          {
            title: "6 Buku Pembantu dan Contoh Isinya",
            content: [
              { code: "BANK", example: "Transfer dana bantuan Rp 50.000.000 dari pemerintah. Pembayaran supplier Rp 5.000.000 via VA. Total: 3 transaksi, Debet Rp 52.000.000, Kredit Rp 7.000.000." },
              { code: "PETTY_CASH", example: "Isi ulang kas kecil Rp 2.000.000. Beli tisu Rp 25.000. Bayar parkir Rp 15.000. Total: 4 transaksi, Debet Rp 2.000.000, Kredit Rp 140.000." },
              { code: "BAHAN_BAKU", example: "Beli sayuran Rp 500.000. Beli beras Rp 300.000. Beli bumbu Rp 150.000. Total: 5 transaksi, Debet Rp 0, Kredit Rp 950.000." },
              { code: "OPERASIONAL", example: "Bayar transport Rp 150.000. Bayar gas Rp 75.000. Beli alat kecil Rp 50.000. Total: 6 transaksi, Debet Rp 0, Kredit Rp 275.000." },
              { code: "FASILITAS", example: "Insentif 5 relawan Rp 1.500.000. Insentif koordinator Rp 500.000. Total: 2 transaksi, Debet Rp 0, Kredit Rp 2.000.000." },
              { code: "PAJAK", example: "PPN pembelian bumbu Rp 50.000. PPN pembelian beras Rp 30.000. Total: 2 transaksi, Debet Rp 0, Kredit Rp 80.000." },
            ],
          },
          {
            title: "Cara Cross-Reference dengan BKU",
            content: "Buka BKU, catat total Debet dan Kredit per kode akun. Buka Buku Pembantu yang relevan, bandingkan totalnya. Jika BANK di BKU menunjukkan Debet Rp 52.000.000, maka Buku Pembantu BANK juga harus menunjukkan Debet Rp 52.000.000. Jika berbeda, cari transaksi yang tidak cocok — kemungkinan ada transaksi yang tidak dipilih buku pembantu atau salah memilih buku pembantu.",
          },
          {
            title: "Kapan Harus Dicek",
            content: "Setelah semua transaksi harian selesai diinput, cek BKU dan semua 6 buku pembantu. Pastikan setiap transaksi di BKU memiliki buku pembantu yang sesuai (kecuali transaksi yang memang tidak perlu buku pembantu). Jika ada transaksi BKU tanpa buku pembantu, edit transaksi tersebut dan tambahkan buku pembantu yang benar.",
          },
          {
            title: "Read-Only",
            content: "Halaman Buku Pembantu hanya bisa dilihat, tidak bisa diedit. Perubahan harus dilakukan melalui menu Transaksi (D/K). Setelah mengedit, kembali ke Buku Pembantu untuk memastikan perubahan sudah tercatat.",
          },
        ],
        workflow: [
          "Buka menu Buku Pembantu dari sidebar.",
          "Klik salah satu dari 6 kartu buku pembantu (misalnya BANK).",
          "Tabel detail di bawah akan menampilkan semua transaksi yang terkait.",
          "Catat total Debet dan Kredit untuk buku pembantu ini.",
          "Buka BKU, cari kode akun yang sama, bandingkan totalnya.",
          "Jika cocok → lanjut ke buku pembantu berikutnya. Jika tidak → cari transaksi yang bermasalah.",
          "Ulangi untuk semua 6 buku pembantu sampai semuanya cocok dengan BKU.",
        ],
      },
      {
        icon: PiggyBank,
        label: "Anggaran (Edit Aktual)",
        link: "/anggaran",
        desc: "Edit field Biaya Aktual pada anggaran yang sudah dibuat oleh admin. RAB tidak bisa diubah.",
        details: [
          {
            title: "Yang Bisa Diedit",
            content: "Field Biaya Aktual pada: Section 1 — Bahan (sayuran, beras, bumbu, dll). Section 2 — Operasional (transport, gas, listrik, dll). Section 3 — Insentif (insentif relawan dan petugas). Field RAB tidak bisa diedit oleh akuntan — RAB ditentukan saat anggaran dibuat oleh admin/kepala SPPG.",
          },
          {
            title: "Perhitungan Selisih Otomatis",
            content: "Setiap kali Anda mengisi Biaya Aktual, sistem otomatis menghitung: Selisih = RAB − Biaya Aktual. Selisih POSITIF (hijau) = surplus, pengeluaran di bawah anggaran. Selisih NEGATIF (merah) = defisit, pengeluaran melebihi anggaran. Contoh: RAB Rp 5.000.000, Aktual Rp 4.500.000 → Selisih Rp 500.000 (surplus, hijau).",
          },
        ],
        workflow: [
          "Buka menu Anggaran dari sidebar.",
          "Lihat daftar anggaran yang sudah ada. Perhatikan periode dan status.",
          "Klik ikon pensil pada baris anggaran yang akan diedit.",
          "Ubah field Biaya Aktual pada Section 1, 2, atau 3 sesuai pengeluaran aktual.",
          "Klik 'Simpan'. Selisih otomatis diperbarui dan ditampilkan.",
          "Ulangi untuk anggaran periode berikutnya jika sudah waktunya input aktual.",
        ],
      },
      {
        icon: FileText,
        label: "Laporan Keuangan",
        link: "/reports",
        desc: "Export 6 jenis laporan keuangan: LR, LPA, Catatan Harian, DafNom, SPTJ, BAPSD. Filter berdasarkan periode.",
        details: [
          {
            title: "Jenis Laporan dan Kapan Digunakan",
            content: [
              { code: "LR", name: "Laporan Resume", use: "Ringkasan pemasukan vs pengeluaran per kode akun. Menunjukkan posisi keuangan SPPG secara keseluruhan. Cocok untuk rapat evaluasi anggaran." },
              { code: "LPA", name: "Laporan 2 Pekanan", use: "Laporan realisasi anggaran 2 pekan: perbandingan RAB vs Aktual untuk bahan, operasional, dan insentif. Wajib diserahkan ke dinas terkait." },
              { code: "Catatan", name: "Catatan Harian", use: "Daftar pengeluaran harian yang dikelompokkan per tanggal. Menampilkan kode akun, keterangan, dan nominal kredit. Berguna untuk audit trail harian." },
              { code: "DafNom", name: "Daftar Nominatif Insentif Relawan", use: "Daftar nama relawan beserta jumlah insentif per porsi. Insentif dihitung dari jumlah porsi yang didistribusikan × insentif per porsi (konfigurasi global)." },
              { code: "SPTJ", name: "Surat Pernyataan Pertanggungjawaban", use: "Surat resmi pernyataan pertanggungjawaban penggunaan dana. Ditandatangani oleh Kepala SPPG dan Akuntan. Memuat total penerimaan, pengeluaran, dan sisa saldo." },
              { code: "BAPSD", name: "Berita Acara Penyaluran", use: "Dokumen resmi penyaluran makanan siap distribusi. Memuat tanggal, lokasi, jumlah porsi, tujuan pengiriman, dan driver. Ditandatangani saat distribusi." },
            ],
          },
          {
            title: "Proses Export Step by Step",
            content: "1. Buka menu Laporan dari sidebar. 2. Pilih jenis laporan yang diinginkan (LR, LPA, Catatan, dll). 3. Atur filter tanggal: isi 'Dari' (tanggal awal periode) dan 'Sampai' (tanggal akhir periode). 4. Klik 'Preview' untuk melihat pratinjau laporan di layar. 5. Periksa apakah data lengkap dan benar. 6. Klik 'Export PDF' untuk mengunduh file PDF. 7. Simpan file dengan nama yang jelas: 'LPA_Agustus_2026_Minggu1.pdf'.",
          },
          {
            title: "Tips Export Laporan",
            content: "Selalu preview sebelum export — jangan langsung export tanpa cek. Pastikan periode tanggal benar sebelum export. Export LPA setiap 2 pekan (Minggu 1–15, 16–akhir bulan). Export LR dan BAPSD setiap akhir bulan untuk evaluasi. Simpan semua file export di folder terorganisir berdasarkan bulan dan tahun. Catat nomor/laporan apa saja yang sudah di-export di buku catatan.",
          },
        ],
        workflow: [
          "Buka menu Laporan dari sidebar.",
          "Pilih jenis laporan: LR, LPA, Catatan, DafNom, SPTJ, atau BAPSD.",
          "Atur filter tanggal: masukkan tanggal awal ('Dari') dan akhir ('Sampai') periode.",
          "Klik 'Preview' untuk melihat pratinjau laporan.",
          "Scroll dan periksa semua data: pastikan tidak ada transaksi yang terlewat.",
          "Jika sudah benar, klik 'Export PDF' untuk mengunduh.",
          "Simpan file dengan nama yang deskriptif di folder laporan bulan ini.",
          "Catat di buku catatan: jenis laporan, periode, tanggal export, nama file.",
        ],
      },
    ],
    tips: [
      "Input transaksi SETIAP HARI sebelum jam 5 sore agar BKU selalu up-to-date dan tidak ada transaksi yang terlewat.",
      "Selalu isi Buku Pembantu saat input transaksi — ini memudahkan pelacakan dan cross-reference dengan BKU saat audit.",
      "Verifikasi pembelian SEGERA setelah asisten lapangan mengirim struk. Jangan menunda lebih dari 1×24 jam agar asisten bisa mengoreksi jika perlu.",
      "Jika jumlah manual ≠ total struk, SELALU beri catatan yang jelas saat verifikasi. Jangan sekadar tolak tanpa penjelasan.",
      "Sebelum export laporan, SELALU preview terlebih dahulu. Periksa apakah semua transaksi periode tersebut sudah tercatat.",
      "Simpan semua file export laporan di folder terorganisir: '/Laporan/2026/Agustus/'. Ini memudahkan pencarian saat audit.",
      "Setiap akhir hari, cek saldo BKU untuk semua akun kas (1000, 1100, 1200, 1300). Jika saldo negatif, Segera cari penyebab — jangan biarkan sampai besok.",
      "Gunakan Catatan audit trail untuk investigasi jika ada transaksi yang mencurigakan. Audit trail mencatat siapa yang mengubah apa dan kapan.",
      "Buat jadwal rutin: Senin input semua transaksi weekend yang tertinggal, Jumat cek BKU dan buku pembantu sebelum akhir minggu kerja.",
      "Jika ragu soal kode akun, tanyakan ke admin atau kepala SPPG. Lebih baik bertanya daripada salah input yang sulit dikoreksi nanti.",
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
    overview: "Asisten Lapangan adalah 'mata dan tangan' operasional SPPG. Anda bertanggung jawab untuk: (1) mencatat setiap pembelian bahan dengan struk fisik, (2) mengelola data tujuan pengiriman, (3) membuat rencana pengiriman harian dan menugaskan driver, (4) memantau pengiriman real-time, dan (5) melakukan opname stok. Setiap data yang Anda catat akan diverifikasi oleh akuntan dan digunakan oleh seluruh tim.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan aktivitas lapangan: stok menipis, pengiriman hari ini, pembelian pending." },
      { label: "Stok & Opname", desc: "Lihat stok FEFO, lakukan opname fisik, catat pengambilan bahan untuk masak, tambah lot baru." },
      { label: "Belanja & Struk", desc: "Catat setiap pembelian bahan beserta foto struk. Status: Draft → Pending → Verified/Tolak." },
      { label: "Tujuan Antar", desc: "Kelola data tujuan pengiriman: sekolah, posyandu, panti asuhan. Hanya tujuan AKTIF yang bisa dipilih." },
      { label: "Rencana Antar", desc: "Buat rencana pengiriman harian: pilih tanggal, driver, tujuan, dan alokasi porsi per kategori." },
      { label: "Tracking Driver", desc: "Pantau status pengiriman real-time: mana yang sudah, sedang, dan belum diantar." },
    ],
    sections: [
      {
        icon: ShoppingBasket,
        label: "Catat Pembelian (Belanja & Struk)",
        link: "/procurement",
        desc: "Input setiap pembelian bahan beserta foto struk asli. Ini adalah bukti pertanggungjawaban keuangan yang akan diverifikasi oleh akuntan.",
        details: [
          {
            title: "Kapan Mencatat Pembelian?",
            content: "Setiap kali Anda membeli bahan untuk SPPG — baik tunai maupun transfer — WAJIB dicatat di sistem. Jangan menunda pencatatan. Catat SEGERA setelah transaksi agar data akurat dan foto struk masih jelas.",
          },
          {
            title: "Memilih Kategori: STOCK vs OPERASIONAL",
            content: "STOCK = bahan baku makanan (sayur, daging, beras, telur, rempah, dll). Pilih ini untuk pembelian bahan yang akan dimasak. OPERASIONAL = biaya non-bahan (transport/BBM kirim, sabun cuci, tisu, kantong plastik, dll). Pilih ini untuk pengeluaran operasional harian. Jangan salah pilih — akuntan menggunakan kategori ini untuk menghitung Biaya Bahan Baku (2100) vs Biaya Operasional (2200).",
          },
          {
            title: "Cara Mengisi Form — Field per Field",
            content: "Deskripsi (wajib): tulis jelas apa yang dibeli. Contoh: 'Beli sayur bayam 5kg + wortel 3kg di Pasar ABC'. Jumlah Manual (wajib): berapa total uang yang ANDA bayarkan. Contoh: Rp 450.000. Total Struk: berapa tertulis di struk. Contoh: Rp 448.000. Jika struk tidak ada, isi = Jumlah Manual. Supplier (opsional): nama toko. Contoh: 'Pasar Segar ABC'. Transport/BBM (opsional): biaya ongkir. Contoh: Rp 25.000. Total yang akan diverifikasi = Jumlah Manual + Transport.",
          },
          {
            title: "Menambah Rincian Bahan (untuk kategori STOCK)",
            content: "Setelah memilih kategori STOCK, tombol '+ Baris' akan muncul. Klik untuk menambah baris bahan. Pilih bahan dari dropdown (data dari Master Bahan). Isi Jumlah (qty) dan Harga Satuan. Sistem otomatis menghitung Subtotal = Qty × Harga. Contoh: Bayam 5kg × Rp 8.000 = Rp 40.000. Wortel 3kg × Rp 12.000 = Rp 36.000. Total dari semua baris harus mendekati Total Struk.",
          },
          {
            title: "Foto Struk — SYARAT WAJIB",
            content: "Tanpa foto struk, pembelian TIDAK BISA disimpan. Format: JPG atau PNG. Maksimal ukuran: 5MB. Tips foto yang baik: (1) Pastikan struk rata dan tidak terlipat. (2) Gunakan pencahayaan cukup — jangan gelap. (3) Pastikan semua tulisan terbaca: nama toko, tanggal, item, total. (4) Foto akan mendapat watermark otomatis: nama SPPG + tanggal/waktu + role Anda. Jika foto buram, akuntan akan MENOLAK dan Anda harus mengulang.",
          },
          {
            title: "Apa Terjadi Setelah Disimpan?",
            content: "Status awal: Draft (belum terkirim). Setelah Anda klik 'Simpan', status berubah ke Pending. Akuntan akan melihat pembelian Anda di halaman 'Belanja & Struk' mereka. Akuntan bisa: (1) Setujui — jika struk cocok. Status berubah ke Verified. (2) Tolak — jika ada masalah. Status berubah ke Tolak. Anda akan melihat catatan penolakan dan bisa memperbaiki. Jika ditolak: perbaiki data/foto → klik 'Update' → status kembali ke Pending.",
          },
        ],
        workflow: [
          "Buka menu Belanja & Struk dari sidebar.",
          "Klik 'Catat Belanja'.",
          "Pilih kategori: STOCK (bahan makanan) atau OPERASIONAL (biaya operasional).",
          "Isi Deskripsi: tulis jelas apa yang dibeli dan di mana.",
          "Isi Jumlah Manual: total uang yang Anda bayarkan (Rp).",
          "Isi Total Struk: jumlah tertulis di struk foto (Rp).",
          "Isi Supplier (opsional): nama toko/pemasok.",
          "Isi Transport/BBM (opsional): biaya ongkir jika ada.",
          "Jika STOCK: Klik '+ Baris' → pilih bahan → isi Qty & Harga Satuan → ulangi untuk semua bahan.",
          "Upload Foto Struk (WAJIB): klik area upload → pilih foto dari galeri atau ambil foto langsung.",
          "Klik 'Simpan'. Status: Pending. Tunggu verifikasi akuntan.",
        ],
      },
      {
        icon: MapPin,
        label: "Tujuan Antar",
        link: "/destinations",
        desc: "Kelola data tujuan pengiriman: sekolah, posyandu, panti asuhan, dll. Data ini digunakan saat membuat Rencana Antar.",
        details: [
          {
            title: "Kapan Menambah Tujuan Baru?",
            content: "Tambahkan tujuan baru saat ada lokasi pengiriman yang belum terdaftar. Contoh: sekolah baru yang bergabung program MBG, posyandu baru, atau panti asuhan. Sebelum menambah, cek dulu apakah tujuan sudah ada di daftar.",
          },
          {
            title: "Cara Mengisi Form Tujuan",
            content: "Nama (wajib): nama lengkap tujuan. Contoh: 'SDN 01 Pagi Jakarta'. Alamat (wajib): alamat lengkap dengan RT/RW dan kelurahan. Contoh: 'Jl. Merdeka No. 10, RT 01/RW 02, Kel. Menteng'. Kontak Person (wajib): nama PIC yang menerima pengiriman. Contoh: 'Pak Budi (Wali Kelas)'. Telepon (wajib): nomor HP yang bisa dihubungi. Contoh: '0812-xxxx-xxxx'. Catatan (opsional): informasi tambahan. Contoh: 'Serahkan ke pos satpam, minta tanda terima'.",
          },
          {
            title: "Mengaktifkan & Menonaktifkan",
            content: "Setiap tujuan punya toggle 'Aktif'. Hanya tujuan AKTIF yang bisa dipilih saat membuat Rencana Antar. Nonaktifkan tujuan yang: sudah tidak beroperasi, pindah lokasi, atau programnya selesai. Jangan hapus tujuan — cukup nonaktifkan, agar data historis tetap tersimpan.",
          },
        ],
        workflow: [
          "Buka menu Tujuan Antar dari sidebar.",
          "Klik '+ Tambah Tujuan'.",
          "Isi Nama tujuan (contoh: 'SDN 01 Pagi').",
          "Isi Alamat lengkap.",
          "Isi Kontak Person (nama PIC di tujuan).",
          "Isi nomor Telepon.",
          "Isi Catatan jika ada informasi khusus.",
          "Klik 'Simpan'. Tujuan baru langsung aktif.",
          "Untuk edit: klik ikon pensil → ubah data → 'Simpan'.",
          "Untuk nonaktifkan: klik toggle 'Aktif' di baris tujuan.",
        ],
      },
      {
        icon: Truck,
        label: "Rencana Antar",
        link: "/deliveries",
        desc: "Buat rencana pengiriman harian: tentukan tanggal, pilih driver, pilih tujuan, dan alokasikan porsi per kategori per tujuan.",
        details: [
          {
            title: "Kapan Membuat Rencana Antar?",
            content: "Buat rencana antar SETIAP HARI sebelum jam distribusi. Rencana harus dibuat SEBELUM driver berangkat. Idealnya dibuat pada hari sebelumnya atau pagi hari. Rencana yang sudah dibuat akan muncul di halaman Tracking Driver untuk driver yang ditugaskan.",
          },
          {
            title: "Cara Mengisi Form Rencana",
            content: "Tanggal Antar (wajib): pilih tanggal pengiriman. Format: YYYY-MM-DD. Driver (wajib): pilih dari daftar driver aktif. Hanya driver dengan role 'driver' yang muncul di dropdown. Catatan (opsional): keterangan tambahan. Contoh: 'Pengiriman pagi, warm delivery'.",
          },
          {
            title: "Menentukan Tujuan & Alokasi Porsi",
            content: "Centang tujuan yang akan dikirim hari ini. Setelah dicentang, 4 field porsi muncul untuk tujuan tersebut: (1) Balita — porsi untuk anak balita (usia < 5 tahun). (2) Porsi Kecil — porsi standar kelompok 1 (PAUD/TK/SD 1-3). (3) Porsi Besar — porsi standar kelompok 2 (SD 4+/SMP/SMA/Bumil/Busui). (4) Bumil & Busui — porsi khusus ibu hamil/menyusui. Isi jumlah porsi per kategori per tujuan. Contoh: SDN 01: Balita = 30, Porsi Kecil = 50, Porsi Besar = 40, Bumil = 0.",
          },
          {
            title: "Mengedit Rencana yang Sudah Dibuat",
            content: "Gunakan dropdown 'Driver' pada baris rencana untuk mengganti driver. Klik ikon expand (▶) untuk melihat detail tujuan dan porsi. Untuk mengubah porsi: expand rencana → klik edit pada tujuan yang sesuai.",
          },
        ],
        workflow: [
          "Buka menu Rencana Antar dari sidebar.",
          "Klik 'Buat Rencana'.",
          "Pilih Tanggal Antar (tanggal pengiriman).",
          "Pilih Driver dari dropdown.",
          "Isi Catatan (opsional).",
          "Centang tujuan yang akan dikirim hari ini.",
          "Untuk setiap tujuan: isi jumlah porsi per kategori (Balita, Porsi Kecil, Porsi Besar, Bumil & Busui).",
          "Ulangi untuk semua tujuan yang akan dikirim.",
          "Klik 'Simpan Rencana'.",
          "Rencana akan langsung muncul di halaman Tracking Driver untuk driver yang ditugaskan.",
        ],
      },
      {
        icon: Navigation,
        label: "Tracking Driver",
        link: "/delivery-tracking",
        desc: "Pantau status pengiriman real-time: tujuan mana yang sudah diantar, sedang dalam perjalanan, atau belum.",
        details: [
          {
            title: "Cara Membaca Halaman Tracking",
            content: "Setiap driver memiliki kartu yang menampilkan: nama driver, tanggal, jumlah tujuan selesai vs total. Di dalam kartu, setiap tujuan menampilkan: nama tujuan, porsi per kategori, status (Belum/Sedang/Selesai), dan waktu terakhir update. Progress bar menunjukkan persentase pengiriman selesai.",
          },
          {
            title: "Memantau Driver",
            content: "Sebagai Asisten Lapangan, Anda bisa melihat SEMUA driver (bukan hanya satu). Gunakan halaman ini untuk: memastikan semua pengiriman selesai tepat waktu, mengidentifikasi driver yang terlambat, membantu koordinasi jika ada kendala di lapangan.",
          },
          {
            title: "Jika Ada Masalah",
            content: "Jika driver melaporkan kendala (macet, tujuan tutup, bahan kurang): hubungi driver langsung via telepon. Bantu koordinasi: alihkan ke tujuan lain jika memungkinkan. Catat kendala di catatan pengiriman untuk laporan.",
          },
        ],
        workflow: [
          "Buka menu Tracking Driver dari sidebar.",
          "Lihat kartu setiap driver — periksa progress bar pengiriman.",
          "Klik expand (▶) untuk melihat detail setiap tujuan.",
          "Periksa waktu update terakhir — jika terlalu lama, hubungi driver.",
          "Pastikan semua tujuan statusnya 'Selesai Diantar' di akhir hari.",
        ],
      },
      {
        icon: Package,
        label: "Stok & Opname",
        link: "/inventory",
        desc: "Lihat stok FEFO, lakukan opname fisik, catat pengambilan bahan untuk masak, dan tambah lot baru dari pembelian.",
        details: [
          {
            title: "Memahami Tampilan Stok",
            content: "Stok ditampilkan dalam 3 zona: DRY (kering — beras, tepung, rempah kering), WET (basah — sayur, buah segar), FREEZER (beku — daging, ikan beku). Setiap lot menampilkan: nama bahan, qty aktual (stok fisik), qty sistem (stok di sistem), tanggal kadaluarsa, dan zona. Warna merah = stok di bawah par-level (menipis). FEFO = First Expired First Out, bahan yang kadaluarsa duluan dipakai duluan.",
          },
          {
            title: "Opname Fisik — Kapan & Cara",
            content: "Kapan: minimal sekali sehari, idealnya setiap pagi sebelum mulai masak. Cara: klik 'Opname' pada lot yang akan diopname. Isi Qty Aktual (hitungan fisik Anda). Jika berbeda dari Qty Sistem, pilih alasan selisih. Klik 'Catat Opname'. Sistem akan menghitung selisih dan mencatat di audit trail. Alasan selisih: RUSAK (bahan rusak), KADALUARSA (bahan expired), HILANG (tidak ditemukan), NORMAL (penyesuaian rutin).",
          },
          {
            title: "Mencatat Pengambilan Bahan (Stok Taken)",
            content: "Saat kitchen mengambil bahan untuk masak, Anda mencatat: pilih lot yang diambil, masukkan jumlah yang diambil, pilih alasan (COOKING — untuk masak, PREPARATION — untuk persiapan). Stok akan berkurang otomatis di sistem. Ini penting agar stok sistem selalu cocok dengan stok aktual.",
          },
          {
            title: "Menambah Lot Baru (setelah Pembelian)",
            content: "Setelah pembelian diverifikasi oleh akuntan, tambahkan lot baru: klik 'Tambah Lot'. Pilih bahan dari dropdown. Masukkan Qty (jumlah yang dibeli). Isi Tanggal Kadaluarsa (wajib — penting untuk FEFO). Pilih Zona penyimpanan. Klik 'Simpan'. Lot baru akan muncul di daftar stok.",
          },
        ],
        workflow: [
          "Buka menu Stok & Opname dari sidebar.",
          "Periksa stok — zona mana yang menipis (warna merah).",
          "Lakukan opname fisik: klik 'Opname' → isi qty aktual → pilih alasan → simpan.",
          "Catat pengambilan bahan: pilih lot → masukkan jumlah yang diambil → pilih alasan → simpan.",
          "Tambah lot baru dari pembelian: klik 'Tambah Lot' → pilih bahan → isi qty & tanggal kadaluarsa → pilih zona → simpan.",
          "Laporkan stok menipis kepada Kepala SPPG SEBELUM stok habis.",
        ],
      },
    ],
    tips: [
      "WAJIB upload foto struk untuk SETIAP pembelian — tanpa foto, akuntan tidak bisa memverifikasi dan pembelian akan ditolak.",
      "Catat pembelian SEGERA setelah transaksi — jangan menunda. Foto struk akan lebih jelas jika baru diambil.",
      "Pastikan jumlah manual = total struk. Jika berbeda, beri keterangan yang jelas di catatan (contoh: 'Selisih Rp 2.000 karena pembulatan').",
      "Buat rencana antar SETIAP HARI sebelum jam distribusi. Jangan menunggu driver datang baru membuat rencana.",
      "Laporkan stok menipis kepada Kepala SPPG SEBELUM stok habis — minimal saat stok tinggal 2 hari.",
      "Lakukan opname minimal sekali sehari — jangan hanya mengandalkan stok sistem.",
      "Periksa kualitas bahan saat opname — laporkan bahan yang rusak, busuk, atau kadaluarsa.",
      "Saat foto struk: pastikan rata, pencahayaan cukup, semua tulisan terbaca. Foto buram = penolakan.",
      "Gunakan filter tanggal di halaman Belanja & Struk untuk melihat riwayat pembelian periode tertentu.",
      "Pantau Tracking Driver secara berkala — pastikan semua pengiriman selesai di akhir hari.",
    ],
  },
  nutritionist: {
    title: "Panduan Ahli Gizi",
    color: "#6D28D9",
    overview: "Ahli Gizi adalah penjamin mutu gizi menu MBG. Anda memastikan SETIAP menu memenuhi standar Permenkes 28/2019 dan Juknis BGN SK 401.1/2025. Tugas utama: (1) review profil gizi setiap resep, (2) hitung pemenuhan AKG menggunakan Kalkulator Gizi, (3) review dan setujui/tolak menu mingguan dari Head Chef, (4) pastikan tidak ada alergen tersembunyi. Tanda tangan digital Anda adalah otorisasi terakhir sebelum menu disajikan ke penerima manfaat.",
    menus: [
      { label: "Dasbor", desc: "Ringkasan data gizi SPPG: rata-rata pemenuhan AKG, menu yang menunggu persetujuan, resep bermasalah." },
      { label: "Resep & Gizi", desc: "Lihat semua resep beserta profil gizi per porsi. Edit data gizi jika perlu. Filter berdasarkan kategori." },
      { label: "Menu & Cetak", desc: "Pantau menu mingguan yang diajukan Head Chef. Lihat alokasi resep per hari per kategori." },
      { label: "Kalkulator Gizi", desc: "Hitung pemenuhan AKG per resep untuk setiap kelompok sasaran (Balita, SD, SMA, Bumil, dll)." },
      { label: "Persetujuan Menu", desc: "Review menu diajukan. Setujui jika memenuhi standar gizi. Tolak dengan catatan perbaikan jika belum." },
    ],
    sections: [
      {
        icon: Calculator,
        label: "Kalkulator Gizi",
        link: "/nutrition-calc",
        desc: "Alat utama Anda untuk menghitung dan memverifikasi pemenuhan Angka Kecukupan Gizi (AKG) per resep per kelompok sasaran.",
        details: [
          {
            title: "Memahami Tampilan",
            content: "Panel kiri: daftar semua resep. Klik untuk memilih. Panel kanan atas: profil gizi per porsi resep (Kalori, Protein, Karbo, Lemak, Serat, Natrium). Panel kanan tengah: grafik bar horizontal pemenuhan AKG (5 nutrien). Panel kanan bawah: verdict — hijau (memenuhi) atau merah (perlu perbaikan).",
          },
          {
            title: "Kelompok Sasaran & Standar AKG",
            content: "Balita (1-3 th): Kalori 1.050 kkal, Protein 20g, Karbo 130g, Lemak 40g. PAUD/TK (4-6 th): Kalori 1.225 kkal, Protein 25g. SD 1-3 (7-9 th): Kalori 1.600 kkal, Protein 35g. SD 4-6 (10-12 th): Kalori 1.900 kkal, Protein 45g. SMP (13-15 th): Kalori 2.100 kkal, Protein 50g. SMA/SLB (16-18 th): Kalori 2.300 kkal, Protein 55g. Ibu Hamil: Kalori 2.250 kkal, Protein 60g. Ibu Menyusui: Kalori 2.500 kkal, Protein 65g. Angka ini berdasarkan PERMENKES 28/2019.",
          },
          {
            title: "Cara Membaca Grafik AKG",
            content: "5 bar progress menunjukkan persentase pemenuhan per nutrien: Hijau ≥ 80% = Memenuhi Standar (ideal). Kuning 50-79% = Kurang (perlu penyesuaian). Merah < 50% = Sangat Kurang (perlu perbaikan signifikan). Contoh: Jika bar Protein kuning 65%, berarti resep ini hanya memenuhi 65% kebutuhan protein harian. Tambahkan sumber protein: ikan, telur, ayam, tahu, tempe.",
          },
          {
            title: "Verdict — Apa Artinya",
            content: "Hijau ✓ 'Memenuhi Standar AKG' = rata-rata pemenuhan semua nutrien ≥ 70%. Menu ini LAYAK disajikan. Merah ✗ 'Perlu Perbaikan Gizi' = rata-rata pemenuhan < 70%. Menu ini TIDAK layak sebelum diperbaiki. Di bawah verdict ada 'Suggestion' — rekomendasi spesifik perbaikan gizi (contoh: 'Tambah 30g protein dari ikan tongkol').",
          },
          {
            title: "Skenario Penggunaan",
            content: "Skenario 1 — Resep baru: Buka Kalkulator Gizi → pilih resep → pilih kelompok sasaran → periksa verdict. Jika hijau, resep OK. Jika merah, catat nutrien yang kurang → sarankan perubahan bahan. Skenario 2 — Sebelum approve menu mingguan: Buka Kalkulator Gizi → pilih SETIAP resep dalam menu → pastikan semua resep hijau untuk kelompok sasaran. Skenario 3 — Review ulang setelah Head Chef perbaiki: Ulangi langkah 1-2 untuk resep yang diperbaiki.",
          },
        ],
        workflow: [
          "Buka menu Kalkulator Gizi dari sidebar.",
          "Di panel kiri, pilih resep yang akan diverifikasi.",
          "Panel kanan otomatis menampilkan profil gizi per porsi.",
          "Pilih kelompok sasaran dari dropdown (contoh: Balita, SD 1-3).",
          "Periksa 5 bar grafik AKG: hijau ≥ 80% = bagus, kuning 50-79% = kurang, merah < 50% = sangat kurang.",
          "Periksa verdict: hijau ✓ = memenuhi standar, merah ✗ = perlu perbaikan.",
          "Jika merah: catat nutrien yang kurang → lihat suggestion → saran perubahan ke Head Chef.",
          "Ulangi untuk SEMUA resep dalam menu yang akan disetujui.",
        ],
      },
      {
        icon: ChefHat,
        label: "Review Resep",
        link: "/recipes",
        desc: "Periksa profil gizi setiap resep, pastikan data gizi akurat, dan identifikasi alergen.",
        details: [
          {
            title: "Yang Harus Diperiksa di Setiap Resep",
            content: "1. Profil Gizi: Kalori, Protein, Karbo, Lemak, Serat, Natrium per porsi. Pastikan angka masuk akal (contoh: nasi putih 100g ≈ 175 kkal). 2. Bahan: pastikan semua bahan terdaftar di Master Bahan dan memiliki data gizi per 100g. 3. Alergen: pastikan tercantum dengan benar (ikan, udang, telur, susu, kacang, gluten, dll). 4. Porsi: pastikan jumlah porsi sesuai dengan target (contoh: 1 resep untuk 100 porsi).",
          },
          {
            title: "Cara Mengedit Profil Gizi",
            content: "Klik 'Edit' pada kartu resep. Ubah nilai gizi manual jika diperlukan (contoh: data dari lab lebih akurat). Klik 'Simpan'. Perubahan akan langsung terlihat di Kalkulator Gizi. Catatan: gizi dihitung otomatis dari bahan (per 100g). Edit manual hanya jika ada data lab yang lebih akurat.",
          },
          {
            title: "Mengidentifikasi Masalah Gizi",
            content: "Protein rendah (< 10g per porsi): tambahkan sumber protein hewani (ikan, telur, ayam) atau nabati (tahu, tempe). Kalori rendah (< 300 kkal per porsi): tambahkan sumber karbohidrat (nasi, kentang, mie). Lemak berlebih (> 30g per porsi): kurangi minyak goreng, gunakan metode kukus/rebus. Natrium tinggi (> 800mg per porsi): kurangi garam dan kecap asin. Serat rendah (< 3g per porsi): tambahkan sayuran hijau.",
          },
        ],
        workflow: [
          "Buka menu Resep & Gizi dari sidebar.",
          "Pilih resep dari daftar (filter berdasarkan kategori jika perlu).",
          "Klik 'Edit' pada resep yang akan direview.",
          "Periksa: apakah semua bahan terdaftar? Apakah data gizi masuk akal?",
          "Periksa alergen: apakah sudah tercantum semua? (ikan, udang, telur, susu, kacang, gluten)",
          "Jika ada perubahan gizi: edit nilai → klik 'Simpan'.",
          "Buka Kalkulator Gizi → pilih resep ini → validasi ulang pemenuhan AKG.",
          "Ulangi untuk SEMUA resep yang akan dimasukkan ke menu mingguan.",
        ],
      },
      {
        icon: BadgeCheck,
        label: "Persetujuan Menu Mingguan",
        link: "/approval",
        desc: "Review menu mingguan yang diajukan Head Chef. Setujui jika memenuhi standar gizi, tolak dengan catatan perbaikan jika belum.",
        details: [
          {
            title: "Apa yang Harus Diperiksa Saat Review Menu",
            content: "1. Ketersediaan Resep: pastikan semua resep dalam menu sudah ada di sistem. 2. Variasi Menu: pastikan menu BERBEDA setiap hari (jangan nasi+ayam 5 hari berturut-turut). 3. Gizi Harian: pastikan total gizi per hari (semua resep dalam sehari) memenuhi ≥ 70% AKG untuk kelompok sasaran. 4. Alergen: pastikan tidak ada alergen tersembunyi yang tidak tercantum. 5. Keseimbangan: pastikan ada sumber karbohidrat, protein, sayur, dan buah setiap hari.",
          },
          {
            title: "Proses Persetujuan",
            content: "Klik 'Review' pada menu yang diajukan (status DIAJUKAN). Tinjau: daftar resep per hari, profil gizi total per hari, keterangan alergen. Isi Catatan (opsional): saran perbaikan, catatan khusus. Klik 'Setujui' — menu langsung status APPROVED, bisa dicetak. Klik 'Tolak' — menu kembali ke DRAFT, Head Chef harus perbaiki dan ajukan ulang. Tanda tangan digital otomatis terisi: nama Anda + timestamp saat persetujuan.",
          },
          {
            title: "Standar yang HARUS Dipenuhi",
            content: "Minimal 70% AKG untuk semua kelompok sasaran. Variasi menu minimal 3 jenis lauk berbeda per minggu. Setiap hari harus ada: sumber karbohidrat + protein + sayuran. Tidak ada alergen yang tidak terdaftar. Menu tidak boleh sama 2 hari berturut-turut.",
          },
          {
            title: "Jika Ditolak — Apa yang Terjadi",
            content: "Menu kembali ke status DRAFT. Head Chef akan melihat catatan penolakan Anda. Head Chef memperbaiki resep/menu → mengajukan ulang (status DIAJUKAN). Anda review ulang. Pastikan perbaikan yang diminta sudah dipenuhi sebelum menyetujui.",
          },
        ],
        workflow: [
          "Buka menu Persetujuan Menu dari sidebar.",
          "Lihat daftar menu berstatus 'DIAJUKAN' (border kuning).",
          "Klik 'Review' pada menu yang akan direview.",
          "Tinjau: resep per hari, total gizi per hari, keterangan alergen.",
          "Buka Kalkulator Gizi → validasi SETIAP resep untuk kelompok sasaran.",
          "Periksa variasi menu — pastikan berbeda setiap hari.",
          "Isi Catatan: saran perbaikan jika ada (contoh: 'Tambah sayuran di hari Rabu').",
          "Klik 'Setujui' jika semua standar terpenuhi. Tanda tangan digital otomatis terisi.",
          "Klik 'Tolak' jika belum memenuhi standar. Isi catatan penolakan yang SPESIFIK.",
        ],
      },
    ],
    tips: [
      "Gunakan Kalkulator Gizi untuk SETIAP resep baru — jangan menyetujui menu tanpa validasi gizi terlebih dahulu.",
      "Pastikan rata-rata pemenuhan AKG ≥ 70% untuk SEMUA resep dalam menu — bukan hanya rata-rata keseluruhan.",
      "Perhatikan alergen — pastikan tercantum dengan benar di SETIAP resep. Alergen yang terlewat = risiko kesehatan.",
      "Ketika menolak, berikan saran yang SPESIFIK: 'Tambah 30g protein dari ikan tongkol' BUKAN 'perlu diperbaiki'.",
      "Periksa variansi menu — jangan setujui menu dengan lauk yang sama lebih dari 2 hari berturut-turut.",
      "Dokumentasikan semua persetujuan/penolakan untuk keperluan audit BGN dan BPK.",
      "Jika ragu, konsultasikan dengan Kepala SPPG sebelum menyetujui menu yang bermasalah.",
      "Gunakan filter di halaman Resep untuk melihat resep berdasarkan kategori (Balita, Porsi Kecil, Porsi Besar).",
      "Periksa data gizi per 100g di Master Bahan — jika tidak akurat, data gizi resep juga akan salah.",
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
              {Array.isArray(d.content) ? (
                <div className="space-y-2 text-sm text-[#5C5C5C] leading-relaxed">
                  {d.content.map((item, j) => (
                    <div key={j} className="bg-[#F9F6F0] rounded-lg p-3 border border-[#E8E4DA]">
                      {item.code && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${color}1A`, color }}>{item.code}</span>
                          {item.name && <span className="font-semibold">{item.name}</span>}
                        </div>
                      )}
                      {item.use && <div className="text-sm">{item.use}</div>}
                      {item.type && <div className="text-xs mt-1 font-medium" style={{ color }}>{item.type}</div>}
                      {!item.code && !item.name && !item.type && <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#5C5C5C] leading-relaxed">{d.content}</p>
              )}
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
