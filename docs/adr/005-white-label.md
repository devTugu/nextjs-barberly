# ADR 005: White-label brand configuration

## Status

Accepted

## Context

Template buyers deploy one codebase for multiple clients with different branding.

## Decision

Three-tier model implemented in `resolveBrandContext()`:

| Tier | Source |
|------|--------|
| Deploy-time | `NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_SITE_URL` |
| Runtime CMS | Site settings: logos, siteName, hero, about, `theme.brandColor` |
| UI chrome | i18n `{brandName}` in message files |

Resolution: CMS `siteName` → env `BRAND_NAME` → `"Your Site"`.

`theme.brandColor` injects `--marketing-indigo` on marketing layout.

## Consequences

**Positive:** Rebrand via admin without code changes.

**Negative:** Operators must know which tier controls which surface.

## Related

- [White Label](../WHITE-LABEL.md)
- Backend [ADR 005](https://github.com/devTugu/nestjs-fsd-portfolio-template/blob/main/docs/adr/005-white-label.md)
