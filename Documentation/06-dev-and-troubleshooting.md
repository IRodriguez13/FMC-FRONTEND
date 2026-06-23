# 06 — Desarrollo y troubleshooting

> **Última verificación:** 2026-06-02  
> **Fuente de verdad:** `vite.config.js`, `.env.example`, `package.json`

## Arranque completo

```bash
# Backend
cd ../fmcbackend
make up

# Frontend
cd ../FindMyCoffee-Frontend
npm install --legacy-peer-deps
cp .env.example .env
npm run dev
```

Login prueba: ver tabla en [`fmcbackend/README.md`](../../fmcbackend/README.md#seed-demo-bd-vacía-tras-migraciones) (`consumidor@seed.fmc` / `SeedPass-123`) → `/explore` o `/map` (**22** cafeterías tras `make seed`).

## Proxy y puertos

| Servicio | Puerto default |
|----------|----------------|
| Vite dev | 5173 |
| FMC API | 5214 |

`vite.config.js`:

```js
proxy: { '/api': { target: 'http://127.0.0.1:5214', changeOrigin: true } }
```

Si `make run` elige otro puerto o `FMC_HTTP_PORT` en Docker difiere → actualizar `target` o usar `VITE_API_URL=http://127.0.0.1:PUERTO`.

## Build producción

```bash
npm run build    # dist/
npm run preview  # sirve dist/ local
```

Definir `VITE_API_URL` apuntando al API público (build-time en Vite).

## Problemas frecuentes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Network error / failed fetch | API apagado o puerto mal | `make up`, revisar proxy |
| Lista vacía | BD sin seed o coords fuera CABA | `make reset-db && make up` en backend |
| Logout inesperado al F5 | JWT viejo tras `reset-db` | Login de nuevo; 401/404 limpian sesión |
| Mapa gris | altura 0 en contenedor | CSS `.fmc-map-shell` |
| npm peer conflict react-leaflet | peer React 19 en v5 | usar `react-leaflet@4.2.1` + `--legacy-peer-deps` |
| Detalle «no encontrada» | ID no está en cache nearby | Volver a explore/map; no hay GET por id |
| Enterprise ve 3 locales | exclusión propia | comportamiento esperado |

## Archivo mock legacy

`src/data/cafeterias.js` — datos estáticos antiguos. El flujo principal usa **solo** `CafeteriasContext` + API.

## Tests

No hay suite de tests en el frontend actualmente. Validación manual: login, explore, map, enterprise panel.
