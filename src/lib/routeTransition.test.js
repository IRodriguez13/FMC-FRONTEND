import { describe, expect, it } from 'vitest';
import {
  getRouteDirection,
  isMapRoute,
  isRouteSlideActive,
  notifyRouteSlideEnd,
  notifyRouteSlideStart,
} from './routeTransition';

describe('getRouteDirection', () => {
  it('avanza hacia la derecha en orden de nav principal', () => {
    expect(getRouteDirection('/explore', '/map')).toBe('forward');
    expect(getRouteDirection('/map', '/demo')).toBe('forward');
  });

  it('retrocede hacia la izquierda al volver en nav', () => {
    expect(getRouteDirection('/map', '/explore')).toBe('back');
    expect(getRouteDirection('/demo', '/map')).toBe('back');
  });

  it('detalle de cafetería entra como forward', () => {
    expect(getRouteDirection('/explore', '/cafe/abc')).toBe('forward');
  });

  it('salir de detalle vuelve como back', () => {
    expect(getRouteDirection('/cafe/abc', '/explore')).toBe('back');
  });
});

describe('isMapRoute', () => {
  it('detecta la ruta del mapa', () => {
    expect(isMapRoute('/map')).toBe(true);
    expect(isMapRoute('/explore')).toBe(false);
  });
});

describe('route slide lifecycle', () => {
  it('marca slide activo entre start y end', () => {
    expect(isRouteSlideActive()).toBe(false);
    notifyRouteSlideStart();
    expect(isRouteSlideActive()).toBe(true);
    notifyRouteSlideEnd();
    expect(isRouteSlideActive()).toBe(false);
  });
});
