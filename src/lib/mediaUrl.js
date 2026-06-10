const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/** Resuelve URLs relativas del backend (/media/...) para dev (proxy) o prod (VITE_API_URL). */
export function resolveMediaUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return API_BASE ? `${API_BASE}${path}` : path;
}
