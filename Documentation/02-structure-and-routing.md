# 02 — Estructura y rutas

> **Última verificación:** 2026-06-02  
> **Fuente de verdad:** `src/App.jsx`, árbol `src/`

## Árbol de carpetas

```
src/
├── api/
│   authApi.js          # register/login consumer & enterprise
│   consumerApi.js      # perfil, PATCH tier
│   discoveryApi.js     # GET nearby
│   enterpriseApi.js    # cafetería propia, subscription tier
├── components/
│   AuthBackLink.jsx
│   CafeteriaCard.jsx
│   CafeteriasMap.jsx   # Leaflet
│   Logo.jsx
│   Navbar.jsx          # nav + «Hola, {nombre}»
│   StarRating.jsx      # visual; sin API de reviews
├── context/
│   AuthContext.jsx
│   CafeteriasContext.jsx
├── data/
│   cafeterias.js       # legacy mock; no usar en flujo principal
├── lib/
│   apiClient.js
│   authStorage.js
│   caba.js
│   cafeteriaMapper.js
│   geolocation.js
│   mapCoffeeIcon.js
├── pages/              # una vista por ruta principal
├── App.jsx
├── main.jsx
└── index.css           # Tailwind + estilos mapa (.fmc-map-*)
```

## Layouts (`App.jsx`)

| Layout | Navbar | Rutas |
|--------|--------|-------|
| `Layout` | sí | `/`, `/explore`, `/map`, `/cafe/:id`, `/profile`, `/favorites`, `/enterprise` |
| `NoNavLayout` | no | `/login`, `/register`, `/register-business` |

## Providers (orden)

```jsx
<AuthProvider>
  <CafeteriasProvider>
    <BrowserRouter>…</BrowserRouter>
  </CafeteriasProvider>
</AuthProvider>
```

`CafeteriasProvider` depende de `useAuth()` para enviar token en `/nearby`.

## Rutas detalladas

| Path | Componente | Notas |
|------|------------|-------|
| `/` | `Home.jsx` | Landing, CTAs |
| `/login` | `Login.jsx` | Pestaña consumidor / negocio |
| `/register` | `Register.jsx` | Solo consumidor |
| `/register-business` | `RegisterBusiness.jsx` | Alta enterprise + coords CABA |
| `/explore` | `Explore.jsx` | Filtros client-side sobre `cafes` |
| `/map` | `MapView.jsx` | Mapa + panel lateral |
| `/cafe/:id` | `CafeDetail.jsx` | Busca en cache `getCafeById` |
| `/profile` | `Profile.jsx` | Tier Premium simulado |
| `/favorites` | `Favorites.jsx` | IDs en localStorage |
| `/enterprise` | `EnterpriseDashboard.jsx` | PUT cafetería, PATCH plan |
| `*` | `Home.jsx` | fallback |

## Estilos

- Tailwind: `tailwind.config.js`, tokens `coffee`, `cream`, `sand`.
- Mapa: clases `.fmc-map-shell`, `.fmc-map-leaflet`, `.fmc-map-marker*` en `index.css`.
