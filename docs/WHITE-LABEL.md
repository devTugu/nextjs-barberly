# White Label

Three-tier brand configuration for multi-client deployments.

## Tier 1: Deploy-time (env)

```env
NEXT_PUBLIC_APP_NAME=Admin Console
NEXT_PUBLIC_BRAND_NAME=Your Company Group
NEXT_PUBLIC_SITE_URL=https://www.yourcompany.com
```

Set before build. Used as fallback when CMS site name is empty.

## Tier 2: Runtime CMS

Editable in admin **Site Settings** without redeploy:

| Field | Effect |
|-------|--------|
| `header.siteName` | Primary brand name (localized) |
| `header.logoUrl`, `logoDarkUrl` | Marketing header logos |
| `header.adminLogoUrl`, `faviconUrl` | Admin + browser tab |
| `theme.brandColor` | `--marketing-indigo` CSS variable |
| `hero.*` | Home hero copy and CTAs |
| `about.*` | About sections across site |
| `seo.*` | Page metadata |
| `footer.*` | Footer copy and social links |

## Tier 3: UI chrome (i18n)

Message files (`src/shared/i18n/messages/en.json`, `mn.json`) use `{brandName}` placeholder for static UI strings.

## Resolution

`resolveBrandContext()` in `src/shared/config/brand.ts`:

```
siteName: CMS siteName → NEXT_PUBLIC_BRAND_NAME → "Your Site"
adminName: NEXT_PUBLIC_APP_NAME → "Admin Console"
```

Marketing layout applies `settings.theme.brandColor` as inline CSS variable.

## Per-brand content

Each brand (`/brands/[slug]`) has its own name, description, logos, and menu/events — managed in admin Brands section.

## Related

- Backend [White Label](https://github.com/devTugu/nestjs-fsd-portfolio-template/blob/main/docs/WHITE-LABEL.md)
- [ADR 005](adr/005-white-label.md)
