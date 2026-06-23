const API_URL = (process.env.FMC_API_URL || 'http://127.0.0.1:5214').replace(/\/$/, '');

export default async function globalSetup() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch {
    throw new Error(
      `Backend FMC no disponible en ${API_URL}. ` +
        'Levantalo antes de los E2E: cd ../fmcbackend && make run (o make up). ' +
        'El puerto debe coincidir con VITE_DEV_API_TARGET en .env.'
    );
  } finally {
    clearTimeout(timer);
  }
}
