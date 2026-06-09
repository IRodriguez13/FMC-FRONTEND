/** Alineado con Fmc.Domain.Constants.CabaServiceArea del backend. */
export const CABA = {
  displayName: 'Ciudad Autónoma de Buenos Aires (CABA)',
  center: { lat: -34.6037, lng: -58.3816 },
  bounds: {
    minLat: -34.705,
    maxLat: -34.527,
    minLng: -58.535,
    maxLng: -58.335,
  },
};

export function isWithinCaba(lat, lng) {
  const { minLat, maxLat, minLng, maxLng } = CABA.bounds;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}
