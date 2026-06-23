/** Etiqueta corta del beneficio (PDF, listados enterprise). */
export function couponBenefitLabel(coupon) {
  if (!coupon) return '';
  if (coupon.kind === 'Percent' || coupon.kind === 0) {
    return `-${coupon.discountPercent}%`;
  }
  if (coupon.kind === 'FixedAmount' || coupon.kind === 1) {
    return `$${coupon.fixedAmountArs} off`;
  }
  return coupon.title || '2x1';
}

/** Título principal en detalle de cafetería (sin repetir % ni fuente). */
export function couponHeadline(coupon) {
  if (!coupon) return '';
  if (coupon.kind === 'Percent' || coupon.kind === 0) {
    return `${coupon.discountPercent}% de descuento`;
  }
  if (coupon.kind === 'FixedAmount' || coupon.kind === 1) {
    return `$${coupon.fixedAmountArs} de descuento`;
  }
  return coupon.title?.trim() || '2x1';
}

/** Línea secundaria: origen del cupón y descripción opcional. */
export function couponDetailLine(coupon) {
  if (!coupon) return '';
  const source = couponSourceLabel(coupon.source);
  const desc = coupon.description?.trim();
  return desc ? `${source} · ${desc}` : source;
}

/** Código y vigencia semanal. */
export function couponMetaLine(coupon) {
  if (!coupon?.code) return '';
  const until = formatCouponWeekEnd(coupon.validUntil);
  return until ? `Código ${coupon.code} · válido hasta el ${until}` : `Código ${coupon.code}`;
}

export function couponSourceLabel(source) {
  return source === 'platform' ? 'Plan Premium FMC' : 'Cupón del local';
}

export function formatCouponWeekEnd(validUntil) {
  if (!validUntil) return '';
  return new Date(validUntil).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

export function formatReviewCount(count) {
  if (count === 1) return '1 reseña';
  return `${count} reseñas`;
}

/** Promedio + cantidad de reseñas en lenguaje claro (evita ambigüedad de «3.3 (3)»). */
export function formatRatingSummary(averageRating, totalReviews) {
  return `${Number(averageRating).toFixed(1)} · ${formatReviewCount(totalReviews)}`;
}
