import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchNearbyCafeterias, invalidateNearbyCache } from '../api/discoveryApi';
import { mapNearbyResponse } from '../lib/cafeteriaMapper';
import { fetchWithRetry, friendlyApiMessage } from '../lib/fetchWithRetry';
import { getCurrentCoords } from '../lib/geolocation';
import { NEARBY_STALE_MS, nearbyCacheKey, peekCache } from '../lib/resourceCache';
import { useAuth } from './AuthContext';

const CafeteriasContext = createContext(null);

function viewerCacheKey(user) {
  if (!user) return 'anon:guest';
  return `${user.role}:${user.premium ? 'premium' : 'free'}`;
}

export function CafeteriasProvider({ children }) {
  const { token, user } = useAuth();
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null);
  const [meta, setMeta] = useState(null);
  const [radiusKm, setRadiusKm] = useState(null);
  const abortRef = useRef(null);

  const applyNearbyRaw = useCallback(
    (raw) => {
      const mapped = mapNearbyResponse(raw, {
        showDiscounts: user?.role === 'consumer' && user?.premium,
      });
      setCafes(mapped.items);
      setMeta({
        queryLatitude: mapped.queryLatitude,
        queryLongitude: mapped.queryLongitude,
        appliedRadiusKm: mapped.appliedRadiusKm,
        viewerTier: mapped.viewerTier,
        maxResultsCap: mapped.maxResultsCap,
      });
    },
    [user?.premium, user?.role]
  );

  const load = useCallback(async (signal, tokenOverride, { bypassCache = false } = {}) => {
    const authToken = tokenOverride ?? token;
    const viewerKey = viewerCacheKey(user);

    setError('');
    if (bypassCache) setLoading(true);

    try {
      const position = await getCurrentCoords();
      if (signal?.aborted) return;
      setCoords(position);

      const cacheKey = nearbyCacheKey(
        position.lat,
        position.lng,
        radiusKm,
        viewerKey
      );

      if (!bypassCache) {
        const cached = peekCache(cacheKey, { maxStaleMs: NEARBY_STALE_MS });
        if (cached) {
          applyNearbyRaw(cached);
          setLoading(false);
        } else {
          setLoading(true);
        }
      }

      const raw = await fetchWithRetry(() =>
        fetchNearbyCafeterias({
          lat: position.lat,
          lng: position.lng,
          radiusKm: radiusKm ?? undefined,
          token: authToken || undefined,
          signal,
          viewerKey,
          bypassCache,
          onRevalidate: (data) => {
            if (!signal?.aborted) applyNearbyRaw(data);
          },
        })
      );

      if (signal?.aborted) return;
      applyNearbyRaw(raw);
    } catch (e) {
      if (signal?.aborted || e.name === 'AbortError') return;
      setCafes([]);
      setError(friendlyApiMessage(e, 'No pudimos cargar cafeterías cerca tuyo. Probá de nuevo.'));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token, radiusKm, user, applyNearbyRaw]);

  const refetch = useCallback(async (tokenOverride) => {
    invalidateNearbyCache();
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    await load(ac.signal, tokenOverride, { bypassCache: true });
  }, [load]);

  useEffect(() => {
    const ac = new AbortController();
    abortRef.current = ac;
    load(ac.signal);
    return () => {
      ac.abort();
    };
  }, [load]);

  const getCafeById = useCallback(
    (id) => cafes.find((c) => c.id === String(id)),
    [cafes]
  );

  const value = useMemo(
    () => ({
      cafes,
      loading,
      error,
      coords,
      meta,
      radiusKm,
      setRadiusKm,
      refetch,
      getCafeById,
    }),
    [cafes, loading, error, coords, meta, radiusKm, refetch, getCafeById]
  );

  return (
    <CafeteriasContext.Provider value={value}>{children}</CafeteriasContext.Provider>
  );
}

export function useCafeterias() {
  const ctx = useContext(CafeteriasContext);
  if (!ctx) throw new Error('useCafeterias must be used within CafeteriasProvider');
  return ctx;
}
