# 02 — Estructura y rutas

> **Última verificación:** 2026-06-09  
> **Fuente de verdad:** `src/App.jsx`, árbol `src/`

## Árbol de carpetas

```
src/
├── api/
│   authApi.js
│   consumerApi.js      # perfil, tier, favoritos
│   discoveryApi.js     # GET nearby
│   enterpriseApi.js    # cafetería, stats, cupones, avatar
│   cafeteriaMediaApi.js
├── components/
│   AuthBackLink.jsx    # usa BackNavLink
│   BackNavLink.jsx     # volver inteligente (historial / returnTo)
│   CafeteriaCard.jsx
│   CafeteriasMap.jsx
│   ProfileAvatarEditor.jsx
│   Navbar.jsx
│   StarRating.jsx
├── context/
│   AuthContext.jsx
│   CafeteriasContext.jsx
│   ThemeContext.jsx
├── lib/
│   apiClient.js
│   authStorage.js
│   cafeteriaMapper.js
│   favoriteMapper.js
│   mediaUrl.js
│   userFacingError.js
│   geolocation.js
│   mapCoffeeIcon.js
├── pages/
├── App.jsx
└── main.jsx
```

## Layouts (`App.jsx`)

| Layout | Navbar | Rutas |
|--------|--------|-------|
| `Layout` | sí | `/`, `/explore`, `/map`, `/cafe/:id`, `/profile`, `/favorites`, `/enterprise` |
| `NoNavLayout` | no | `/login`, `/register`, `/register-business`, `/checkout/*` |

## Providers (orden)

```jsx
<ThemeProvider>
  <AuthProvider>
    <CafeteriasProvider>
      <BrowserRouter>…</BrowserRouter>
    </CafeteriasProvider>
  </AuthProvider>
</ThemeProvider>
```

`CafeteriasProvider` depende de `useAuth()` para enviar token en `/nearby`.

## Rutas detalladas

| Path | Componente | Notas |
|------|------------|-------|
| `/` | `Home.jsx` | Landing, CTAs |
| `/login` | `Login.jsx` | Pestaña consumidor / negocio |
| `/register` | `Register.jsx` | Solo consumidor |
| `/register-business` | `RegisterBusiness.jsx` | Alta enterprise + coords CABA |
| `/explore` | `Explore.jsx` | Filtros client-side; chips con `dark:` |
| `/map` | `MapView.jsx` | Mapa + panel lateral + BackNavLink |
| `/cafe/:id` | `CafeDetail.jsx` | Cache nearby; reseñas, cupones, PDF |
| `/profile` | `Profile.jsx` | Tier, avatar, favoritos desde API |
| `/favorites` | `Favorites.jsx` | `GET /me/favorites` + sync al login |
| `/enterprise` | `EnterpriseDashboard.jsx` | Métricas, cupones, avatar, PUT cafetería |
| `/checkout/consumer-premium` | `PaymentCheckout.jsx` | Activar Premium consumidor |
| `/checkout/enterprise-premium` | `PaymentCheckout.jsx` | Activar Premium enterprise |
| `/demo`, `/terms` | onboarding / legales | BackNavLink |
| `*` | `Home.jsx` | fallback |

## Estilos

- Tailwind: `tailwind.config.js`, tokens `coffee`, `cream`, `sand`.
- Dark mode: clase `dark` en `<html>` vía `ThemeContext`.
- Mapa: clases `.fmc-map-shell`, `.fmc-map-leaflet`, `.fmc-map-marker*` en `index.css`.
