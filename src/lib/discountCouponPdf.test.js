import { describe, expect, it } from 'vitest';
import { buildCouponFilename } from './discountCouponPdf';

describe('buildCouponFilename', () => {
  it('genera slug seguro desde el nombre del local', () => {
    const name = buildCouponFilename('FMC Seed — Palermo (Premium)');
    expect(name).toMatch(/^cupon-fmc-fmc-seed-palermo-premium-\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  it('usa fallback si el nombre queda vacío', () => {
    expect(buildCouponFilename('---')).toMatch(/^cupon-fmc-local-/);
  });
});
