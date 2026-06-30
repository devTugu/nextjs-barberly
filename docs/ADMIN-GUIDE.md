# Admin Guide

![Dashboard overview](../gallery/dashboard-overview.png)

Dashboard for managing multi-brand CMS content and RBAC.

## Routes

| Path | Section |
|------|---------|
| `/dashboard` | Overview stats |
| `/dashboard/users` | User management |
| `/dashboard/roles` | Role management |
| `/dashboard/permissions` | Permission management |
| `/dashboard/audit-logs` | Audit log viewer |
| `/dashboard/security` | MFA settings |
| `/dashboard/brands` | Brands + menu items + events |
| `/dashboard/history` | History timeline |
| `/dashboard/leadership` | Leadership members |
| `/dashboard/team` | Team members |
| `/dashboard/news` | News posts |
| `/dashboard/navigation` | Header/footer nav tree |
| `/dashboard/site-settings` | Hero, about, logos, brandColor, SEO |
| `/dashboard/contact-messages` | Contact inbox |

Sidebar: `src/widgets/app-sidebar/app-sidebar.tsx`

## Legacy admin redirects

Deprecated routes redirect to v3 equivalents (`ROUTES` in `routes.ts`):

| Legacy | Redirect |
|--------|----------|
| `/dashboard/projects` | `/dashboard/brands` |
| `/dashboard/skills` | `/dashboard/brands` |
| `/dashboard/experiences` | `/dashboard/history` |
| `/dashboard/blog` | `/dashboard/news` |
| `/dashboard/pricing` | `/dashboard/site-settings` |

## Permissions

Admin actions require backend permission codes. Key mappings:

| Section | Permissions |
|---------|-------------|
| Brands | `BRAND_*` |
| History | `HISTORY_*` |
| Leadership | `LEADERSHIP_*` |
| Team | `TEAM_*` |
| News | `BLOG_*` |
| Site settings | `SITE_SETTING_*` |
| Navigation | `NAV_*` |
| Contact | `CONTACT_*` |
| Users/Roles | `USER_*`, `ROLE_*`, `PERMISSION_*` |
| Audit | `AUDIT_READ` |
| Dashboard | `DASHBOARD_READ` |

UI gates: `RequirePermission` component wraps protected sections.

## Site settings (v3)

Extended form fields:

- `theme.brandColor` — accent color for marketing site
- `about` — brief, mission, vision, values, stats
- `hero.secondaryCtaLabel/Url` — second hero button
- `contactInfo.address`, `contactInfo.workHours`

## Content locale

Admin CMS forms support `en` / `mn` via `AdminContentLocaleProvider` and locale switcher. Edit content per locale before publishing.

## Brands admin

Single brands page manages:

- Brand CRUD (type: RESTAURANT or EVENT)
- Nested menu items (restaurant brands)
- Nested brand events (event brands)

## Related

- Backend [CMS Reference](https://github.com/devTugu/nestjs-fsd-portfolio-template/blob/main/docs/CMS-REFERENCE.md)
- [Security](SECURITY.md)
