# 01 — Visión general (frontend)

> **Última verificación:** 2026-06-09  
> **Fuente de verdad:** `package.json`, `src/App.jsx`, `README.md`

## Propósito

Cliente web para **Find My Coffee**: explorar cafeterías registradas en **CABA**, autenticarse como consumidor o negocio, ver mapa y gestionar perfil/plan según rol.

## Relación con el backend

- Repo API: **`../fmcbackend`** (mismo nivel que este repo en disco).
- Comunicación: **REST JSON** bajo `/api/*`.
- No usa GraphQL del backend.

## Stack

| Pieza | Versión / nota |
|-------|----------------|
| React | 18.3 |
| Vite | 8.x |
| react-router-dom | 6.x |
| Tailwind | 3.4 |
| leaflet | 1.9 |
| react-leaflet | **4.2.1** (no v5: exige React 19) |
| lucide-react | iconos |

## Principios de la UI actual

- **Una carga de cafeterías** vía `CafeteriasProvider` → `/nearby` con coords del usuario (o fallback Obelisco).
- **JWT** en `localStorage`; rehidratación al F5 con `GET /me` o `GET /enterprise/cafeteria/me`.
- **Enterprise logueado:** ve **todos** los locales en `/nearby`, **incluido el propio** si está activo.
- **Favoritos:** servidor + cache local (`fmc_favorites`); merge al login vía `PUT /me/favorites/sync`.

## Fuera de alcance (estado actual)

- Verificación de email real (si hay UI de código, es mock).
- Pasarela de pago real (checkout simula tier).
- PWA / SSR.

## Incluido en el MVP

- Reseñas y fotos por cafetería (CRUD author-owned).
- Cupones semanales (consumidor Premium + enterprise Premium).
- Métricas enterprise, avatares consumer/enterprise, navegación «volver» inteligente (`BackNavLink`).

## Variables de entorno

| Variable | Dev | Producción |
|----------|-----|------------|
| `VITE_API_URL` | vacío (proxy) | URL absoluta del API |
| `VITE_DEV_API_TARGET` | URL del `make run` backend | — |

Ver `.env.example`.
