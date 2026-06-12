import { CABA, isWithinCaba } from './caba';

/** Centro CABA (Obelisco) cuando el navegador no entrega ubicación o está fuera del área. */
export const DEFAULT_COORDS = { ...CABA.center };

export function getCurrentCoords() {
  return new Promise((resolve) => {
    const finish = (lat, lng) => resolve({ lat, lng });

    if (!navigator.geolocation) {
      finish(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (isWithinCaba(lat, lng)) {
          finish(lat, lng);
        } else {
          finish(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
        }
      },
      () => finish(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  });
}
