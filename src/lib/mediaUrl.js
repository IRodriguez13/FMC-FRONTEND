import { getApiBase } from './apiBase';

/** Fallback local (no depende de red externa). */
const FALLBACK_COVER = '/images/fallback-cafe.jpg';

/** Normaliza rutas seed legacy (.png con bytes JPEG) a .jpg. */
function normalizeSeedMediaPath(path) {
  if (/^\/media\/seed-.+\.png$/i.test(path)) {
    return path.replace(/\.png$/i, '.jpg');
  }
  return path;
}

/** Resuelve URLs relativas del backend (/media/...) al host del API configurado. */
export function resolveMediaUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  let path = url.startsWith('/') ? url : `/${url}`;
  path = normalizeSeedMediaPath(path);
  const base = getApiBase();
  return base ? `${base}${path}` : path;
}

export { FALLBACK_COVER };
