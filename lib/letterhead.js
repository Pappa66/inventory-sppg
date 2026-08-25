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

export function todayIndo() {
  return new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function fmtDateIndo(dateStr) {
  if (!dateStr) return "___/___/______";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Render kop surat — Indonesian formal letter format.
 *
 * Layout (left logo + right text):
 *   Logo 20×20  |  YAYASAN ...           (gray 8pt)
 *               |  NAMA SPPG / DAPUR     (bold 14pt)
 *               |  ID · Alamat · Telp     (gray 7pt)
 *   ═══════════════════════════════════════  (single line)
 *   return Y
 */
export function renderLetterhead(doc, settings, logo, options = {}) {
  const {
    pageWidth = 210,
    marginLeft = 20,
    marginRight = 20,
  } = options;

  const textX = marginLeft + (logo ? 25 : 0);

  // ── Logo (left) ──
  if (logo) {
    try {
      doc.addImage(logo, "PNG", marginLeft, 12, 20, 20);
    } catch {}
  }

  // ── Line 1: Yayasan (small, gray, uppercase) ──
  let lineY = 14;
  if (settings.nama_yayasan) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0x7A, 0x7A, 0x7A);
    doc.text(settings.nama_yayasan.toUpperCase(), textX, lineY);
    lineY += 5;
  }

  // ── Line 2: Nama SPPG (large, bold) ──
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0x1F, 0x1F, 0x1F);
  doc.text(settings.sppg_name || "SPPG MBG", textX, lineY + 2);
  lineY += 8;

  // ── Line 3: ID · Alamat · Telepon (small, gray) ──
  const parts = [];
  if (settings.id_sppg) parts.push(`ID: ${settings.id_sppg}`);
  if (settings.sppg_address) parts.push(settings.sppg_address);
  if (settings.phone) parts.push(`Telp: ${settings.phone}`);
  if (parts.length) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0x7A, 0x7A, 0x7A);
    doc.text(parts.join("  ·  "), textX, lineY);
    lineY += 4;
  }

  // ── Separator line ──
  const sepY = lineY + 2;
  doc.setDrawColor(0x1F, 0x1F, 0x1F);
  doc.setLineWidth(0.6);
  doc.line(marginLeft, sepY, pageWidth - marginRight, sepY);

  return sepY + 6;
}

/**
 * Render title block — centered, with underline.
 */
export function renderLetterTitle(doc, title, subtitle, y, pageWidth, ml, mr) {
  const cx = pageWidth / 2;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0x1F, 0x1F, 0x1F);
  doc.text(title, cx, y, { align: "center" });

  if (subtitle) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0x6C, 0x6C, 0x6C);
    doc.text(subtitle, cx, y + 5, { align: "center" });
  }

  const lineY = y + (subtitle ? 9 : 7);
  doc.setDrawColor(0x1F, 0x1F, 0x1F);
  doc.setLineWidth(0.25);
  doc.line(ml, lineY, pageWidth - mr, lineY);

  return lineY + 5;
}

/**
 * Render signature block — NO lines, just name + jabatan.
 * Date is right-aligned above the signature.
 */
export function renderSignatureBlock(doc, settings, startY, pageWidth, roles) {
  const ml = 20;
  const usable = pageWidth - ml * 2;
  let y = startY;

  if (roles.length === 2) {
    const lx = ml + 5;
    const rx = ml + usable / 2 + 15;

    // Left role
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0x1F, 0x1F, 0x1F);
    doc.text("Mengetahui,", lx, y);

    // Right role
    doc.text(roles[1].label || "Kepala SPPG,", rx, y);

    y += 18;

    // Left name + jabatan
    const leftName = settings[roles[0].settingsKey] || "___________________";
    doc.setFont("helvetica", "bold");
    doc.text(leftName, lx, y);
    if (roles[0].jabatan) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(0x4A, 0x4A, 0x4A);
      doc.text(roles[0].jabatan, lx, y + 4);
    }

    // Right name + jabatan
    const rightName = settings[roles[1].settingsKey] || "___________________";
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0x1F, 0x1F, 0x1F);
    doc.text(rightName, rx, y);
    if (roles[1].jabatan) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(0x4A, 0x4A, 0x4A);
      doc.text(roles[1].jabatan, rx, y + 4);
    }

    return y + 12;
  }

  // Single signature — right-aligned
  const rx = ml + usable / 2 + 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0x1F, 0x1F, 0x1F);
  doc.text(roles[0].label || "Kepala SPPG,", rx, y);

  y += 18;
  const name = settings[roles[0].settingsKey] || "___________________";
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0x1F, 0x1F, 0x1F);
  doc.text(name, rx, y);
  if (roles[0].jabatan) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0x4A, 0x4A, 0x4A);
    doc.text(roles[0].jabatan, rx, y + 4);
  }

  return y + 12;
}
