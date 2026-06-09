import { CABA, isWithinCaba } from './caba';

/** Centro CABA (Obelisco) cuando el navegador no entrega ubicación o está fuera del área. */
export const DEFAULT_COORDS = { ...CABA.center };

export function getCurrentCoords() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_COORDS);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        resolve(isWithinCaba(coords.lat, coords.lng) ? coords : DEFAULT_COORDS);
      },
      () => resolve(DEFAULT_COORDS),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  });
}
