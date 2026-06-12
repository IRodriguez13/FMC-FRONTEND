import { apiRequest } from '../lib/apiClient';

export function fetchNearbyCafeterias({ lat, lng, radiusKm, token, signal }) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });
  if (radiusKm != null) params.set('radiusKm', String(radiusKm));
  return apiRequest(`/api/cafeterias/nearby?${params}`, { token, signal });
}
