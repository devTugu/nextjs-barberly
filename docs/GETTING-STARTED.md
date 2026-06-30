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
- Admin: `http://localhost:3000/sign-in`
- Credentials: `admin@example.com` / `Admin123!`

## Verify

```bash
npm run typecheck
npm run test
npm run build
bash scripts/fork-check.sh
```

## Full-stack fork

See [Fork Guide](FORK-GUIDE.md) for production deployment steps.
