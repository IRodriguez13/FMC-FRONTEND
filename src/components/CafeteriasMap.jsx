import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { CABA } from '../lib/caba';
import { getCoffeeMapIcon } from '../lib/mapCoffeeIcon';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import OwnCafeteriaBadge from './OwnCafeteriaBadge';
import { isOwnEnterpriseCafeteria } from '../lib/ownCafeteria';
import {
  ROUTE_TRANSITION_END_EVENT,
  ROUTE_TRANSITION_START_EVENT,
  isRouteSlideActive,
} from '../lib/routeTransition';
import 'leaflet/dist/leaflet.css';

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function MapReady({ onReady }) {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => {
      map.invalidateSize();
    };
    const t = window.setTimeout(invalidate, 100);
    window.addEventListener(ROUTE_TRANSITION_END_EVENT, invalidate);
    window.addEventListener('resize', invalidate);
    onReady?.();
    return () => {
      window.clearTimeout(t);
      window.removeEventListener(ROUTE_TRANSITION_END_EVENT, invalidate);
      window.removeEventListener('resize', invalidate);
    };
  }, [map, onReady]);
  return null;
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) {
      map.setView([CABA.center.lat, CABA.center.lng], 13);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15 });
  }, [map, points]);
  return null;
}

function FlyToSelected({ cafe }) {
  const map = useMap();
  useEffect(() => {
    if (cafe?.lat == null || cafe?.lng == null) return;
    map.flyTo([cafe.lat, cafe.lng], 16, { duration: 0.45 });
  }, [map, cafe?.id, cafe?.lat, cafe?.lng]);
  return null;
}

function CafeteriasMapInner({
  cafes,
  userCoords,
  selectedId,
  selectedCafe,
  onSelect,
  className,
}) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const tileUrl = isDark ? TILE_DARK : TILE_LIGHT;

  const cafePoints = useMemo(
    () =>
      cafes
        .filter((c) => c.lat != null && c.lng != null)
        .map((c) => [c.lat, c.lng]),
    [cafes]
  );

  const allPoints = useMemo(() => {
    const pts = [...cafePoints];
    if (userCoords?.lat != null && userCoords?.lng != null) {
      pts.push([userCoords.lat, userCoords.lng]);
    }
    return pts;
  }, [cafePoints, userCoords]);

  const center = userCoords
    ? [userCoords.lat, userCoords.lng]
    : cafePoints[0] || [CABA.center.lat, CABA.center.lng];

  return (
    <MapContainer
      center={center}
      zoom={13}
      className={className}
      scrollWheelZoom
      style={{ height: '100%', width: '100%', minHeight: 320 }}
    >
      <TileLayer url={tileUrl} attribution={TILE_ATTRIBUTION} />
      <MapReady />
      <FitBounds points={allPoints} />
      <FlyToSelected cafe={selectedCafe} />

      {userCoords && (
        <CircleMarker
          center={[userCoords.lat, userCoords.lng]}
          radius={10}
          pathOptions={{
            color: '#1d4ed8',
            fillColor: '#3b82f6',
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Popup>
            <span className="font-body text-sm font-semibold text-coffee-800">Tu ubicación</span>
          </Popup>
        </CircleMarker>
      )}

      {cafes.map((cafe) => {
        if (cafe.lat == null || cafe.lng == null) return null;
        const selected = selectedId === cafe.id;
        const premium = cafe.subscriptionTier === 'Premium';
        const isOwn = isOwnEnterpriseCafeteria(user, cafe.id);
        return (
          <Marker
            key={cafe.id}
            position={[cafe.lat, cafe.lng]}
            icon={getCoffeeMapIcon({ premium, selected })}
            eventHandlers={{
              click: () => onSelect?.(cafe),
            }}
          >
            <Popup>
              <div className="font-body text-sm min-w-[160px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-semibold text-coffee-800">{cafe.name}</p>
                  {isOwn && <OwnCafeteriaBadge />}
                </div>
                {premium && (
                  <p className="text-amber-700 text-xs font-semibold mt-0.5">Enterprise Premium</p>
                )}
                <p className="text-coffee-500 text-xs mt-0.5">{cafe.address}</p>
                <p className="text-coffee-600 text-xs mt-1">
                  {cafe.distance < 1000
                    ? `${cafe.distance} m`
                    : `${(cafe.distance / 1000).toFixed(1)} km`}
                </p>
                {user?.premium && cafe.discountPercent != null && (
                  <p className="text-amber-700 text-xs font-semibold mt-1">
                    Descuento Premium {cafe.discountPercent}%
                  </p>
                )}
                <Link
                  to={`/cafe/${cafe.id}`}
                  className="inline-block mt-2 text-coffee-700 font-semibold text-xs hover:underline"
                >
                  Ver detalle →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

/** Mapa OpenStreetMap + Leaflet (100% gratis, sin API key). */
export default function CafeteriasMap(props) {
  const [clientReady, setClientReady] = useState(false);
  const [leafletReady, setLeafletReady] = useState(() => !isRouteSlideActive());

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    const hideLeaflet = () => setLeafletReady(false);
    const showLeaflet = () => setLeafletReady(true);

    window.addEventListener(ROUTE_TRANSITION_START_EVENT, hideLeaflet);
    window.addEventListener(ROUTE_TRANSITION_END_EVENT, showLeaflet);
    if (!isRouteSlideActive()) setLeafletReady(true);

    return () => {
      window.removeEventListener(ROUTE_TRANSITION_START_EVENT, hideLeaflet);
      window.removeEventListener(ROUTE_TRANSITION_END_EVENT, showLeaflet);
    };
  }, []);

  if (!clientReady || !leafletReady) {
    return (
      <div className="fmc-map-shell flex items-center justify-center bg-cream-200 dark:bg-coffee-800 font-body text-coffee-600 dark:text-coffee-300 text-sm">
        Inicializando mapa…
      </div>
    );
  }

  return (
    <div className="fmc-map-shell">
      <CafeteriasMapInner {...props} className="fmc-map-leaflet" />
    </div>
  );
}
