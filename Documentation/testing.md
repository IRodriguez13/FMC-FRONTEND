# Tests unitarios — FMC Frontend

> **Última verificación:** 2026-06-11  
> **Fuente de verdad:** `vitest.config.js`, `src/**/*.test.js`

## Stack

- **Vitest** 3.x (`npm test`) — utilidades puras (node)
- **Playwright** (`npm run test:e2e`) — flujos E2E en navegador (requiere API levantada)

## E2E (Playwright)

**Prerrequisito:** backend en el mismo puerto que `VITE_DEV_API_TARGET` (por defecto `http://127.0.0.1:5214`):

```bash
cd ../fmcbackend && make run
```

En otra terminal:

```bash
npm run test:e2e          # headless
npm run test:e2e:ui       # modo interactivo
npm run test:e2e:report   # último reporte HTML
```

Variables opcionales: `FMC_API_URL`, `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_PORT` (por defecto **5193**, para no chocar con otro Vite en 5173).

Suites en `e2e/`: rutas públicas, login/logout, consumidor (explore, perfil, detalle, cupón, checkout), enterprise y mapa.

## Suites unitarias

| Archivo | Cubre |
|---------|--------|
| `src/lib/mediaUrl.test.js` | `resolveMediaUrl`, normalización seed PNG→JPG, proxy dev |
| `src/lib/cafeteriaMapper.test.js` | `mapNearbyItem`, `mapNearbyResponse`, descuentos, cover |
| `src/lib/userFacingError.test.js` | Mensajes de error orientados al usuario |

## Comandos

```bash
npm test
npm run test:watch
```

## Alcance actual

- Lógica de mapeo, cupones, URLs de medios y mensajes de error (Vitest).
- Flujos E2E: login consumidor/enterprise, explore, detalle cafetería, cupón Premium, CTA upgrade, perfil, favoritos, checkout, mapa.
- **No** incluye aún tests de componentes React aislados (Testing Library).

## CI sugerido

```bash
npm install --legacy-peer-deps
npx playwright install chromium
npm test
npm run build
# Con API en CI (job service o script):
npm run test:e2e
```
