import { ApiError } from './apiClient';
import { friendlyApiMessage } from './userFacingError';

function isRetryableError(err) {
  if (err?.name === 'AbortError') return false;
  if (err instanceof ApiError) {
    return err.status >= 500 || err.status === 408 || err.status === 429;
  }
  return err instanceof TypeError;
}

/** Reintenta fallos de red / 5xx (útil en cold start del hosting demo). */
export async function fetchWithRetry(fn, { retries = 2, baseDelayMs = 1200 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryableError(err) || attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, baseDelayMs * (attempt + 1)));
    }
  }
  throw lastErr;
}

export { friendlyApiMessage };
