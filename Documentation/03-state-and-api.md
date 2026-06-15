# 03 — Estado y capa API

> **Última verificación:** 2026-06-09  
> **Fuente de verdad:** `src/context/*`, `src/lib/*`, `src/api/*`

## apiClient (`lib/apiClient.js`)

- Base URL: `import.meta.env.VITE_API_URL` (sin barra final); vacío → rutas relativas `/api/...` (proxy Vite).
- Header `Authorization: Bearer` si hay `token`.
- Errores: clase `ApiError` con `status`, `body`.
- **`sessionExpired`:** solo en **401**, o **404** con `detail` de auth (`Usuario no encontrado.`, `Cuenta enterprise no encontrada.`, `Token inválido.`). Un 404 de ruta/recurso **no** implica sesión vencida.

## localStorage (`lib/authStorage.js`)

| Key | Contenido |
|-----|-----------|
| `fmc_token` | JWT |
| `fmc_role` | `consumer` \| `enterprise` |
| `fmc_email` | hint para saludo / hydrate |
| `fmc_favorites` | JSON array de IDs cafetería (**cache offline**) |
| `fmc-theme` | `light` \| `dark` |

`clearToken()` borra token, role y email (no favoritos ni tema).

## Favoritos (modelo híbrido)

1. **UI inmediata:** `toggleFavorite` actualiza estado React + `fmc_favorites`.
2. **Servidor:** `PUT/DELETE /api/consumer/me/favorites/{id}` si hay JWT consumer.
3. **Login / hydrate:** `mergeFavoriteIds` → `PUT /me/favorites/sync` con IDs locales; resultado autoritativo en memoria + localStorage.
4. **Página `/favorites`:** `GET /me/favorites` (no depende solo del cache `/nearby`).

## AuthContext

**Estado:** `user`, `token`, `authLoading`, `favorites`.

**Flujo login/registro:** auth API → `persistAuth` → hydrate perfil → `mergeFavoriteIds` (consumer) → `setUser`.

**Hydrate al montar (F5):** si hay token, `fetchConsumerProfile` o `fetchEnterpriseCafeteria` con `AbortController`; abort en cleanup (StrictMode).

**Sesión inválida:** solo limpia token si `sessionExpired`, no en abort.

**Modelo `user` consumidor:** `{ id, email, name, avatarUrl, tier, premium, role: 'consumer' }`.

**Modelo `user` enterprise:** `{ id, email, name, avatarUrl, cafeteriaId, enterpriseSubscriptionTier, cafeteria, role: 'enterprise' }`.

**API expuesta:** `loginConsumer`, `loginEnterprise`, `register*`, `logout`, `toggleFavorite`, `setConsumerTier`, `saveConsumerProfile`, `saveConsumerAvatar`, `saveEnterpriseCafeteria`, `setEnterpriseSubscriptionTier`, `saveEnterpriseAvatar`, etc.

## CafeteriasContext

**Estado:** `cafes`, `loading`, `error`, `coords`, `meta`, `radiusKm`.

**Carga:** `getCurrentCoords()` → `fetchNearbyCafeterias({ lat, lng, radiusKm, token, signal })` → `mapNearbyResponse`.

**Token:** se envía siempre que exista (consumer **y** enterprise).

**Descuentos en tags:** `showDiscounts: user?.role === 'consumer' && user?.premium`.

**Refetch:** `refetch(signal)` desde botones «Actualizar» o tras cambio de tier Premium.

## Mapper (`lib/cafeteriaMapper.js`)

Convierte `NearbyCafeteriaItem` del backend al modelo UI:

- `distance` ← `distanceMeters`
- `subscriptionTier`, `discountPercent`
- `tags`: «Enterprise Premium/Standard», `% off` solo si `showDiscounts`
- Imágenes: `coverImageUrl` vía `resolveMediaUrl` (`lib/mediaUrl.js`)

## Módulos API

| Archivo | Endpoints |
|---------|-----------|
| `authApi.js` | `POST /api/auth/consumer/*`, `POST /api/auth/enterprise/*` |
| `discoveryApi.js` | `GET /api/cafeterias/nearby?lat&lng&radiusKm?` |
| `consumerApi.js` | perfil, avatar, tier, favoritos |
| `enterpriseApi.js` | cafetería, avatar, stats, cupones, subscription-tier |
| `cafeteriaMediaApi.js` | fotos y reseñas por cafetería |

Contrato completo: doc backend `03-api-rest.md`.

## Errores UX (`lib/userFacingError.js`)

Mapa opcional `detail` backend → copy legible. Ver `.cursor/rules/fmc-api-errors.mdc`.
