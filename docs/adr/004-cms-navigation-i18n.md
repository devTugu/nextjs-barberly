# ADR 004: CMS, navigation, and i18n

## Status

Accepted

## Context

Multi-brand sites need bilingual CMS content and admin-editable navigation without code deploys.

## Decision

1. **CMS content:** API returns `{ en, mn }` JSON. Frontend uses `pickLocalized()` with `locale` cookie.
2. **UI i18n:** `next-intl` for chrome strings (`en.json`, `mn.json`). No URL locale prefix.
3. **Navigation:** Fetched from API (`/navigation?scope=HEADER|FOOTER`). Admin tree editor in dashboard.
4. **Admin editing:** `AdminContentLocaleProvider` lets editors switch locale while editing CMS fields.
5. **Fallback nav:** `marketing-nav.ts` provides label keys when API nav is empty.

## Consequences

**Positive:** Content and navigation fully CMS-driven.

**Negative:** Third locale requires API schema + frontend i18n extension.

## Related

- Backend [ADR 004](https://github.com/devTugu/nestjs-fsd-portfolio-template/blob/main/docs/adr/004-cms-i18n-navigation.md)
- [Site Guide](../SITE-GUIDE.md)
