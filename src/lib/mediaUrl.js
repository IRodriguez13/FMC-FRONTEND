const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1495474472287-4d489bc25008?w=800&q=80';

/** Normaliza rutas seed legacy (.png con bytes JPEG) a .jpg. */
function normalizeSeedMediaPath(path) {
  if (/^\/media\/seed-.+\.png$/i.test(path)) {
    return path.replace(/\.png$/i, '.jpg');
  }
  return path;
}

/** Resuelve URLs relativas del backend (/media/...) para dev (proxy) o prod (VITE_API_URL). */
export function resolveMediaUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  let path = url.startsWith('/') ? url : `/${url}`;
  path = normalizeSeedMediaPath(path);
  if (import.meta.env.DEV && path.startsWith('/media')) return path;
  return API_BASE ? `${API_BASE}${path}` : path;
}

export { FALLBACK_COVER };
