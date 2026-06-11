import { describe, expect, it } from 'vitest';
import { ApiError } from './apiClient';
import { friendlyApiMessage } from './userFacingError';

describe('friendlyApiMessage', () => {
  it('mapea credenciales inválidas', () => {
    const err = new ApiError('Credenciales inválidas.', 401);
    expect(friendlyApiMessage(err)).toBe('Email o contraseña incorrectos.');
  });

  it('mapea sesión expirada', () => {
    const err = new ApiError('Usuario no encontrado.', 404);
    err.sessionExpired = true;
    expect(friendlyApiMessage(err)).toBe('Tu sesión venció. Volvé a iniciar sesión.');
  });

  it('mensaje amigable para 500', () => {
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
