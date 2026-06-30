# Fork Guide

Primary full-stack fork guide. Pair backend + frontend at **v3.0.0**.

## 1. Fork both repositories

- [nestjs-fsd-portfolio-template](https://github.com/devTugu/nestjs-fsd-portfolio-template)
- [nextjs-fsd-portfolio-template](https://github.com/devTugu/nextjs-fsd-portfolio-template)

## 2. Backend setup

```bash
cd nestjs-fsd-portfolio-template
npm ci && cp .env.example .env
```

Configure:

```env
DB_HOST=localhost
DB_NAME=your_db
JWT_ACCESS_SECRET=<32+ chars>
JWT_REFRESH_SECRET=<32+ chars>
CORS_ORIGIN=http://localhost:3000
SEED_BRAND_NAME=Your Company Group
SEED_CONTACT_EMAIL=hello@yourcompany.com
APP_PORT=3001
```

```bash
npm run migration:run
npm run seed
npm run start:dev
```

Details: backend [Fork Guide](https://github.com/devTugu/nestjs-fsd-portfolio-template/blob/main/docs/FORK-GUIDE.md).

## 3. Frontend setup

```bash
cd nextjs-fsd-portfolio-template
npm ci && cp .env.example .env.local
```

```env
API_INTERNAL_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_BRAND_NAME=Your Company Group
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm run dev
```

## 4. Customize branding

1. Sign in: `admin@example.com` / `Admin123!` (change after first login)
2. **Site Settings** — logos, hero, about, brandColor, SEO
3. **Brands** — replace demo restaurants/events
4. **History, Leadership, Team** — company pages
5. **News** — blog posts
6. **Navigation** — header/footer menus

## 5. Production deploy

| Service | Platform options |
|---------|------------------|
| API + MySQL + Redis | Railway, Docker, VPS |
| Frontend | Vercel, Railway, Docker |

Set `CORS_ORIGIN` on API to frontend URL. Set `API_INTERNAL_URL` on frontend to API URL.

Run `scripts/smoke-railway.sh` after deploy.

## 6. Verification checklist

```bash
# Backend
cd nestjs-fsd-portfolio-template && npm run test && npm run build

# Frontend
cd nextjs-fsd-portfolio-template && npm run typecheck && npm run build

# Full stack
bash scripts/fork-check.sh
bash scripts/ci-e2e.sh   # with backend running
```

## 7. What changed in v3

Portfolio CMS (projects, skills, experiences, pricing) removed. Replaced by multi-brand CMS. See [ADR 003](adr/003-multi-brand-v3.md).

## License

MIT — retain license files in both forks.
