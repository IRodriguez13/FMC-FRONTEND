/** Orden lógico de tabs/nav para inferir dirección del slide. */
const ROUTE_ORDER = {
  '/': 0,
  '/explore': 10,
  '/enterprise': 15,
  '/map': 20,
  '/favorites': 25,
  '/demo': 30,
  '/profile': 35,
  '/terms': 40,
};

function normalizePath(pathname) {
  if (pathname.startsWith('/cafe/')) return '/cafe';
  if (pathname.startsWith('/checkout/')) return '/checkout';
  return pathname;
}

export function isMapRoute(pathname) {
  return pathname === '/map';
}

let routeSlideActive = false;

export function isRouteSlideActive() {
  return routeSlideActive;
}

function setRouteSlideActive(active) {
  routeSlideActive = active;
}

export const ROUTE_TRANSITION_START_EVENT = 'fmc-route-transition-start';

function routeIndex(pathname) {
  const key = normalizePath(pathname);
  if (ROUTE_ORDER[key] !== undefined) return ROUTE_ORDER[key];
  if (key === '/cafe') return 12;
  if (key === '/checkout') return 45;
  return null;
}

/** 'forward' = nueva pantalla entra desde la derecha; 'back' = desde la izquierda. */
export function getRouteDirection(fromPath, toPath) {
  const fromIdx = routeIndex(fromPath);
  const toIdx = routeIndex(toPath);

  if (fromIdx != null && toIdx != null && fromIdx !== toIdx) {
    return toIdx > fromIdx ? 'forward' : 'back';
  }

  if (normalizePath(toPath) === '/cafe') return 'forward';
  if (normalizePath(fromPath) === '/cafe') return 'back';

  return 'forward';
}

export function prefersReducedRouteMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const ROUTE_TRANSITION_MS = 400;

export const ROUTE_TRANSITION_END_EVENT = 'fmc-route-transition-end';

export function notifyRouteSlideStart() {
  setRouteSlideActive(true);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ROUTE_TRANSITION_START_EVENT));
  }
}

export function notifyRouteSlideEnd() {
  setRouteSlideActive(false);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ROUTE_TRANSITION_END_EVENT));
  }
}
