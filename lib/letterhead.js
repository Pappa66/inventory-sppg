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
 * Render kop surat (letterhead) on a jsPDF document.
 * Returns the Y position after the letterhead.
 */
export function renderLetterhead(doc, settings, logo, options = {}) {
  const {
    startY = 10,
    pageWidth = 210,
    marginLeft = 14,
    marginRight = 14,
  } = options;

  let y = startY;

  // Logo (left side)
  if (logo) {
    try {
      doc.addImage(logo, "PNG", marginLeft, y, 30, 0);
    } catch {}
  }

  // Organization name (right of logo)
  const textX = logo ? marginLeft + 35 : marginLeft;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0x2D, 0x2D, 0x2D);
  doc.text(settings.sppg_name || "SPPG MBG", textX, y + 5);

  // Address
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0x5C, 0x5C, 0x5C);
  if (settings.sppg_address) {
    doc.text(settings.sppg_address, textX, y + 10);
  }

  // ID SPPG & Yayasan line
  const metaParts = [];
  if (settings.id_sppg) metaParts.push(`ID: ${settings.id_sppg}`);
  if (settings.nama_yayasan) metaParts.push(`Yayasan: ${settings.nama_yayasan}`);
  if (metaParts.length) {
    doc.setFontSize(8);
    doc.text(metaParts.join("  |  "), textX, y + 15);
  }

  // Separator line
  y += logo ? 22 : 18;
  doc.setDrawColor(0x4A, 0x7C, 0x59);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, pageWidth - marginRight, y);

  return y + 6;
}

/**
 * Render a signature block for one or more roles.
 * Returns the Y position after the last signature.
 */
export function renderSignatureBlock(doc, settings, startY, pageWidth, roles) {
  const marginLeft = 14;
  const marginRight = 14;
  const colWidth = (pageWidth - marginLeft - marginRight) / roles.length;

  let y = startY;

  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    const x = marginLeft + i * colWidth + (colWidth / 2);

    // Label
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0x2D, 0x2D, 0x2D);
    doc.text(role.label || "", x, y, { align: "center" });

    // Name (from settings)
    const name = settings[role.settingsKey] || "___________________";
    doc.setFont("helvetica", "bold");
    doc.text(name, x, y + 12, { align: "center" });

    // Jabatan
    if (role.jabatan) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(role.jabatan, x, y + 17, { align: "center" });
    }

    // Signature line
    doc.setDrawColor(0x5C, 0x5C, 0x5C);
    doc.setLineWidth(0.3);
    doc.line(x - 25, y + 9, x + 25, y + 9);
  }

  return y + 25;
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
