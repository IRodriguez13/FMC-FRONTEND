import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_COVER, resolveMediaUrl } from './mediaUrl';

describe('resolveMediaUrl', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', '');
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('PROD', 'false');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('devuelve null/undefined sin transformar', () => {
    expect(resolveMediaUrl(null)).toBe(null);
    expect(resolveMediaUrl(undefined)).toBe(undefined);
  });

  it('conserva URLs absolutas http/https', () => {
    const url = 'https://cdn.example.com/photo.jpg';
    expect(resolveMediaUrl(url)).toBe(url);
  });

  it('en dev usa proxy relativo para /media', () => {
    expect(resolveMediaUrl('/media/abc.jpg')).toBe('/media/abc.jpg');
  });

  it('normaliza seed legacy .png a .jpg', () => {
    expect(resolveMediaUrl('/media/seed-palermo-barra.png')).toBe('/media/seed-palermo-barra.jpg');
  });

  it('añade slash inicial a rutas relativas sin slash', () => {
    expect(resolveMediaUrl('media/foo.jpg')).toBe('/media/foo.jpg');
  });

  it('exporta FALLBACK_COVER', () => {
    expect(FALLBACK_COVER).toMatch(/^https:\/\//);
  });
});
