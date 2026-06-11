import { ApiError } from './apiClient';

/** Mensajes del backend → copy para la persona usuaria (sin jerga técnica). */
const BACKEND_DETAIL_MAP = {
  'Credenciales inválidas.': 'Email o contraseña incorrectos.',
  'El correo ya está registrado.': 'Ese correo ya tiene una cuenta. Probá iniciar sesión.',
  'Usuario no encontrado.': 'Tu sesión venció. Volvé a iniciar sesión.',
  'Cuenta enterprise no encontrada.': 'No encontramos tu cuenta de negocio. Volvé a iniciar sesión.',
  'Cafetería no encontrada.': 'No encontramos esa cafetería.',
  'Archivo vacío.': 'Elegí una imagen antes de subir.',
  'Formato no permitido. Usá JPEG, PNG o WebP.': 'La imagen debe ser JPG, PNG o WebP.',
  'El nombre no puede estar vacío.': 'Escribí un nombre para mostrar.',
  'El nombre no puede superar 80 caracteres.': 'El nombre es demasiado largo (máximo 80 caracteres).',
  'La valoración debe estar entre 1 y 5.': 'La puntuación debe ser entre 1 y 5 estrellas.',
  'Demo pública: usá las cuentas seed documentadas en /demo.': 'En la demo usá las cuentas de prueba de la página Ayuda.',
};

function mapBackendDetail(detail) {
  if (!detail || typeof detail !== 'string') return null;
  const trimmed = detail.trim();
  if (BACKEND_DETAIL_MAP[trimmed]) return BACKEND_DETAIL_MAP[trimmed];
  if (trimmed.startsWith('La imagen supera el tamaño máximo')) {
    return 'La imagen es muy pesada. Probá con un archivo más chico.';
  }
  if (trimmed.startsWith('El texto no puede superar')) {
    return 'La reseña es demasiado larga. Acortala e intentá de nuevo.';
  }
  if (trimmed.startsWith('Error ')) return null;
  if (/exception|stack|sqlite|jwt|token|http/i.test(trimmed)) return null;
  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
}

function messageByStatus(status, fallback) {
  if (status === 401) return 'No pudimos verificar tu acceso. Volvé a iniciar sesión.';
  if (status === 403) return 'No tenés permiso para hacer esto con tu cuenta actual.';
  if (status === 404) return 'No encontramos lo que buscás. Puede que ya no esté disponible.';
  if (status === 409) return 'Esa acción no se puede completar ahora. Probá de nuevo.';
  if (status === 429) return 'Hiciste muchos intentos seguidos. Esperá un momento y probá otra vez.';
  if (status === 408 || status === 504) {
    return 'Tardó demasiado en responder. Probá de nuevo en unos segundos.';
  }
  if (status >= 500) {
    return 'Tuvimos un problema en el servidor. Probá de nuevo en unos segundos.';
  }
  return fallback;
}

/**
 * Convierte errores de red/API en mensajes entendibles para quien usa la app.
 * @param {unknown} err
 * @param {string} [fallback] Mensaje si no hay detalle usable
 */
export function friendlyApiMessage(err, fallback = 'Algo salió mal. Probá de nuevo en un momento.') {
  if (err instanceof ApiError) {
    if (err.sessionExpired) {
      return 'Tu sesión venció. Volvé a iniciar sesión.';
    }

    const mapped = mapBackendDetail(err.message);
    if (mapped) return mapped;

    if (err.status === 400 && err.message) {
      return mapBackendDetail(err.message) || fallback;
    }

    return messageByStatus(err.status, fallback);
  }

  if (err instanceof TypeError) {
    return 'No pudimos conectar. Revisá tu internet e intentá de nuevo.';
  }

  if (err?.name === 'AbortError') {
    return fallback;
  }

  const raw = typeof err?.message === 'string' ? err.message.trim() : '';
  if (raw && !raw.startsWith('Error ') && !/failed to fetch/i.test(raw)) {
    return mapBackendDetail(raw) || fallback;
  }

  return fallback;
}
