import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_COVER, resolveMediaUrl } from './mediaUrl';

describe('resolveMediaUrl', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', '');
    vi.stubEnv('VITE_DEV_API_TARGET', 'http://127.0.0.1:5215');
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

  it('en dev apunta al VITE_DEV_API_TARGET para /media', () => {
    expect(resolveMediaUrl('/media/abc.jpg')).toBe('http://127.0.0.1:5215/media/abc.jpg');
  });

  it('normaliza seed legacy .png a .jpg', () => {
    expect(resolveMediaUrl('/media/seed-palermo-barra.png')).toBe(
      'http://127.0.0.1:5215/media/seed-palermo-barra.jpg'
    );
  });

  it('añade slash inicial a rutas relativas sin slash', () => {
    expect(resolveMediaUrl('media/foo.jpg')).toBe('http://127.0.0.1:5215/media/foo.jpg');
  });

  it('usa VITE_API_URL en prod', () => {
    vi.stubEnv('DEV', 'false');
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    expect(resolveMediaUrl('/media/cafe.jpg')).toBe('https://api.example.com/media/cafe.jpg');
  });

  it('exporta FALLBACK_COVER local', () => {
    expect(FALLBACK_COVER).toBe('/images/fallback-cafe.jpg');
  });
});
