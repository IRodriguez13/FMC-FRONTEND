import { ApiError } from './apiClient';

/**
 * Mapa opcional backend detail → copy UX.
 * Si no hay entrada, se muestra el detail del backend (si es seguro).
 * Fuente: fmcbackend Application/Services, Endpoints, CabaServiceArea.
 */
const BACKEND_DETAIL_MAP = {
  'Credenciales inválidas.': 'Email o contraseña incorrectos.',
  'Token inválido.': 'Tu sesión no es válida. Volvé a iniciar sesión.',
  'Rol no autorizado.': 'Tu cuenta no tiene permiso para esta acción.',
  'El correo ya está registrado.': 'Ese correo ya tiene una cuenta. Probá iniciar sesión.',
  'Usuario no encontrado.': 'Tu sesión venció. Volvé a iniciar sesión.',
  'Cuenta enterprise no encontrada.': 'No encontramos tu cuenta de negocio. Volvé a iniciar sesión.',
  'Cafetería no encontrada.': 'No encontramos esa cafetería.',
  'Reseña no encontrada.': 'No encontramos esa reseña.',
  'No podés modificar esta reseña.': 'Solo podés editar o eliminar tus propias reseñas.',
  'Archivo vacío.': 'Elegí una imagen antes de subir.',
  'Formato no permitido. Usá JPEG, PNG o WebP.': 'La imagen debe ser JPG, PNG o WebP.',
  'Formato no permitido.': 'Formato de archivo no permitido.',
  'El nombre no puede estar vacío.': 'Escribí un nombre para mostrar.',
  'El nombre no puede superar 80 caracteres.': 'El nombre es demasiado largo (máximo 80 caracteres).',
  'La valoración debe estar entre 1 y 5.': 'La puntuación debe ser entre 1 y 5 estrellas.',
  'Coordenadas geográficas inválidas.': 'Las coordenadas no son válidas.',
  'Demo pública: usá las cuentas seed documentadas en /demo.':
    'En la demo usá las cuentas de prueba de la página Ayuda (/demo).',
};

const PREFIX_RULES = [
  {
    prefix: 'La imagen supera el tamaño máximo',
    message: 'La imagen es muy pesada. Probá con un archivo más chico.',
  },
  {
    prefix: 'El texto no puede superar',
    message: 'La reseña es demasiado larga. Acortala e intentá de nuevo.',
  },
  {
    prefix: 'Find My Coffee solo opera en',
    passThrough: true,
  },
];

function isInternalDetail(detail) {
  if (!detail || typeof detail !== 'string') return true;
  const trimmed = detail.trim();
  if (!trimmed || trimmed.startsWith('Error ')) return true;
  if (/exception|stack trace|sqlite| at \w+\./i.test(trimmed)) return true;
  return false;
}

function resolveBackendDetail(detail) {
  if (isInternalDetail(detail)) return null;

  const trimmed = detail.trim();
  if (BACKEND_DETAIL_MAP[trimmed]) return BACKEND_DETAIL_MAP[trimmed];

  for (const rule of PREFIX_RULES) {
    if (!trimmed.startsWith(rule.prefix)) continue;
    if (rule.passThrough) return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
    return rule.message;
  }

  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
}

function messageByStatus(status, fallback) {
  if (status === 401) return 'No pudimos verificar tu acceso. Volvé a iniciar sesión.';
  if (status === 403) return 'No tenés permiso para hacer esto con tu cuenta actual.';
  if (status === 404) {
    return 'No encontramos ese recurso. Si acabás de actualizar la app, reiniciá el servidor backend.';
  }
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
 * Prioriza detail del backend; el mapa UX es opcional.
 * @param {unknown} err
 * @param {string} [fallback] Mensaje si no hay detalle usable
 */
export function friendlyApiMessage(err, fallback = 'Algo salió mal. Probá de nuevo en un momento.') {
  if (err instanceof ApiError) {
    const fromBackend = resolveBackendDetail(err.message);
    if (fromBackend) return fromBackend;

    if (err.sessionExpired) {
      return 'Tu sesión venció. Volvé a iniciar sesión.';
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
    return resolveBackendDetail(raw) || fallback;
  }

  return fallback;
}
