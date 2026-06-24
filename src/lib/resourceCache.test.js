import { describe, expect, it, vi } from 'vitest';
import {
  getCached,
  invalidateCache,
  nearbyCacheKey,
  peekCache,
} from './resourceCache';

describe('resourceCache', () => {
  it('devuelve datos frescos sin repetir fetch', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    const key = 'test:fresh';

    await getCached(key, fetcher, { ttlMs: 60_000, staleMs: 120_000 });
    await getCached(key, fetcher, { ttlMs: 60_000, staleMs: 120_000 });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(peekCache(key, { maxStaleMs: 120_000 })).toEqual({ ok: true });
  });

  it('invalida por prefijo', async () => {
    const fetcher = vi.fn().mockResolvedValue(1);
    await getCached('cafe:a:reviews', fetcher, { ttlMs: 60_000, staleMs: 120_000 });
    invalidateCache('cafe:a:');
    expect(peekCache('cafe:a:reviews', { maxStaleMs: 120_000 })).toBeNull();
  });

  it('nearbyCacheKey redondea coords', () => {
    expect(nearbyCacheKey(-34.6037123, -58.3816456, null, 'anon:free')).toBe(
      'nearby:-34.604:-58.382:auto:anon:free'
    );
  });
});
