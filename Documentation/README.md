# Find My Coffee — Documentación frontend

> **Última verificación:** 2026-06-02  
> **Repo:** `FindMyCoffee-Frontend` · **API hermano:** [`../fmcbackend`](../fmcbackend)

Contexto para desarrollo y agentes. Complementa el README de la raíz; no duplica la doc del API salvo lo necesario para la UI.

## Índice

| Archivo | Contenido |
|---------|-----------|
| [01-overview.md](./01-overview.md) | Propósito, stack, límites del MVP UI |
| [02-structure-and-routing.md](./02-structure-and-routing.md) | Carpetas, rutas, layouts |
| [03-state-and-api.md](./03-state-and-api.md) | Contextos, localStorage, capa API |
| [04-pages-and-features.md](./04-pages-and-features.md) | Pantallas y comportamiento |
| [05-map-and-geo.md](./05-map-and-geo.md) | Leaflet, marcadores, geolocalización |
| [06-dev-and-troubleshooting.md](./06-dev-and-troubleshooting.md) | Env, proxy, problemas frecuentes |
| [changelog.md](./changelog.md) | Hitos documentados |

## Backend (fuente de contrato)

| Tema | Doc backend |
|------|-------------|
| Endpoints REST | [`fmcbackend/Documentation/03-api-rest.md`](../../fmcbackend/Documentation/03-api-rest.md) |
| Reglas de negocio | [`fmcbackend/Documentation/04-business-rules.md`](../../fmcbackend/Documentation/04-business-rules.md) |
| Docker, seed, Make | [`fmcbackend/Documentation/06-dev-ops.md`](../../fmcbackend/Documentation/06-dev-ops.md) |

## Política de vigencia

1. **Fuente de verdad:** código en `src/` y contrato del API en `fmcbackend`.
2. Si doc y código difieren → **priorizar código**; actualizar doc solo con OK del mantenedor.
3. Revisar «Última verificación» y `git log` en rutas citadas antes de confiar en contexto antiguo.

## Actualización

Creación o cambios en `Documentation/` requieren **aprobación explícita** del mantenedor por feat (regla global `~/.cursor/rules/ir0-project-documentation.mdc`).
