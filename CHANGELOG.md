# Changelog

All notable changes to this project are documented in this file.

## [3.0.0] - 2026-06-19

### BREAKING CHANGE

Portfolio marketing and admin UI removed: **projects**, **skills**, **experiences**, **pricing**.

Legacy URL redirects (via proxy):

| Legacy | Redirect |
|--------|----------|
| `/projects` | `/brands` |
| `/blog`, `/blog/*` | `/news`, `/news/*` |
| `/pricing` | `/contact` |

Requires [nestjs-fsd-portfolio-template v3.0.0](https://github.com/devTugu/nestjs-fsd-portfolio-template/releases/tag/v3.0.0) API.

### Added

- Multi-brand marketing site: home, brands, news, contact
- Admin CMS: brands, history, leadership, team, news, navigation, site settings
- `AdminPageHeader` widget on dashboard CRUD pages
- `CONTRIBUTING.md`, root `SECURITY.md`
- `scripts/fork-check.sh` smoke checks
- `scripts/capture-dashboard-screenshot.mjs` for gallery refresh

### Changed

- **blog → news** rename in UI/domain (`entities/news-post`, `features/news`, `/news` routes)
- Dashboard overview: progress insights (removed Recharts dependency)
- Default env branding: `RE CMS Admin` / `Demo Group`
- BFF auth, CSRF, MFA, OAuth, GDPR, session refresh (enterprise baseline from v2.3)

### Removed

- `recharts` and `src/shared/ui/chart.tsx`
- Portfolio entities, features, and dashboard routes

### Upgrade

```bash
npm ci
cp .env.example .env.local
# API_INTERNAL_URL=http://localhost:3001/api/v1
npm run dev
```

---

## [2.3.0] - 2026-06-19

Portfolio marketing site + admin dashboard with blog, pricing, navigation CMS, MFA, OAuth, regulated-enterprise features.

Paired with backend [v2.3.0](https://github.com/devTugu/nestjs-fsd-portfolio-template/releases/tag/v2.3.0) — superseded by v3 multi-brand pivot.
