# Contributing

## Architecture

Follow Feature-Sliced Design import rules:

```
app → widgets, features, entities, shared, processes
widgets → features, entities, shared
features → entities, shared
entities → shared only
```

See [ADR 001](docs/adr/001-feature-sliced-design.md) and [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Adding a CMS or RBAC feature

1. **Entity** — types, Zod schemas, API queries/mutations in `src/entities/<name>/`
2. **Feature UI** — table + manage sheet in `src/features/<name>/ui/`
3. **Widget reuse** — prefer `AdminPageHeader`, `AdminFormSheet`, `DataTable`, `PermissionPicker`
4. **Route** — thin page in `app/dashboard/<name>/page.tsx` with `AdminPageHeader` + `Suspense` when needed
5. **Permissions** — gate actions with `useAuthPermissions()` and `PERMISSION_CODES`
6. **i18n** — add keys to both `src/shared/i18n/messages/en.json` and `mn.json`
7. **E2E** — extend `e2e/` for critical paths when behavior is non-trivial

## Code style

- TypeScript strict; avoid `any`
- English for UI copy, docs, and commit messages
- Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- Prefer composition over large monolithic components (max ~300 lines per file)

## Running locally

```bash
# Terminal 1 — API (nestjs-fsd-portfolio-template)
cd ../nestjs-fsd-portfolio-template
npm ci && cp .env.example .env
npm run migration:run && npm run seed && npm run start:dev

# Terminal 2 — Frontend
npm ci && cp .env.example .env.local
npm run dev
```

Default admin after API seed: `admin@example.com` / `Admin123!`

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e   # CI uses scripts/ci-e2e.sh with paired API
```

## Gallery screenshots

Replace images under `docs/gallery/` after meaningful UI changes. Run `node scripts/capture-dashboard-screenshot.mjs` (dev server + API required) to refresh `dashboard-overview.png`.

## Pull requests

- Keep PRs focused (one feature or fix per PR when possible)
- Ensure CI passes (lint, typecheck, test, build)
- Update docs when adding routes, env vars, or architectural decisions
