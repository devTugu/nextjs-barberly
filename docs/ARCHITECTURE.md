# Architecture

Next.js 16 app using **Feature-Sliced Design (FSD)** with a **Backend-for-Frontend (BFF)** auth layer.

## Layer structure

```
app/           # Next.js App Router (routes, layouts, API routes)
widgets/       # Composed UI blocks (sidebar, marketing sections)
features/      # User interactions (auth, brands CRUD, MFA)
entities/      # Business models + API clients
shared/        # Config, UI kit, i18n, utilities
processes/     # App-wide providers, proxy handler
```

**Import rule:** upper layers import from lower layers only (`app` → `widgets` → `features` → `entities` → `shared`).

## Request flow

```mermaid
sequenceDiagram
  participant Browser
  participant NextApp as Next.js
  participant BFF as BFF /api/backend
  participant Nest as NestJS API

  Note over Browser,Nest: Marketing (SSR)
  Browser->>NextApp: GET /
  NextApp->>Nest: fetchInternal /site-settings, /brands
  Nest-->>NextApp: JSON envelope
  NextApp-->>Browser: HTML

  Note over Browser,Nest: Admin (client)
  Browser->>BFF: PATCH /api/backend/admin/brands/1
  BFF->>Nest: Forward with httpOnly cookie JWT
  Nest-->>BFF: Response
  BFF-->>Browser: JSON
```

## BFF pattern

- Browser never holds access tokens in `localStorage`
- Auth cookies set by `/api/auth/*` route handlers
- Admin API calls go through `/api/backend/*` with allowlist (`bff-allowlist.ts`)
- Server components call Nest API directly via `API_INTERNAL_URL`

## Key modules

| Area | Location |
|------|----------|
| Marketing pages | `app/(marketing)/` |
| Barber admin | `app/admin/` |
| Platform admin | `app/(platform)/` |
| Customer portal | `app/user/`, `app/book/` |
| Auth routes | `app/api/auth/` |
| Public API client | `src/entities/public-api/` |
| Proxy redirects | `src/processes/proxy.ts` |
| Route constants | `src/shared/config/routes.ts` |

## PWA (Serwist)

Dual installable manifests:

| Manifest | Scope | Start URL |
|----------|-------|-----------|
| `/manifest.webmanifest` | `/` | `/` |
| `/admin/manifest.webmanifest` | `/admin` | `/admin/dashboard` |

- Service worker: `app/sw.ts` → build output `public/sw.js` via `@serwist/next`
- Admin push: `AdminPwaBootstrap` subscribes via VAPID + `POST /admin/push-subscriptions`
- NestJS sends web push on booking payment webhook (`NotifyTenantNewBookingUseCase`)

## Related

- [Security](SECURITY.md)
- [ADR 001](adr/001-feature-sliced-design.md)
- [ADR 002](adr/002-bff-httponly-auth.md)
