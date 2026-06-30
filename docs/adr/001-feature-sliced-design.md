# ADR 001: Feature-Sliced Design

## Status

Accepted

## Context

The admin UI has many domains (users, brands, news, navigation). We need scalable folder structure with clear import boundaries.

## Decision

Adopt FSD layers:

```
app → widgets → features → entities → shared
```

- **entities:** API types, queries, column definitions
- **features:** CRUD tables, forms, dialogs
- **widgets:** Sidebar, marketing sections, composed layouts
- **shared:** UI kit, config, i18n, utilities

Cross-slice imports use public API (`index.ts` barrels).

## Consequences

**Positive:** Predictable placement for new CMS sections; easy onboarding.

**Negative:** More folders than a flat `components/` tree.

## Related

- [Architecture](../ARCHITECTURE.md)
