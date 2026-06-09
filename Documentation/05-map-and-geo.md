# 05 — Mapa y geolocalización

> **Última verificación:** 2026-06-02  
> **Fuente de verdad:** `src/components/CafeteriasMap.jsx`, `src/lib/mapCoffeeIcon.js`, `src/lib/geolocation.js`

## Geolocalización (`lib/geolocation.js`)

1. Intenta `navigator.geolocation.getCurrentPosition`.
2. Si falla o deniega permiso → coords **Obelisco** (`CABA.center` en `lib/caba.js`).
3. Backend exige query en CABA; fallback evita `/nearby` vacío por coords fuera de área.

## CafeteriasMap

- **Montaje:** solo en cliente (`mounted` state) para evitar SSR/hydration con Leaflet.
- **Tiles:** CARTO Voyager (`basemaps.cartocdn.com`) — gratis, atribución en mapa.
- **Contenedor:** `.fmc-map-shell` con altura explícita (`index.css`); sin esto el mapa queda gris.

### Marcadores

| Elemento | Representación |
|----------|----------------|
| Usuario | `CircleMarker` azul |
| Cafetería Standard | taza marrón (`mapCoffeeIcon.js`) |
| Cafetería Enterprise Premium | taza **ámbar/dorada** |
| Seleccionada | escala ~1.12 + sombra |

Iconos: `L.divIcon` con SVG inline (estilo taza con vapor, referencia visual tipo Java).

Implementación cacheada: 4 variantes premium × selected en `getCoffeeMapIcon()`.

### Comportamiento

- `FitBounds`: ajusta vista a cafés + usuario.
- `FlyToSelected`: centra al elegir en lista lateral.
- Click marcador → `onSelect(cafe)`; popup con link a `/cafe/:id`.

## react-leaflet

- Versión **4.2.1** — instalar con `npm install --legacy-peer-deps`.
- Importar `leaflet/dist/leaflet.css` en el componente mapa.

## Enterprise en el mapa

Con JWT enterprise, `/nearby` **no incluye** la cafetería propia; el mapa muestra solo competidores (3 de 4 seeds si hay 4 locales demo).
