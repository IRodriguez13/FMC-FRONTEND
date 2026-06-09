# 03 — Estado y capa API

> **Última verificación:** 2026-06-02  
> **Fuente de verdad:** `src/context/*`, `src/lib/*`, `src/api/*`

## apiClient (`lib/apiClient.js`)

- Base URL: `import.meta.env.VITE_API_URL` (sin barra final); vacío → rutas relativas `/api/...`.
- Header `Authorization: Bearer` si hay `token`.
- Errores: clase `ApiError` con `status`, `body`.
- **401 / 404:** `err.sessionExpired = true` (token inválido tras reset DB, etc.).

## localStorage (`lib/authStorage.js`)

| Key | Contenido |
|-----|-----------|
| `fmc_token` | JWT |
| `fmc_role` | `consumer` \| `enterprise` |
| `fmc_email` | hint para saludo / hydrate |
| `fmc_favorites` | JSON array de IDs cafetería |

`clearToken()` borra token, role y email (no favoritos).

## AuthContext

**Estado:** `user`, `token`, `authLoading`, `favorites`.

**Flujo login/registro:** auth API → `persistAuth` → hydrate perfil → `setUser`.

**Hydrate al montar (F5):** si hay token, `fetchConsumerProfile` o `fetchEnterpriseCafeteria` con `AbortController`; abort en cleanup (StrictMode).

**Sesión inválida:** solo limpia token si `sessionExpired` (401/404), no en abort.

**Modelo `user` consumidor:** `{ id, email, name, tier, premium, role: 'consumer' }`.

**Modelo `user` enterprise:** `{ id, email, name, cafeteriaId, enterpriseSubscriptionTier, cafeteria, role: 'enterprise' }`.

**API expuesta:** `loginConsumer`, `loginEnterprise`, `register*`, `logout`, `toggleFavorite`, `setConsumerTier`, `saveEnterpriseCafeteria`, `setEnterpriseSubscriptionTier`, `refreshEnterprise`.

## CafeteriasContext

**Estado:** `cafes`, `loading`, `error`, `coords`, `meta`, `radiusKm`.

**Carga:** `getCurrentCoords()` → `fetchNearbyCafeterias({ lat, lng, radiusKm, token, signal })` → `mapNearbyResponse`.

**Token:** se envía siempre que exista (consumer **y** enterprise).

**Refetch:** `refetch(signal)` desde botones «Actualizar».

## Mapper (`lib/cafeteriaMapper.js`)

Convierte `NearbyCafeteriaItem` del backend al modelo UI:

- `distance` ← `distanceMeters`
- `subscriptionTier`, `discountPercent`
- `tags`: «Enterprise Premium/Standard», descuento si aplica
- Imágenes: URLs Unsplash fijas (no vienen del API)

## Módulos API

| Archivo | Endpoints |
|---------|-----------|
| `authApi.js` | `POST /api/auth/consumer/*`, `POST /api/auth/enterprise/*` |
| `discoveryApi.js` | `GET /api/cafeterias/nearby?lat&lng&radiusKm?` |
| `consumerApi.js` | `GET /api/consumer/me`, `PATCH /api/consumer/tier` |
| `enterpriseApi.js` | `GET/PUT /api/enterprise/cafeteria/me`, `PATCH .../subscription-tier` |

Contrato completo: doc backend `03-api-rest.md`.
