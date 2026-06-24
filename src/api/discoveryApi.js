import { apiRequest } from '../lib/apiClient';
import {
  CAFE_COUPONS_STALE_MS,
  CAFE_COUPONS_TTL_MS,
  NEARBY_STALE_MS,
  NEARBY_TTL_MS,
  cafeCouponsKey,
  getCached,
  invalidateNearbyCache,
  nearbyCacheKey,
} from '../lib/resourceCache';

export { invalidateNearbyCache };

export function fetchNearbyCafeterias({
  lat,
  lng,
  radiusKm,
  token,
  signal,
  viewerKey = token ? 'auth' : 'anon',
  bypassCache = false,
  onRevalidate,
}) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });
  if (radiusKm != null) params.set('radiusKm', String(radiusKm));

  const cacheKey = nearbyCacheKey(lat, lng, radiusKm, viewerKey);

  return getCached(
    cacheKey,
    () => apiRequest(`/api/cafeterias/nearby?${params}`, { token, signal }),
    {
      ttlMs: NEARBY_TTL_MS,
      staleMs: NEARBY_STALE_MS,
      bypass: bypassCache,
      signal,
      onRevalidate,
    }
  );
}

export function fetchCafeteriaCoupons(cafeteriaId, token, signal, options = {}) {
  const viewerKey = options.viewerKey ?? (token ? 'auth' : 'anon');
  const cacheKey = cafeCouponsKey(cafeteriaId, viewerKey);

  return getCached(
    cacheKey,
    () => apiRequest(`/api/cafeterias/${cafeteriaId}/coupons`, { token, signal }),
    {
      ttlMs: CAFE_COUPONS_TTL_MS,
      staleMs: CAFE_COUPONS_STALE_MS,
      bypass: options.bypassCache,
      signal,
      onRevalidate: options.onRevalidate,
    }
  );
}
