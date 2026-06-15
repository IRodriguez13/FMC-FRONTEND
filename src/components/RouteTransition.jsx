import { useEffect, useRef, useState } from 'react';
import {
  ROUTE_TRANSITION_MS,
  getRouteDirection,
  notifyRouteSlideEnd,
  notifyRouteSlideStart,
  prefersReducedRouteMotion,
} from '../lib/routeTransition';

function finishTransition(setLeaving, setActive, location, children, prevRouteRef, prevNodeRef) {
  setLeaving(null);
  setActive({
    key: location.key,
    pathname: location.pathname,
    node: children,
    entering: false,
  });
  prevRouteRef.current = { key: location.key, pathname: location.pathname };
  prevNodeRef.current = children;
  notifyRouteSlideEnd();
}

/**
 * Slide horizontal entre rutas. La animación va en una capa interna para no romper layout/Leaflet.
 */
export default function RouteTransition({ location, children, variant = 'slide' }) {
  const reduced = prefersReducedRouteMotion();
  const mounted = useRef(false);
  const prevRouteRef = useRef({ key: location.key, pathname: location.pathname });
  const prevNodeRef = useRef(children);
  const timerRef = useRef(null);
  const [leaving, setLeaving] = useState(null);
  const [direction, setDirection] = useState('forward');
  const [active, setActive] = useState({
    key: location.key,
    pathname: location.pathname,
    node: children,
    entering: false,
  });

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!mounted.current) {
      mounted.current = true;
      prevRouteRef.current = { key: location.key, pathname: location.pathname };
      prevNodeRef.current = children;
      setActive({ key: location.key, pathname: location.pathname, node: children, entering: false });
      return;
    }

    if (location.key === prevRouteRef.current.key) {
      prevNodeRef.current = children;
      setActive((prev) => (prev.node === children ? prev : { ...prev, node: children }));
      return;
    }

    const fromPath = prevRouteRef.current.pathname;
    const fromKey = prevRouteRef.current.key;
    const leavingNode = prevNodeRef.current;
    const dir = getRouteDirection(fromPath, location.pathname);
    const instant = reduced || variant === 'fade';

    if (instant) {
      setLeaving(null);
      setActive({
        key: location.key,
        pathname: location.pathname,
        node: children,
        entering: variant === 'fade',
      });
      prevRouteRef.current = { key: location.key, pathname: location.pathname };
      prevNodeRef.current = children;
      if (variant === 'fade') {
        notifyRouteSlideStart();
        timerRef.current = window.setTimeout(() => {
          finishTransition(setLeaving, setActive, location, children, prevRouteRef, prevNodeRef);
        }, 280);
      } else {
        window.requestAnimationFrame(() => notifyRouteSlideEnd());
      }
      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
      };
    }

    notifyRouteSlideStart();
    setDirection(dir);
    setLeaving({ key: fromKey, node: leavingNode });
    setActive({
      key: location.key,
      pathname: location.pathname,
      node: children,
      entering: true,
    });

    timerRef.current = window.setTimeout(() => {
      finishTransition(setLeaving, setActive, location, children, prevRouteRef, prevNodeRef);
    }, ROUTE_TRANSITION_MS);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [location.key, location.pathname, children, reduced, variant]);

  const enterClass =
    variant === 'fade'
      ? 'route-fade-in'
      : direction === 'forward'
        ? 'route-enter-forward'
        : 'route-enter-back';

  const leaveClass =
    direction === 'forward' ? 'route-exit-forward' : 'route-exit-back';

  return (
    <div className={`route-stage${leaving ? ' route-stage--transitioning' : ''}`}>
      {leaving && (
        <div
          className={`route-panel route-panel--leaving ${leaveClass}`}
          aria-hidden="true"
        >
          {leaving.node}
        </div>
      )}
      <div className="route-panel route-panel--active">
        <div className={`route-slide ${active.entering ? enterClass : ''}`}>
          {active.node}
        </div>
      </div>
    </div>
  );
}
