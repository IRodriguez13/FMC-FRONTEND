# 01 — Visión general (frontend)

> **Última verificación:** 2026-06-02  
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
- **Enterprise logueado:** el backend excluye su propia cafetería del listado (solo competencia).
- **Favoritos:** persistencia local; no hay endpoint.

## Fuera de alcance (estado actual)

- Reseñas, menú y ratings reales (detalle muestra placeholders).
- Verificación de email real (si hay UI de código, es mock).
- Sincronización de favoritos con servidor.
- PWA / SSR.

## Variables de entorno

| Variable | Dev | Producción |
|----------|-----|------------|
| `VITE_API_URL` | vacío (proxy) | URL absoluta del API |

Ver `.env.example`.
