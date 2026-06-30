# Security

Frontend security model: BFF proxy, httpOnly cookies, CSRF protection.

## Authentication flow

1. User submits credentials on `/sign-in`
2. `POST /api/auth/login` proxies to Nest `POST /auth/login`
3. On success, BFF sets httpOnly cookies (access + refresh + session hint)
4. Browser calls admin API via `/api/backend/*` — BFF attaches JWT from cookie
5. `POST /api/auth/refresh` rotates tokens before expiry
6. MFA challenge handled inline on sign-in page

Tokens are **never** stored in `localStorage`.

## BFF allowlist

`src/shared/config/bff-allowlist.ts` defines exact backend paths the proxy forwards. Requests outside the allowlist return 403. Path traversal (`..`) is blocked.

Auth routes (`/api/auth/*`) are separate handlers, not proxied through the generic backend proxy.

## CSRF

State-changing BFF requests require CSRF token:

1. `GET /api/auth/csrf` returns token
2. Client sends `X-CSRF-Token` header on POST/PATCH/DELETE

Implemented in `src/shared/lib/csrf-client.ts` and BFF route handlers.

## Session protection

`src/processes/proxy.ts` guards `/dashboard/*`:

- Redirects unauthenticated users to `/sign-in`
- Redirects authenticated users away from `/sign-in` to `/dashboard`

Session check: `SESSION` cookie hint + `REFRESH_TOKEN` cookie present.

## Environment

| Variable | Scope | Purpose |
|----------|-------|---------|
| `API_INTERNAL_URL` | Server only | Nest API base (must end with `/api/v1`) |
| `NEXT_PUBLIC_*` | Client | Display names only — no secrets |

Required in production: `API_INTERNAL_URL`.

## OAuth

Optional OIDC login via `/api/auth/oauth/authorize` and callback page at `/oauth/callback`.

## Related

- Backend [Security](https://github.com/devTugu/nestjs-fsd-portfolio-template/blob/main/docs/SECURITY.md)
- [ADR 002](adr/002-bff-httponly-auth.md)
