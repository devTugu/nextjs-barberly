# Site Guide

Public marketing site powered by CMS data from the NestJS API.

## Routes

| Path | Page |
|------|------|
| `/` | Home |
| `/about/us` | About us |
| `/about/history` | Company history |
| `/about/leadership` | Leadership |
| `/about/team` | Team |
| `/brands` | Brand list (filter by type) |
| `/brands/[slug]` | Brand detail (menu or events) |
| `/news` | News list |
| `/news/[slug]` | News article |
| `/contact` | Contact form |

Route constants: `src/shared/config/routes.ts` (`PUBLIC_ROUTES`).

## Home page composition

`app/(marketing)/page.tsx`:

```
HeroSection          → Stripe AnimatedMesh + CMS hero
AboutBriefSection    → CMS about.brief
BrandsShowcaseSection → API /brands (limit 6)
NewsPreviewSection   → API /news (limit 3)
ContactCtaSection    → CMS contactInfo
```

## Legacy redirects

Handled by `src/processes/proxy.ts` (308 permanent):

| From | To |
|------|-----|
| `/blog`, `/blog/*` | `/news`, `/news/*` |
| `/projects`, `/projects/*` | `/brands`, `/brands/*` |
| `/pricing` | `/contact` |

Legacy URL redirects are handled by `proxy.ts` (308).

## Public API client

Server components use `src/entities/public-api/public-server.ts`:

| Function | API |
|----------|-----|
| `getPublicSiteSettings` | `/site-settings` |
| `getPublicBrands` | `/brands` |
| `getPublicBrandBySlug` | `/brands/:slug` |
| `getPublicHistory` | `/history` |
| `getPublicLeadership` | `/leadership` |
| `getPublicTeam` | `/team` |
| `getPublicNews` | `/news` |
| `getPublicNavigation` | `/navigation?scope=` |

Fetches use `revalidate: 60` seconds. Locale resolved via `pickLocalized()` and `locale` cookie.

## Marketing layout

`app/(marketing)/layout.tsx`:

- Metadata from CMS SEO + `resolveBrandContext()`
- `theme.brandColor` → CSS `--marketing-indigo`
- Header/footer navigation from API (`scope=HEADER|FOOTER`)

## i18n

- UI chrome: `next-intl` with `en` / `mn` message files
- CMS content: `{ en, mn }` JSON from API
- Locale: `locale` cookie (no URL prefix)

## Related

- Backend [API Reference](https://github.com/devTugu/nestjs-fsd-portfolio-template/blob/main/docs/API.md)
- [White Label](WHITE-LABEL.md)
