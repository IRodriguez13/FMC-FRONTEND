# Tests unitarios — FMC Frontend

> **Última verificación:** 2026-06-11  
> **Fuente de verdad:** `vitest.config.js`, `src/**/*.test.js`

## Stack

- **Vitest** 3.x (`npm test`)
- Entorno **node** (sin DOM; tests de utilidades puras)

## Suites

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

- Lógica de mapeo y URLs de medios (regresiones de fotos seed y descuentos en UI).
- **No** incluye aún tests de componentes React (Login, Profile, etc.).

## CI sugerido

```bash
npm install --legacy-peer-deps
npm test
npm run build
```
