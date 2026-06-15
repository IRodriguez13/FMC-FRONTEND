/** Base del API: prod usa VITE_API_URL; dev usa proxy Vite (rutas relativas /api, /media). */
export function getApiBase() {
  const configured = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  if (configured) return configured;
  // Dev: vacío → fetch('/api/...') pasa por server.proxy (VITE_DEV_API_TARGET en vite.config.js).
  if (import.meta.env.DEV) return '';
  return '';
}
