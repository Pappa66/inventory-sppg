export const ROLE_LABELS = {
  admin: "Admin",
  accountant: "Akuntan",
  kitchen_head: "Kepala Dapur",
  head_chef: "Chef Utama",
  field_assistant: "Asisten Lapangan",
  nutritionist: "Ahli Gizi",
  driver: "Driver",
};

export const ROLE_COLORS = {
  admin: "#2D2D2D",
  accountant: "#2C4251",
  kitchen_head: "#4A7C59",
  head_chef: "#D97706",
  field_assistant: "#C5533B",
  nutritionist: "#6D28D9",
  driver: "#0891B2",
};

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
  { key: "balita", label: "Balita", color: "#E11D48" },
  { key: "paud_tk", label: "PAUD/TK/RA", color: "#D97706" },
  { key: "sd_1_3", label: "SD/MI 1-3", color: "#4A7C59" },
  { key: "sd_4_6", label: "SD/MI 4-6", color: "#16A34A" },
  { key: "smp", label: "SMP/MTs", color: "#2C4251" },
  { key: "sma", label: "SMA/MA/SMK", color: "#6D28D9" },
  { key: "slb", label: "SLB", color: "#0891B2" },
  { key: "santri", label: "Santri", color: "#7C3AED" },
  { key: "pend_tk", label: "Pend/TK", color: "#C5533B" },
  { key: "bumil", label: "Bumil", color: "#E11D48" },
  { key: "busui", label: "Busui", color: "#D97706" },
  { key: "lainnya", label: "Lainnya", color: "#6B7280" },
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
  BB: { label: "Bahan Baku Lain", color: "#6B7280" },
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
