# FMC Frontend — Documentación

> **Última verificación:** 2026-06-09  
> **Fuente de verdad:** `src/`, `vite.config.js`, `package.json`  
> **Backend acoplado:** [`../fmcbackend`](../fmcbackend) — ver `Documentation/05-frontend-integration.md`

SPA React + Vite para **Find My Coffee** (consumidor y enterprise).

## Arranque

```bash
cd fmcfront
npm install --legacy-peer-deps
npm run dev          # http://localhost:5173
```

**Importante:** en `.env` definí `VITE_DEV_API_TARGET` con el **mismo puerto** que muestra `make run` (ej. `http://127.0.0.1:5214`). El front usa proxy para `/api` y `/media` en dev.

## Tests

```bash
npm test             # Vitest, una pasada
npm run test:watch   # modo watch
```

Detalle: [testing.md](./testing.md).

Historial de feats: [changelog.md](./changelog.md).

## Rutas principales

| Ruta | Pantalla |
|------|----------|
| `/` | Home (cercanas) |
| `/explore` | Búsqueda + filtros (Premium / con descuento) |
| `/map` | Mapa Leaflet |
| `/cafe/:id` | Detalle (fotos, reseñas, cupones, PDF) |
| `/profile` | Perfil consumidor (nombre, avatar; favoritos API) |
| `/favorites` | Favoritos (`GET /me/favorites` + cache local) |
| `/enterprise` | Panel negocio (métricas, cupones, avatar) |
| `/checkout/consumer-premium` | Activar plan Premium consumidor |
| `/checkout/enterprise-premium` | Activar plan Premium enterprise |
| `/demo` | Onboarding demo |
| `/terms` | Términos |

## Módulos clave

| Archivo | Rol |
|---------|-----|
| `src/lib/mediaUrl.js` | URLs `/media`, normalización seed `.png`→`.jpg` |
| `src/lib/cafeteriaMapper.js` | DTO `/nearby` → modelo UI |
| `src/lib/favoriteMapper.js` | DTO favoritos → tarjeta |
| `src/lib/userFacingError.js` | Errores API → copy UX |
| `src/context/AuthContext.jsx` | JWT, perfil, favoritos híbridos, tier |
| `src/context/CafeteriasContext.jsx` | `/nearby`, refetch con token nuevo tras Premium |
| `src/context/ThemeContext.jsx` | Modo claro/oscuro |

## Cuentas seed

Contraseña: `SeedPass-123` — ver tabla en `fmcbackend/Documentation/06-dev-ops.md`.

Enterprise Palermo y Recoleta incluyen **avatar demo** tras seed/migrate.
