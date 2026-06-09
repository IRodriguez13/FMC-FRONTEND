import L from 'leaflet';

/** Taza estilo Java (con vapor) para marcadores Leaflet. */
function cupSvg(fill, stroke, steam) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%" aria-hidden="true">
    <path d="M8 10c0-1 .8-2 2-2h12c1.2 0 2 1 2 2v1H8v-1z" fill="${steam}" opacity="0.85"/>
    <path d="M10 7c.5-1.2 1.2-2 2-2M16 5c0-1.2.8-2 1.5-2M22 7c-.5-1.2-1.2-2-2-2" fill="none" stroke="${steam}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M8 11h16c1.1 0 2 .9 2 2v8c0 3.3-2.7 6-6 6H12c-3.3 0-6-2.7-6-6v-8c0-1.1.9-2 2-2z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <path d="M24 13h2.5c1.4 0 2.5 1.1 2.5 2.5S27.9 18 26.5 18H24" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
    <ellipse cx="16" cy="11.5" rx="7" ry="1.2" fill="${stroke}" opacity="0.25"/>
  </svg>`;
}

const PALETTE = {
  standard: { fill: '#a67c52', stroke: '#5c3d1e', steam: '#7d5420' },
  premium: { fill: '#f59e0b', stroke: '#b45309', steam: '#d97706' },
};

function buildIcon({ premium, selected }) {
  const palette = premium ? PALETTE.premium : PALETTE.standard;
  const size = selected ? 42 : 36;
  const html = `<div class="fmc-map-marker${premium ? ' fmc-map-marker--premium' : ''}${selected ? ' fmc-map-marker--selected' : ''}" style="width:${size}px;height:${size}px">${cupSvg(palette.fill, palette.stroke, palette.steam)}</div>`;

  return L.divIcon({
    html,
    className: 'fmc-map-marker-wrap',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 6],
  });
}

const cache = new Map();

/** Icono de taza cacheado (4 variantes: standard/premium × selected). */
export function getCoffeeMapIcon({ premium = false, selected = false } = {}) {
  const key = `${premium}-${selected}`;
  if (!cache.has(key)) cache.set(key, buildIcon({ premium, selected }));
  return cache.get(key);
}
