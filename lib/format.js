export const ROLE_LABELS = {
  admin: "Admin",
  accountant: "Akuntan",
  kitchen_head: "Kepala Dapur",
  head_chef: "Chef Utama",
  field_assistant: "Asisten Lapangan",
  field_staff: "Staf Lapangan",
  nutritionist: "Ahli Gizi",
};

export const ROLE_COLORS = {
  admin: "#2D2D2D",
  accountant: "#2C4251",
  kitchen_head: "#4A7C59",
  head_chef: "#D97706",
  field_assistant: "#C5533B",
  field_staff: "#8B6F3A",
  nutritionist: "#6D28D9",
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
