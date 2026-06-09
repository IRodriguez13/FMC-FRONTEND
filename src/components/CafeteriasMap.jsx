import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { CABA } from '../lib/caba';
import { getCoffeeMapIcon } from '../lib/mapCoffeeIcon';
import 'leaflet/dist/leaflet.css';

/** Carto Voyager — estilo claro, gratis para demos (atribución en mapa). */
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function MapReady({ onReady }) {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => {
      map.invalidateSize();
      onReady?.();
    }, 100);
    return () => window.clearTimeout(t);
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
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
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
                <p className="font-semibold text-coffee-800">{cafe.name}</p>
                {premium && (
                  <p className="text-amber-700 text-xs font-semibold mt-0.5">Enterprise Premium</p>
                )}
                <p className="text-coffee-500 text-xs mt-0.5">{cafe.address}</p>
                <p className="text-coffee-600 text-xs mt-1">
                  {cafe.distance < 1000
                    ? `${cafe.distance} m`
                    : `${(cafe.distance / 1000).toFixed(1)} km`}
                </p>
                {cafe.discountPercent != null && (
                  <p className="text-amber-700 text-xs font-semibold mt-1">
                    Descuento {cafe.discountPercent}%
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fmc-map-shell flex items-center justify-center bg-cream-200 font-body text-coffee-600 text-sm">
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
