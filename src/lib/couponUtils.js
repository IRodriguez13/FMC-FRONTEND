/** Etiqueta legible del beneficio del cupón. */
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

export function couponSourceLabel(source) {
  return source === 'platform' ? 'Beneficio Premium FMC' : 'Cupón del local';
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
