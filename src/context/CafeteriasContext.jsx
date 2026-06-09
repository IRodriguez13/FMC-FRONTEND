import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchNearbyCafeterias } from '../api/discoveryApi';
import { mapNearbyResponse } from '../lib/cafeteriaMapper';
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

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const position = await getCurrentCoords();
      if (signal?.aborted) return;
      setCoords(position);
      const raw = await fetchNearbyCafeterias({
        lat: position.lat,
        lng: position.lng,
        radiusKm: radiusKm ?? undefined,
        token: token || undefined,
        signal,
      });
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
      setError(e.message || 'No se pudieron cargar las cafeterías.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token, radiusKm]);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
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
      refetch: load,
      getCafeById,
    }),
    [cafes, loading, error, coords, meta, radiusKm, load, getCafeById]
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
