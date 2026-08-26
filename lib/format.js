export const ROLE_LABELS = {
  admin_apps: "Admin Aplikasi",
  admin_sppg: "Admin SPPG",
  accountant: "Akuntan",
  kitchen_head: "Kepala SPPG",
  head_chef: "Head Chef",
  field_assistant: "Asisten Lapangan",
  nutritionist: "Ahli Gizi",
  driver: "Driver",
  persiapan: "Tenaga Persiapan",
  tenaga_masak: "Tenaga Masak",
  pemorsian: "Tenaga Pemorsian",
  kebersihan: "Petugas Kebersihan",
  pencuci: "Pencuci Ompreng",
};

export const ROLE_COLORS = {
  admin_apps: "#1E40AF",
  admin_sppg: "#2D2D2D",
  accountant: "#2C4251",
  kitchen_head: "#4A7C59",
  head_chef: "#D97706",
  field_assistant: "#C5533B",
  nutritionist: "#6D28D9",
  driver: "#0891B2",
  persiapan: "#16A34A",
  tenaga_masak: "#EA580C",
  pemorsian: "#7C3AED",
  kebersihan: "#059669",
  pencuci: "#0284C7",
};

export const ROLE_GROUPS = [
  { label: "Admin", roles: ["admin_apps", "admin_sppg"] },
  { label: "Manajemen", roles: ["kitchen_head", "accountant", "nutritionist"] },
  { label: "Dapur", roles: ["head_chef", "persiapan", "tenaga_masak", "pemorsian"] },
  { label: "Lapangan", roles: ["field_assistant", "driver"] },
  { label: "Penunjang", roles: ["kebersihan", "pencuci"] },
];

export const MENU_CATEGORIES = {
  BALITA: { label: "Balita", color: "#E11D48" },
  PORTION_SMALL: { label: "Porsi Kecil", color: "#D97706" },
  PORTION_LARGE: { label: "Porsi Besar", color: "#4A7C59" },
  BUMIL_BUSUI: { label: "Bumil/Busui", color: "#7C3AED" },
};

export const DELIVERY_STATUSES = {
  NOT_DELIVERED: { label: "Belum Diantar", color: "#C5533B" },
  IN_TRANSIT: { label: "Sedang Diantar", color: "#D97706" },
  DELIVERED: { label: "Sudah Diantar", color: "#4A7C59" },
};

export const BENEFICIARY_TYPES = [
  { key: "balita", label: "Balita", color: "#E11D48", price_group: 1 },
  { key: "paud_tk_ra", label: "PAUD/TK/RA", color: "#D97706", price_group: 1 },
  { key: "sd_1_3", label: "SD/MI 1-3", color: "#4A7C59", price_group: 1 },
  { key: "sd_4_6", label: "SD/MI 4-6", color: "#16A34A", price_group: 2 },
  { key: "smp_mts", label: "SMP/MTs", color: "#2C4251", price_group: 2 },
  { key: "sma_ma_smk", label: "SMA/MA/SMK", color: "#6D28D9", price_group: 2 },
  { key: "slb", label: "SLB", color: "#0891B2", price_group: 2 },
  { key: "santri", label: "Santri", color: "#7C3AED", price_group: 2 },
  { key: "pend_tk", label: "Pend/TK", color: "#C5533B", price_group: 2 },
  { key: "bumil", label: "Bumil", color: "#E11D48", price_group: 2 },
  { key: "busui", label: "Busui", color: "#D97706", price_group: 2 },
];

// 3 Section Anggaran sesuai Excel
export const ANGGARAN_SECTIONS = {
  BAHAN_MAKANAN: { label: "Anggaran Bahan Makanan (Bahan Baku Pangan)", code: "2100" },
  OPERASIONAL: { label: "Anggaran Operasional", code: "2200" },
  INSENTIF: { label: "Anggaran Insentif Fasilitas", code: "2300" },
};

// Harga satuan per porsi (dari Excel & Juknis)
export const HARGA_SATUAN = {
  KELOMPOK_1: 8000,  // Balita, PAUD/TK/RA, SD 1-3
  KELOMPOK_2: 10000, // SD 4-6, SMP, SMA, SLB, Santri, Pend/TK, Bumil, Busui
};

// Standar AKG (Permenkes 28/2019) untuk Kalkulator Gizi
export const AKG_STANDARDS = {
  BALITA:    { kkal: 1350, protein: 20, lemak: 45, karbo: 215, serat: 19, sodium: 1200, label: "Balita (1-<5 thn)" },
  PAUD:      { kkal: 1400, protein: 25, lemak: 50, karbo: 220, serat: 20, sodium: 1200, label: "PAUD/TK (5-<6 thn)" },
  SD_1_3:    { kkal: 1650, protein: 40, lemak: 55, karbo: 250, serat: 23, sodium: 1200, label: "SD Kelas 1-3 (6-<9 thn)" },
  SD_4_6:    { kkal: 1950, protein: 52.5, lemak: 65, karbo: 290, serat: 27.5, sodium: 1400, label: "SD Kelas 4-6 (9-<12 thn)" },
  SMP:       { kkal: 2225, protein: 67.5, lemak: 75, karbo: 325, serat: 31.5, sodium: 1500, label: "SMP (12-<15 thn)" },
  SMA:       { kkal: 2375, protein: 70, lemak: 77.5, karbo: 350, serat: 33, sodium: 1500, label: "SMA (15-<18 thn)" },
  SLB:       { kkal: 2000, protein: 55, lemak: 60, karbo: 290, serat: 27, sodium: 1500, label: "SLB" },
  TENDIK:    { kkal: 2100, protein: 60, lemak: 70, karbo: 325, serat: 30, sodium: 1500, label: "Pendidik & Tenaga Kependidikan" },
  BUMIL:     { kkal: 2460, protein: 77, lemak: 62, karbo: 385, serat: 37, sodium: 1500, label: "Ibu Hamil" },
  BUSUI:     { kkal: 2565, protein: 78, lemak: 62, karbo: 400, serat: 35, sodium: 1500, label: "Ibu Menyusui" },
};

// Level otoritas role
export const ROLE_LEVELS = {
  admin_apps: "admin",
  admin_sppg: "admin",
  accountant: "staff",
  kitchen_head: "staff",
  head_chef: "staff",
  field_assistant: "staff",
  nutritionist: "staff",
  driver: "relawan",
  persiapan: "relawan",
  tenaga_masak: "relawan",
  pemorsian: "relawan",
  kebersihan: "relawan",
  pencuci: "relawan",
};

export const STAFF_ROLES = Object.entries(ROLE_LEVELS).filter(([,v]) => v === "staff" || v === "admin").map(([k]) => k);
export const RELAWAN_ROLES = Object.entries(ROLE_LEVELS).filter(([,v]) => v === "relawan").map(([k]) => k);

// Global config keys (diatur oleh admin aplikasi)
export const GLOBAL_CONFIG_KEYS = [
  "tax_rate_percent",
  "incentive_per_portion",
  "price_group1",
  "price_group2",
  "daily_portion_capacity",
  "max_beneficiaries",
  "cooking_start_hour",
  "distribution_start_hour",
  "operational_percentage",
  "incentive_percentage",
  "bahan_baku_percentage",
];

export const AUXILIARY_BOOKS = {
  BANK: { label: "Kas di Bank", color: "#2C4251" },
  PETTY_CASH: { label: "Petty Cash", color: "#D97706" },
  BAHAN_BAKU: { label: "Bahan Baku", color: "#4A7C59" },
  OPERASIONAL: { label: "Operasional", color: "#C5533B" },
  FASILITAS: { label: "Fasilitas", color: "#6D28D9" },
  PAJAK: { label: "Pajak", color: "#0891B2" },
};

export const ASSIGNMENT_STATUSES = {
  PENDING: { label: "Menunggu", color: "#5C5C5C" },
  IN_TRANSIT: { label: "Dalam Perjalanan", color: "#D97706" },
  COMPLETED: { label: "Selesai", color: "#4A7C59" },
};

export const ITEM_CATEGORIES = {
  KH: { label: "Karbohidrat", color: "#D97706" },
  PH: { label: "Protein Hewani", color: "#C5533B" },
  PN: { label: "Protein Nabati", color: "#4A7C59" },
  SY: { label: "Sayuran", color: "#16A34A" },
  BU: { label: "Buah-buahan", color: "#7C3AED" },
  BB: { label: "Bumbu & Bahan Lain", color: "#6B7280" },
  OPR: { label: "Operasional (Gas/Alat)", color: "#0891B2" },
  CLN: { label: "Kebersihan (Sabun/Kain)", color: "#059669" },
};

export const ZONES = ["DRY", "WET", "FREEZER"];
export const ZONE_COLORS = {
  DRY: "#D97706",
  WET: "#2C4251",
  FREEZER: "#1E40AF",
};
export const ZONE_LABELS = {
  DRY: "Kering",
  WET: "Chiller (0–4°C)",
  FREEZER: "Freezer (-18°C)",
};

export const MENU_STATUS = {
  DRAFT: { label: "Draft", color: "#5C5C5C" },
  PENDING_REVIEW: { label: "Menunggu Review", color: "#D97706" },
  APPROVED: { label: "Disetujui", color: "#4A7C59" },
  REJECTED: { label: "Ditolak", color: "#C5533B" },
};

export const COMMON_ALLERGENS = ["telur", "susu", "kedelai", "kacang", "gluten", "ikan", "udang"];

export function fmtIDR(n) {
  if (n == null || isNaN(n)) return "Rp 0";
  return "Rp " + Number(n).toLocaleString("id-ID");
}

export function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "medium" });
}

export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { dateStyle: "medium" });
}

export function mondayOf(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

export const DAYS = [
  { key: "mon", label: "Senin" },
  { key: "tue", label: "Selasa" },
  { key: "wed", label: "Rabu" },
  { key: "thu", label: "Kamis" },
  { key: "fri", label: "Jumat" },
];
