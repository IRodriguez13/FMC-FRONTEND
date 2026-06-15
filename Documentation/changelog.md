# Changelog — FMC Frontend

> **Fuente de verdad del código:** Git (`fmcfront`).  
> **Última verificación:** 2026-06-11  
> **Backend acoplado:** [`../fmcbackend/Documentation/changelog.md`](../fmcbackend/Documentation/changelog.md)

Entradas **más recientes arriba**.

---

## 2026-06-15 — Fotos en reseñas, perfil y proxy dev

**Pedido:** UI reseñas con foto; galería enterprise; avatar lápiz/quitar; validaciones; proxy Vite en dev.  
**Alcance:** frontend

### Cambios

- `CafeDetail`: foto en reseña, galería solo enterprise, validación estrellas/nombre.
- `Profile`: menú lápiz (subir/cambiar/quitar foto); avatar en `Navbar`.
- `EnterpriseDashboard`: fotos oficiales del local.
- `apiBase.js`: dev vía proxy (`/api`, `/media`); `.env.example` alineado a 5214.
- Build OK.

---

## 2026-06-11 — Demo MVP funcional (cierre de oleada)

**Commits:** `bc8d08a`, `57b7e8a`, `35f0452`, `475fea4`, `e24dc31`  
**Pedido:** SPA demo usable — dark mode, fotos, perfil, Premium, UX sin jerga técnica.  
**Alcance:** frontend, docs, tests

### Estado funcional (demo)

| Ruta | Estado |
|------|--------|
| `/` | Home con cercanas, fotos cover, dark mode |
| `/explore` | Búsqueda, filtros Premium / con descuento |
| `/map` | Mapa Leaflet, sidebar, flecha volver |
| `/cafe/:id` | Detalle, fotos, reseñas CRUD, descuento Premium |
| `/profile` | Nombre, avatar; email solo lectura |
| `/favorites` | Favoritos localStorage |
| `/checkout/consumer-premium` | Activar Premium + refetch token |
| `/demo`, `/terms` | Onboarding y legales legibles |

### Cambios clave

- **Medios:** `apiBase.js`, `resolveMediaUrl`, `CafeCoverImage`, fallback local `/images/fallback-cafe.jpg`.
- **Config dev:** `VITE_DEV_API_TARGET` en `.env` (no versionado); plantilla en `.env.example`.
- **Premium:** descuentos visibles solo si `user.premium`; refetch con JWT nuevo tras checkout.
- **Perfil:** PUT nombre, POST avatar; contraste dark en paneles y botones.
- **UX errores:** `userFacingError.js` — mensajes al consumidor, sin «backend» ni puertos.
- **Tema:** `ThemeContext`, toggle luna; contraste en login, home, detalle, perfil, favoritos.
- **Detalle:** reseñas CRUD, cupón PDF, upsell Premium.
- **GraphQL:** capa de búsqueda geoespacial (commit `d4e3034`).

### Setup local (obligatorio)

```bash
cp .env.example .env
# VITE_DEV_API_TARGET = mismo puerto que `make run` en fmcbackend
npm install --legacy-peer-deps
npm run dev
```

### Validación

- `npm test`: **23/23 OK**
- `npm run build`: OK
- Manual: fotos en home con API en marcha; errores amigables si API caída

---

## 2026-06-09 — Integración fotos y reseñas del API

**Commit:** `e24dc31` — `feat(media): integrar fotos y reseñas del API FMC`  
**Alcance:** frontend

### Cambios

- `cafeteriaMediaApi.js`; fotos y reseñas en `CafeDetail`.
- Mapper usa `coverImageUrl` del backend.

---

## 2026-06-02 — Documentación inicial del frontend

**Alcance:** docs

### Contenido

- Integración REST, proxy Vite, contextos Auth/Cafeterías.
- Rutas, mapa Leaflet, geo CABA.

---

## Plantilla (próximas feats)

```markdown
## YYYY-MM-DD — <título>

**Commit:** `<hash>` — `<asunto>`  
**Pedido:** …  
**Alcance:** frontend | docs | tests

### Cambios
- …

### Validación
- `npm test`: …
- Cotejo manual: http://localhost:5173/…
```
