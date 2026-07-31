# Getting Started

## Prerequisites

- Node.js 18+
- Running backend: [nestjs-fsd-portfolio-template](https://github.com/devTugu/nestjs-fsd-portfolio-template) v3.0.0

## Backend first

```bash
git clone https://github.com/devTugu/nestjs-fsd-portfolio-template.git
cd nestjs-fsd-portfolio-template
npm ci && cp .env.example .env
# Edit DB + JWT secrets
npm run migration:run && npm run seed
npm run start:dev   # default port 3001 if APP_PORT=3001
```

See backend [Getting Started](https://github.com/devTugu/nestjs-fsd-portfolio-template/blob/main/docs/GETTING-STARTED.md).

## Frontend

```bash
git clone https://github.com/devTugu/nextjs-fsd-portfolio-template.git
cd nextjs-fsd-portfolio-template
npm ci
cp .env.example .env.local
```

`.env.local`:

```env
API_INTERNAL_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=Admin Console
NEXT_PUBLIC_BRAND_NAME=Your Site
```

```bash
npm run dev
```

- Marketing site: `http://localhost:3000`
- Platform admin: `http://localhost:3000/login`
- Credentials: `admin@example.com` / `Admin123!`

## Customer brand SSO cookies (ADR-019)

| Env | Default cookie `Domain` |
|-----|-------------------------|
| production | `.barberly.mn` (`NEXT_PUBLIC_ROOT_DOMAIN`) |
| development | **host-only** (no Domain) — reliable on `*.localhost` |

Dev shared-domain SSO (optional):

```env
CUSTOMER_COOKIE_DOMAIN=.barberly.test
```

Force host-only everywhere: `CUSTOMER_COOKIE_HOST_ONLY=1`.

Do **not** use `CUSTOMER_COOKIE_DOMAIN=.localhost` — browsers often reject it, which breaks profile save (`No customer session` after OTP).

Smoke: `e2e/customer-cookie-domain-smoke.spec.ts`

## Verify

```bash
npm run typecheck
npm run test
npm run build
bash scripts/fork-check.sh
```

## Full-stack fork

See [Fork Guide](FORK-GUIDE.md) for production deployment steps.
