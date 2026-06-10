const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function parseProblemDetail(data) {
  if (!data || typeof data !== 'object') return null;
  return data.detail || data.title || null;
}

export async function apiRequest(path, { method = 'GET', body, token, signal } = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status === 204) return null;

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      parseProblemDetail(data) ||
      (typeof data === 'string' ? data : null) ||
      `Error ${res.status}`;
    const err = new ApiError(msg, res.status, data);
    if (res.status === 401 || res.status === 404) err.sessionExpired = true;
    throw err;
  }

  return data;
}

export async function apiUpload(path, { file, fieldName = 'file', token, signal } = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const formData = new FormData();
  formData.append(fieldName, file);

  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    signal,
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      parseProblemDetail(data) ||
      (typeof data === 'string' ? data : null) ||
      `Error ${res.status}`;
    const err = new ApiError(msg, res.status, data);
    if (res.status === 401 || res.status === 404) err.sessionExpired = true;
    throw err;
  }

  return data;
}
