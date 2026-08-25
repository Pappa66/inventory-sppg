import { api } from "@/lib/api";
import { getLogo } from "@/lib/logo";

let cachedSettings = null;

export async function getSettings() {
  if (cachedSettings) return cachedSettings;
  try {
    const { data } = await api.get("/settings/logo");
    cachedSettings = data || {};
    return cachedSettings;
  } catch {
    return {};
  }
}

export function clearSettingsCache() {
  cachedSettings = null;
}

/**
 * Format a date string to Indonesian format.
 */
export function fmtDateIndo(dateStr) {
  if (!dateStr) return "___/___/______";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format today's date for kop surat header.
 */
export function todayIndo() {
  return new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Render kop surat (letterhead) on a jsPDF document.
 * Proper Indonesian formal letter format with double line separator.
 * Returns the Y position after the letterhead.
 */
export function renderLetterhead(doc, settings, logo, options = {}) {
  const {
    startY = 10,
    pageWidth = 210,
    marginLeft = 20,
    marginRight = 20,
  } = options;

  let y = startY;

  // Logo (left side)
  if (logo) {
    try {
      doc.addImage(logo, "PNG", marginLeft, y, 25, 25);
    } catch {}
  }

  // Organization name (right of logo)
  const textX = logo ? marginLeft + 30 : marginLeft;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0x1F, 0x1F, 0x1F);
  doc.text(settings.sppg_name || "SPPG MBG", textX, y + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0x4A, 0x4A, 0x4A);
  if (settings.sppg_address) {
    doc.text(settings.sppg_address, textX, y + 13);
  }

  const metaParts = [];
  if (settings.id_sppg) metaParts.push(`ID SPPG: ${settings.id_sppg}`);
  if (settings.nama_yayasan) metaParts.push(`Yayasan: ${settings.nama_yayasan}`);
  if (metaParts.length) {
    doc.setFontSize(8);
    doc.setTextColor(0x6C, 0x6C, 0x6C);
    doc.text(metaParts.join("  |  "), textX, y + 18);
  }

  // Double line separator
  y += logo ? 28 : 24;
  doc.setDrawColor(0x1F, 0x1F, 0x1F);
  doc.setLineWidth(0.8);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  doc.setLineWidth(0.2);
  doc.line(marginLeft, y + 2, pageWidth - marginRight, y + 2);

  return y + 8;
}

/**
 * Render a proper Indonesian formal letter title block.
 */
export function renderLetterTitle(doc, title, subtitle, y, pageWidth, marginLeft, marginRight) {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0x1F, 0x1F, 0x1F);
  doc.text(title, pageWidth / 2, y, { align: "center" });

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0x5C, 0x5C, 0x5C);
    doc.text(subtitle, pageWidth / 2, y + 5, { align: "center" });
  }

  // Underline
  const lineY = y + (subtitle ? 9 : 6);
  doc.setDrawColor(0x1F, 0x1F, 0x1F);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, lineY, pageWidth - marginRight, lineY);

  return lineY + 6;
}

/**
 * Render a proper signature block with "Mengetahui" and "Kepala SPPG" side by side.
 */
export function renderSignatureBlock(doc, settings, startY, pageWidth, roles) {
  const marginLeft = 20;
  const marginRight = 20;
  const usableWidth = pageWidth - marginLeft - marginRight;

  let y = startY;

  // "Mengetahui:" label (for left side if 2 roles)
  if (roles.length === 2) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0x1F, 0x1F, 0x1F);
    doc.text("Mengetahui,", marginLeft, y);

    // "Kepala SPPG," label (right side)
    doc.text(`${roles[1].label || "Kepala SPPG,"}`, marginLeft + usableWidth / 2 + 20, y);
  } else if (roles.length === 1) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0x1F, 0x1F, 0x1F);
    doc.text(roles[0].label || "Kepala SPPG,", marginLeft + usableWidth / 2 + 20, y);
  }

  y += 5;

  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    const x = roles.length === 2
      ? (i === 0 ? marginLeft + 10 : marginLeft + usableWidth / 2 + 30)
      : marginLeft + usableWidth / 2 + 30;

    // Name
    const name = settings[role.settingsKey] || "___________________";
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0x1F, 0x1F, 0x1F);
    doc.text(name, x, y + 10, { align: "left" });

    // Jabatan
    if (role.jabatan) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(0x4A, 0x4A, 0x4A);
      doc.text(role.jabatan, x, y + 15, { align: "left" });
    }

    // Signature line
    doc.setDrawColor(0x1F, 0x1F, 0x1F);
    doc.setLineWidth(0.3);
    doc.line(x, y + 7, x + 50, y + 7);
  }

  return y + 25;
}
