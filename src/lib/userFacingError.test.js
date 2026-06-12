import { describe, expect, it } from 'vitest';
import { ApiError } from './apiClient';
import { friendlyApiMessage } from './userFacingError';

describe('friendlyApiMessage', () => {
  it('mapea credenciales inválidas del backend', () => {
    const err = new ApiError('Credenciales inválidas.', 401);
    expect(friendlyApiMessage(err)).toBe('Email o contraseña incorrectos.');
  });

  it('mapea token inválido del backend (no filtra por keyword token)', () => {
    const err = new ApiError('Token inválido.', 401);
    err.sessionExpired = true;
    expect(friendlyApiMessage(err)).toBe('Tu sesión no es válida. Volvé a iniciar sesión.');
  });

  it('mapea sesión expirada cuando no hay detail mapeable', () => {
    const err = new ApiError('Usuario no encontrado.', 404);
    err.sessionExpired = true;
    expect(friendlyApiMessage(err)).toBe('Tu sesión venció. Volvé a iniciar sesión.');
  });

  it('prioriza detail del backend sobre fallback de status', () => {
    const err = new ApiError('Rol no autorizado.', 403);
    expect(friendlyApiMessage(err)).toBe('Tu cuenta no tiene permiso para esta acción.');
  });

  it('pasa through mensajes CABA del backend', () => {
    const detail =
      'Find My Coffee solo opera en Ciudad Autónoma de Buenos Aires (CABA). Las coordenadas indicadas están fuera del área de servicio.';
    const err = new ApiError(detail, 400);
    expect(friendlyApiMessage(err)).toBe(detail);
  });

  it('mensaje amigable para 500 sin detail', () => {
    const err = new ApiError('Error interno', 500);
    expect(friendlyApiMessage(err)).toMatch(/servidor/i);
  });

  it('mensaje amigable para red caída', () => {
    expect(friendlyApiMessage(new TypeError('Failed to fetch'))).toMatch(/conectar/i);
  });

  it('usa fallback contextual', () => {
    const err = new ApiError('Error 502', 502);
    expect(friendlyApiMessage(err, 'No pudimos cargar el mapa.')).toMatch(/servidor|mapa/i);
  });

  it('traduce archivo vacío', () => {
    const err = new ApiError('Archivo vacío.', 400);
    expect(friendlyApiMessage(err)).toBe('Elegí una imagen antes de subir.');
  });
});
