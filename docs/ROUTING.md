# Routing & Host Matrix

Canonical web routes for `nextjs-barberly`. See [PRODUCT.md](../../nestjs-barberly/docs/PRODUCT.md) §12–14 and [MULTI-TENANT.md](../../nestjs-barberly/docs/MULTI-TENANT.md).

## Host resolution

| Host pattern | Scope | Tenant context |
|--------------|-------|----------------|
| `platform.barberly.mn` | Platform admin | None |
| `{subdomain}.barberly.mn` | Customer + barber | `subdomain` |
| `localhost` / `*.localhost` | Dev | Subdomain label or `?tenant=` fallback |

BFF forwards `x-tenant-subdomain` to the NestJS API on tenant-scoped requests.

## Permission map (barber admin)

| Route prefix | Permission |
|--------------|------------|
| `/admin/dashboard`, `/admin/brand`, `/admin/calendar`, `/admin/bookings` | `BOOKING_READ` |
| `/admin/bookings/:id` actions | `BOOKING_UPDATE` |
| `/admin/services` | `SERVICE_READ` / `SERVICE_CREATE` / `SERVICE_UPDATE` |
| `/admin/schedule` | `SCHEDULE_READ` / `SCHEDULE_UPDATE` |
| `/admin/wallet` | `WALLET_READ` / `WALLET_UPDATE` |
| `/admin/settings` | `TENANT_UPDATE` |

## Platform routes

| Route | Permission |
|-------|------------|
| `/dashboard` | `DASHBOARD_READ` |
| `/tenants` | `TENANT_READ` |
| `/analytics` | `TENANT_READ` |
| `/withdrawals` | `WALLET_READ` (platform) |
| `/users`, `/roles`, `/permissions` | RBAC permissions |
| `/audit` | `AUDIT_READ` |

## Public booking preview APIs (customer JWT)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/public/bookings/:id/cancel-preview` | GET | Refund % and amount before cancel |
| `/api/public/bookings/:id/reschedule-preview` | GET | Policy window check before reschedule |

BFF allowlist: `public-bff-allowlist.ts`. Upstream: `GET /api/v1/public/bookings/:id/*`.

## Admin booking cancel (barber)

| Route | Method | Behavior |
|-------|--------|----------|
| `/api/admin/bookings/:id/cancel` | PATCH | Barber cancels a **confirmed** booking; wallet refund is always **100%** (policy bypass). Status becomes `cancelled_by_barber`. |

Customer self-service cancel uses preview APIs above; responses include `refundPercent` and optional `reasonCode` (`BOOKING_NOT_ACTIVE`, `RESCHEDULE_WINDOW_PASSED`, etc.) when the action is blocked.
