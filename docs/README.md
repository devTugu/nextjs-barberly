# Documentation

Multi-brand RE Admin + Marketing site (v3.0.0). Start here.

## Quick links

| Guide | Purpose |
|-------|---------|
| [Getting Started](GETTING-STARTED.md) | Local setup with paired backend |
| [Architecture](ARCHITECTURE.md) | FSD layers and BFF pattern |
| [Site Guide](SITE-GUIDE.md) | Marketing routes, home sections, redirects |
| [Admin Guide](ADMIN-GUIDE.md) | Dashboard CRUD and permissions |
| [Security](SECURITY.md) | BFF, httpOnly cookies, CSRF |
| [Deployment](DEPLOYMENT.md) | Production deploy and CI |
| [White Label](WHITE-LABEL.md) | Brand resolution and CMS |
| [Fork Guide](FORK-GUIDE.md) | Full-stack fork (primary guide) |

## Architecture decisions

| ADR | Topic |
|-----|-------|
| [001 — Feature-Sliced Design](adr/001-feature-sliced-design.md) | FSD layer boundaries |
| [002 — BFF httpOnly auth](adr/002-bff-httponly-auth.md) | Cookie-based session |
| [003 — Multi-brand v3](adr/003-multi-brand-v3.md) | v3 pivot |
| [004 — CMS, navigation, i18n](adr/004-cms-navigation-i18n.md) | Localized content |
| [005 — White label](adr/005-white-label.md) | Brand tiers |

## Paired backend

This frontend pairs with [nestjs-fsd-portfolio-template](https://github.com/devTugu/nestjs-fsd-portfolio-template) v3.0.0.

## Removed in v3

Portfolio marketing (`/projects`, `/pricing`) and admin (`projects`, `skills`, `experiences`, `pricing`) replaced by multi-brand CMS. Legacy URLs redirect. See [ADR 003](adr/003-multi-brand-v3.md).
