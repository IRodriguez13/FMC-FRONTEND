/** Base del API: prod usa VITE_API_URL; dev usa VITE_DEV_API_TARGET (mismo host para /api y /media). */
export function getApiBase() {
  const configured = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  if (configured) return configured;
  if (import.meta.env.DEV) {
    return (import.meta.env.VITE_DEV_API_TARGET ?? 'http://127.0.0.1:5214').replace(/\/$/, '');
  }
  return '';
}
