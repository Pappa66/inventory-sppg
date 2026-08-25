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
 * Render kop surat (letterhead) — returns Y after separator.
 *
 * Layout (A4 portrait = 210 × 297mm):
 *   Y=12  Logo 22×22   |  Nama SPPG (bold 14pt)
 *   Y=17               |  Alamat (normal 8pt)
 *   Y=21               |  ID SPPG | Yayasan (gray 7pt)
 *   Y=28  ═══════════════════════════════════  (double line)
 *   Y=34  → return
 */
export function renderLetterhead(doc, settings, logo, options = {}) {
  const {
    pageWidth = 210,
    marginLeft = 20,
    marginRight = 20,
  } = options;

  const textX = marginLeft + (logo ? 28 : 0);

  // ── Logo ──
  if (logo) {
    try {
      doc.addImage(logo, "PNG", marginLeft, 12, 22, 22);
    } catch {}
  }

  // ── Organization name ──
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0x1F, 0x1F, 0x1F);
  doc.text(settings.sppg_name || "SPPG MBG", textX, 21);

  // ── Address ──
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0x4A, 0x4A, 0x4A);
  if (settings.sppg_address) {
    doc.text(settings.sppg_address, textX, 26);
  }

  // ── Meta line ──
  const meta = [];
  if (settings.id_sppg) meta.push(`ID SPPG: ${settings.id_sppg}`);
  if (settings.nama_yayasan) meta.push(`Yayasan: ${settings.nama_yayasan}`);
  if (meta.length) {
    doc.setFontSize(7);
    doc.setTextColor(0x7A, 0x7A, 0x7A);
    doc.text(meta.join("  |  "), textX, 30);
  }

  // ── Double line separator ──
  const lineY = 34;
  doc.setDrawColor(0x1F, 0x1F, 0x1F);
  doc.setLineWidth(0.7);
  doc.line(marginLeft, lineY, pageWidth - marginRight, lineY);
  doc.setLineWidth(0.2);
  doc.line(marginLeft, lineY + 1.8, pageWidth - marginRight, lineY + 1.8);

  return lineY + 7; // Y=41
}

/**
 * Render title block — returns Y after underline.
 *
 *   Y+0   SURAT PERNYATAAN... (bold 12pt, center)
 *   Y+5   (Lampiran 30j)      (gray 8pt, center)
 *   Y+10  ──────────────────── (thin line)
 *   return Y+14
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
 * Helper: write a "Label  :  Value" row. Label is right-padded to `pad` chars.
 * Returns new Y.
 */
function labelValue(doc, label, value, x, y, pad = 12) {
  const lbl = label.padEnd(pad);
  doc.setFont("helvetica", "normal");
  doc.text(`${lbl} :`, x, y);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + pad * 2.2, y);
  return y + 5.5;
}

/**
 * Render signature block — returns Y after last signature.
 *
 * Single role:  right-aligned
 * Dual roles:   "Mengetahui," left  |  "Kepala SPPG," right
 */
export function renderSignatureBlock(doc, settings, startY, pageWidth, roles) {
  const ml = 20;
  const usable = pageWidth - ml * 2;
  let y = startY;

  if (roles.length === 2) {
    // ── Left signature ──
    const lx = ml + 5;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0x1F, 0x1F, 0x1F);
    doc.text("Mengetahui,", lx, y);

    // ── Right signature ──
    const rx = ml + usable / 2 + 15;
    doc.text(roles[1].label || "Kepala SPPG,", rx, y);

    y += 5;

    // Left name
    const leftName = settings[roles[0].settingsKey] || "___________________";
    doc.setFont("helvetica", "bold");
    doc.text(leftName, lx, y + 10);
    if (roles[0].jabatan) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(roles[0].jabatan, lx, y + 14);
    }
    doc.setDrawColor(0x1F, 0x1F, 0x1F);
    doc.setLineWidth(0.3);
    doc.line(lx, y + 7, lx + 55, y + 7);

    // Right name
    const rightName = settings[roles[1].settingsKey] || "___________________";
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(rightName, rx, y + 10);
    if (roles[1].jabatan) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(roles[1].jabatan, rx, y + 14);
    }
    doc.line(rx, y + 7, rx + 55, y + 7);

    return y + 22;
  }

  // ── Single signature (right-aligned) ──
  const rx = ml + usable / 2 + 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0x1F, 0x1F, 0x1F);
  doc.text(roles[0].label || "Kepala SPPG,", rx, y);

  y += 5;
  const name = settings[roles[0].settingsKey] || "___________________";
  doc.setFont("helvetica", "bold");
  doc.text(name, rx, y + 10);
  if (roles[0].jabatan) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(roles[0].jabatan, rx, y + 14);
  }
  doc.setDrawColor(0x1F, 0x1F, 0x1F);
  doc.setLineWidth(0.3);
  doc.line(rx, y + 7, rx + 55, y + 7);

  return y + 22;
}
