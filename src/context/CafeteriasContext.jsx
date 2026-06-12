import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchNearbyCafeterias } from '../api/discoveryApi';
import { mapNearbyResponse } from '../lib/cafeteriaMapper';
import { fetchWithRetry, friendlyApiMessage } from '../lib/fetchWithRetry';
import { getCurrentCoords } from '../lib/geolocation';
import { useAuth } from './AuthContext';

const CafeteriasContext = createContext(null);

export function CafeteriasProvider({ children }) {
  const { token } = useAuth();
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null);
  const [meta, setMeta] = useState(null);
  const [radiusKm, setRadiusKm] = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(async (signal, tokenOverride) => {
    setLoading(true);
    setError('');
    const authToken = tokenOverride ?? token;
    try {
      const position = await getCurrentCoords();
      if (signal?.aborted) return;
      setCoords(position);
      const raw = await fetchWithRetry(() =>
        fetchNearbyCafeterias({
          lat: position.lat,
          lng: position.lng,
          radiusKm: radiusKm ?? undefined,
          token: authToken || undefined,
          signal,
        })
      );
      if (signal?.aborted) return;
      const mapped = mapNearbyResponse(raw);
      setCafes(mapped.items);
      setMeta({
        queryLatitude: mapped.queryLatitude,
        queryLongitude: mapped.queryLongitude,
        appliedRadiusKm: mapped.appliedRadiusKm,
        viewerTier: mapped.viewerTier,
        maxResultsCap: mapped.maxResultsCap,
      });
    } catch (e) {
      if (signal?.aborted || e.name === 'AbortError') return;
      setCafes([]);
      setError(friendlyApiMessage(e, 'No pudimos cargar cafeterías cerca tuyo. Probá de nuevo.'));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token, radiusKm]);

  const refetch = useCallback(async (tokenOverride) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    await load(ac.signal, tokenOverride);
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
