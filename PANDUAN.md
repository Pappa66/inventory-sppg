# Panduan Penggunaan Aplikasi SPPG · MBG

## Daftar Isi
1. [Akses & Login](#1-akses--login)
2. [7 Peran Pengguna](#2-7-peran-pengguna)
3. [Halaman & Fungsinya](#3-halaman--fungsinya)
4. [Alur Kerja Utama](#4-alur-kerja-utama)
5. [Fitur Ekspor](#5-fitur-ekspor)
6. [Tips Demo](#6-tips-demo)

---

## 1. Akses & Login

**URL:** https://inventory-sppg.vercel.app

**Cara Login:**
1. Buka URL di browser (HP/komputer)
2. Masukkan email & password
3. Klik "Masuk"

Semua akun password: **admin123**

---

## 2. 7 Peran Pengguna

| Email | Role | Wewenang Utama |
|-------|------|----------------|
| admin@sppg.id | Admin | Semua akses, kelola pengguna, pengaturan |
| akuntan@sppg.id | Akuntan | Validasi belanja, laporan keuangan, audit |
| kepala@sppg.id | Kepala Dapur | Pantau stok, menu, resep, laporan |
| chef@sppg.id | Chef Utama | Kelola menu, resep, bahan baku |
| asisten@sppg.id | Asisten Lapangan | Catat pembelian, upload struk |
| staf@sppg.id | Staf Gudang | Kelola stok, opname fisik |
| ahligizi@sppg.id | Ahli Gizi | Setujui menu, resep & gizi, audit gizi |

**Role Switcher (khusus Admin):** Klik peran di pojok kanan atas untuk melihat halaman dari perspektif role lain.

---

## 3. Panduan Per Role

### 👤 Admin — `admin@sppg.id` / `admin123`
Akses penuh ke semua fitur. Bisa menggunakan Role Switcher di pojok kanan atas untuk melihat tampilan role lain.

**Dasbor** — Menampilkan ringkasan seluruh data: total stok bahan, total pengeluaran (STOK + OPEX + Transport), jumlah stok yang menipis, jumlah transaksi, dan yang sudah/tervalidasi. Dari sini Admin bisa langsung klik tombol cepat ke halaman Laporan, Belanja, Menu, atau Audit.

**Pengguna** — Admin dapat menambahkan pengguna baru (nama, email, role, password), melihat daftar semua pengguna, serta mengaktifkan atau menonaktifkan akun. Akun yang dinonaktifkan tidak bisa login. Akun `admin@sppg.id` tidak bisa dinonaktifkan.

**Master Bahan** — Mengelola data bahan baku dapur: menambah bahan baru, mengedit nama, kategori (Karbo/Protein/Sayur/Bumbu/dll), satuan (kg/liter/papan), harga per unit, par-level (batas stok minimal), zona penyimpanan (DRY/WET/FREEZER), dan alergen (telur, susu, kedelai, dll). Setiap perubahan tersimpan sebagai riwayat versi — klik tombol "Riwayat" untuk melihat detail perubahan lama → baru.

**Stok (FEFO)** — Mengelola stok bahan berdasarkan sistem FEFO (First Expired First Out). Admin bisa menambah lot stok baru (pilih bahan, masukkan jumlah & tanggal kadaluarsa), melihat daftar stok yang diurutkan dari kadaluarsa terdekat, menyaring berdasarkan zona (DRY/WET/FREEZER), dan melakukan opname (hitung fisik) — mencatat jumlah aktual, suhu (khusus WET 0–4°C, FREEZER ≤ -18°C), dan kelembapan (khusus DRY).

**Belanja & Struk** — Admin dapat mencatat pembelian baru (pilih kategori STOCK untuk bahan baku atau OPERATIONAL untuk gas/transport, upload foto struk, input rincian item & harga, biaya transport). Juga bisa melakukan validasi akuntan: melihat selisih antara jumlah manual dengan total struk, lalu menyetujui atau menolak.

**Menu 5-Hari** — Merencanakan menu makan untuk Senin–Jumat. Pilih minggu melalui kalender, lalu untuk setiap hari pilih resep-resep yang tersedia dan atur jumlah porsi. Admin juga bisa mengajukan menu untuk direview oleh Ahli Gizi, atau langsung menyetujuinya.

**Resep & Gizi** — Membuat resep standar: pilih bahan-bahan dari Master Bahan, tentukan jumlah per porsi, tambahkan instruksi masak, dan lengkapi profil gizi (kalori, protein, karbo, lemak, sodium). Tandai alergen yang terkandung dalam resep.

**Persetujuan Menu** — Melihat daftar menu yang menunggu review. Admin bisa langsung menyetujui atau menolak menu dengan tanda tangan digital dan catatan.

**TvA Selisih** — Melihat analisis perbandingan antara pemakaian bahan secara teoritis (dihitung dari resep × jumlah porsi) dengan pemakaian aktual (dari hasil opname). Ditampilkan dalam grafik batang dan tabel dengan warna: hijau (selisih < 5%), kuning (5–15%), merah (> 15%).

**Laporan** — Menampilkan ringkasan keuangan (total STOK, OPEX, Transport, Grand Total) dan stok per zona. Dari sini Admin bisa mengekspor: PDF Laporan Keuangan, PDF Stok per Zona, Excel multi-sheet, bagikan ke WhatsApp, atau cetak Paket BPK (7 halaman siap audit).

**Audit Trail** — Log perubahan seluruh aktivitas sistem secara real-time. Setiap entri menampilkan timestamp, aktor, aksi, entitas, dan detail perubahan (old → new). Bisa difilter dengan teks.

**Pengaturan** — Mengupload logo SPPG yang akan muncul di semua halaman PDF (Laporan Keuangan, Stok per Zona, Paket BPK).

---

### 💼 Akuntan — `akuntan@sppg.id` / `admin123`
Fokus pada validasi keuangan dan pembuatan laporan.

**Dasbor** — Melihat total biaya STOK, OPEX, dan Grand Total, jumlah transaksi yang sudah tervalidasi dan yang belum, serta shortcut ke halaman Belanja dan Laporan.

**Belanja & Struk** — Menampilkan semua transaksi belanja. Akuntan bisa membuka detail transaksi, melihat foto struk yang diupload Asisten, membandingkan jumlah manual dengan total struk (jika ada selisih akan muncul peringatan), kemudian memilih **setujui** atau **tolak** disertai catatan. Transaksi yang sudah tervalidasi masuk ke perhitungan laporan keuangan.

**TvA Selisih** — Melihat analisis selisih pemakaian bahan teoritis vs aktual, untuk mengecek efisiensi penggunaan bahan baku.

**Laporan** — Mengekspor laporan keuangan (PDF/Excel/Paket BPK) yang siap diberikan kepada Kepala Dapur atau BPK.

**Audit Trail** — Memantau semua perubahan yang terjadi di sistem, termasuk validasi yang sudah dilakukan.

---

### 👨‍🍳 Kepala Dapur — `kepala@sppg.id` / `admin123`
Mengawasi seluruh operasional dapur.

**Dasbor** — Melihat jumlah bahan aktif, stok yang menipis, menu aktif, jumlah resep, dan total pengeluaran. Shortcut ke Master Bahan, Stok, Belanja, Menu, Laporan.

**Master Bahan** — Melihat dan mengedit data bahan baku, termasuk harga, par-level, dan zona penyimpanan.

**Stok (FEFO)** — Memantau stok semua zona (DRY/WET/FREEZER). Melihat lot mana yang akan segera kadaluarsa (FEFO), stok yang hampir habis, dan melakukan opname jika diperlukan.

**Belanja & Struk** — Melihat riwayat belanja dan memantau pengeluaran dapur.

**Menu 5-Hari** — Bersama Chef, merencanakan menu mingguan. Kepala Dapur bisa memilih resep dan menentukan porsi untuk setiap hari.

**Resep & Gizi** — Melihat dan membuat resep standar untuk digunakan di menu.

**Persetujuan Menu** — Melihat status menu yang diajukan Chef dan sudah direview Ahli Gizi.

**TvA Selisih** — Menganalisis efisiensi pemakaian bahan dapur, melihat bahan mana yang pemakaiannya boros atau hemat.

**Laporan** — Mengekspor laporan untuk evaluasi dapur.

**Audit Trail** — Memantau perubahan yang terjadi di sistem.

---

### 🧑‍🍳 Chef Utama — `chef@sppg.id` / `admin123`
Bertanggung jawab membuat resep dan merencanakan menu mingguan.

**Dasbor** — Melihat stok yang menipis (sehingga tahu bahan apa yang perlu segera dipesan), jumlah bahan aktif, menu aktif minggu ini, dan jumlah resep yang tersedia. Shortcut ke Menu, Resep, Stok.

**Master Bahan** — Melihat daftar bahan baku yang tersedia, kategorinya, dan harga. Berguna saat menyusun resep agar tahu bahan apa saja yang bisa digunakan.

**Stok (FEFO)** — Mengecek stok bahan yang tersedia sebelum menyusun menu, memastikan bahan yang mendekati kadaluarsa segera digunakan (FEFO).

**Menu 5-Hari** — **Ini tugas utama Chef.** Membuka kalender mingguan, lalu untuk setiap hari (Senin–Jumat) memilih resep mana yang akan disajikan dari daftar resep yang sudah dibuat, serta menentukan jumlah porsi. Setelah selesai, Chef mengklik **"Ajukan Review"** untuk mengirim menu ke Ahli Gizi agar diperiksa nilai gizi dan disetujui. Jika ditolak, Chef bisa merevisi dan mengajukan ulang. Chef juga bisa membagikan menu ke WhatsApp.

**Resep & Gizi** — **Ini tugas utama Chef juga.** Membuat resep standar: memasukkan nama resep, memilih bahan-bahan dari Master Bahan (lengkap dengan jumlah per porsi), menambahkan instruksi memasak, dan melengkapi profil gizi (kalori, protein, karbo, lemak, sodium) serta menandai alergen. Resep yang sudah dibuat akan tersedia saat menyusun Menu 5-Hari.

**TvA Selisih** — Melihat efisiensi pemakaian bahan: apakah pemakaian aktual sesuai dengan teoritis berdasar resep yang dibuat.

**Laporan** — Melihat laporan menu dan stok.

---

### 🏃 Asisten Lapangan — `asisten@sppg.id` / `admin123`
Fokus pada pencatatan pembelian harian.

**Dasbor** — Melihat total belanja minggu ini, jumlah transaksi yang sudah dicatat, dan berapa banyak yang belum divalidasi oleh Akuntan. Shortcut ke halaman Belanja.

**Belanja & Struk** — **Ini tugas utama Asisten.** Mencatat setiap pembelian:
1. Klik **"Catat Belanja"**
2. Pilih kategori: **STOCK** (untuk bahan baku seperti beras, telur, sayur) atau **OPERATIONAL** (untuk kebutuhan operasional seperti gas LPG, transport, kebersihan)
3. **Upload foto struk** — wajib! Bisa ambil gambar dari kamera HP atau pilih dari galeri. Foto akan otomatis diberi watermark.
4. Masukkan deskripsi pembelian
5. Untuk kategori STOCK: tambahkan rincian item (pilih bahan, jumlah, harga satuan) — bisa tambah beberapa item sekaligus
6. Masukkan total amount, total struk (jika berbeda akan ada peringatan selisih), biaya transport jika ada, dan nama supplier
7. Simpan. Transaksi akan muncul di daftar dan menunggu validasi Akuntan

---

### 📦 Staf Gudang — `staf@sppg.id` / `admin123`
Bertanggung jawab atas manajemen stok fisik dapur.

**Dasbor** — Melihat stok yang menipis (perlu segera dipesan), total bahan yang ada, dan kapan terakhir kali opname dilakukan. Shortcut ke halaman Stok.

**Stok (FEFO)** — **Ini tugas utama Staf Gudang.** Ada dua aktivitas utama:
1. **Tambah Lot Stok** — Saat menerima kiriman bahan, Staf menambahkan lot baru: pilih bahan, masukkan jumlah, tanggal kadaluarsa, dan zona penyimpanan. Stok akan otomatis diurutkan berdasarkan kadaluarsa terdekat (FEFO) agar bahan yang cepat kadaluarsa segera digunakan.
2. **Opname (Hitung Fisik)** — Secara berkala, Staf melakukan penghitungan fisik stok. Klik tombol Opname, pilih zona yang akan dihitung, masukkan jumlah aktual, serta catat suhu (khusus WET target 0–4°C, FREEZER ≤ -18°C) atau kelembapan (khusus DRY). Tambahkan alasan jika ada selisih (penyusutan, rusak, penyesuaian). Data opname digunakan untuk analisis TvA.

---

### 🥗 Ahli Gizi — `ahligizi@sppg.id` / `admin123`
Fokus pada gizi, kelayakan resep, dan persetujuan menu.

**Dasbor** — Melihat status seluruh menu: berapa yang sudah disetujui, masih draft, atau menunggu review. Shortcut ke Persetujuan Menu, Resep, Laporan.

**Master Bahan** — Melihat data bahan baku terutama informasi alergen, untuk memastikan tidak ada bahan berbahaya bagi penerima manfaat.

**Menu 5-Hari** — Melihat menu mingguan yang sudah disusun Chef, termasuk resep apa saja yang dipilih dan jumlah porsi per hari.

**Resep & Gizi** — Membuat dan mengedit resep standar, dengan fokus pada **profil gizi**: memasukkan nilai kalori, protein, karbo, lemak, dan sodium untuk setiap resep, serta menandai alergen. Resep yang sudah memiliki profil gizi lengkap siap digunakan di menu.

**Persetujuan Menu** — **Ini tugas utama Ahli Gizi.** Ketika Chef mengajukan menu mingguan, notifikasi muncul di sini. Ahli Gizi membuka detail menu, melihat:
- Total nilai gizi per hari (kalori, protein, dll.)
- Alergen yang terkandung dari resep-resep yang dipilih
Kemudian memberikan **tanda tangan digital** (nama otomatis terisi "Nama + Ahli Gizi") dan memilih **Setujui** atau **Tolak**. Jika ditolak, Chef akan merevisi dan mengajukan ulang. Menu yang sudah disetujui siap diproduksi.

**Laporan** — Mengekspor laporan gizi dan menu untuk dokumentasi.

**Audit Trail** — Memantau perubahan terkait menu dan resep.

---

---

## 4. Alur Kerja Utama

### A. Alur Belanja
1. **Asisten** → Catat pembelian + upload struk
2. **Akuntan** → Validasi (setujui/tolak)
3. Data masuk laporan keuangan

### B. Alur Menu
1. **Chef/Admin** → Buat resep di Resep & Gizi
2. **Chef/Admin** → Atur menu mingguan di Menu 5-Hari
3. **Chef/Admin** → Ajukan review (tombol "Ajukan Review")
4. **Ahli Gizi/Admin** → Review & tanda tangan digital
5. Menu siap produksi

### C. Alur Stok
1. **Staf/Admin** → Tambah lot stok baru
2. **Staf/Admin** → Lakukan opname (hitung fisik berkala)
3. Sistem catat selisih teoritis vs aktual (TvA)

---

## 5. Fitur Ekspor

### PDF
- **Laporan Keuangan** — Ringkasan + tabel transaksi + logo
- **Stok per Zona** — Per-zona (DRY, WET, FREEZER)
- **Paket BPK** — 7 halaman siap audit:
  1. Cover
  2. Ringkasan Keuangan
  3. Transaksi + Foto Struk
  4. Stok per Zona
  5. Peringatan Stok Menipis
  6. Persetujuan Menu
  7. Halaman Tanda Tangan

### Excel
Multi-sheet: Keuangan, Low-Stock, Stock-by-Zone

### WhatsApp
Bagikan laporan + detail stok menipis ke grup WA

---

## 6. Tips Demo

1. **Login sebagai Admin dulu** — lihat semua role pakai Role Switcher
2. **Isi data secara berurutan:** Master Bahan → Resep → Menu → Belanja
3. **Coba alur Belanja:** Login sebagai Asisten → catat belanja → logout → login sebagai Akuntan → validasi
4. **Coba alur Menu:** Login sebagai Chef → buat menu → ajukan review → logout → login sebagai Ahli Gizi → setujui
5. **Cek Audit Trail** setelah melakukan beberapa perubahan — semua tercatat
6. **Ekspor Paket BPK** untuk lihat laporan lengkap
7. **Upload logo** di Pengaturan agar PDF terlihat lebih profesional
