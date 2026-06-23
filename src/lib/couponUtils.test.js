import { describe, expect, it } from 'vitest';
import {
  couponDetailLine,
  couponHeadline,
  couponMetaLine,
  formatRatingSummary,
  formatReviewCount,
} from './couponUtils';

describe('couponHeadline', () => {
  it('muestra porcentaje sin duplicar título del backend', () => {
    expect(
      couponHeadline({
        kind: 'Percent',
        discountPercent: 12,
        title: 'Beneficio Premium FMC — 12%',
        source: 'platform',
      })
    ).toBe('12% de descuento');
  });
});

describe('couponDetailLine', () => {
  it('incluye descripción cuando existe', () => {
    expect(
      couponDetailLine({
        source: 'platform',
        description: 'Válido para consumidores con plan Premium esta semana.',
      })
    ).toContain('Plan Premium FMC');
    expect(
      couponDetailLine({
        source: 'platform',
        description: 'Válido para consumidores con plan Premium esta semana.',
      })
    ).toContain('esta semana');
  });
});

describe('couponMetaLine', () => {
  it('formatea código y vigencia', () => {
    const line = couponMetaLine({
      code: 'FMC-A33333-W26',
      validUntil: '2026-06-28T23:59:59Z',
    });
    expect(line).toMatch(/^Código FMC-A33333-W26 · válido hasta el /);
  });
});

describe('formatRatingSummary', () => {
  it('aclara que el número final es cantidad de reseñas', () => {
    expect(formatReviewCount(3)).toBe('3 reseñas');
    expect(formatReviewCount(1)).toBe('1 reseña');
    expect(formatRatingSummary(3.3, 3)).toBe('3.3 · 3 reseñas');
  });
});
