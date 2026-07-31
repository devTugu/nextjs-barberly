# Deployment

Production deployment for the Next.js frontend.

## Environment

| Variable | Required | Example |
|----------|----------|---------|
| `API_INTERNAL_URL` | Yes (production) | `https://api.example.com/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | No | `Admin Console` |
| `NEXT_PUBLIC_BRAND_NAME` | No | `Your Company` |
| `NEXT_PUBLIC_SITE_URL` | Recommended | `https://www.example.com` |

## Build

```bash
npm ci
npm run build
npm run start
```

## Platforms

### Vercel / Railway

1. Connect repo
2. Set `API_INTERNAL_URL` to deployed Nest API
3. Set `NEXT_PUBLIC_SITE_URL` for metadata/canonical URLs

### Docker

Use root `Dockerfile`. Ensure `API_INTERNAL_URL` points to internal network hostname of the API service.

## CI

GitHub Actions runs:

- Lint, typecheck, unit tests
- E2E via `scripts/ci-e2e.sh` (requires paired backend)

### E2E environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `E2E_ADMIN_EMAIL` | Yes | Platform admin login (default `admin@example.com` in local specs) |
| `E2E_ADMIN_PASSWORD` | Yes | Platform admin password |
| `API_INTERNAL_URL` | Yes | NestJS API base URL for BFF during Playwright runs |
| `PLAYWRIGHT_BASE_URL` | No | Frontend URL under test (CI sets from preview/deploy URL) |

Pair with backend seed (`RUN_SEED=true` once) so demo tenant and admin user exist before e2e.

## Smoke test

After deploy:

```bash
bash scripts/smoke-railway.sh https://your-frontend.example.com
```

## Health

Frontend exposes `GET /api/health` for load balancer probes.

## Production checklist (Barberly)

| Item | Setting |
|------|---------|
| QPay provider | Backend `QPAY_PROVIDER=qpay` with valid merchant credentials |
| QPay callback | Public HTTPS webhook URL registered with QPay |
| Dev simulate | `NEXT_PUBLIC_QPAY_SIMULATE_ENABLED=false` in production |
| Web push | Backend `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` + admin push subscription route |
| Brand color | Run migration `1730000000024` (`tenant_settings.brand_color`) |
| Permissions | Re-seed if new permissions added (`RUN_SEED=true` once, then `false`) |
| PWA | Serwist enabled in production build; service worker at `/sw.js` |
| patch-package | `postinstall` runs `patch-package` (next-themes React 19 fix) |
| Tenant hosts | Wildcard DNS `*.barberly.mn` + platform host for admin console |

## Related

- Backend [Deployment](../../nestjs-barberly/docs/DEPLOYMENT.md)
- [Fork Guide](FORK-GUIDE.md)
- [ROUTING.md](ROUTING.md)
