# Find My Coffee — Frontend 

SPA **React 18 + Vite** para descubrir cafeterías en **CABA**, integrada con el API [`fmcbackend`](../fmcbackend).

**Documentación ampliada:** [`Documentation/README.md`](./Documentation/README.md)

## Requisitos

- Node.js 18+
- API FMC en marcha (`make up` en `fmcbackend`, puerto **5214** por defecto)

## Instalación y desarrollo

```bash
npm install --legacy-peer-deps   # react-leaflet@4 + React 18
cp .env.example .env             # VITE_API_URL vacío en dev (proxy Vite)
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173).

El proxy de Vite reenvía `/api` → `http://127.0.0.1:5214` (`vite.config.js`). Si el backend usa otro puerto, ajustá el `target` o definí `VITE_API_URL` con la URL absoluta del API.

## Stack

| Tecnología | Uso |
|------------|-----|
| Vite 8 | bundler y dev server |
| React 18 | UI |
| React Router 6 | rutas |
| Tailwind CSS 3 | estilos |
| Leaflet + react-leaflet 4 | mapa (tiles CARTO/OSM, sin API key) |
| Lucide React | iconos |

## Cuentas demo (backend seed)

Contraseña común: **`SeedPass-123`**. Tabla completa y listado de locales en [`fmcbackend/README.md`](../fmcbackend/README.md#seed-demo-bd-vacía-tras-migraciones).

| Rol | Email | Password |
|-----|--------|----------|
| Consumidor Free | `consumidor@seed.fmc` | `SeedPass-123` |
| Consumidor Premium | `consumidor-premium@seed.fmc` | `SeedPass-123` |
| Enterprise Premium (Palermo) | `enterprise-premium@seed.fmc` | `SeedPass-123` |
| Enterprise Standard (San Telmo) | `enterprise-standard@seed.fmc` | `SeedPass-123` |
| Enterprise Premium (Recoleta) | `enterprise-recoleta@seed.fmc` | `SeedPass-123` |
| Enterprise Standard (Caballito) | `enterprise-caballito@seed.fmc` | `SeedPass-123` |

En login elegí pestaña **Consumidor** o **Negocio** según el rol. Otros enterprise del catálogo: `enterprise-{barrio}@seed.fmc` (misma contraseña).

## Rutas

| Ruta | Descripción | Auth |
|------|-------------|------|
| `/` | Landing | — |
| `/login` | Login consumidor o negocio | — |
| `/register` | Registro consumidor | — |
| `/register-business` | Alta Enterprise + cafetería | — |
| `/explore` | Listado desde `/api/cafeterias/nearby` | — |
| `/map` | Mapa interactivo + listado lateral | — |
| `/cafe/:id` | Detalle (datos del listado cargado) | — |
| `/profile` | Tier consumidor, plan Premium | consumidor |
| `/favorites` | Favoritos locales | consumidor |
| `/enterprise` | Panel cafetería propia | enterprise |

## Qué está integrado vs placeholder

| Funcionalidad | Estado |
|---------------|--------|
| Auth JWT (consumer / enterprise) | API real |
| Listado y mapa `/nearby` | API real |
| Perfil consumidor, tier Premium | API real |
| Panel Enterprise (datos + plan) | API real |
| Favoritos | solo `localStorage` |
| Menú, reseñas, ratings en detalle | UI placeholder / vacío |
| Imágenes de cafeterías | Unsplash estático en mapper |

## Scripts

```bash
npm run dev      # desarrollo
npm run build    # producción → dist/
npm run preview  # servir dist/
```

## Estructura (resumen)

```
src/
├── api/              # llamadas REST por dominio
├── components/       # Navbar, mapa, cards…
├── context/          # AuthContext, CafeteriasContext
├── lib/              # apiClient, authStorage, mapper, geo, mapCoffeeIcon
├── pages/            # vistas por ruta
└── App.jsx           # router + layouts
```

Detalle en [`Documentation/02-structure-and-routing.md`](./Documentation/02-structure-and-routing.md).

## Enlace con backend

- Contrato REST: [`fmcbackend/Documentation/03-api-rest.md`](../fmcbackend/Documentation/03-api-rest.md)
- Reglas CABA, tiers, exclusión Enterprise en mapa: [`fmcbackend/Documentation/04-business-rules.md`](../fmcbackend/Documentation/04-business-rules.md)
