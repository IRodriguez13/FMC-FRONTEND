/** TTL en ms — datos de descubrimiento (mapa / explore). */
export const NEARBY_TTL_MS = 3 * 60 * 1000;
export const NEARBY_STALE_MS = 12 * 60 * 1000;

/** Fotos y reseñas por local. */
export const CAFE_MEDIA_TTL_MS = 5 * 60 * 1000;
export const CAFE_MEDIA_STALE_MS = 20 * 60 * 1000;

/** Cupones (dependen del tier del viewer). */
export const CAFE_COUPONS_TTL_MS = 2 * 60 * 1000;
export const CAFE_COUPONS_STALE_MS = 8 * 60 * 1000;

const store = new Map();
const inFlight = new Map();

export function roundCoord(value, decimals = 3) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function nearbyCacheKey(lat, lng, radiusKm, viewerKey) {
  return `nearby:${roundCoord(lat)}:${roundCoord(lng)}:${radiusKm ?? 'auto'}:${viewerKey}`;
}

export function cafePhotosKey(cafeteriaId) {
  return `cafe:${cafeteriaId}:photos`;
}

export function cafeReviewsKey(cafeteriaId) {
  return `cafe:${cafeteriaId}:reviews`;
}

export function cafeCouponsKey(cafeteriaId, viewerKey) {
  return `cafe:${cafeteriaId}:coupons:${viewerKey}`;
}

/** Lectura síncrona (p. ej. pintar mapa al instante). */
export function peekCache(key, { maxStaleMs } = {}) {
  const entry = store.get(key);
  if (!entry) return null;
  const age = Date.now() - entry.at;
  const limit = maxStaleMs ?? entry.staleMs;
  if (age >= limit) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function invalidateCache(prefix) {
  for (const key of store.keys()) {
    if (key === prefix || key.startsWith(prefix)) store.delete(key);
  }
}

export function invalidateNearbyCache() {
  invalidateCache('nearby:');
}

export function invalidateCafeteriaMedia(cafeteriaId) {
  invalidateCache(`cafe:${cafeteriaId}:`);
}

export function invalidateCafeteriaReviews(cafeteriaId) {
  invalidateCache(cafeReviewsKey(cafeteriaId));
  invalidateNearbyCache();
}

export function invalidateCafeteriaPhotos(cafeteriaId) {
  invalidateCache(cafePhotosKey(cafeteriaId));
  invalidateNearbyCache();
}

/**
 * GET con caché en memoria, deduplicación de requests y stale-while-revalidate.
 * @param {string} key
 * @param {() => Promise<unknown>} fetcher
 * @param {{ ttlMs?: number, staleMs?: number, bypass?: boolean, signal?: AbortSignal, onRevalidate?: (data: unknown) => void }} [options]
 */
export async function getCached(key, fetcher, options = {}) {
  const {
    ttlMs = CAFE_MEDIA_TTL_MS,
    staleMs = CAFE_MEDIA_STALE_MS,
    bypass = false,
    signal,
    onRevalidate,
  } = options;

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  if (!bypass) {
    const entry = store.get(key);
    const now = Date.now();

    if (entry) {
      const age = now - entry.at;
      if (age < ttlMs) return entry.data;

      if (age < staleMs) {
        revalidateInBackground(key, fetcher, { staleMs, onRevalidate });
        return entry.data;
      }

      store.delete(key);
    }

    const pending = inFlight.get(key);
    if (pending) return pending;
  }

  const promise = (async () => {
    const data = await fetcher();
    store.set(key, { data, at: Date.now(), staleMs });
    return data;
  })();

  inFlight.set(key, promise);

  try {
    return await promise;
  } finally {
    if (inFlight.get(key) === promise) inFlight.delete(key);
  }
}

function revalidateInBackground(key, fetcher, { staleMs, onRevalidate }) {
  if (inFlight.has(key)) return;

  const promise = (async () => {
    try {
      const data = await fetcher();
      store.set(key, { data, at: Date.now(), staleMs });
      onRevalidate?.(data);
      return data;
    } catch {
      return null;
    } finally {
      if (inFlight.get(key) === promise) inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
}
