# 04 — Páginas y funcionalidades

> **Última verificación:** 2026-06-09  
> **Fuente de verdad:** `src/pages/*`, `src/components/Navbar.jsx`

## Home (`/`)

Landing con enlaces a explorar, mapa y registro. Cafeterías cercanas desde contexto.

## Login (`/login`)

- Pestañas **Consumidor** / **Negocio**.
- Éxito: consumidor → `/explore`; enterprise → `/enterprise`.
- Errores vía `friendlyApiMessage`.

## Register / Register business

- **Register:** `consumerRegister` → sesión automática + sync favoritos.
- **Register business:** payload con nombre cafetería, dirección, coords; validación CABA en front (`lib/caba.js`).

## Explore (`/explore`)

- Datos: `useCafeterias()`.
- Filtros **solo en cliente:** búsqueda texto, orden distancia/nombre, «Solo Enterprise Premium», «Con descuento» (solo consumer Premium), radio km.
- Panel y chips de filtros con variantes `dark:`.
- Muestra radio aplicado (`meta.appliedRadiusKm`) y tier viewer si viene del API.
- **No** re-ordena por boost Enterprise (respeta orden del backend).

## MapView (`/map`)

- Panel lateral: lista filtrable + botón Actualizar + `BackNavLink`.
- Mapa: `CafeteriasMap` (ver doc 05).
- Leyenda: azul = usuario; tazas = cafeterías; ámbar = Enterprise Premium.

## CafeDetail (`/cafe/:id`)

- Resuelve cafetería desde cache del contexto (`getCafeById`).
- Si el ID no está en la lista cargada → «no encontrada» (no hay GET por id en API).
- Favorito: heart → `toggleFavorite` (local + API).
- Reseñas CRUD, galería enterprise, cupones semanales + PDF (consumer Premium).
- Badge Enterprise Premium en ficha.

## Profile (`/profile`)

- Consumidor: `displayName`, avatar, tier Premium/checkout.
- Sección favoritos: `GET /me/favorites` (preview); enlace a `/favorites`.
- `BackNavLink` para volver.

## Favorites (`/favorites`)

- `GET /api/consumer/me/favorites` al cargar.
- Mapper `favoriteMapper.js`; descuentos solo si `user.premium`.
- `BackNavLink` fallback `/explore`.

## EnterpriseDashboard (`/enterprise`)

- `GET /me` vía contexto `user.cafeteria`; avatar con `ProfileAvatarEditor`.
- Métricas `GET /me/stats` — «Guardados por usuarios» (conteo server-side).
- Cupones semanales CRUD si plan Premium.
- Formulario edición → `PUT /me`; plan → checkout o `PATCH /subscription-tier`.
- Errores de métricas/cupones en avisos ámbar (no banner rojo de sesión).

## PaymentCheckout (`/checkout/*`)

- Simula pago; activa tier vía contexto.
- Beneficios alineados a reglas de negocio (cupones, visibilidad).
- `BackNavLink` al panel/perfil según plan.

## Navbar

- Enlaces según rol (favoritos / mi cafetería / Premium).
- **«Hola, {nombre}»** + avatar si existe.
- Menú desplegable con `dark:`.

## Componentes compartidos

| Componente | Uso |
|------------|-----|
| `CafeteriaCard` | cards Explore/Home; badge Enterprise Premium |
| `ProfileAvatarEditor` | perfil consumidor y panel enterprise |
| `BackNavLink` | navegación volver (historial / `returnTo`) |
| `CafeCoverImage` | portadas con fallback local |
