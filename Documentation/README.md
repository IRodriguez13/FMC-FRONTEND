# FMC Frontend — Documentación

> **Última verificación:** 2026-06-11  
> **Fuente de verdad:** `src/`, `vite.config.js`, `package.json`  
> **Backend acoplado:** [`../fmcbackend`](../fmcbackend) — ver `Documentation/05-frontend-integration.md`

SPA React + Vite para **Find My Coffee** (consumidor y enterprise).

## Arranque

```bash
cd fmcfront
npm install --legacy-peer-deps
npm run dev          # http://localhost:5173
```

Proxy dev: `/api` y `/media` → `VITE_DEV_API_TARGET` (default `http://127.0.0.1:5214`).

## Tests

```bash
npm test             # Vitest, una pasada
npm run test:watch   # modo watch
```

Detalle: [testing.md](./testing.md).

## Rutas principales

| Ruta | Pantalla |
|------|----------|
| `/` | Home (cercanas) |
| `/explore` | Búsqueda + filtros (Premium / con descuento) |
| `/map` | Mapa Leaflet |
| `/cafe/:id` | Detalle (fotos, reseñas, descuento Premium) |
| `/profile` | Perfil consumidor (nombre, avatar; email solo lectura) |
| `/favorites` | Favoritos (`localStorage`) |
| `/checkout/consumer-premium` | Activar plan Premium |
| `/demo` | Onboarding demo |
| `/terms` | Términos |

## Módulos clave

| Archivo | Rol |
|---------|-----|
| `src/lib/mediaUrl.js` | URLs `/media`, normalización seed `.png`→`.jpg` |
| `src/lib/cafeteriaMapper.js` | DTO `/nearby` → modelo UI |
| `src/context/AuthContext.jsx` | JWT, perfil, favoritos, tier |
| `src/context/CafeteriasContext.jsx` | `/nearby`, refetch con token nuevo tras Premium |
| `src/context/ThemeContext.jsx` | Modo claro/oscuro |

## Cuentas seed

Contraseña: `SeedPass-123` — ver tabla en `fmcbackend/Documentation/06-dev-ops.md`.
