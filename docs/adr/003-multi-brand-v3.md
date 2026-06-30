# ADR 003: Multi-brand pivot (v3.0.0)

## Status

Accepted — 2026-06-19

## Context

Template pivoted from individual developer portfolio to multi-brand restaurant/event conglomerate sites.

## Decision

### Marketing routes (v3)

| Route | Purpose |
|-------|---------|
| `/` | Hero + About + Brands + News + Contact CTA |
| `/about/*` | Us, history, leadership, team |
| `/brands`, `/brands/[slug]` | Restaurant/event brands |
| `/news`, `/news/[slug]` | News (was blog) |
| `/contact` | Contact form |

### Admin routes (v3)

Brands, history, leadership, team, news — replace projects, skills, experiences, pricing.

### Preserved

- Stripe `AnimatedMesh` hero (visual shell only; copy from CMS)
- BFF auth, MFA, audit, i18n infrastructure

### Redirects

`/blog` → `/news`, `/projects` → `/brands`, `/pricing` → `/contact` (308 via proxy).

## Consequences

**Positive:** Single template for RE multi-brand clients.

**Negative:** Breaking v3.0.0; legacy admin pages redirect but should be removed in future cleanup.

## Related

- Backend [ADR 002](https://github.com/devTugu/nestjs-fsd-portfolio-template/blob/main/docs/adr/002-multi-brand-v3.md)
- [Site Guide](../SITE-GUIDE.md)
