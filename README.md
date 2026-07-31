# Barberly Web (Next.js + FSD)

Multi-tenant barbershop booking web app — marketing landing, customer booking wizard (`/book`), tenant admin (`/admin`), and platform dashboard (`/dashboard`).

**Product specification:** [../nestjs-barberly/docs/PRODUCT.md](../nestjs-barberly/docs/PRODUCT.md)

Pairs with [nestjs-barberly](../nestjs-barberly) (NestJS API).

---

## Quick start

### Backend

```bash
cd ../nestjs-barberly
npm ci && cp .env.example .env
npm run migration:run && npm run seed && npm run start:dev
```

### Frontend

```bash
npm ci
cp .env.example .env.local
npm run dev
```

| Route | Purpose |
|-------|---------|
| `/` | Marketing / tenant landing |
| `/dashboard` | Platform super-admin |
| `/admin/*` | Tenant admin |
| `/book` | Customer booking wizard (Phase 1) |

Dev tenant resolution: `?tenant=demo` or `X-Tenant-Subdomain` via BFF proxy.

---

## Phase 1 status

- CMS template removed; system admin shell retained
- Sprint 0+ backend: see nestjs-barberly README
- Frontend `/admin` and `/book` — upcoming sprints

See [PRODUCT.md](../nestjs-barberly/docs/PRODUCT.md) for full booking specification.
