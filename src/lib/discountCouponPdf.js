import { jsPDF } from 'jspdf';
import { couponBenefitLabel, couponSourceLabel, formatCouponWeekEnd } from './couponUtils';

const LOGO_PATH = '/img/logo.png';
const LEGAL_DISCLAIMER =
  'Este cupón no tiene validez legal. Forma parte de un proyecto académico/demo de Find My Coffee. Válido solo la semana indicada.';

export function buildCouponFilename(cafeName, code) {
  const slug = String(cafeName ?? 'cafeteria')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  const codeSlug = code ? `-${String(code).toLowerCase()}` : '';
  const date = new Date().toISOString().slice(0, 10);
  return `cupon-fmc-${slug || 'local'}${codeSlug}-${date}.pdf`;
}

async function loadLogoDataUrl() {
  const res = await fetch(LOGO_PATH);
  if (!res.ok) throw new Error('No pudimos cargar el logo.');
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No pudimos leer el logo.'));
    reader.readAsDataURL(blob);
  });
}

function loadImageSize(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Logo inválido.'));
    img.src = dataUrl;
  });
}

function wrapText(doc, text, maxWidth) {
  return doc.splitTextToSize(text, maxWidth);
}

/**
 * @param {{ name: string, address?: string }} cafe
 * @param {{ name?: string, email?: string }} user
 * @param {{ title?: string, code?: string, kind?: string|number, discountPercent?: number, fixedAmountArs?: number, validUntil?: string, source?: string, description?: string }} coupon
 */
export async function downloadDiscountCoupon(cafe, user, coupon = null) {
  const benefit = coupon ? couponBenefitLabel(coupon) : (cafe?.discountPercent != null ? `-${cafe.discountPercent}%` : null);
  if (!benefit) throw new Error('Este cupón no está disponible.');

  const logoData = await loadLogoDataUrl();
  const logoSize = await loadImageSize(logoData);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a6' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = margin;

  const logoMaxW = 36;
  const logoH = (logoSize.height / logoSize.width) * logoMaxW;
  doc.addImage(logoData, 'PNG', (pageW - logoMaxW) / 2, y, logoMaxW, logoH);
  y += logoH + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(90, 60, 30);
  doc.text('CUPÓN SEMANAL', pageW / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(120, 80, 40);
  const sourceLine = coupon?.source ? couponSourceLabel(coupon.source) : 'Find My Coffee · Plan Premium';
  doc.text(sourceLine, pageW / 2, y, { align: 'center' });
  y += 10;

  doc.setDrawColor(192, 139, 64);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 20, 10);
  const cafeLines = wrapText(doc, cafe.name, contentW);
  doc.text(cafeLines, pageW / 2, y, { align: 'center' });
  y += cafeLines.length * 5 + 2;

  if (cafe.address) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 60, 40);
    const addrLines = wrapText(doc, cafe.address, contentW);
    doc.text(addrLines, pageW / 2, y, { align: 'center' });
    y += addrLines.length * 4.5 + 6;
  } else {
    y += 4;
  }

  doc.setFillColor(250, 243, 224);
  doc.roundedRect(margin, y, contentW, 26, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(coupon?.kind === 'TwoForOne' || coupon?.kind === 2 ? 14 : 22);
  doc.setTextColor(160, 110, 40);
  const title = coupon?.title && (coupon.kind === 'TwoForOne' || coupon.kind === 2)
    ? coupon.title
    : benefit;
  const titleLines = wrapText(doc, title, contentW - 8);
  doc.text(titleLines, pageW / 2, y + 14, { align: 'center' });
  y += 32;

  if (coupon?.code) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 30, 20);
    doc.text(`Código: ${coupon.code}`, pageW / 2, y, { align: 'center' });
    y += 7;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(40, 30, 20);
  const body = coupon?.description
    || 'Presentá este cupón en el local durante la semana vigente.';
  const bodyLines = wrapText(doc, body, contentW);
  doc.text(bodyLines, margin, y);
  y += bodyLines.length * 4.5 + 6;

  const holder = user?.name || user?.email;
  if (holder) {
    doc.setFontSize(8.5);
    doc.setTextColor(90, 70, 50);
    doc.text(`Titular: ${holder}`, margin, y);
    y += 5;
  }

  const weekEnd = coupon?.validUntil ? formatCouponWeekEnd(coupon.validUntil) : null;
  if (weekEnd) {
    doc.text(`Válido hasta: ${weekEnd}`, margin, y);
    y += 5;
  }

  const issued = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
  doc.text(`Emitido: ${issued}`, margin, y);
  y += 10;

  doc.setDrawColor(220, 200, 170);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  doc.setFontSize(6.5);
  doc.setTextColor(120, 100, 80);
  const disclaimerLines = wrapText(doc, LEGAL_DISCLAIMER, contentW);
  doc.text(disclaimerLines, margin, y);

  doc.save(buildCouponFilename(cafe.name, coupon?.code));
}
