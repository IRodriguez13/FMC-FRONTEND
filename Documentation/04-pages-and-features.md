# 04 — Páginas y funcionalidades

> **Última verificación:** 2026-06-02  
> **Fuente de verdad:** `src/pages/*`, `src/components/Navbar.jsx`

## Home (`/`)

Landing con enlaces a explorar, mapa y registro. Sin datos dinámicos del API.

## Login (`/login`)

- Pestañas **Consumidor** / **Negocio**.
- Éxito: consumidor → `/explore`; enterprise → `/enterprise`.
- Errores vía `ApiError.message`.

## Register / Register business

- **Register:** `consumerRegister` → sesión automática.
- **Register business:** payload con nombre cafetería, dirección, coords; validación CABA en front (`lib/caba.js`) alineada al backend.

## Explore (`/explore`)

- Datos: `useCafeterias()`.
- Filtros **solo en cliente:** búsqueda texto, orden distancia/nombre, toggle «solo Premium Enterprise».
- Muestra radio aplicado (`meta.appliedRadiusKm`) y tier viewer si viene del API.
- **No** re-ordena por boost Enterprise (respeta orden del backend).

## MapView (`/map`)

- Panel lateral: lista filtrable + botón Actualizar.
- Mapa: `CafeteriasMap` (ver doc 05).
- Leyenda: azul = usuario; tazas = cafeterías; ámbar = Enterprise Premium.

## CafeDetail (`/cafe/:id`)

- Resuelve cafetería desde cache del contexto (`getCafeById`).
- Si el ID no está en la lista cargada → «no encontrada» (no hay GET por id en API).
- Favorito: heart → `toggleFavorite` (localStorage).
- Menú / reseñas: arrays vacíos o placeholder del mapper.

## Profile (`/profile`)

- Consumidor autenticado: muestra tier; acción simular upgrade Premium → `PATCH /tier` + JWT nuevo.

## Favorites (`/favorites`)

- Filtra `cafes` del contexto por IDs favoritos.
- Requiere haber cargado nearby al menos una vez.

## EnterpriseDashboard (`/enterprise`)

- `GET /me` vía contexto user.cafeteria.
- Formulario edición → `PUT /me`.
- Cambio plan Standard/Premium → `PATCH /subscription-tier` + token nuevo.

## Navbar

- Enlaces según rol (favoritos / mi cafetería).
- **«Hola, {nombre}»** arriba a la derecha; tooltip email.
- Menú desplegable: perfil, logout.
- Durante `authLoading`: «Hola…» si hay token.

## Componentes compartidos

| Componente | Uso |
|------------|-----|
| `CafeteriaCard` | cards en Explore / Home |
| `StarRating` | decorativo; sin datos API |
| `AuthBackLink` | volver al home en pantallas auth |
