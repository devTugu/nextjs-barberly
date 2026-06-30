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

## Smoke test

After deploy:

```bash
bash scripts/smoke-railway.sh https://your-frontend.example.com
```

## Health

Frontend exposes `GET /api/health` for load balancer probes.

## Related

- Backend [Deployment](https://github.com/devTugu/nestjs-fsd-portfolio-template/blob/main/docs/DEPLOYMENT.md)
- [Fork Guide](FORK-GUIDE.md)
